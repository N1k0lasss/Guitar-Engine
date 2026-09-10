// ===== Cartografía Modal (Illustrated Modes, pp 102–190, Range of Closeness p187) =====
// 13 modos · cada arista une modos que difieren en UNA sola nota · BFS = distancia.
// Reutiliza NOTE_NAMES de Chords/chord-mode.js si está en el scope global.

const CARTO_NOTES = typeof NOTE_NAMES !== 'undefined' ? NOTE_NAMES : ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const CARTO_MODES = [
  { name: 'Jónico',     key: 'ionian',   intervals: [0,2,4,5,7,9,11],  triad: '',    tetrad: 'maj7', tension: 'maj7',       char: 'sin alteración', color: '#c08a43' },
  { name: 'Lidio',      key: 'lydian',   intervals: [0,2,4,6,7,9,11],  triad: '',    tetrad: 'maj7', tension: 'maj7(add#11)', char: '#4', charPc: 6, color: '#6e91a3' },
  { name: 'Mixolidio',  key: 'mixo',     intervals: [0,2,4,5,7,9,10],  triad: '',    tetrad: '7',    tension: '7',           char: 'b7', charPc: 10, color: '#9b7352' },
  { name: 'Lidio b7',   key: 'lydianb7', intervals: [0,2,4,6,7,9,10],  triad: '',    tetrad: '7',    tension: '7(add#11)',   char: '#4 y b7', charPc: 10, color: '#7c91a3' },
  { name: 'Dórico #4',  key: 'dorian4',  intervals: [0,2,3,6,7,9,10],  triad: 'm',   tetrad: 'm7',   tension: 'm6(add#11)',  char: '#4', charPc: 6, color: '#6e9166' },
  { name: 'Dórico',     key: 'dorian',   intervals: [0,2,3,5,7,9,10],  triad: 'm',   tetrad: 'm7',   tension: 'm6',          char: '6 mayor', charPc: 9, color: '#6e9166' },
  { name: 'Eólico',     key: 'aeolian',  intervals: [0,2,3,5,7,8,10],  triad: 'm',   tetrad: 'm7',   tension: 'm7',          char: 'b6', charPc: 8, color: '#806b83' },
  { name: 'Armónico',   key: 'harmonic', intervals: [0,2,3,5,7,8,11],  triad: 'm',   tetrad: 'mM7',  tension: 'mM7',         char: '#7', charPc: 11, color: '#a2546a' },
  { name: 'Melódico',   key: 'melodic',  intervals: [0,2,3,5,7,9,11],  triad: 'm',   tetrad: 'mM7',  tension: 'mM7',         char: '6 y #7', charPc: 11, color: '#8a6d9e' },
  { name: 'Mixolidio b13', key: 'mixo13', intervals: [0,2,4,5,7,8,10], triad: '',   tetrad: '7',    tension: '7(b13)',      char: 'b13', charPc: 8, color: '#9b7352' },
  { name: 'Frigio',     key: 'phrygian', intervals: [0,1,3,5,7,8,10],  triad: 'm',   tetrad: 'm7',   tension: 'm7(addb9)',   char: 'b2', charPc: 1, color: '#a45a46' },
  { name: 'Dórico b2',  key: 'dorianb2', intervals: [0,1,3,5,7,9,10],  triad: 'm',   tetrad: 'm7',   tension: 'm6(addb9)',   char: 'b2', charPc: 1, color: '#a45a46' },
  { name: 'Lidio #2',   key: 'lydian2',  intervals: [0,3,4,6,7,9,11],  triad: '',    tetrad: 'maj7', tension: 'maj7(add9,#11)', char: '#2', charPc: 3, color: '#6e91a3' },
];

// Sabores de nota (p188 del libro): los pcs absolutos respecto de C.
const CARTO_FLAVORS = { 1: 'afilado, flamenco', 3: 'antiguo', 6: 'magia', 9: 'dulce', 10: 'épico', 11: 'dominante' };

let cartoTonic = 0;
let cartoRootMode = 0;
let cartoTetrad = false;
let cartoSelected = 0;

function cartoEdges() {
  const edges = [];
  for (let i = 0; i < CARTO_MODES.length; i++) {
    for (let j = i + 1; j < CARTO_MODES.length; j++) {
      const a = CARTO_MODES[i].intervals, b = CARTO_MODES[j].intervals;
      const rem = a.filter(pc => !b.includes(pc));
      const add = b.filter(pc => !a.includes(pc));
      if (rem.length === 1 && add.length === 1) edges.push([i, j]);
    }
  }
  return edges;
}

