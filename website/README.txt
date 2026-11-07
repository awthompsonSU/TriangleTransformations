TRIANGLE TRANSFORMATIONS — WEB GAME
===================================

Built from the ideas in the Java Swing Transformations_ project by
Brian Lawrence and Andrew Thompson.

FILES
-----
index.html  — webpage structure
style.css   — appearance and responsive layout
script.js   — triangle generation, geometry, answer checking, scoring, email/CSV

QUICK START
-----------
1. Unzip TriangleTransformationsWeb.zip.
2. Open the TriangleTransformationsWeb folder.
3. Double-click index.html to open the game in your web browser.
4. Enter a student name and select Start playing.

No Java, server, or external libraries are required. The game works offline.

HOST IT AND LINK IT FROM YOUR HOMEPAGE
--------------------------------------
Upload the entire TriangleTransformationsWeb folder to your website. Keep
index.html, style.css and script.js together in the same folder. From an HTML
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
On shared devices, students should download/send the report first, then use
"New student / clear scores" before the next person begins.

In "Share your results," the student can:
  1. Type a teacher's email and select "Prepare email". This launches the
     device's configured email client with a prewritten report. The student
     must review and SEND it; it is not sent automatically.
  2. Choose "Copy report" and paste the score into email or an LMS.
  3. Choose "Download CSV" to produce a score file for Excel/Sheets or LMS.

If no email client is configured, use Copy report or Download CSV.
For formal graded assignments, a secure server-based submission system with
student authentication is recommended: these browser-generated scores can
be altered and are not independently verified.

To prefill the same teacher email for newly started sessions, change the line
in script.js:

  const DEFAULT_TEACHER_EMAIL = '';

For example:

  const DEFAULT_TEACHER_EMAIL = 'your-address@school.edu';

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
The website has no external scripts, cookies, trackers or network requests.
Data is saved in each browser rather than collected centrally. Clearing site
data or changing devices may erase or hide saved scores. Local file URLs may
have differing storage restrictions across browsers; hosting the three files
under HTTPS is recommended for a consistent classroom deployment.
