// ===== Proximidad / Glue mágico (Armonía Ilustrada 2) =====
// Reutiliza los globals de Chords/chord-mode.js: NOTE_NAMES, CHORD_TYPES, getChordInfo.

const PROX_QUALITIES = ['', 'm', 'sus2', 'sus4', 'dim', 'aug', '7', 'maj7', 'm7'];
const PROX_QUALITY_LABELS = {
  '': 'Mayor', m: 'Menor', '7': 'Dominante 7', maj7: 'Maj7', m7: 'm7',
  sus2: 'Sus2', sus4: 'Sus4', dim: 'Disminuido', aug: 'Aumentado',
};
const PROX_DEGREES = ['raíz', '3ra', '5ta', '7ma'];
const PROX_MOVES = [
  [-2, '2 st abajo'],
  [-1, 'st abajo'],
  [1, 'st arriba'],
  [2, '2 st arriba'],
];
const PROX_MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];

const PROX_POOL = buildProxPool();
const PROX_NOTE_COUNTS = proxCommonCounts();

function proxRootIndex(name) {
  return NOTE_NAMES.indexOf(name);
}

function buildProxPool() {
  const pool = [];
  NOTE_NAMES.forEach((raw, root) => {
    PROX_QUALITIES.forEach(q => {
      const set = CHORD_TYPES[q].intervals.map(iv => (root + iv) % 12).sort((a, b) => a - b);
      pool.push({ name: raw + q, root, quality: q, set });
    });
  });
  return pool;
}

function proxPoolMatches(set) {
  return PROX_POOL.filter(chord => chord.set.length === set.length && chord.set.every((pc, i) => pc === set[i]));
}

function proxCanonicalName(set) {
  const matches = proxPoolMatches(set);
  if (!matches.length) return null;
  return matches.slice().sort((a, b) => a.root - b.root)[0].name;
}

function proxScaleNotes(rootName) {
  const root = proxRootIndex(rootName);
  if (root < 0) return null;
  return PROX_MAJOR_SCALE.map(iv => (root + iv) % 12);
}

function proxIsDiatonic(pcs, keyName) {
  const scale = proxScaleNotes(keyName);
  if (!scale) return null;
  return pcs.every(pc => scale.includes(pc));
}

function proxCommonCounts() {
  const counts = new Array(12).fill(0);
  PROX_POOL.forEach(chord => chord.set.forEach(pc => counts[pc] += 1));
  return counts;
}

function* proxCombinations(items, k) {
  if (k === 0) { yield []; return; }
  for (let i = 0; i < items.length; i++) {
    for (const rest of proxCombinations(items.slice(i + 1), k - 1)) yield [items[i], ...rest];
  }
}

function proxMoveVariants(baseSet, combo) {
  const variants = [];
  const count = Math.pow(PROX_MOVES.length, combo.length);
  for (let code = 0; code < count; code++) {
    let c = code;
    const newSet = baseSet.slice();
    const deltas = [];
    combo.forEach(pos => {
      const move = PROX_MOVES[c % PROX_MOVES.length];
      c = Math.floor(c / PROX_MOVES.length);
      deltas.push({ pos, delta: move[0], label: move[1] });
      newSet[pos] = (newSet[pos] + move[0] + 12) % 12;
    });
    const sorted = [...new Set(newSet)].sort((a, b) => a - b);
    variants.push({ set: sorted, deltas });
  }
  return variants;
}

function findNeighbors(rootName, quality, notesToMove) {
  const root = proxRootIndex(rootName);
  if (root < 0 || !CHORD_TYPES[quality]) return [];
  const baseSet = CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
  const results = [];
  const seen = new Set();
  for (const combo of proxCombinations(baseSet.map((_, i) => i), notesToMove)) {
    proxMoveVariants(baseSet, combo).forEach(variant => {
      const key = variant.set.join(',');
      if (seen.has(key)) return;
      seen.add(key);
      const name = proxCanonicalName(variant.set);
      if (!name) return;
      const glue = baseSet.filter(pc => variant.set.includes(pc)).length;
      const moves = variant.deltas.map(d => ({ degree: PROX_DEGREES[d.pos] || 'nota', label: d.label }));
      const moveCost = variant.deltas.reduce((sum, d) => sum + Math.abs(d.delta), 0);
      results.push({ name, set: variant.set, glue, size: baseSet.length, moves, moveCost });
    });
  }
  results.sort((a, b) => (b.glue - a.glue) || (a.moveCost - b.moveCost));
  return results;
}