function cartoBFS() {
  const dist = new Array(CARTO_MODES.length).fill(-1);
  dist[cartoRootMode] = 0;
  const queue = [cartoRootMode];
  while (queue.length) {
    const cur = queue.shift();
    for (const [i, j] of cartoEdgesCache) {
      const next = i === cur ? j : j === cur ? i : -1;
      if (next >= 0 && dist[next] < 0) { dist[next] = dist[cur] + 1; queue.push(next); }
    }
  }
  let far = 0;
  dist.forEach((d, idx) => { if (d > dist[far] || (d === dist[far] && idx > far)) far = idx; });
  return { dist, furthest: far };
}

function cartoEdgeDiff(i, j) {
  const a = CARTO_MODES[i].intervals, b = CARTO_MODES[j].intervals;
  const rem = a.filter(pc => !b.includes(pc))[0];
  const add = b.filter(pc => !a.includes(pc))[0];
  return rem === undefined || add === undefined ? null : { removedPc: rem, addedPc: add };
}

let cartoEdgesCache = cartoEdges();

function cartoLayout() {
  const pts = CARTO_MODES.map((m, i) => {
    const ang = i * (Math.PI * 2 / CARTO_MODES.length) - Math.PI / 2;
    return { x: 50 + 46 * Math.cos(ang), y: 50 + 46 * Math.sin(ang) };
  });
  for (let iter = 0; iter < 200; iter++) {
    const f = pts.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x, dy = pts[j].y - pts[i].y;
        let d = Math.sqrt(dx * dx + dy * dy) || 0.5;
        const rep = 1400 / (d * d);
        const ux = dx / d, uy = dy / d;
        f[i].x -= ux * rep; f[i].y -= uy * rep;
        f[j].x += ux * rep; f[j].y += uy * rep;
      }
    }
    for (const [a, b] of cartoEdgesCache) {
      let dx = pts[b].x - pts[a].x, dy = pts[b].y - pts[a].y;
      let d = Math.sqrt(dx * dx + dy * dy) || 0.5;
      const spring = (d - 17) * 0.06;
      const ux = dx / d, uy = dy / d;
      f[a].x += ux * spring; f[a].y += uy * spring;
      f[b].x -= ux * spring; f[b].y -= uy * spring;
    }
    pts.forEach((p, i) => {
      const gx = 50 - p.x, gy = 50 - p.y;
      const gl = Math.sqrt(gx * gx + gy * gy) || 1;
      f[i].x += (gx / gl) * 0.12;
      f[i].y += (gy / gl) * 0.12;
    });
    pts.forEach((p, i) => {
      p.x += f[i].x * 0.15;
      p.y += f[i].y * 0.15;
    });
  }
  const min = 11, max = 89;
  pts.forEach(p => {
    p.x = Math.max(min, Math.min(max, p.x));
    p.y = Math.max(min, Math.min(max, p.y));
  });
  return pts;
}

let cartoPos = cartoLayout();

function cartoNote(pc) { return CARTO_NOTES[(cartoTonic + pc) % 12]; }
function cartoChord(m, tetrad) { return CARTO_NOTES[cartoTonic] + (tetrad ? m.tetrad : m.triad); }
function cartoFlavor(pc) { return CARTO_FLAVORS[(cartoTonic + pc) % 12]; }

function cartoDists() {
  const { dist, furthest } = cartoBFS();
  return { dist, furthest };
}

let cartoGraph, cartoCard;

function cartoRender() {
  if (!cartoGraph) return;
  const { dist, furthest } = cartoDists();
  const ringColors = ['#e8a33d', '#c08a43', '#9b7352', '#7d5f4e', '#5d4a40', '#453a34'];
  const sel = CARTO_MODES[cartoRootMode];

  let html = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="carto-svg">';
  cartoEdgesCache.forEach(([i, j], ei) => {
    const a = cartoPos[i], b = cartoPos[j];
    html += `<line x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}" data-ei="${ei}" class="carto-edge"/>`;
  });
  CARTO_MODES.forEach((m, i) => {
    const p = cartoPos[i];
    const r = Math.min(1.6 + dist[i] * 0.5, 3.2);
    const stroke = dist[i] === 0 ? '#ffffff' : ringColors[Math.min(dist[i], ringColors.length - 1)];
    html += `<circle cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r}" fill="${m.color}" stroke="${stroke}" stroke-width="0.45" data-ni="${i}" class="carto-node${i === cartoSelected ? ' selected' : ''}"/>`;
    html += `<text x="${p.x.toFixed(2)}" y="${(p.y - 2.6).toFixed(2)}" class="carto-label" text-anchor="middle">${m.name}</text>`;
    html += `<text x="${p.x.toFixed(2)}" y="${(p.y + 3.8).toFixed(2)}" class="carto-sub" text-anchor="middle">${cartoNote(0)}${m.triad}</text>`;
  });
  html += '</svg>';
  cartoGraph.innerHTML = html;
  cartoGraph.querySelectorAll('.carto-node').forEach(n => {
    n.addEventListener('click', () => { cartoSelected = +n.getAttribute('data-ni'); cartoRender(); });
  });
  cartoRenderCard();
}

