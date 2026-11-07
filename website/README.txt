TRIANGLE TRANSFORMATIONS — WEB GAME
===================================

Built from the ideas in the Java Swing Transformations_ project by
Brian Lawrence and Andrew Thompson.

FILES
-----
index.html  — webpage structure
style.css   — appearance and responsive layout
script.js   — triangle generation, geometry, answer checking, scoring, image reports
vendor/     — bundled html2canvas 1.4.1 renderer and MIT license

QUICK START
-----------
1. Unzip TriangleTransformationsWeb.zip.
2. Open the TriangleTransformationsWeb folder.
3. Double-click index.html to open the game in your web browser.
4. Enter a student name and select Start playing.

No Java, build process, or backend server is required. The image renderer is
bundled locally in vendor/. The game works offline after its files are loaded.

HOST IT AND LINK IT FROM YOUR HOMEPAGE
--------------------------------------
Upload the entire TriangleTransformationsWeb folder to your website. Keep
index.html, style.css, script.js and the vendor/ folder together. From an HTML
homepage one directory above that folder, add:

<a href="TriangleTransformationsWeb/index.html">Triangle Transformations Game</a>

If you rename the folder to triangle-transformations, update the link to:

<a href="triangle-transformations/index.html">Triangle Transformations Game</a>

If the homepage and game are hosted in different directories, adjust the URL.

HOW THE GAME WORKS
------------------
- The black triangle is the original; the red triangle is the result.
- Students select Easy (one transformation) or Hard (two transformations),
  then choose Translation, Reflection or Rotation and enter each rule.
- Translations: whole-number horizontal and vertical offsets.
- Reflections: a vertical line x = a or horizontal line y = b.
- Rotations: 90, 180, 270 degrees, clockwise or counterclockwise, about (0,0).
- Equivalent descriptions, such as 90 degrees clockwise and 270 degrees
  counterclockwise, are both accepted if they map all vertices exactly.
- After each valid submitted guess, a green dashed triangle shows where that
  transformation sends the original black triangle. Its vertices are A*, B*, C*.
  Each retry replaces the previous green triangle; it does not transform the
  previous guess in Easy mode. In Hard mode Step 2 always starts from the
  saved Step 1 result. The overlay clears for each new problem.
- Correct guesses overlay the red target; dashed edges and hollow vertex markers
  keep the red triangle visible. Invalid/incomplete answers do not change the
  last valid guess or count as attempts.
- If a guess extends outside the -15 to 15 grid, only its visible portion is
  drawn. A message explains this; the coordinate readout shows its full position.
- The optional "Show vertex coordinates" toggle provides a learning aid and
  includes the green guessed vertices after an answer is submitted.
- Mixed mode distributes the three types evenly in shuffled groups.
- In Easy mode, practice settings limit newly generated problems to one category.
  In Hard mode, the focus selects the first category; the second uses another type.
  Mode and focus changes apply to the next problem.

SCORING
-------
The student's first valid answer to each question determines the score:
  Correct on first answer: one correct, one answered.
  Incorrect on first answer: zero correct, one answered.
  Reveal without answering: zero correct, one answered.
Invalid/incomplete forms do not count as attempts. Students can retry after an
incorrect response, but retries cannot increase the first-attempt score.
The score table contains category totals and percentages for Easy problems,
plus a separate Hard (two steps) row. Each Hard problem counts once overall.
In Hard mode the first complete pair determines the score. A submitted first
step alone is not scored. Resetting Step 1 immediately marks the problem missed;
repeated resets or later correct answers cannot alter that first-attempt score.

STUDENT INFORMATION AND TEACHER REPORTS
---------------------------------------
The name and results are saved in the browser's localStorage, on that device,
where browser policy permits. The program has no accounts or remote database.
On shared devices, students should copy their progress screenshot first, then
use "New student / clear scores" before the next person begins.

Use "Copy progress screenshot" in Your Progress to copy a PNG image containing:
  - The student's name and the current date/time with local time zone.
  - Easy category scores, the Hard (two steps) score, and an overall total.
  - The first-attempt scoring explanation.
Paste the image into an assignment editor, document, or email that accepts images.
The screenshot has a consistent readable size even when copied from a phone.
At least one problem must be scored before copying.

Automatic image copying needs HTTPS or localhost and browser Clipboard API support.
If the browser blocks or does not support image copying, a preview appears for
manual copying. Right-click or press and hold the preview for your browser's
image-copy options, or take a screenshot of Your Progress. A rendering failure
shows instructions instead of claiming that a copy succeeded.

The previous email, teacher-email, copy-text, and CSV controls have been removed.
The app never sends scores automatically. Rendering happens on the device using
the bundled renderer; there are no third-party requests for screenshots.
For formal graded assignments, these browser-generated scores and device-clock
timestamps can be altered and are not independently verified.

MODE SCOPE
----------
Easy mode implements one transformation per problem, like beginner Java play.
Hard mode implements two transformations in order, inspired by advanced Java play:
  1. Submit Step 1 to see the intermediate triangle in green.
  2. Submit Step 2 to transform that intermediate triangle, then check the pair.
  3. Retry Step 2 from the saved first result, or reset Step 1 (counts as wrong).
Any pair mapping every corresponding vertex to the red triangle is accepted.
The coordinate toggle shows the saved first result with subscript 1 after Step 2.
Generated problems use two different types, keep both stages within the grid,
and cannot be solved by one supported transformation. Solution reveal describes
one valid pair in order. Next problem clears the steps and the green triangle.
Mode selection and scores are saved locally, preserving older Easy-mode scores.

WEB HOSTING / PRIVACY NOTES
---------------------------
The website uses only local static files, including its bundled image renderer.
It has no remote submission endpoint, cookies, trackers, or third-party requests.
Data is saved in each browser rather than collected centrally. Clearing site
data or changing devices may erase or hide saved scores. Local file URLs may
have differing storage restrictions across browsers; hosting the complete website folder
under HTTPS is recommended for a consistent classroom deployment.