function findCommonChords(selectedPcs, mode) {
  if (!selectedPcs.length) return [];
  const want = {
    any: m => m >= 1,
    two: m => m === 2,
    exact: m => m === selectedPcs.length,
  }[mode];
  const results = [];
  PROX_POOL.forEach(chord => {
    const matched = chord.set.filter(pc => selectedPcs.includes(pc));
    if (want && want(matched.length)) {
      results.push({ name: chord.name, set: chord.set, matched, m: matched.length });
    }
  });
  results.sort((a, b) => b.m - a.m);
  return results;
}

// ===== Estado de la vista =====

let proxTool = 'neighbors';
let proxRoot = 'C';
let proxQuality = '';
let proxMoves = 1;
let proxKey = '';
let proxSelected = [];
let proxMatch = 'any';
let proxResultClicked = null;
let PROX_LAST_RESULTS = [];

// ===== Render =====

function renderProxDiagram(chordName) {
  const info = getChordInfo(chordName);
  const container = document.getElementById('prox-diagram');
  const barreEl = document.getElementById('prox-barre');
  container.innerHTML = '';
  if (!info) return;
  ['E', 'A', 'D', 'G', 'B', 'e'].forEach((stringName, index) => {
    const fret = info.fingering.frets[index];
    const cell = document.createElement('div');
    cell.className = 'diagram-cell';
    cell.innerHTML = `<span class="string-label">${stringName}</span>`;
    const marker = document.createElement('b');
    marker.textContent = fret === null ? '×' : fret === 0 ? '○' : fret;
    marker.className = fret === null ? 'mute' : fret === 0 ? 'open' : 'dot';
    cell.appendChild(marker);
    container.appendChild(cell);
  });
  barreEl.textContent = info.fingering.label;
}

function renderProxDetail(chordName, noteNames, pcsToAccent, tipLines) {
  document.getElementById('prox-selected').textContent = chordName;
  const notesEl = document.getElementById('prox-notes');
  notesEl.innerHTML = '';
  noteNames.forEach((name, i) => {
    const span = document.createElement('span');
    span.textContent = (i ? ' · ' : '') + name;
    if (pcsToAccent.includes(proxRootIndex(name))) span.style.color = 'var(--accent)';
    notesEl.appendChild(span);
  });
  renderProxDiagram(chordName);
  document.getElementById('prox-tip').innerHTML = tipLines;
}

function renderProxDetailPlaceholder() {
  document.getElementById('prox-selected').textContent = '—';
  document.getElementById('prox-notes').textContent = 'Elegí un acorde para ver su digitación y el glue mágico.';
  document.getElementById('prox-diagram').innerHTML = '';
  document.getElementById('prox-barre').textContent = '';
  document.getElementById('prox-tip').innerHTML = '';
}

function renderNeighbors(grid, summary) {
  const results = findNeighbors(proxRoot, proxQuality, proxMoves);
  PROX_LAST_RESULTS = results;
  const baseLabel = `${proxRoot} ${PROX_QUALITY_LABELS[proxQuality].toLowerCase()}`;

  if (!results.length) {
    summary.innerHTML = `Ningún acorde del pool (${PROX_POOL.length}) se forma moviendo ${proxMoves === 1 ? 'una nota' : 'dos notas'} ±1/±2 semitonos.`;
    grid.innerHTML = '';
  } else {
    summary.innerHTML = results.length === 1
      ? `A partir de <b>${baseLabel}</b>, moviendo <b>${proxMoves === 1 ? 'una nota' : 'dos notas'}</b>, encontré 1 acorde del pool.`
      : `A partir de <b>${baseLabel}</b>, moviendo <b>${proxMoves === 1 ? 'una nota' : 'dos notas'}</b>, encontré <b>${results.length}</b> acordes del pool.`;
    grid.innerHTML = results.map(res => `
      <button type="button" class="glue-card ${proxResultClicked === res.name ? 'selected' : ''}" data-name="${res.name}">
        <b>${res.name}</b>
        <span class="glue-moves">${res.moves.map(m => `${m.degree} ${m.label}`).join(' · ')}</span>
        <span class="glue-dots">${Array.from({ length: res.size }, (_, dot) => `<i${dot < res.glue ? ' class="on"' : ''}></i>`).join('')}</span>
        <small class="glue-familiar">${res.glue}/${res.size} notas en común</small>
      </button>`).join('');
  }

  grid.querySelectorAll('.glue-card').forEach(card => {
    card.onclick = () => {
      proxResultClicked = card.dataset.name;
      renderProximity();
    };
  });

  if (proxResultClicked) {
    const stillThere = results.some(r => r.name === proxResultClicked);
    if (!stillThere) proxResultClicked = null;
  }
}

