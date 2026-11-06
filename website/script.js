/* Triangle Transformations. Uses the uploaded Java/Swing project as the mathematical
   inspiration. All calculation and scoring happen in the student's browser. */
(function () {
  'use strict';

  const CATEGORIES = ['translation', 'reflection', 'rotation'];
  const CATEGORY_NAMES = { translation: 'Translation', reflection: 'Reflection', rotation: 'Rotation' };
  const STORAGE_KEY = 'triangle-transformations-web-v1';
  const DEFAULT_TEACHER_EMAIL = ''; // Optional: teacher can put a fixed address here.
  const BOUNDS = 15;

  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
  const clone = value => JSON.parse(JSON.stringify(value));

  function applyTransformation(points, rule) {
    return points.map(([x, y]) => {
      if (rule.type === 'translation') return [x + rule.dx, y + rule.dy];
      if (rule.type === 'reflection') {
        return rule.axis === 'x' ? [2 * rule.value - x, y] : [x, 2 * rule.value - y];
      }
      if (rule.type === 'rotation') {
        const direction = rule.direction === 'cw' ? -1 : 1;
        const steps = (((rule.degrees / 90) * direction) % 4 + 4) % 4;
        if (steps === 1) return [-y, x];
        if (steps === 2) return [-x, -y];
        if (steps === 3) return [y, -x];
        return [x, y];
      }
      throw new Error('Unknown transformation');
    });
  }

  function trianglesMatch(first, second) {
    return first.length === second.length && first.every((p, i) => p[0] === second[i][0] && p[1] === second[i][1]);
  }

  function twiceArea(points) {
    const [[ax, ay], [bx, by], [cx, cy]] = points;
    return Math.abs((bx - ax) * (cy - ay) - (by - ay) * (cx - ax));
  }

  function sqDistance(a, b) {
    return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
  }

  function centroid(points) {
    return [points.reduce((sum, p) => sum + p[0], 0) / 3, points.reduce((sum, p) => sum + p[1], 0) / 3];
  }

  function sampleTriangle() {
    for (let attempt = 0; attempt < 1000; attempt++) {
      const points = Array.from({ length: 3 }, () => [rand(-9, 9), rand(-9, 9)]);
      const distances = [sqDistance(points[0], points[1]), sqDistance(points[1], points[2]), sqDistance(points[2], points[0])];
      if (distances.some(d => d < 16 || d > 190)) continue;
      const area = twiceArea(points);
      if (area < 20 || area > 145) continue;
      // Avoid nearly symmetric triangles, so identifying a transformation stays clear.
      if (new Set(distances).size !== 3) continue;
      return points;
    }
    throw new Error('Unable to generate triangle');
  }

  function sampleRule(type) {
    if (type === 'translation') {
      let dx, dy;
      do { dx = rand(-9, 9); dy = rand(-9, 9); } while (dx === 0 && dy === 0);
      return { type, dx, dy };
    }
    if (type === 'reflection') return { type, axis: Math.random() < .5 ? 'x' : 'y', value: rand(-4, 4) };
    const degrees = [90, 180, 270][rand(0, 2)];
    return { type, degrees, direction: Math.random() < .5 ? 'ccw' : 'cw' };
  }

  function generateProblem(type) {
    if (!CATEGORIES.includes(type)) throw new Error('Invalid category');
    for (let attempt = 0; attempt < 4000; attempt++) {
      const original = sampleTriangle();
      const rule = sampleRule(type);
      const transformed = applyTransformation(original, rule);
      if (transformed.some(point => point.some(value => Math.abs(value) > BOUNDS))) continue;
      // Prevent identical or almost completely superimposed problems.
      if (trianglesMatch(original, transformed)) continue;
      if (sqDistance(centroid(original), centroid(transformed)) < 9) continue;
      return { type, original, transformed, rule };
    }
    throw new Error('Unable to generate problem');
  }

  function describeRule(rule) {
    if (rule.type === 'translation') {
      const horizontal = rule.dx === 0 ? '0 horizontally' : `${Math.abs(rule.dx)} unit${Math.abs(rule.dx) === 1 ? '' : 's'} ${rule.dx > 0 ? 'right' : 'left'}`;
      const vertical = rule.dy === 0 ? '0 vertically' : `${Math.abs(rule.dy)} unit${Math.abs(rule.dy) === 1 ? '' : 's'} ${rule.dy > 0 ? 'up' : 'down'}`;
      return `Translate ${horizontal} and ${vertical}. (x, y) → (x ${rule.dx < 0 ? '−' : '+'} ${Math.abs(rule.dx)}, y ${rule.dy < 0 ? '−' : '+'} ${Math.abs(rule.dy)})`;
    }
    if (rule.type === 'reflection') return `Reflect across the ${rule.axis === 'x' ? 'vertical' : 'horizontal'} line ${rule.axis} = ${rule.value}.`;
    return `Rotate ${rule.degrees}° ${rule.direction === 'cw' ? 'clockwise' : 'counterclockwise'} around the origin (0, 0).`;
  }

  function createEmptyStats() {
    return Object.fromEntries(CATEGORIES.map(key => [key, { correct: 0, attempted: 0 }]));
  }

  function freshState(name = '') {
    return { name, stats: createEmptyStats(), history: [], served: 0, focus: 'all', teacherEmail: DEFAULT_TEACHER_EMAIL };
  }

  function validateSavedState(candidate) {
    if (!candidate || typeof candidate.name !== 'string' || !candidate.name.trim() || candidate.name.length > 80) return null;
    const state = freshState(candidate.name.trim());
    for (const key of CATEGORIES) {
      const row = candidate.stats && candidate.stats[key];
      if (!row || !Number.isSafeInteger(row.correct) || !Number.isSafeInteger(row.attempted) || row.correct < 0 || row.attempted < row.correct) return null;
      state.stats[key] = { correct: row.correct, attempted: row.attempted };
    }
    state.served = Number.isSafeInteger(candidate.served) && candidate.served >= 0 ? candidate.served : 0;
    state.focus = [...CATEGORIES, 'all'].includes(candidate.focus) ? candidate.focus : 'all';
    state.teacherEmail = typeof candidate.teacherEmail === 'string' ? candidate.teacherEmail.slice(0, 254) : DEFAULT_TEACHER_EMAIL;
    state.history = Array.isArray(candidate.history) ? candidate.history.slice(-300) : [];
    return state;
  }

  function escapeCsv(value) {
    let cell = String(value == null ? '' : value);
    if (/^[\s]*[=+\-@\t\r]/.test(cell)) cell = "'" + cell;
    return '"' + cell.replace(/"/g, '""') + '"';
  }

  function init() {
    const $ = id => document.getElementById(id);
    const startPanel = $('startPanel');
    const gameArea = $('gameArea');
    const startForm = $('startForm');
    const studentName = $('studentName');
    const feedback = $('feedback');
    const answerForm = $('answerForm');
    const checkBtn = $('checkBtn');
    const nextBtn = $('nextBtn');
    const revealBtn = $('revealBtn');
    const teacherEmail = $('teacherEmail');
    const practiceType = $('practiceType');
    const svg = $('coordinatePlane');
    const showCoords = $('showCoords');
    let state = freshState();
    let currentProblem = null;
    let guessPoints = null;
    let firstSubmitted = false;
    let solved = false;
    let mixedBag = [];

    function save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* storage may be blocked */ }
    }

    function sumScore() {
      return CATEGORIES.reduce((total, key) => ({
        correct: total.correct + state.stats[key].correct,
        attempted: total.attempted + state.stats[key].attempted
      }), { correct: 0, attempted: 0 });
    }

    const percent = (correct, attempted) => attempted ? `${Math.round(100 * correct / attempted)}%` : '—';

    function updateScoreboard() {
      const total = sumScore();
      $('overallCorrect').textContent = total.correct;
      $('overallAttempted').textContent = total.attempted;
      $('overallAccuracy').textContent = percent(total.correct, total.attempted);
      for (const key of CATEGORIES) {
        const { correct, attempted } = state.stats[key];
        $(key + 'Correct').textContent = correct;
        $(key + 'Attempted').textContent = attempted;
        $(key + 'Accuracy').textContent = percent(correct, attempted);
      }
    }

    function showSession() {
      $('displayName').textContent = state.name;
      startPanel.hidden = true;
      gameArea.hidden = false;
      practiceType.value = state.focus;
      teacherEmail.value = state.teacherEmail;
      updateScoreboard();
      newProblem();
    }

    function pickCategory() {
      if (state.focus !== 'all') return state.focus;
      if (mixedBag.length === 0) {
        mixedBag = CATEGORIES.slice();
        for (let i = mixedBag.length - 1; i > 0; i--) {
          const j = rand(0, i);
          [mixedBag[i], mixedBag[j]] = [mixedBag[j], mixedBag[i]];
        }
      }
      return mixedBag.pop();
    }

    function resetForm() {
      answerForm.reset();
      $('answerPrompt').hidden = false;
      ['translation', 'reflection', 'rotation'].forEach(key => $(key + 'Fields').hidden = true);
      feedback.hidden = true;
      feedback.className = 'feedback';
      checkBtn.disabled = false;
      revealBtn.disabled = false;
      nextBtn.disabled = true;
      answerForm.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
    }

    function newProblem() {
      currentProblem = generateProblem(pickCategory());
      guessPoints = null;
      firstSubmitted = false;
      solved = false;
      state.served += 1;
      $('problemNumber').textContent = `Problem ${state.served}`;
      showCoords.checked = false;
      $('coordinatesPanel').hidden = true;
      resetForm();
      drawBoard();
      save();
    }

    const svgNS = 'http://www.w3.org/2000/svg';
    const margin = 50;
    const step = 22;
    const xCoord = x => margin + (x + BOUNDS) * step;
    const yCoord = y => margin + (BOUNDS - y) * step;

    function svgNode(tag, attributes = {}, content) {
      const node = document.createElementNS(svgNS, tag);
      for (const [name, value] of Object.entries(attributes)) node.setAttribute(name, String(value));
      if (content != null) node.textContent = content;
      return node;
    }

    function drawBoard() {
      svg.replaceChildren();
      const background = svgNode('rect', { x: 0, y: 0, width: 760, height: 760, fill: '#fff' });
      svg.appendChild(background);
      const grid = svgNode('g');
      for (let k = -BOUNDS; k <= BOUNDS; k++) {
        const major = k % 5 === 0;
        const color = major ? '#ccd3dc' : '#e9edf2';
        grid.appendChild(svgNode('line', { x1: xCoord(k), y1: margin, x2: xCoord(k), y2: yCoord(-BOUNDS), stroke: color, 'stroke-width': major ? 1.5 : .9 }));
        grid.appendChild(svgNode('line', { x1: margin, y1: yCoord(k), x2: xCoord(BOUNDS), y2: yCoord(k), stroke: color, 'stroke-width': major ? 1.5 : .9 }));
      }
      svg.appendChild(grid);
      svg.appendChild(svgNode('line', { x1: xCoord(-BOUNDS), y1: yCoord(0), x2: xCoord(BOUNDS) + 6, y2: yCoord(0), stroke: '#566171', 'stroke-width': 2.8 }));
      svg.appendChild(svgNode('line', { x1: xCoord(0), y1: yCoord(-BOUNDS), x2: xCoord(0), y2: yCoord(BOUNDS) - 6, stroke: '#566171', 'stroke-width': 2.8 }));
      for (let k = -BOUNDS; k <= BOUNDS; k += 5) {
        if (k === 0) continue;
        svg.appendChild(svgNode('text', { x: xCoord(k), y: yCoord(0) + 23, 'font-size': 15, fill: '#5a6370', 'text-anchor': 'middle', 'font-family': 'sans-serif' }, k));
        svg.appendChild(svgNode('text', { x: xCoord(0) - 12, y: yCoord(k) + 5, 'font-size': 15, fill: '#5a6370', 'text-anchor': 'end', 'font-family': 'sans-serif' }, k));
      }
      svg.appendChild(svgNode('text', { x: xCoord(0) - 13, y: yCoord(0) + 23, 'font-size': 15, fill: '#5a6370', 'text-anchor': 'end', 'font-family': 'sans-serif' }, '0'));
      svg.appendChild(svgNode('text', { x: 734, y: yCoord(0) - 9, 'font-size': 21, 'font-weight': 800, 'font-style': 'italic', fill: '#39485a', 'text-anchor': 'middle' }, 'x'));
      svg.appendChild(svgNode('text', { x: xCoord(0) + 14, y: 34, 'font-size': 21, 'font-weight': 800, 'font-style': 'italic', fill: '#39485a', 'text-anchor': 'middle' }, 'y'));
      // Draw red first so the original outline remains distinguishable where shapes overlap.
      drawTriangle(currentProblem.transformed, '#d62839', '#d62839', true);
      drawTriangle(currentProblem.original, '#18212b', '#111820', false);
      const guessStatus = $('guessStatus');
      guessStatus.hidden = !guessPoints;
      svg.setAttribute('aria-label', 'Cartesian coordinate grid from −15 to 15, with horizontal x and vertical y axes, showing the black original and red transformed triangle.' +
        (guessPoints ? ' Your last submitted guess is the green dashed triangle, labeled A*, B*, C*.' : ''));
      if (guessPoints) {
        // Clip out-of-range guesses to the actual coordinate plane, without changing their coordinates.
        const defs = svgNode('defs');
        const clip = svgNode('clipPath', { id: 'guessClip' });
        clip.appendChild(svgNode('rect', { x: margin, y: margin, width: 2 * BOUNDS * step, height: 2 * BOUNDS * step }));
        defs.appendChild(clip);
        svg.appendChild(defs);
        drawTriangle(guessPoints, '#16803c', 'none', false, true);
        const outside = guessPoints.some(point => point.some(value => Math.abs(value) > BOUNDS));
        guessStatus.textContent = 'Your last submitted guess is green and dashed (A*, B*, C*).' +
          (outside ? ' Some or all of your guess is outside the displayed −15 to 15 grid. Show vertex coordinates to see its full position.' : '');
      }
      const coordPanel = $('coordinatesPanel');
      if (showCoords.checked) {
        coordPanel.hidden = false;
        coordPanel.replaceChildren();
        const title = document.createElement('strong');
        title.textContent = 'Vertex coordinates';
        coordPanel.appendChild(title);
        const columns = document.createElement('div');
        columns.className = 'coord-pair';
        const sets = [[currentProblem.original, 'black', ''], [currentProblem.transformed, 'red', '′']];
        if (guessPoints) sets.push([guessPoints, 'green', '*']);
        sets.forEach(([pts, color, suffix]) => {
          const col = document.createElement('div');
          col.className = `coord-col coord-${color}`;
          for (let i = 0; i < 3; i++) {
            const row = document.createElement('span');
            row.textContent = `${'ABC'[i]}${suffix} = (${pts[i][0]}, ${pts[i][1]})`;
            col.appendChild(row);
          }
          columns.appendChild(col);
        });
        coordPanel.appendChild(columns);
      } else {
        coordPanel.hidden = true;
      }
    }

    function drawTriangle(points, stroke, fill, red, guessed = false) {
      const group = svgNode('g', { id: guessed ? 'guessTriangle' : red ? 'transformedTriangle' : 'originalTriangle' });
      if (guessed) group.setAttribute('clip-path', 'url(#guessClip)');
      svg.appendChild(group);
      const vertexCoordinates = points.map(([x, y]) => `${xCoord(x)},${yCoord(y)}`).join(' ');
      group.appendChild(svgNode('polygon', {
        points: vertexCoordinates, fill, 'fill-opacity': .13, stroke,
        'stroke-width': guessed ? 2.8 : 3.8, 'stroke-linejoin': 'round',
        'stroke-dasharray': guessed ? '10 7' : 'none'
      }));
      points.forEach(([x, y], i) => {
        const px = xCoord(x), py = yCoord(y);
        const dot = svgNode('circle', { cx: px, cy: py, r: guessed ? 7.5 : 5.2, fill: guessed ? 'none' : stroke, stroke: guessed ? stroke : '#fff', 'stroke-width': guessed ? 2 : 1.5 });
        dot.appendChild(svgNode('title', {}, `${'ABC'[i]}${guessed ? ' guess' : red ? ' prime' : ''} (${x}, ${y})`));
        group.appendChild(dot);
        const dx = guessed ? (px > 100 ? -11 : 11) : px > 666 ? -10 : 11;
        const dy = guessed ? -34 : red ? 24 : -11;
        group.appendChild(svgNode('text', {
          x: px + dx, y: Math.max(24, Math.min(743, py + dy)),
          'font-size': 21, 'font-weight': 800, 'font-family': 'sans-serif',
          'paint-order': 'stroke', stroke: 'white', 'stroke-width': 4,
          fill: stroke, 'text-anchor': dx < 0 ? 'end' : 'start'
        }, `${'ABC'[i]}${guessed ? '*' : red ? '′' : ''}`));
      });
    }

    function toggleFields() {
      const choice = answerForm.querySelector('input[name="transformType"]:checked');
      const selected = choice ? choice.value : null;
      $('answerPrompt').hidden = Boolean(selected);
      for (const category of CATEGORIES) $(category + 'Fields').hidden = selected !== category;
    }

    function readNumber(id, label) {
      const input = $(id);
      const val = input.value.trim();
      const number = Number(val);
      if (val === '' || !Number.isSafeInteger(number) || !input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        throw new Error(`Enter a whole number for ${label}.`);
      }
      input.removeAttribute('aria-invalid');
      return number;
    }

    function readGuess() {
      const selected = answerForm.querySelector('input[name="transformType"]:checked');
      if (!selected) throw new Error('Choose Translation, Reflection, or Rotation first.');
      const type = selected.value;
      if (type === 'translation') return { type, dx: readNumber('translateX', 'horizontal movement'), dy: readNumber('translateY', 'vertical movement') };
      if (type === 'reflection') return { type, axis: $('reflectAxis').value, value: readNumber('reflectValue', 'the mirror line') };
      if (type === 'rotation') {
        const degrees = Number($('rotateDegrees').value);
        if (![90, 180, 270].includes(degrees)) throw new Error('Choose a rotation angle.');
        return { type, degrees, direction: $('rotateDirection').value };
      }
      throw new Error('Select a supported transformation.');
    }

    function showFeedback(title, message, kind) {
      feedback.className = `feedback ${kind}`;
      feedback.replaceChildren();
      const heading = document.createElement('strong');
      heading.textContent = title;
      const detail = document.createElement('p');
      detail.textContent = message;
      feedback.append(heading, detail);
      feedback.hidden = false;
    }

    function recordFirstAnswer(correct, guess) {
      if (firstSubmitted) return;
      firstSubmitted = true;
      const bucket = state.stats[currentProblem.type];
      bucket.attempted++;
      if (correct) bucket.correct++;
      state.history.push({
        at: new Date().toISOString(), category: currentProblem.type,
        firstTryCorrect: correct, guess: guess ? describeRule(guess) : 'Solution revealed'
      });
      if (state.history.length > 300) state.history.shift();
      updateScoreboard();
      save();
    }

    function setSolved() {
      solved = true;
      checkBtn.disabled = true;
      revealBtn.disabled = true;
      nextBtn.disabled = false;
    }

    function submitAnswer(event) {
      event.preventDefault();
      if (solved || !currentProblem) return;
      let guess;
      try {
        guess = readGuess();
      } catch (error) {
        showFeedback('Complete your answer', error.message, 'info');
        return;
      }
      guessPoints = applyTransformation(currentProblem.original, guess);
      drawBoard();
      const correct = trianglesMatch(guessPoints, currentProblem.transformed);
      const onFirstTry = !firstSubmitted;
      recordFirstAnswer(correct, guess);
      nextBtn.disabled = false;
      if (correct) {
        setSolved();
        showFeedback('Correct transformation!', onFirstTry
          ? `Great work! ${describeRule(guess)} Your first-try score increased.`
          : `You found it! ${describeRule(guess)} This problem remains marked incorrect for first-try scoring.`, 'good');
      } else {
        showFeedback(onFirstTry ? 'Not quite — try again.' : 'Still not a match.',
          'The green dashed triangle shows where your guess sends the original. Your first answer is scored. You can adjust your transformation and check again, show the solution, or move to the next problem.', 'bad');
      }
    }

    function revealAnswer() {
      if (solved) return;
      recordFirstAnswer(false, null);
      setSolved();
      showFeedback('Solution', describeRule(currentProblem.rule) + ' This problem is counted as missed in your first-try score.', 'info');
    }

    function makeReport() {
      const total = sumScore();
      const lines = [
        'TRIANGLE TRANSFORMATIONS — STUDENT RESULTS',
        `Student: ${state.name}`,
        `Report created: ${new Date().toLocaleString()}`,
        '',
        `Overall: ${total.correct} correct out of ${total.attempted} answered (${percent(total.correct, total.attempted)})`,
        ...CATEGORIES.map(key => `${CATEGORY_NAMES[key]}: ${state.stats[key].correct} correct out of ${state.stats[key].attempted} answered (${percent(state.stats[key].correct, state.stats[key].attempted)})`),
        '',
        'Scoring: Only the first answer to each problem counts. Revealing a solution counts as incorrect.',
        'Results are student-generated in a web browser; they are not independently verified.'
      ];
      return lines.join('\n');
    }

    function canReport() {
      if (sumScore().attempted === 0) {
        $('reportStatus').textContent = 'Answer at least one problem before creating a score report.';
        return false;
      }
      return true;
    }

    function sendEmail() {
      if (!canReport()) return;
      const address = teacherEmail.value.trim();
      if (!address || !teacherEmail.checkValidity()) {
        $('reportStatus').textContent = 'Enter a valid teacher email address first.';
        teacherEmail.focus();
        return;
      }
      state.teacherEmail = address;
      save();
      const subject = `Triangle Transformations Score — ${state.name}`;
      const emailLink = `mailto:${encodeURIComponent(address)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(makeReport())}`;
      $('reportStatus').textContent = 'Opening your email application. Review the report and press Send. If nothing opens, use Copy report.';
      window.location.href = emailLink;
    }

    async function copyReport() {
      if (!canReport()) return;
      const report = makeReport();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(report);
            $('reportStatus').textContent = 'Report copied. Paste it into an email, document, or learning management system.';
            return;
          } catch (_) { /* Try the legacy path if clipboard permission is denied. */ }
        }
        const previousFocus = document.activeElement;
        const temp = document.createElement('textarea');
        try {
          temp.value = report;
          temp.style.position = 'fixed';
          temp.style.left = '-9999px';
          document.body.appendChild(temp);
          temp.select();
          if (!document.execCommand('copy')) throw new Error('Clipboard unavailable');
        } finally {
          temp.remove();
          if (previousFocus) previousFocus.focus({ preventScroll: true });
        }
        $('reportStatus').textContent = 'Report copied. Paste it into an email, document, or learning management system.';
      } catch (_) {
        $('reportStatus').textContent = 'Copying was blocked by the browser. Try Download CSV instead.';
      }
    }

    function downloadCsv() {
      if (!canReport()) return;
      const total = sumScore();
      const headers = ['Student Name', 'Report Date', 'Overall Correct', 'Overall Answered', 'Overall Accuracy',
        ...CATEGORIES.flatMap(key => [`${CATEGORY_NAMES[key]} Correct`, `${CATEGORY_NAMES[key]} Answered`, `${CATEGORY_NAMES[key]} Accuracy`])];
      const values = [state.name, new Date().toLocaleString(), total.correct, total.attempted, percent(total.correct, total.attempted),
        ...CATEGORIES.flatMap(key => {
          const row = state.stats[key];
          return [row.correct, row.attempted, percent(row.correct, row.attempted)];
        })];
      const csv = '\uFEFF' + [headers.map(escapeCsv).join(','), values.map(escapeCsv).join(',')].join('\r\n') + '\r\n';
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      const fileName = state.name.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 50) || 'student';
      anchor.download = `TriangleTransformations_${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      $('reportStatus').textContent = 'CSV score report downloaded. Attach the file to an email or submit it to your teacher.';
    }

    startForm.addEventListener('submit', event => {
      event.preventDefault();
      const name = studentName.value.trim().replace(/\s+/g, ' ');
      if (!name) { studentName.focus(); return; }
      state = freshState(name);
      mixedBag = [];
      save();
      showSession();
    });
    answerForm.addEventListener('submit', submitAnswer);
    answerForm.querySelectorAll('input[name="transformType"]').forEach(el => el.addEventListener('change', toggleFields));
    showCoords.addEventListener('change', drawBoard);
    revealBtn.addEventListener('click', revealAnswer);
    nextBtn.addEventListener('click', () => {
      newProblem();
      // The Next button becomes disabled; move focus to the new question.
      $('graphTitle').focus();
    });
    practiceType.addEventListener('change', () => {
      state.focus = practiceType.value;
      mixedBag = [];
      save();
    });
    teacherEmail.addEventListener('change', () => { state.teacherEmail = teacherEmail.value.trim(); save(); });
    $('emailBtn').addEventListener('click', sendEmail);
    $('copyBtn').addEventListener('click', copyReport);
    $('csvBtn').addEventListener('click', downloadCsv);
    $('newStudentBtn').addEventListener('click', () => {
      if (!window.confirm('Start a new student session? This removes the current student name and all scores saved on this browser. Download or email the results first if you need them.')) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      state = freshState();
      mixedBag = [];
      currentProblem = null;
      guessPoints = null;
      startForm.reset();
      startPanel.hidden = false;
      gameArea.hidden = true;
      $('reportStatus').textContent = '';
      studentName.focus();
    });

    let loaded = null;
    try { loaded = validateSavedState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { /* storage not enabled */ }
    if (loaded) { state = loaded; showSession(); }
  }

  // Expose pure mathematical helpers for automated testing in Node; no server required.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyTransformation, trianglesMatch, generateProblem, describeRule, twiceArea, escapeCsv };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
