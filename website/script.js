/* Triangle Transformations. Uses the uploaded Java/Swing project as the mathematical
   inspiration. All calculation and scoring happen in the student's browser. */
(function () {
  'use strict';

  const CATEGORIES = ['translation', 'reflection', 'rotation'];
  const CATEGORY_NAMES = { translation: 'Translation', reflection: 'Reflection', rotation: 'Rotation' };
  const SCORE_KEYS = [...CATEGORIES, 'hard'];
  const STORAGE_KEY = 'triangle-transformations-web-v1';
  const BOUNDS = 15;

  const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

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

  function mapsInOneStep(original, transformed) {
    const [x, y] = original[0], [tx, ty] = transformed[0];
    const candidates = [
      { type: 'translation', dx: tx - x, dy: ty - y },
      { type: 'reflection', axis: 'x', value: (x + tx) / 2 },
      { type: 'reflection', axis: 'y', value: (y + ty) / 2 },
      ...[90, 180, 270].map(degrees => ({ type: 'rotation', degrees, direction: 'ccw' }))
    ];
    return candidates.some(rule => trianglesMatch(applyTransformation(original, rule), transformed));
  }

  function generateHardProblem(firstType) {
    if (!CATEGORIES.includes(firstType)) throw new Error('Invalid category');
    const secondTypes = CATEGORIES.filter(type => type !== firstType);
    for (let attempt = 0; attempt < 4000; attempt++) {
      const first = generateProblem(firstType);
      const secondRule = sampleRule(secondTypes[rand(0, secondTypes.length - 1)]);
      const transformed = applyTransformation(first.transformed, secondRule);
      if (transformed.some(point => point.some(value => Math.abs(value) > BOUNDS))) continue;
      if (sqDistance(centroid(first.transformed), centroid(transformed)) < 9) continue;
      if (sqDistance(centroid(first.original), centroid(transformed)) < 9) continue;
      // Require a genuine two-step challenge, rather than a supported single rule.
      if (mapsInOneStep(first.original, transformed)) continue;
      return { type: 'hard', mode: 'hard', original: first.original,
        intermediate: first.transformed, transformed, rules: [first.rule, secondRule] };
    }
    throw new Error('Unable to generate two-step problem');
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
    return Object.fromEntries(SCORE_KEYS.map(key => [key, { correct: 0, attempted: 0 }]));
  }

  function freshState(name = '') {
    return { name, stats: createEmptyStats(), history: [], served: 0, focus: 'all', mode: 'easy' };
  }

  function validateSavedState(candidate) {
    if (!candidate || typeof candidate.name !== 'string' || !candidate.name.trim() || candidate.name.length > 80) return null;
    const state = freshState(candidate.name.trim());
    for (const key of SCORE_KEYS) {
      const row = candidate.stats && candidate.stats[key];
      if (key === 'hard' && row === undefined) continue; // Preserve pre-mode saved scores.
      if (!row || !Number.isSafeInteger(row.correct) || !Number.isSafeInteger(row.attempted) || row.correct < 0 || row.attempted < row.correct) return null;
      state.stats[key] = { correct: row.correct, attempted: row.attempted };
    }
    state.served = Number.isSafeInteger(candidate.served) && candidate.served >= 0 ? candidate.served : 0;
    state.focus = [...CATEGORIES, 'all'].includes(candidate.focus) ? candidate.focus : 'all';
    state.mode = candidate.mode === 'hard' ? 'hard' : 'easy';
    state.history = Array.isArray(candidate.history) ? candidate.history.slice(-300) : [];
    return state;
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
    const copyProgressBtn = $('copyProgressBtn');
    let progressPreviewUrl = null;
    const practiceType = $('practiceType');
    const gameMode = $('gameMode');
    const resetFirstBtn = $('resetFirstBtn');
    const svg = $('coordinatePlane');
    const showCoords = $('showCoords');
    let state = freshState();
    let currentProblem = null;
    let guessPoints = null;
    let firstGuess = null;
    let intermediatePoints = null;
    let secondGuessSubmitted = false;
    let firstSubmitted = false;
    let solved = false;
    let mixedBag = [];

    function save() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* storage may be blocked */ }
    }

    function sumScore() {
      return SCORE_KEYS.reduce((total, key) => ({
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
      $('progressOverallCorrect').textContent = total.correct;
      $('progressOverallAttempted').textContent = total.attempted;
      $('progressOverallAccuracy').textContent = percent(total.correct, total.attempted);
      updateProgressIdentity(new Date());
      clearProgressPreview();
      $('reportStatus').textContent = '';
      for (const key of SCORE_KEYS) {
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
      gameMode.value = state.mode;
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
      const category = pickCategory();
      currentProblem = state.mode === 'hard' ? generateHardProblem(category) : { ...generateProblem(category), mode: 'easy' };
      guessPoints = null;
      firstGuess = null;
      intermediatePoints = null;
      secondGuessSubmitted = false;
      firstSubmitted = false;
      solved = false;
      state.served += 1;
      $('problemNumber').textContent = `Problem ${state.served}`;
      showCoords.checked = false;
      $('coordinatesPanel').hidden = true;
      resetForm();
      updateStepUI();
      drawBoard();
      save();
    }

    function updateStepUI() {
      const hard = currentProblem.mode === 'hard';
      $('modeLabel').textContent = hard ? 'Hard · two transformations' : 'Easy · one transformation';
      $('graphInstructions').textContent = hard
        ? 'Find two transformations, in order, that map the black triangle onto the red triangle. Submit Step 1 to see its result in green, then enter Step 2.'
        : 'Find a single transformation that maps the black triangle onto the red triangle. Corresponding vertices use matching letters. Submit an answer to see your guess in green.';
      $('answerTitle').textContent = hard ? (firstGuess ? 'Step 2 of 2' : 'Step 1 of 2') : 'Choose a transformation';
      checkBtn.textContent = hard ? (firstGuess ? 'Check two-step answer' : 'Apply first transformation') : 'Check my answer';
      resetFirstBtn.hidden = !hard || !firstGuess;
      resetFirstBtn.disabled = solved;
      $('firstStepSummary').hidden = !hard || !firstGuess;
      $('firstStepSummary').textContent = firstGuess ? `Step 1: ${describeRule(firstGuess)} Step 2 always starts from this first result.` : '';
      updatePracticeSettings();
    }

    function updatePracticeSettings() {
      const hard = state.mode === 'hard';
      $('practiceTypeLabel').textContent = hard ? 'First transformation to generate' : 'Problems to generate';
      for (const option of practiceType.options) {
        option.textContent = option.value === 'all' ? 'All transformations (mixed)'
          : `${CATEGORY_NAMES[option.value]}${hard ? ' first' : 's only'}`;
      }
      $('practiceHelp').textContent = hard
        ? 'Applies to the next problem. Hard problems use two different transformation types; this focus sets the first type, and the second is mixed. You may solve them using any valid pair.'
        : 'The selection applies to your next problem. Mixed practice rotates evenly through the three categories.';
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
        const label = currentProblem.mode === 'hard'
          ? (secondGuessSubmitted ? 'Your two-step result' : 'Your Step 1 result') : 'Your last submitted guess';
        guessStatus.textContent = label + ' is green and dashed (A*, B*, C*).' +
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
        if (intermediatePoints && secondGuessSubmitted) sets.push([intermediatePoints, 'green', '₁']);
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

    function recordFirstAnswer(correct, guess, reason) {
      if (firstSubmitted) return;
      firstSubmitted = true;
      const bucket = state.stats[currentProblem.type];
      bucket.attempted++;
      if (correct) bucket.correct++;
      state.history.push({
        at: new Date().toISOString(), category: currentProblem.type,
        firstTryCorrect: correct, guess: reason || (guess ? (Array.isArray(guess) ? guess.map(describeRule).join(' Then ') : describeRule(guess)) : 'Solution revealed')
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
      updateStepUI();
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
      const hard = currentProblem.mode === 'hard';
      if (hard && !firstGuess) {
        firstGuess = guess;
        intermediatePoints = applyTransformation(currentProblem.original, guess);
        guessPoints = intermediatePoints;
        secondGuessSubmitted = false;
        resetForm();
        nextBtn.disabled = !firstSubmitted;
        updateStepUI();
        drawBoard();
        showFeedback('Step 1 applied', 'The green triangle shows your first transformation. Now choose a second transformation to map that result onto the red triangle. Your complete two-step answer will be checked together. Resetting Step 1 counts this problem as missed.', 'info');
        answerForm.querySelector('input[name="transformType"]').focus();
        return;
      }
      guessPoints = applyTransformation(hard ? intermediatePoints : currentProblem.original, guess);
      secondGuessSubmitted = hard;
      drawBoard();
      const correct = trianglesMatch(guessPoints, currentProblem.transformed);
      const onFirstTry = !firstSubmitted;
      recordFirstAnswer(correct, hard ? [firstGuess, guess] : guess);
      nextBtn.disabled = false;
      if (correct) {
        setSolved();
        const description = hard ? `Step 1: ${describeRule(firstGuess)} Step 2: ${describeRule(guess)}` : describeRule(guess);
        showFeedback(hard ? 'Correct two-step transformation!' : 'Correct transformation!', onFirstTry
          ? `Great work! ${description} Your first-try score increased.`
          : `You found it! ${description} This problem remains marked incorrect for first-try scoring.`, 'good');
      } else {
        showFeedback(onFirstTry ? 'Not quite — try again.' : 'Still not a match.',
          hard
            ? 'The green dashed triangle shows your two-step result. Your first complete answer is scored. Retry Step 2 from the saved Step 1 result, reset Step 1, show the solution, or move to the next problem.'
            : 'The green dashed triangle shows where your guess sends the original. Your first answer is scored. You can adjust your transformation and check again, show the solution, or move to the next problem.', 'bad');
      }
    }

    function resetFirstTransformation() {
      if (solved || !firstGuess || currentProblem.mode !== 'hard') return;
      recordFirstAnswer(false, firstGuess, 'First transformation reset');
      firstGuess = null;
      intermediatePoints = null;
      guessPoints = null;
      secondGuessSubmitted = false;
      resetForm();
      nextBtn.disabled = false;
      updateStepUI();
      drawBoard();
      showFeedback('Step 1 reset — counted as missed', 'Try a new first transformation. This problem remains incorrect for first-attempt scoring, even if you solve it later. Further retries or resets will not count the same problem again.', 'info');
      answerForm.querySelector('input[name="transformType"]').focus();
    }

    function revealAnswer() {
      if (solved) return;
      recordFirstAnswer(false, null);
      setSolved();
      const description = currentProblem.mode === 'hard'
        ? `One valid solution, in order: Step 1: ${describeRule(currentProblem.rules[0])} Step 2: ${describeRule(currentProblem.rules[1])}`
        : describeRule(currentProblem.rule);
      showFeedback('Solution', description + ' This problem is counted as missed in your first-try score.', 'info');
    }

    function formatProgressTime(date) {
      return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit', second: '2-digit', timeZoneName: 'short' });
    }

    function updateProgressIdentity(date) {
      $('progressStudentName').textContent = state.name;
      $('progressTimestamp').dateTime = date.toISOString();
      $('progressTimestamp').textContent = formatProgressTime(date);
    }

    function clearProgressPreview() {
      $('progressPreview').hidden = true;
      $('progressPreviewImage').removeAttribute('src');
      if (progressPreviewUrl) URL.revokeObjectURL(progressPreviewUrl);
      progressPreviewUrl = null;
    }

    async function renderProgressImage(snapshot) {
      if (typeof window.html2canvas !== 'function') throw new Error('Image renderer unavailable');
      const canvas = await window.html2canvas($('progressCapture'), {
        backgroundColor: '#ffffff', scale: 2, logging: false,
        windowWidth: 1280, windowHeight: 900,
        onclone: cloned => {
          const capture = cloned.getElementById('progressCapture');
          // A consistent readable image, including when copied from a narrow phone.
          capture.style.width = '640px';
          capture.style.padding = '24px';
          capture.style.boxSizing = 'border-box';
          capture.querySelector('.score-table').style.fontSize = '16px';
          capture.querySelector('.score-note').style.fontSize = '14px';
          cloned.getElementById('progressStudentName').textContent = snapshot.name;
          cloned.getElementById('progressTimestamp').textContent = formatProgressTime(snapshot.at);
          cloned.getElementById('progressTimestamp').dateTime = snapshot.at.toISOString();
          for (const key of SCORE_KEYS) {
            const row = snapshot.stats[key];
            cloned.getElementById(key + 'Correct').textContent = row.correct;
            cloned.getElementById(key + 'Attempted').textContent = row.attempted;
            cloned.getElementById(key + 'Accuracy').textContent = percent(row.correct, row.attempted);
          }
          cloned.getElementById('progressOverallCorrect').textContent = snapshot.total.correct;
          cloned.getElementById('progressOverallAttempted').textContent = snapshot.total.attempted;
          cloned.getElementById('progressOverallAccuracy').textContent = percent(snapshot.total.correct, snapshot.total.attempted);
        }
      });
      return new Promise((resolve, reject) => canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Could not create PNG image'));
      }, 'image/png'));
    }

    async function copyProgressScreenshot() {
      if (copyProgressBtn.disabled) return;
      if (sumScore().attempted === 0) {
        $('reportStatus').textContent = 'Answer at least one problem before copying your progress.';
        return;
      }
      const session = state;
      const at = new Date();
      const snapshot = { name: state.name, stats: JSON.parse(JSON.stringify(state.stats)), total: sumScore(), at };
      updateProgressIdentity(at);
      clearProgressPreview();
      copyProgressBtn.disabled = true;
      copyProgressBtn.setAttribute('aria-busy', 'true');
      $('reportStatus').textContent = 'Creating your progress screenshot…';
      const imagePromise = renderProgressImage(snapshot);
      try {
        if (!window.isSecureContext || !navigator.clipboard || !navigator.clipboard.write || typeof ClipboardItem !== 'function') {
          throw new Error('Image clipboard unavailable');
        }
        // Start the clipboard write during the click. The PNG promise preserves
        // the user gesture in browsers that require it, including Safari.
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': imagePromise })]);
        if (state === session) $('reportStatus').textContent = 'Progress screenshot copied. Paste the image into your assignment, document, or email.';
      } catch (_) {
        try {
          const image = await imagePromise;
          if (state !== session) return;
          progressPreviewUrl = URL.createObjectURL(image);
          $('progressPreviewImage').src = progressPreviewUrl;
          $('progressPreview').hidden = false;
          $('reportStatus').textContent = 'Automatic image copying is unavailable or was blocked. Copy the image below manually, or take a screenshot of Your Progress.';
        } catch (_) {
          if (state === session) $('reportStatus').textContent = 'Could not create the image. Take a screenshot of Your Progress, or reload the page and try again.';
        }
      } finally {
        copyProgressBtn.disabled = false;
        copyProgressBtn.removeAttribute('aria-busy');
      }
    }

    startForm.addEventListener('submit', event => {
      event.preventDefault();
      const name = studentName.value.trim().replace(/\s+/g, ' ');
      if (!name) { studentName.focus(); return; }
      state = freshState(name);
      state.mode = $('startMode').value === 'hard' ? 'hard' : 'easy';
      mixedBag = [];
      save();
      showSession();
    });
    answerForm.addEventListener('submit', submitAnswer);
    answerForm.querySelectorAll('input[name="transformType"]').forEach(el => el.addEventListener('change', toggleFields));
    showCoords.addEventListener('change', drawBoard);
    revealBtn.addEventListener('click', revealAnswer);
    resetFirstBtn.addEventListener('click', resetFirstTransformation);
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
    gameMode.addEventListener('change', () => {
      state.mode = gameMode.value === 'hard' ? 'hard' : 'easy';
      updatePracticeSettings();
      save();
    });
    copyProgressBtn.addEventListener('click', copyProgressScreenshot);
    $('newStudentBtn').addEventListener('click', () => {
      if (!window.confirm('Start a new student session? This removes the current student name and all scores saved on this browser. Copy a progress screenshot first if you need the results.')) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      state = freshState();
      mixedBag = [];
      currentProblem = null;
      guessPoints = null;
      firstGuess = null;
      intermediatePoints = null;
      secondGuessSubmitted = false;
      startForm.reset();
      startPanel.hidden = false;
      gameArea.hidden = true;
      $('reportStatus').textContent = '';
      clearProgressPreview();
      studentName.focus();
    });

    let loaded = null;
    try { loaded = validateSavedState(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch (_) { /* storage not enabled */ }
    if (loaded) { state = loaded; showSession(); }
  }

  // Expose pure mathematical helpers for automated testing in Node; no server required.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { applyTransformation, trianglesMatch, generateProblem, generateHardProblem, mapsInOneStep, describeRule, twiceArea };
  }
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
