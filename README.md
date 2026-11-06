# Triangle Transformations — Codex-ready project

This package combines the current HTML/CSS/JavaScript game with the original Java program for Codex to reference.

## Use on Windows

1. Extract the entire `TriangleTransformations-Codex.zip` archive to a folder on your computer, such as Documents\TriangleTransformations-Codex.
2. Open the **ChatGPT desktop app**, switch to **Codex**, and choose/open the extracted project folder. Sign in with your ChatGPT account if prompted.
3. Begin a new Codex conversation in this folder. Paste the prompt in `START_HERE_PROMPT.txt`.
4. The working site lives in `website/`. To try it before changes, open `website/index.html` in a browser.
5. Ask Codex to run tests and preview the changes before you approve or deploy them.

You can also use Codex through a code editor extension or CLI. Codex Cloud may require setting up an environment and a GitHub repository; for these local files, the desktop app is the simplest route.

## Link from an HTML homepage

When the `website/` directory is alongside your homepage's HTML file, add:

```html
<a href="website/index.html">Play Triangle Transformations</a>
```

If you upload just the contents of `website/` to a folder named `TriangleTransformationsWeb`, adjust the link to that folder name instead.

## What does not happen automatically

- Opening this project in Codex does not automatically carry over this ChatGPT conversation. The included `AGENTS.md` and starter prompt explain the goals and design decisions.
- Scores are currently stored only in a local browser, not centrally.
- The email report only launches a configured email application; students must send the email themselves.

For classroom grading, ask Codex to design a secure optional submission backend rather than treating localStorage totals as authoritative grades.

## Website verification

The website keeps the original game's coordinate matching, with Easy (one-step)
and Hard (two-step) modes:
translations, reflections in horizontal/vertical lines, and rotations about the
origin. It accepts equivalent rotation descriptions and matches corresponding
vertices, rather than only comparing the transformation's name. Hard mode follows the Java game's ordered two-transformation flow, with a green
intermediate triangle after Step 1. The original Java source is preserved unchanged.

The website uses **first-attempt scoring**, rather than the Java game's eventual
correct-answer totals. An invalid form does not count; a wrong answer or reveal
counts once; retries cannot increase the first-attempt score. In Hard mode, the
first complete pair is scored; resetting Step 1 immediately counts the problem
as missed, even before Step 2 is submitted. Repeated resets never count the same
problem more than once. Hard totals have their own row and are included once in
the overall total, while the three transformation rows track Easy problems. Scores persist in
that browser but are not independently verified grades.

To check the site manually:

1. Open `website/index.html` directly, or serve this repository with
   `python3 -m http.server 8000` and visit
   `http://localhost:8000/website/`.
2. Start a student session. Use the coordinate toggle to compare each original
   vertex with its corresponding red vertex. Check each practice category,
   reflections in both line directions, and rotations in both directions.
3. Submit an incomplete or decimal answer: totals should stay unchanged. Submit
   a wrong answer, then the correct one: answered should increase once and
   first-try correct should not increase. Reveal another problem: it counts as
   one missed answer.
4. Select Next problem. The new question heading receives keyboard focus and is
   brought into view. Use Tab to continue through the controls.
5. Submit a valid guess and compare the green dashed triangle (A*, B*, C*) with
   the red target. Retry with another rule: the green triangle should update
   from the original black vertices. A correct guess should coincide with red.
   Try translating by 30 horizontally and 30 vertically to check the off-grid
   message and full guessed coordinates. Next problem should clear the overlay.
6. Try Copy report and Download CSV. Prepare email should open your configured
   email app; you must send it yourself. Actual delivery requires a working
   email application. If copying is blocked, the site offers CSV as an alternative.
7. Reload to check saved totals, resize the window, and test New student / clear
   scores. Direct-file use works offline; a hosted site needs its files loaded
   and does not install an offline service worker.

Automated checks (no build step or test dependency is required to use the site):

```sh
node tests/geometry.cjs
python3 tests/browser.py
python3 tests/hard_browser.py
```

The geometry checks require Node.js and test 30,000 generated problems, all six
supported rotation descriptions across the displayed integer grid, reflection
round trips, incorrect vertex matching, and CSV escaping. The browser checks
require Python's optional `playwright` package plus Chromium. For a separate test
environment, install them with `python3 -m pip install playwright` and
`python3 -m playwright install chromium`. The test uses system Chromium when
available, otherwise Playwright's installed browser.

Browser checks cover all three categories, equivalent rotations, invalid inputs,
wrong/correct retries, reveals, practice settings, coordinates, green guess
overlays (including off-grid guesses, retries, matches, and clearing), score persistence,
student reset, clipboard permission failures, CSV contents, the prepared email
URL, eight viewport widths from 320 to 1366 pixels, offline gameplay, direct-file use when browser policy permits, and
blocked browser storage. If managed Chromium blocks file URLs, that check is
reported as skipped and offline gameplay is tested after loading from localhost. Email URL testing intercepts the external mail launch;
it does not send messages. Tests leave application source and student data alone.


## Hard mode: two transformations

Select **Hard — 2 transformations** before starting, or select it under Practice
settings for the next problem. The current mode appears above the coordinate grid.
Mode and focus changes never replace the current problem midway through an answer.

1. Enter a first transformation and select **Apply first transformation**. The
   resulting green triangle is your intermediate result; the game does not tell
   you whether it matches a hidden first step. The scoreboard stays unchanged.
2. Enter a second transformation and select **Check two-step answer**. The game
   applies it to the saved Step 1 result and draws the combined result in green.
   Any valid ordered pair mapping all corresponding vertices onto red is accepted.
3. If the pair is wrong, retry Step 2. Every retry starts from the same Step 1
   result, rather than compounding the previous Step 2 guess. The coordinate
   readout includes Step 1 vertices with a subscript 1 and the latest green result
   with an asterisk.
4. To choose a different first step, use **Reset Step 1 (counts as wrong)**.
   This marks the problem missed immediately and clears the intermediate triangle.
   Solving it later or resetting again cannot change its first-attempt score.
5. Revealing the solution shows one valid ordered pair and counts the problem as
   missed. Next problem clears both steps and the green triangle.

Generated Hard problems use two different transformation categories, as in the
Java game, with original, intermediate, and final triangles inside the grid.
The generator excludes problems solvable by a single supported transformation.
The practice focus selects the generated **first** category; the second category
is chosen from the other two. Student answers are checked by their geometric
result, rather than requiring the particular generated sequence. Off-grid student
guesses remain valid inputs: the display clips them and coordinates give their
full values.

The geometry suite also checks 6,000 Hard problems, all six ordered category
pairs, independently calculated compositions, intermediate/final bounds, and
single-step shortcuts. `tests/hard_browser.py` checks the staged entry flow,
correct/incorrect pairs, alternative sequences, invalid second inputs, reset
penalties, retries, reveals, mode changes, CSV/copy reporting, older saved-score
migration, student reset, and eight desktop/mobile widths. Test dependencies are
the same as for `tests/browser.py`. The application itself remains a standalone
static site without test dependencies or a build process.
