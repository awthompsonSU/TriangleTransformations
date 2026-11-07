"""Exercise two-step play through the actual browser UI, deriving answers from SVG."""
import functools
import http.server
import shutil
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / 'website'))
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}'


def transform(points, rule):
    result = []
    for x, y in points:
        if rule['type'] == 'translation':
            x, y = x + rule['dx'], y + rule['dy']
        elif rule['type'] == 'reflection':
            if rule['axis'] == 'x':
                x = 2 * rule['value'] - x
            else:
                y = 2 * rule['value'] - y
        else:
            turns = (rule['degrees'] // 90 * (1 if rule['direction'] == 'ccw' else -1)) % 4
            for _ in range(turns):
                x, y = -y, x
        result.append([x, y])
    return result


def find_single(original, target):
    x, y = original[0]
    tx, ty = target[0]
    candidates = [dict(type='translation', dx=tx-x, dy=ty-y)]
    candidates += [dict(type='reflection', axis=axis, value=value)
                   for axis, value in [('x', (x+tx)/2), ('y', (y+ty)/2)]
                   if value == int(value) and abs(value) <= 15]
    candidates += [dict(type='rotation', degrees=degrees, direction=direction)
                   for degrees in [90, 180, 270] for direction in ['cw', 'ccw']]
    return next((r for r in candidates
                 if (r['type'] != 'translation' or max(abs(r['dx']), abs(r['dy'])) <= 30)
                 and transform(original, r) == target), None)


def find_pair(original, target):
    candidates = [dict(type='translation', dx=dx, dy=dy)
                  for dx in range(-9, 10) for dy in range(-9, 10) if dx or dy]
    candidates += [dict(type='reflection', axis=axis, value=value)
                   for axis in ['x', 'y'] for value in range(-4, 5)]
    candidates += [dict(type='rotation', degrees=d, direction=dr)
                   for d in [90, 180, 270] for dr in ['cw', 'ccw']]
    for first in candidates:
        intermediate = transform(original, first)
        second = find_single(intermediate, target)
        if second:
            return first, second
    raise AssertionError('No two-step solution found')


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=shutil.which('chromium'), args=['--no-sandbox'])
        page = browser.new_page(viewport={'width': 1366, 'height': 900},
                                permissions=['clipboard-read', 'clipboard-write'])
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(url)
        page.locator('#studentName').fill('Hard Mode Student')
        page.locator('#startMode').select_option('hard')
        page.locator('#startForm button').click()

        def coordinates(group):
            return page.locator(f'#{group} polygon').evaluate('''el => el.getAttribute('points').split(' ')
                .map(p => p.split(',').map(Number)).map(([x,y]) => [(x-50)/22-15,15-(y-50)/22])''')

        def solve():
            return find_pair(coordinates('originalTriangle'), coordinates('transformedTriangle'))

        def enter(rule):
            page.locator(f'input[name="transformType"][value="{rule["type"]}"]').check()
            if rule['type'] == 'translation':
                page.locator('#translateX').fill(str(int(rule['dx'])))
                page.locator('#translateY').fill(str(int(rule['dy'])))
            elif rule['type'] == 'reflection':
                page.locator('#reflectAxis').select_option(rule['axis'])
                page.locator('#reflectValue').fill(str(int(rule['value'])))
            else:
                page.locator('#rotateDegrees').select_option(str(rule['degrees']))
                page.locator('#rotateDirection').select_option(rule['direction'])
            page.locator('#checkBtn').click()

        def scores(correct, attempted):
            for prefix in ['hard', 'overall']:
                assert page.locator(f'#{prefix}Correct').inner_text() == str(correct)
                assert page.locator(f'#{prefix}Attempted').inner_text() == str(attempted)
            for kind in ['translation', 'reflection', 'rotation']:
                assert page.locator(f'#{kind}Attempted').inner_text() == '0'

        def next_problem():
            page.locator('#nextBtn').click()
            assert page.locator('#guessTriangle').count() == 0
            assert page.locator('#firstStepSummary').is_hidden()
            assert page.locator('#resetFirstBtn').is_hidden()

        first, second = solve()
        original = coordinates('originalTriangle')
        enter(first)
        assert coordinates('guessTriangle') == transform(original, first)
        assert page.locator('#answerTitle').inner_text() == 'Step 2 of 2'
        assert page.locator('#nextBtn').is_disabled()
        assert page.locator('#resetFirstBtn').is_visible()
        scores(0, 0)
        # Incomplete second answers neither score nor replace the intermediate.
        page.locator('#checkBtn').click()
        scores(0, 0)
        assert coordinates('guessTriangle') == transform(original, first)
        enter(second)
        assert coordinates('guessTriangle') == coordinates('transformedTriangle')
        assert 'Correct two-step' in page.locator('#feedback').inner_text()
        assert page.locator('#resetFirstBtn').is_disabled()
        scores(1, 1)

        # Reset before a complete pair is explicitly one missed problem.
        next_problem()
        first, second = solve()
        enter(first)
        page.locator('#resetFirstBtn').click()
        scores(1, 2)
        assert page.locator('#answerTitle').inner_text() == 'Step 1 of 2'
        assert page.locator('#guessTriangle').count() == 0
        assert page.locator('#resetFirstBtn').is_hidden()
        assert page.locator('#nextBtn').is_enabled()
        enter(first)
        page.locator('#resetFirstBtn').click()
        scores(1, 2)
        enter(first)
        enter(second)
        scores(1, 2)
        assert coordinates('guessTriangle') == coordinates('transformedTriangle')

        # Incorrect Step 2 can be corrected without compounding the previous guess.
        next_problem()
        first, second = solve()
        enter(first)
        enter(dict(type='translation', dx=0, dy=0))
        scores(1, 3)
        assert coordinates('guessTriangle') == transform(coordinates('originalTriangle'), first)
        enter(second)
        scores(1, 3)
        assert coordinates('guessTriangle') == coordinates('transformedTriangle')
        page.locator('#showCoords').check()
        assert '₁' in page.locator('#coordinatesPanel').inner_text()
        assert '*' in page.locator('#coordinatesPanel').inner_text()

        # Reveal works before and after the first step and describes both rules.
        next_problem()
        page.locator('#revealBtn').click()
        scores(1, 4)
        assert 'Step 1:' in page.locator('#feedback').inner_text()
        assert 'Step 2:' in page.locator('#feedback').inner_text()
        next_problem()
        first, second = solve()
        enter(first)
        page.locator('#revealBtn').click()
        scores(1, 5)
        assert page.locator('#resetFirstBtn').is_disabled()

        # Ten more generated problems exercise alternate valid sequences in-browser.
        for i in range(10):
            next_problem()
            first, second = solve()
            enter(first)
            scores(1+i, 5+i)
            enter(second)
            scores(2+i, 6+i)
            assert coordinates('guessTriangle') == coordinates('transformedTriangle')

        assert page.locator('#progressStudentName').inner_text() == 'Hard Mode Student'
        assert page.locator('#hardCorrect').inner_text() == '11'
        assert page.locator('#hardAttempted').inner_text() == '15'
        assert page.locator('#progressOverallAccuracy').inner_text() == '73%'
        page.locator('#copyProgressBtn').click()
        page.wait_for_function("document.getElementById('reportStatus').textContent.includes('Progress screenshot copied')")
        assert page.evaluate("async () => (await navigator.clipboard.read())[0].types.includes('image/png')")
        page.reload()
        scores(11, 15)
        assert page.locator('#gameMode').input_value() == 'hard'
        assert 'Hard' in page.locator('#modeLabel').inner_text()

        # Selecting Easy midway through a hard question applies only to the next.
        # An off-grid first guess remains a real intermediate, with an explanation.
        enter(dict(type='translation', dx=30, dy=30))
        assert 'outside' in page.locator('#guessStatus').inner_text()
        page.locator('#gameMode').select_option('easy')
        assert page.locator('#answerTitle').inner_text() == 'Step 2 of 2'
        assert 'Hard' in page.locator('#modeLabel').inner_text()
        page.locator('#resetFirstBtn').click()
        scores(11, 16)
        next_problem()
        assert 'Easy' in page.locator('#modeLabel').inner_text()
        assert page.locator('#checkBtn').inner_text() == 'Check my answer'
        page.locator('#revealBtn').click()

        # Hard layout, including the first-step summary, remains usable on small screens.
        page.locator('#gameMode').select_option('hard')
        next_problem()
        first, second = solve()
        enter(first)
        for width in [1366, 1024, 980, 768, 641, 640, 390, 320]:
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            assert page.locator('#resetFirstBtn').is_visible()
        page.once('dialog', lambda d: d.accept())
        page.locator('#newStudentBtn').click()
        page.locator('#studentName').fill('Next Student')
        page.locator('#startForm button').click()
        scores(0, 0)
        assert page.locator('#gameMode').input_value() == 'easy'

        # Old saved sessions without hard stats or a mode migrate without losing scores.
        page.evaluate('''() => localStorage.setItem('triangle-transformations-web-v1', JSON.stringify({
            name:'Existing Student', served:5, focus:'reflection', teacherEmail:'teacher@example.com',
            stats:{translation:{correct:2,attempted:3},reflection:{correct:1,attempted:1},rotation:{correct:0,attempted:1}}
        }))''')
        page.reload()
        assert page.locator('#overallCorrect').inner_text() == '3'
        assert page.locator('#overallAttempted').inner_text() == '5'
        assert page.locator('#hardAttempted').inner_text() == '0'
        assert page.locator('#gameMode').input_value() == 'easy'
        assert page.locator('#progressStudentName').inner_text() == 'Existing Student'
        assert 'teacherEmail' not in page.evaluate("JSON.parse(localStorage.getItem('triangle-transformations-web-v1'))")
        assert not errors, errors
        browser.close()
        print('PASS: hard mode composition, intermediate overlay, reset penalty, retries, reveals, reports, mode changes, migration and eight viewport widths')
finally:
    server.shutdown()