function cartoRenderCard() {
  if (!cartoCard) return;
  const m = CARTO_MODES[cartoSelected];
  const sel = CARTO_MODES[cartoRootMode];
  const { dist, furthest } = cartoDists();
  const neighbors = cartoEdgesCache
    .filter(([i, j]) => i === cartoSelected || j === cartoSelected)
    .map(([i, j]) => {
      const n = i === cartoSelected ? j : i;
      const other = CARTO_MODES[n];
      const rem = m.intervals.filter(pc => !other.intervals.includes(pc))[0];
      const add = other.intervals.filter(pc => !m.intervals.includes(pc))[0];
      return { n, note: `${cartoNote(rem)} → ${cartoNote(add)}` };
    });
  const far = CARTO_MODES[furthest];
  const flavor = m.charPc !== undefined ? cartoFlavor(m.charPc) : null;

  cartoCard.innerHTML = `
    <p class="eyebrow">MODO SELECCIONADO · DISTANCIA ${dist[cartoSelected]}</p>
    <h3>${m.name} <span class="carto-chord">${cartoChord(m, cartoTetrad)}</span></h3>
    <p class="carto-notes">${m.intervals.map(cartoNote).join(' · ')}</p>
    <div class="carto-facts">
      <div><small>Tensión</small><b>${CARTO_NOTES[cartoTonic] + m.tension}</b></div>
      <div><small>Característica</small><b>${m.char}${m.charPc !== undefined ? ' · ' + cartoNote(m.charPc) : ''}</b></div>
      ${flavor ? `<div><small>Sabor de la nota</small><b>${cartoNote(m.charPc)} = ${flavor}</b></div>` : ''}
      <div><small>Vecinos (1 nota)</small><b>${neighbors.length ? neighbors.map(n => `${CARTO_MODES[n.n].name} <span class="carto-delta">${n.note}</span>`).join(' · ') : '—'}</b></div>
    </div>
    <p class="carto-hint">Distancia desde ${sel.name} · el más lejano es <b>${far.name}</b> (distancia ${dist[furthest]}).
    ${cartoSelected === furthest ? 'Este es el modo más distante.' : ''}</p>`;
}

function cartoInit() {
  const rootSel = document.getElementById('carto-root');
  const modeSel = document.getElementById('carto-mode');
  const tetradBtn = document.querySelector('[data-carto-voicing="tetrad"]');
  const triadBtn = document.querySelector('[data-carto-voicing="triad"]');

  const g1 = document.getElementById('carto-graph');
  const g2 = document.getElementById('carto-card');
  if (!rootSel) return;

  rootSel.innerHTML = CARTO_NOTES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  modeSel.innerHTML = CARTO_MODES.map((m, i) => `<option value="${i}">${m.name}</option>`).join('');

  rootSel.addEventListener('change', () => { cartoTonic = +rootSel.value; cartoRender(); });
  modeSel.addEventListener('change', () => { cartoRootMode = +modeSel.value; cartoSelected = cartoRootMode; cartoRender(); });
  if (tetradBtn) tetradBtn.addEventListener('click', () => { cartoTetrad = true; updateVoicingBtns(); cartoRender(); });
  if (triadBtn) triadBtn.addEventListener('click', () => { cartoTetrad = false; updateVoicingBtns(); cartoRender(); });

  cartoGraph = g1;
  cartoCard = g2;
  updateVoicingBtns();
  cartoRender();
}

function updateVoicingBtns() {
  document.querySelectorAll('[data-carto-voicing]').forEach(b => b.classList.toggle('active', b.getAttribute('data-carto-voicing') === (cartoTetrad ? 'tetrad' : 'triad')));
}

if (typeof document !== 'undefined') cartoInit();