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
- Copy progress image puts a PNG image on the clipboard; students paste it into their assignment, document, or email themselves. No scores are sent automatically.

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
first complete pair is scored. Undoing Step 1 is free and keeps the same problem
and first-attempt eligibility. Repeated undos do not count as answers. Undoing
after an incorrect complete pair does not erase that already scored answer. Hard totals have their own row and are included once in
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
6. Select **Copy progress image** after answering a problem. Paste into an
   image-capable document, email, or assignment editor. Confirm the image contains
   the student name, timestamp with local time zone, category scores, Hard score,
   and overall total. The copy button itself is excluded. If automatic copying
   is blocked or unsupported, copy the displayed preview manually or take a
   screenshot of Your Progress.
7. Reload to check saved totals, resize the window, and test New student / clear
   scores. Direct-file use works offline; a hosted site needs its files loaded
   and does not install an offline service worker.

Automated checks (no build step or test dependency is required to use the site):

```sh
node tests/geometry.cjs
python3 tests/browser.py
python3 tests/hard_browser.py
python3 tests/progress_browser.py
```

The geometry checks require Node.js and test 30,000 generated problems, all six
supported rotation descriptions across the displayed integer grid, reflection
round trips and incorrect vertex matching. The browser checks
require Python's optional `playwright` package plus Chromium. For a separate test
environment, install them with `python3 -m pip install playwright` and
`python3 -m playwright install chromium`. The test uses system Chromium when
available, otherwise Playwright's installed browser.

Browser checks cover all three categories, equivalent rotations, invalid inputs,
wrong/correct retries, reveals, practice settings, coordinates, green guess
overlays (including off-grid guesses, retries, matches, and clearing), score persistence,
student reset, PNG clipboard reports, eight viewport widths from 320 to 1366
pixels, offline gameplay, direct-file use when browser policy permits, and
blocked browser storage. If managed Chromium blocks file URLs, that check is
reported as skipped and offline gameplay is tested after loading from localhost.
Tests leave application source and student data alone.


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
4. To choose a different first step, use **Undo Step 1 (no penalty)**.
   This clears the intermediate triangle and returns to Step 1 of the same
   problem without scoring an answer. You can undo repeatedly and still earn
   first-attempt credit on your first complete pair. If you already submitted
   an incorrect complete pair, undo remains free but does not erase that result.
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
correct/incorrect pairs, alternative sequences, invalid second inputs, free first-step
undo, retries, reveals, mode changes, screenshot reporting, older saved-score
migration, student reset, and eight desktop/mobile widths. Test dependencies are
the same as for `tests/browser.py`. The application itself remains a standalone
static site without test dependencies or a build process.


## Progress screenshots

The previous email, text-report, teacher-email, and CSV controls have been
replaced by **Copy progress image** and **Download progress JPEG** buttons in Your Progress. The PNG
contains the student's name, current date/time including their browser's local
time zone, all four score rows, an overall total, and the first-attempt scoring
note. The browser draws a report image directly with its built-in Canvas API,
using a consistent 1280-pixel image width so it remains readable on a phone.
It contains the same information as Your Progress, with a separately drawn layout.
The timestamp refreshes on score updates and on every copy. It comes from the
student's device clock and is not an independently verified timestamp.

Image copying uses the browser's Clipboard API on HTTPS (or localhost). Supported
browsers receive a PNG clipboard item, which can be pasted into an editor that
accepts images. If clipboard access is denied or unsupported, a PNG preview is
shown for manual copying; if image creation fails, the page explains how to take
a screenshot. Some school-managed browsers may block clipboard access. No text
report, email launch, automatic submission, or CSV download remains.

Rendering uses native Canvas 2D drawing and image encoding. There is no external
library, CDN request, dependency folder, or backend. Upload `index.html`,
`style.css`, and `script.js` from `website/` when moving the app to another host.
The app still needs no build process and can be used offline after its files load.
Old stored teacher-email fields are ignored and removed on the next local save;
existing names, mode preferences, and scores remain available.

`tests/progress_browser.py` verifies actual PNG clipboard output, student-name
handling, timestamp/time zone, combined Easy/Hard totals, refreshed captures,
permission-denied/missing/insecure clipboard fallback, rendering failures,
offline copying, narrow layouts/long names, and switching students during an
unfinished capture. It has the same optional Playwright/Chromium requirements
as the other browser tests.


### Download a JPEG

**Download progress JPEG** saves the same generated progress report as a high-quality
`.jpg` file with a white background. The image includes the student's name,
current timestamp/time zone, scores, and overall total. Its filename includes a
sanitized student name and a timestamp. Like copying, downloading requires at
least one scored problem and refreshes the capture each time.

JPEG downloads do not need clipboard permission and work even when automatic
image copying is unavailable. Both report buttons are temporarily disabled while
an image is being created. If the student changes before rendering finishes,
the previous student's JPEG is not downloaded. Rendering errors show a message
and restore both buttons. Existing clipboard copying remains PNG for browser
compatibility; the download button creates a real JPEG, not a renamed PNG.

`tests/progress_browser.py` also checks JPEG signatures and browser decoding,
image dimensions, filenames, failure recovery, download without clipboard/HTTPS,
offline download, and cancelling downloads when the student changes.


### Trying the Canvas version and going back

The Canvas renderer changes only how report images are created; the game and
saved-score format are unchanged. Review the dedicated pull request before
merging it. To try it first, download that branch's ZIP from GitHub and serve its
`website/` folder locally (for example, `python3 -m http.server 8000`).

The previous library-based version is preserved at Git commit
`7925d3dced0800e964b14fa1380199897b3e1e39` (use the full parent commit shown in the Canvas pull request if
needed). Before merging, the live site is unaffected. After merging, reverting
the Canvas pull request restores the former renderer and its vendor files;
GitHub Pages will publish the reverted version automatically. This does not
require changing stored scores. For a school-hosted copy, replace the uploaded
website files with the previous version, including its `vendor/` folder.


## Salisbury theme and author credit

The page uses maroon (#782b1b), gold (#fec81e), and white sampled from the
supplied Salisbury University logo. The original JPEG is preserved unchanged
in `website/assets/salisbury-university-logo.jpg`. Its footer credits app author Andrew Thompson and links to
https://faculty.salisbury.edu/~awthompson/welcome.htm. The footer logo links to
https://www.salisbury.edu/. Keep the `assets/` folder with the HTML, CSS, and
JavaScript when uploading to your school website. The mathematical diagrams
retain black original, red target, and green guessed triangles.
