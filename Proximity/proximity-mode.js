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

// ===== Puente / Glue Tension (Illustrated Chord Extensions, pp 174–189) =====

const GLUE_EXT = [[1, 'b9'], [2, '9'], [3, '#9'], [5, '11'], [6, '#11'], [8, 'b13'], [9, '13']];

function glueExtOf(rel) {
  const f = GLUE_EXT.find(([e]) => e === rel);
  return f ? f[1] : null;
}

function glueScan(originRootIdx, originQuality, foreignPcs) {
  const originPcs = CHORD_TYPES[originQuality].intervals.map(iv => (originRootIdx + iv) % 12);
  const intervals = CHORD_TYPES[originQuality].intervals;
  const thirdRel = intervals.length > 1 && intervals[1] > 0 && intervals[1] <= 4 ? intervals[1] : null;
  const rows = [];
  foreignPcs.forEach(pc => {
    const rel = (pc - originRootIdx + 12) % 12;
    const ext = glueExtOf(rel);
    if (!ext) return;
    let b9 = 0, tri = 0;
    originPcs.forEach(b => {
      const d = Math.abs(pc - b);
      const dist = Math.min(d, 12 - d);
      if (dist === 1) b9++;
      if (dist === 6) tri++;
    });
    const clashes3rd = thirdRel !== null && Math.abs(rel - thirdRel) === 1;
    rows.push({ pc, note: NOTE_NAMES[pc], rel, ext, allowed: !clashes3rd, b9, tri });
  });
  rows.sort((a, b) => a.rel - b.rel);
  return { rows, originPcs };
}

function glueSymbol(originRootIdx, originQuality, rows) {
  const allowed = rows.filter(r => r.allowed).sort((a, b) => a.rel - b.rel).map(r => r.ext);
  const base = NOTE_NAMES[originRootIdx] + originQuality;
  return allowed.length ? base + '(add' + allowed.join(',') + ')' : base;
}

