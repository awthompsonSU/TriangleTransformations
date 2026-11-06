# Triangle Transformations — instructions for Codex

## Purpose
This repository is a browser-based coordinate-geometry practice game adapted from a legacy Java Swing app. Students identify one transformation in Easy mode, or an ordered pair in Hard mode, that sends a black original triangle to a red transformed triangle.

## Project layout
- `website/index.html`: browser interface (entry point)
- `website/style.css`: styling and mobile layout
- `website/script.js`: coordinate geometry, problem generation, answer checking, scoring and reports
- `legacy-java/`: reference Java source only; do not edit unless explicitly asked
- `original-java-project.zip`: unmodified uploaded Java project for reference
- `website/README.txt`: current behavior and deployment notes

## Preserve these mathematical requirements
- Translations by integer horizontal and vertical offsets.
- Reflections in vertical lines `x = a` and horizontal lines `y = b` (not only the coordinate axes).
- Rotations around the origin by 90°, 180° or 270°, clockwise and counterclockwise.
- Render black original and red transformed triangle clearly with corresponding labeled vertices.
- Evaluate a student's chosen operation by whether it maps every original vertex to its corresponding transformed vertex; accept equivalent descriptions (e.g. 90° CW = 270° CCW, and either direction for 180°).
- Keep both triangles within the displayed coordinate plane and generate nondegenerate, visually readable problems. Test edge cases and wrong answers.
- Track first-attempt correct and attempted counts for each type and overall. Invalid/unsubmitted answers must not count. A retry must never inflate the first-attempt score.
- Hard mode applies the student's second rule to the saved Step 1 result. Accept any valid ordered pair by its final geometry; do not require the generated hidden sequence.
- Show the green intermediate after Step 1 and the combined result after Step 2. Retrying Step 2 must not compound prior second guesses.
- Resetting Step 1 immediately marks the Hard problem missed, once per problem. First-step submission alone is not scored; the first complete pair is scored unless reset/reveal already marked it missed. Hard problems have a separate score row and count once overall.
- Preserve old saved Easy-mode scores when loading sessions without Hard stats or a mode field.
- Store name and progress locally as currently implemented unless asked to add a backend.

## Teacher reporting and privacy
- Current email action uses the student's installed email program via a mailto link; it does NOT email automatically.
- Keep copyable results and CSV download working.
- Browser-stored scores are user-editable and not tamper-proof; do not present them as verified grades.
- Do not add a remote collection endpoint, third-party tracking or hard-coded student information without explicit request.

## Development guidance
- Favor simple plain HTML, CSS and JavaScript with no mandatory build process. The site should work as a static website with the existing homepage link.
- Make small, tested changes; keep behavior accessible and usable on desktop and Chromebooks.
- Before and after changes, test all three categories, both rotation directions, answer validation, first-attempt scores, student reset, email/report export, and responsive layout.
- Discuss new features such as advanced multi-step mode or server-based grading before introducing substantial complexity.

## Verification

Run `node tests/geometry.cjs`, `python3 tests/browser.py`, and `python3 tests/hard_browser.py`. Browser tests need Playwright and Chromium; the application has no such runtime dependencies.