function renderCommon(grid, summary) {
  document.querySelectorAll('#prox-notes-picker .prox-chip').forEach(chip => {
    chip.classList.toggle('selected', proxSelected.includes(Number(chip.dataset.pc)));
  });

  const matchSelect = document.getElementById('prox-match');
  matchSelect.querySelector('option[value="two"]').disabled = proxSelected.length < 2;
  matchSelect.querySelector('option[value="exact"]').disabled = proxSelected.length < 2;
  if ((proxMatch === 'two' || proxMatch === 'exact') && proxSelected.length < 2) {
    proxMatch = 'any';
    matchSelect.value = 'any';
  }

  if (!proxSelected.length) {
    summary.innerHTML = 'Elegí una o más notas para listar todos los acordes que las contienen (los números indican cuántos acordes incluye cada nota).';
    grid.innerHTML = '';
    return;
  }

  const results = findCommonChords(proxSelected, proxMatch);
  const totalAny = findCommonChords(proxSelected, 'any').length;
  summary.innerHTML = `De <b>${proxSelected.map(pc => NOTE_NAMES[pc]).join(' · ')}</b> → <b>${results.length}</b> resultado${results.length === 1 ? '' : 's'} de ${PROX_POOL.length} (${totalAny} con "al menos 1").`;
  grid.innerHTML = results.map(res => `
    <button type="button" class="glue-card ${proxResultClicked === res.name ? 'selected' : ''}" data-name="${res.name}">
      <b>${res.name}</b>
      <span class="glue-notes">${res.set.map(pc => NOTE_NAMES[pc]).join(' · ')}</span>
      <span class="glue-dots">${res.set.map(pc => `<i${proxSelected.includes(pc) ? ' class="on"' : ''}></i>`).join('')}</span>
      <small class="glue-familiar">${res.m} de ${proxSelected.length} notas coinciden</small>
    </button>`).join('');

  grid.querySelectorAll('.glue-card').forEach(card => {
    card.onclick = () => {
      proxResultClicked = card.dataset.name;
      renderProximity();
    };
  });

  if (proxResultClicked && !results.some(c => c.name === proxResultClicked)) proxResultClicked = null;
}

function proxRenderSelectedDetail() {
  if (!proxResultClicked) return;
  if (proxTool === 'neighbors') {
    const res = PROX_LAST_RESULTS.find(r => r.name === proxResultClicked);
    if (!res) { renderProxDetailPlaceholder(); return; }
    const baseName = proxRoot + proxQuality;
    const baseSet = CHORD_TYPES[proxQuality].intervals.map(iv => (proxRootIndex(proxRoot) + iv) % 12);
    const changedPcs = res.set.filter(pc => !baseSet.includes(pc));
    const baseDia = proxKey ? proxIsDiatonic(baseSet, proxKey) : null;
    const resDia = proxKey ? proxIsDiatonic(res.set, proxKey) : null;
    const lines = [
      `Desde <b>${baseName}</b>: mover ${res.moves.map(m => `<b>${m.degree}</b> ${m.label}`).join(' y ')}.`,
      `${res.glue}/${res.size} notas en común: ese es el <b>glue mágico</b>.`,
    ];
    if (proxKey && baseDia && resDia) lines.push('Ambos acordes son diatónicos de la tonalidad de referencia.');
    else if (proxKey) lines.push('El acorde de destino sale (parcial o totalmente) de la escala de referencia.');
    lines.push('Hacé melodías usando las notas en común para que la conexión fluya.');
    renderProxDetail(res.name, res.set.map(pc => NOTE_NAMES[pc]), changedPcs, lines);
  } else {
    const res = findCommonChords(proxSelected, proxMatch).find(c => c.name === proxResultClicked);
    if (!res) { renderProxDetailPlaceholder(); return; }
    const lines = [
      `Incluye <b>${res.m}</b> de las notas elegidas.`,
      `Del pool de ${PROX_POOL.length} acordes (${PROX_QUALITIES.length} calidades × 12 raíces).`,
    ];
    renderProxDetail(res.name, res.set.map(pc => NOTE_NAMES[pc]), res.matched, lines);
  }
}

