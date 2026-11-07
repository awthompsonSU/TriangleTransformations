"""Verify real PNG clipboard output and image-report fallback behavior."""
import base64
import functools
import http.server
import shutil
import struct
import threading
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_):
        pass


handler = functools.partial(QuietHandler, directory=str(ROOT / 'website'))
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}'

try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(executable_path=shutil.which('chromium'), args=['--no-sandbox'])
        context = browser.new_context(permissions=['clipboard-read', 'clipboard-write'],
                                      timezone_id='America/New_York', viewport={'width': 390, 'height': 900})
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.clock.set_fixed_time(datetime(2026, 11, 7, 15, 30, 45, tzinfo=timezone.utc))
        page.goto(url)
        page.locator('#studentName').fill('Zoë O’Connor <A&B>')
        page.locator('#startForm button').click()
        assert page.locator('#emailBtn, #copyBtn, #csvBtn, #teacherEmail').count() == 0
        assert page.locator('#copyProgressBtn').is_visible()
        page.locator('#copyProgressBtn').click()
        assert 'at least one problem' in page.locator('#reportStatus').inner_text()
        assert page.locator('#copyProgressBtn').is_enabled()

        # Load a realistic mixed Easy/Hard session; no answers are changed by copying.
        page.evaluate('''() => localStorage.setItem('triangle-transformations-web-v1', JSON.stringify({
            name:'Zoë O’Connor <A&B>', mode:'hard', served:31, focus:'all', teacherEmail:'old@example.com',
            stats:{translation:{correct:10,attempted:12}, reflection:{correct:2,attempted:4},
                   rotation:{correct:3,attempted:5}, hard:{correct:7,attempted:10}}
        }))''')
        page.reload()
        assert page.locator('#progressStudentName').inner_text() == 'Zoë O’Connor <A&B>'
        assert page.locator('#progressStudentName *').count() == 0
        assert page.locator('#progressOverallCorrect').inner_text() == '22'
        assert page.locator('#progressOverallAttempted').inner_text() == '31'
        assert page.locator('#progressOverallAccuracy').inner_text() == '71%'
        assert page.locator('#progressTimestamp').get_attribute('datetime') == '2026-11-07T15:30:45.000Z'
        timestamp = page.locator('#progressTimestamp').inner_text()
        assert '2026' in timestamp and '10:30:45' in timestamp and 'EST' in timestamp
        assert 'teacherEmail' not in page.evaluate("JSON.parse(localStorage.getItem('triangle-transformations-web-v1'))")
        state_before = page.evaluate("localStorage.getItem('triangle-transformations-web-v1')")

        # Observe the real write without changing it: it must start in the click's
        # user activation, before awaiting image rendering (important on Safari).
        page.evaluate('''() => {
            const write=navigator.clipboard.write.bind(navigator.clipboard);
            navigator.clipboard.write=items=>{
                window.copyHadUserGesture=navigator.userActivation.isActive;
                return write(items);
            };
            const render=window.html2canvas;
            window.html2canvas=(element, options)=>{
                window.capturedElement=element.id;
                return render(element,options);
            };
        }''')

        def wait_for_copy():
            page.wait_for_function("document.getElementById('reportStatus').textContent.includes('Progress screenshot copied')")
            assert page.locator('#copyProgressBtn').is_enabled()
            assert page.locator('#copyProgressBtn').get_attribute('aria-busy') is None

        def read_png():
            data = page.evaluate('''async()=>{
                const items=await navigator.clipboard.read();
                const blob=await items[0].getType('image/png');
                return await new Promise(resolve=>{
                    const reader=new FileReader();
                    reader.onload=()=>resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            }''')
            png = base64.b64decode(data)
            assert png.startswith(b'\x89PNG\r\n\x1a\n')
            width, height = struct.unpack('>II', png[16:24])
            assert width == 1280 and 600 < height < 2000
            assert len(png) > 10000
            return png

        page.locator('#copyProgressBtn').click()
        wait_for_copy()
        original_png = read_png()
        assert page.evaluate('window.copyHadUserGesture')
        assert page.evaluate('window.capturedElement') == 'progressCapture'
        assert page.locator('#progressCapture button, #progressCapture figure').count() == 0
        assert page.evaluate("localStorage.getItem('triangle-transformations-web-v1')") == state_before
        assert page.locator('#progressPreview').is_hidden()

        # A later timestamp is captured afresh, rather than reusing the old image.
        page.clock.set_fixed_time(datetime(2026, 11, 7, 15, 31, 50, tzinfo=timezone.utc))
        page.locator('#copyProgressBtn').click()
        wait_for_copy()
        assert page.locator('#progressTimestamp').get_attribute('datetime') == '2026-11-07T15:31:50.000Z'
        assert read_png() != original_png

        # Permission-denied copying displays a usable PNG preview, not a success message.
        page.evaluate("() => {navigator.clipboard.write=async()=>{throw new DOMException('Denied','NotAllowedError')};}")
        page.locator('#copyProgressBtn').click()
        page.wait_for_function("!document.getElementById('progressPreview').hidden")
        page.wait_for_function("document.getElementById('progressPreviewImage').naturalWidth===1280")
        assert 'blocked' in page.locator('#reportStatus').inner_text()
        assert page.locator('#copyProgressBtn').is_enabled()
        assert not page.evaluate("document.querySelector('iframe.html2canvas-container')")

        # Copying without an image clipboard API, or without HTTPS, still offers the image.
        page.evaluate("() => {Object.defineProperty(navigator,'clipboard',{value:undefined,configurable:true});}")
        page.locator('#copyProgressBtn').click()
        page.wait_for_function("!document.getElementById('progressPreview').hidden")
        assert page.locator('#copyProgressBtn').is_enabled()
        assert 'unavailable' in page.locator('#reportStatus').inner_text()
        page.evaluate("() => {Object.defineProperty(window,'isSecureContext',{value:false,configurable:true});}")
        page.locator('#copyProgressBtn').click()
        page.wait_for_function("!document.getElementById('progressPreview').hidden")
        assert page.locator('#copyProgressBtn').is_enabled()

        # A rendering failure is caught, leaves the game usable, and does not retain
        # the old image or claim copying succeeded.
        page.evaluate("() => {window.html2canvas=async()=>{throw new Error('Render failed')};}")
        page.locator('#copyProgressBtn').click()
        page.wait_for_function("document.getElementById('reportStatus').textContent.includes('Could not create')")
        assert page.locator('#progressPreview').is_hidden()
        assert page.locator('#copyProgressBtn').is_enabled()
        page.reload()

        # The bundled renderer works with network access turned off after initial load.
        context.set_offline(True)
        page.locator('#copyProgressBtn').click()
        wait_for_copy()
        read_png()
        context.set_offline(False)

        # A long name and very narrow layout still produce the same full-width PNG.
        long_name = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' * 3 + 'É李'
        page.evaluate("name=>{const data=JSON.parse(localStorage.getItem('triangle-transformations-web-v1'));data.name=name;localStorage.setItem('triangle-transformations-web-v1',JSON.stringify(data));}", long_name)
        page.reload()
        page.set_viewport_size({'width': 320, 'height': 900})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
        page.locator('#copyProgressBtn').click()
        wait_for_copy()
        assert page.locator('#progressStudentName').inner_text() == long_name
        read_png()

        # Rendering is asynchronous: starting a new student must not display the
        # previous student's fallback report when the old promise finishes.
        page.evaluate('''() => {
            navigator.clipboard.write=async()=>{throw new Error('Denied')};
            const render=window.html2canvas;
            window.html2canvas=(element,options)=>new Promise((resolve,reject)=>{
                window.finishOldCapture=()=>render(element,options).then(resolve,reject);
            });
        }''')
        page.locator('#copyProgressBtn').click()
        assert page.locator('#copyProgressBtn').is_disabled()
        page.once('dialog', lambda dialog: dialog.accept())
        page.locator('#newStudentBtn').click()
        page.locator('#studentName').fill('New Student')
        page.locator('#startForm button').click()
        page.evaluate('window.finishOldCapture()')
        page.wait_for_function("!document.getElementById('copyProgressBtn').disabled")
        assert page.locator('#progressPreview').is_hidden()
        assert page.locator('#reportStatus').inner_text() == ''
        assert page.locator('#progressStudentName').inner_text() == 'New Student'
        assert page.locator('#progressOverallAttempted').inner_text() == '0'
        assert not errors, errors
        browser.close()
        print('PASS: PNG clipboard, student identity, local timestamp/time zone, totals, permission/HTTPS fallback, rendering failure, offline use, long names, and session-switch privacy')
finally:
    server.shutdown()