function proxBridgeScan(targetRootIdx, targetQuality) {
  const bridges = [];
  const targetPcs = CHORD_TYPES[targetQuality].intervals.map(iv => (targetRootIdx + iv) % 12);
  const originRootIdx = proxRootIndex(proxRoot);
  const originQuality = proxQuality;
  const scan = glueScan(originRootIdx, originQuality, targetPcs);
  const originPcs = scan.originPcs;
  const shared = targetPcs.filter(pc => originPcs.includes(pc));
  const domRootIdx = (targetRootIdx + 7) % 12;
  const domPcs = CHORD_TYPES['7'].intervals.map(iv => (domRootIdx + iv) % 12);
  const viaDom = glueScan(originRootIdx, originQuality, domPcs);
  bridges.push({
    kind: 'direct',
    label: `${NOTE_NAMES[originRootIdx]}${originQuality} → ${NOTE_NAMES[targetRootIdx]}${targetQuality}`,
    headline: `${NOTE_NAMES[originRootIdx]}${originQuality} → ${glueSymbol(originRootIdx, originQuality, scan.rows)} → ${NOTE_NAMES[targetRootIdx]}${targetQuality}`,
    rows: scan.rows, shared, targetPcs,
  });
  bridges.push({
    kind: 'via',
    label: `vía V (${NOTE_NAMES[domRootIdx]}7) de ${NOTE_NAMES[targetRootIdx]}`,
    headline: `${NOTE_NAMES[originRootIdx]}${originQuality} → ${glueSymbol(originRootIdx, originQuality, viaDom.rows)} → ${NOTE_NAMES[targetRootIdx]}${targetQuality}`,
    rows: viaDom.rows, shared: domPcs.filter(pc => originPcs.includes(pc)), targetPcs: domPcs,
  });
  return bridges;
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
let proxBridgeRoot = 'C';
let proxBridgeQuality = 'maj7';
let PROX_LAST_BRIDGES = [];

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
  document.getElementById('prox-tip').innerHTML = tipLines.join ? tipLines.join('') : String(tipLines);
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

function renderBridge(grid, summary) {
  const targetRootIdx = proxRootIndex(proxBridgeRoot);
  const bridges = proxBridgeScan(targetRootIdx, proxBridgeQuality);
  PROX_LAST_BRIDGES = bridges;
  const originName = proxRoot + proxQuality;
  const targetName = proxBridgeRoot + proxBridgeQuality;
  summary.innerHTML = `De <b>${originName}</b> hacia <b>${targetName}</b>: el libro llama <b>glue tension</b> a la nota del próximo acorde que pegás en el actual. Cuando llega el acorde, "explica" la tensión que escuchaste.`;
  grid.innerHTML = bridges.map((b, bi) => `
    <div class="bridge-card ${proxResultClicked === bi ? 'selected' : ''}" data-bridge="${bi}">
      <div class="bridge-tag">${b.kind === 'direct' ? 'directo' : b.label}</div>
      <div class="bridge-headline">${b.headline}</div>
      ${b.rows.length ? `<div class="bridge-notes">${b.rows.map(r => `
        <span class="bridge-note ${r.allowed ? '' : 'blocked'}" title="${r.note}: ${r.ext} sobre ${originName}${r.allowed ? '' : ' · choca a semitono de la 3ra'}">
          ${r.note} = ${r.ext}${!r.allowed ? '<em>◘</em>' : ''}${r.b9 + r.tri ? `<i>${r.b9 ? r.b9 + '●' : ''}${r.tri ? r.tri + '▲' : ''}</i>` : ''}
        </span>`).join('')}</div>`
        : `<p class="bridge-empty">${b.kind === 'direct' ? 'El destino comparte todas sus notas: el puente es natural.' : 'La dominante del destino no aporta tensiones nuevas.'}</p>`}
      <small class="bridge-shared">${b.shared.length} nota${b.shared.length === 1 ? '' : 's'} en común</small>
    </div>`).join('');
  grid.querySelectorAll('.bridge-card').forEach(card => {
    card.onclick = () => {
      proxResultClicked = Number(card.dataset.bridge);
      renderProximity();
    };
  });
}

function proxRenderSelectedDetail() {
  if (!proxResultClicked && proxResultClicked !== 0) return;
  if (proxTool === 'bridge') {
    const b = PROX_LAST_BRIDGES[proxResultClicked];
    if (!b) { renderProxDetailPlaceholder(); return; }
    const targetName = proxBridgeRoot + proxBridgeQuality;
    const changedPcs = b.targetPcs.filter(pc => !b.shared.includes(pc));
    const symbol = b.headline.split(' → ')[1] || b.headline;
    const lines = [
      `Hacia <b>${targetName}</b>${b.kind === 'via' ? ', vía la dominante del destino' : ''}.`,
      changedPcs.length
        ? `La nota nueva del puente: <b>${changedPcs.map(pc => NOTE_NAMES[pc]).join(' · ')}</b> (la glue tension que el próximo acorde explica).`
        : 'El destino no aporta notas nuevas: comparten todo el sonido.',
      `Símbolo híbrido: <b>${symbol}</b>.`,
      'No es una fórmula exacta: probá cada nota y quedate con la que más te guste (tritono-sub, 2-5 y VII° del destino también sirven).',
    ];
    renderProxDetail(targetName, b.targetPcs.map(pc => NOTE_NAMES[pc]), changedPcs, lines);
    return;
  }
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
  else if (proxTool === 'common') renderCommon(grid, summary);
  else renderBridge(grid, summary);
  proxRenderSelectedDetail();
  if (proxResultClicked === null) renderProxDetailPlaceholder();
}

function setProxTool(tool) {
  proxTool = tool;
  document.getElementById('prox-mode-neighbors').classList.toggle('active', tool === 'neighbors');
  document.getElementById('prox-mode-common').classList.toggle('active', tool === 'common');
  document.getElementById('prox-mode-bridge').classList.toggle('active', tool === 'bridge');
  ['prox-root', 'prox-quality'].forEach(id => {
    document.getElementById(id).style.display = (tool === 'neighbors' || tool === 'bridge') ? '' : 'none';
  });
  ['prox-moves', 'prox-key'].forEach(id => {
    document.getElementById(id).style.display = tool === 'neighbors' ? '' : 'none';
  });
  ['prox-notes-picker', 'prox-match'].forEach(id => {
    document.getElementById(id).style.display = tool === 'common' ? '' : 'none';
  });
  ['prox-bridge-root', 'prox-bridge-quality'].forEach(id => {
    document.getElementById(id).style.display = tool === 'bridge' ? '' : 'none';
  });
  document.getElementById('prox-bridge-label').style.display = tool === 'bridge' ? '' : 'none';
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
  document.getElementById('prox-mode-bridge').onclick = () => setProxTool('bridge');
  rootSelect.onchange = () => { proxRoot = rootSelect.value; renderProximity(); };
  qualitySelect.onchange = () => { proxQuality = qualitySelect.value; renderProximity(); };
  movesSelect.onchange = () => { proxMoves = Number(movesSelect.value); renderProximity(); };
  keySelect.onchange = () => { proxKey = keySelect.value; renderProximity(); };
  const bridgeRoot = document.getElementById('prox-bridge-root');
  bridgeRoot.innerHTML = NOTE_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');
  bridgeRoot.value = proxBridgeRoot;
  bridgeRoot.onchange = () => { proxBridgeRoot = bridgeRoot.value; renderProximity(); };
  const bridgeQuality = document.getElementById('prox-bridge-quality');
  bridgeQuality.innerHTML = PROX_QUALITIES.map(q => `<option value="${q}">${PROX_QUALITY_LABELS[q]}</option>`).join('');
  bridgeQuality.value = proxBridgeQuality;
  bridgeQuality.onchange = () => { proxBridgeQuality = bridgeQuality.value; renderProximity(); };
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