function renderProximity() {
  const grid = document.getElementById('prox-grid');
  const summary = document.getElementById('prox-summary');
  if (!grid || !summary) return;
  if (proxTool === 'neighbors') renderNeighbors(grid, summary);
  else renderCommon(grid, summary);
  proxRenderSelectedDetail();
  if (!proxResultClicked) renderProxDetailPlaceholder();
}

function setProxTool(tool) {
  proxTool = tool;
  document.getElementById('prox-mode-neighbors').classList.toggle('active', tool === 'neighbors');
  document.getElementById('prox-mode-common').classList.toggle('active', tool === 'common');
  ['prox-root', 'prox-quality', 'prox-moves', 'prox-key'].forEach(id => {
    document.getElementById(id).style.display = tool === 'neighbors' ? '' : 'none';
  });
  ['prox-notes-picker', 'prox-match'].forEach(id => {
    document.getElementById(id).style.display = tool === 'common' ? '' : 'none';
  });
  proxResultClicked = null;
  renderProximity();
}

function initializeProximity() {
  const view = document.getElementById('proximity-view');
  if (!view) return;

  const rootSelect = document.getElementById('prox-root');
  rootSelect.innerHTML = NOTE_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');
  rootSelect.value = proxRoot;

  const qualitySelect = document.getElementById('prox-quality');
  qualitySelect.innerHTML = PROX_QUALITIES.map(q => `<option value="${q}">${PROX_QUALITY_LABELS[q]}</option>`).join('');

  const keySelect = document.getElementById('prox-key');
  keySelect.innerHTML = '<option value="">— sin referencia —</option>'
    + NOTE_NAMES.map(n => `<option value="${n}">${n} mayor</option>`).join('');

  const movesSelect = document.getElementById('prox-moves');
  movesSelect.value = proxMoves;

  const picker = document.getElementById('prox-notes-picker');
  picker.innerHTML = NOTE_NAMES.map((name, pc) => `
    <button type="button" class="prox-chip" data-pc="${pc}" title="${PROX_NOTE_COUNTS[pc]} acordes del pool incluyen ${name}. Clic para alternar.">
      <b>${name}</b><em>${PROX_NOTE_COUNTS[pc]}</em>
    </button>`).join('');

  document.getElementById('prox-mode-neighbors').onclick = () => setProxTool('neighbors');
  document.getElementById('prox-mode-common').onclick = () => setProxTool('common');
  rootSelect.onchange = () => { proxRoot = rootSelect.value; renderProximity(); };
  qualitySelect.onchange = () => { proxQuality = qualitySelect.value; renderProximity(); };
  movesSelect.onchange = () => { proxMoves = Number(movesSelect.value); renderProximity(); };
  keySelect.onchange = () => { proxKey = keySelect.value; renderProximity(); };
  document.getElementById('prox-match').onchange = (event) => { proxMatch = event.target.value; renderProximity(); };
  picker.addEventListener('click', event => {
    const chip = event.target.closest('.prox-chip');
    if (!chip) return;
    const pc = Number(chip.dataset.pc);
    const idx = proxSelected.indexOf(pc);
    if (idx >= 0) proxSelected.splice(idx, 1);
    else proxSelected.push(pc);
    proxSelected.sort((a, b) => a - b);
    renderProximity();
  });

  renderProximity();
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initializeProximity);