// ===== Calculadora de Poliacordes (Illustrated Chord Extensions, pp 139–159) =====
// Reutiliza NOTE_NAMES de Chords/chord-mode.js si ya está en el scope global.

const POLY_NOTES = typeof NOTE_NAMES !== 'undefined' ? NOTE_NAMES : ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

const POLY_TEMPLATES = [
  { key: 'maj7', intervals: [0,4,7,11] },
  { key: 'm7',   intervals: [0,3,7,10] },
  { key: '7',    intervals: [0,4,7,10] },
  { key: 'm',    intervals: [0,3,7] },
  { key: '',     intervals: [0,4,7] },
  { key: 'sus2', intervals: [0,2,7] },
  { key: 'sus4', intervals: [0,5,7] },
  { key: 'dim',  intervals: [0,3,6] },
  { key: 'aug',  intervals: [0,4,8] },
];

const POLY_BASE_QUALITIES  = ['', 'm', '7', 'maj7', 'm7'];
const POLY_TRIAD_QUALITIES = ['m', '', 'dim', 'aug'];
const POLY_TRIAD_LABELS    = { '': 'Mayor', m: 'Menor', dim: 'Dim', aug: 'Aum' };
const POLY_BASE_LABELS     = { '': 'Mayor', m: 'Menor', '7': '7', maj7: 'maj7', m7: 'm7' };

function polyPc(root, interval) { return (root + interval) % 12; }
function polyNote(pc) { return POLY_NOTES[pc]; }
function polyIntervals(root, intervals) { return intervals.map(iv => polyPc(root, iv)); }

function polyDist(a, b) {
  const d = Math.abs(a - b);
  return Math.min(d, 12 - d);
}

function polyFindName(rootPc, unionPcs) {
  const rel = unionPcs.map(pc => (pc - rootPc + 12) % 12);
  const extTable = [[1,'b9'],[2,'9'],[3,'#9'],[5,'11'],[6,'#11'],[8,'b13'],[9,'13']];
  let best = { match: 0, extras: Infinity, priority: Infinity, key: '' };
  let bestExtraInts = [];
  for (let pi = 0; pi < POLY_TEMPLATES.length; pi++) {
    const t = POLY_TEMPLATES[pi];
    if (t.intervals.length > 3 && !rel.includes(t.intervals[3])) continue;
    const tInts = new Set(t.intervals);
    const inUnion = t.intervals.filter(iv => rel.includes(iv));
    const extras = rel.filter(iv => !tInts.has(iv));
    if (inUnion.length > best.match ||
        (inUnion.length === best.match && extras.length < best.extras) ||
        (inUnion.length === best.match && extras.length === best.extras && pi < best.priority)) {
      best = { match: inUnion.length, extras: extras.length, priority: pi, key: t.key };
      bestExtraInts = extras;
    }
  }
  const names = bestExtraInts.slice().sort((a, b) => a - b)
    .map(iv => { const f = extTable.find(([e]) => e === iv); return f ? f[1] : null; })
    .filter(Boolean);
  const sym = POLY_NOTES[rootPc] + best.key;
  return names.length ? sym + '(add' + names.join(',') + ')' : sym;
}

function polyCountDissonance(pcs) {
  if (typeof countDissonancePairs === 'function') return countDissonancePairs(pcs);
  let b9 = 0, tri = 0;
  for (let i = 0; i < pcs.length; i++)
    for (let j = i + 1; j < pcs.length; j++) {
      const d = polyDist(pcs[i], pcs[j]);
      if (d === 1) b9++;
      if (d === 6) tri++;
    }
  return { b9, tri };
}

function polyBuildAll() {
  const out = [];
  for (const baseQ of POLY_BASE_QUALITIES) {
    for (let br = 0; br < 12; br++) {
      for (const triQ of POLY_TRIAD_QUALITIES) {
        for (let ur = 0; ur < 12; ur++) {
          const bIv = POLY_TEMPLATES.find(t => t.key === (baseQ || '')).intervals;
          const tIv = POLY_TEMPLATES.find(t => t.key === (triQ || '')).intervals;
          const bPcs = polyIntervals(br, bIv);
          const tPcs = polyIntervals(ur, tIv);
          const union = [...new Set([...bPcs, ...tPcs])].sort((a, b) => a - b);
          const notes = union.map(polyNote);
          const name = polyFindName(br, union);
          const { b9, tri } = polyCountDissonance(union);
          const bass = polyNote(br);
          const triRoot = polyNote(ur);
          const isHybrid = br !== ur;
          const polyName = isHybrid ? polyNote(ur) + (triQ || '') + '/' + bass : name;
          out.push({
            combo: bass + (baseQ || '') + ' + ' + triRoot + (triQ || ''),
            bass, baseQ, baseRoot: br,
            triRoot, triQ, triRootPc: ur,
            name, notes, union, b9, tri, isHybrid, polyName
          });
        }
      }
    }
  }
  return out;
}

function polyBuildStar() {
  const STAR_NODES = [
    { degree: 'I',     root: 0,  q: '',     pcs: [0,4,7],   pos: [50,11] },
    { degree: 'ii',    root: 2,  q: 'm',    pcs: [2,5,9],   pos: [81,25] },
    { degree: 'iii',   root: 4,  q: 'm',    pcs: [4,7,11],  pos: [87,58] },
    { degree: 'IV',    root: 5,  q: '',     pcs: [5,9,0],   pos: [66,85] },
    { degree: 'V',     root: 7,  q: '',     pcs: [7,11,2],  pos: [34,85] },
    { degree: 'vi',    root: 9,  q: 'm',    pcs: [9,0,4],   pos: [13,58] },
    { degree: 'vii°',  root: 11, q: 'dim',  pcs: [11,2,5],  pos: [19,25] },
  ];
  const nodes = STAR_NODES.map(n => ({
    ...n, name: POLY_NOTES[n.root] + (n.q === 'm' ? 'm' : n.q === 'dim' ? '°' : ''),
    notes: n.pcs.map(polyNote).join(' - ')
  }));
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j];
      const unionPcs = [...new Set([...a.pcs, ...b.pcs])].sort((x, y) => x - y);
      const aName = polyFindName(a.root, unionPcs);
      const bName = polyFindName(b.root, unionPcs);
      const { b9, tri } = polyCountDissonance(unionPcs);
      edges.push({ a: i, b: j, aName, bName, notes: unionPcs.map(polyNote).join(' · '), b9, tri });
    }
  }
  return { nodes, edges };
}

let polyData = [], polyStar = null;
let polyState = {
  baseRoot: 0, baseQ: '', triQ: '',
  showDissonance: false, filterTri: false, filterB9: false,
  sortBy: null, sortDir: -1
};

let polyTable, polyStarEl;

function polyRender() {
  if (!polyTable) return;
  let list = polyData.filter(d => d.baseRoot === polyState.baseRoot && d.baseQ === polyState.baseQ);
  if (polyState.triQ) list = list.filter(d => d.triQ === polyState.triQ);
  if (polyState.filterTri) list = list.filter(d => d.tri > 0);
  if (polyState.filterB9) list = list.filter(d => d.b9 > 0);
  if (polyState.sortBy === 'tri') list.sort((a, b) => (b.tri - a.tri) * polyState.sortDir);
  else if (polyState.sortBy === 'b9') list.sort((a, b) => (b.b9 - a.b9) * polyState.sortDir);
  else if (polyState.sortBy === 'dis') list.sort((a, b) => ((b.tri + b.b9) - (a.tri + a.b9)) * polyState.sortDir);
  polyRenderTable(list);
  polyRenderStar();
}

function polyRenderTable(list) {
  polyTable.innerHTML = list.map(d => `
    <div class="poly-row" data-idx="${polyData.indexOf(d)}">
      <div class="poly-combo">${d.combo}</div>
      <div class="poly-name">${d.name}</div>
      <div class="poly-notes">${d.notes.join(' · ')}</div>
      ${polyState.showDissonance ? `<div class="poly-dis">${d.tri ? '<span class="poly-tri">' + d.tri + '▲</span>' : ''}${d.b9 ? '<span class="poly-b9">' + d.b9 + '●</span>' : ''}</div>` : ''}
    </div>`).join('');
}

function polyRenderStar() {
  if (!polyStarEl || !polyStar) return;
  const { nodes, edges } = polyStar;
  let html = '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="poly-star-svg">';
  edges.forEach(e => {
    const [x1, y1] = nodes[e.a].pos;
    const [x2, y2] = nodes[e.b].pos;
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" data-ei="${edges.indexOf(e)}" class="poly-star-edge"/>`;
  });
  nodes.forEach((n, i) => {
    html += `<circle cx="${n.pos[0]}" cy="${n.pos[1]}" r="3.5" class="poly-star-node" data-ni="${i}"/>`;
    html += `<text x="${n.pos[0]}" y="${n.pos[1] - 5}" class="poly-star-label" text-anchor="middle">${n.name}</text>`;
  });
  html += '</svg>';
  html += '<div id="poly-star-detail" class="poly-star-detail"></div>';
  polyStarEl.innerHTML = html;
  const detail = polyStarEl.querySelector('#poly-star-detail');
  polyStarEl.querySelectorAll('.poly-star-edge').forEach(line => {
    line.addEventListener('click', () => {
      const e = polyStar.edges[+line.getAttribute('data-ei')];
      const dis = polyState.showDissonance && (e.b9 + e.tri > 0)
        ? ` <span class="poly-b9">${e.b9}●</span><span class="poly-tri">${e.tri}▲</span>`
        : '';
      detail.innerHTML = `<b>${polyStar.nodes[e.a].name} + ${polyStar.nodes[e.b].name}</b> · ${e.aName} → ${e.bName} · ${e.notes}${dis}`;
    });
  });
  polyStarEl.querySelectorAll('.poly-star-node').forEach(node => {
    node.addEventListener('click', () => {
      const ni = +node.getAttribute('data-ni');
      const mine = polyStar.edges.filter(ed => ed.a === ni || ed.b === ni)
        .map(ed => ed.a === ni ? ed.aName : ed.bName).join(' · ');
      detail.innerHTML = `<b>${polyStar.nodes[ni].name}</b> con cada acorde: ${mine}`;
    });
  });
}

function polyInit() {
  const rootSelect = document.getElementById('poly-base-root');
  const baseQSelect = document.getElementById('poly-base-quality');
  const triQSelect  = document.getElementById('poly-tri-quality');
  const disToggle   = document.getElementById('poly-show-dis');
  const filterTri   = document.getElementById('poly-filter-tri');
  const filterB9    = document.getElementById('poly-filter-b9');
  const sortTriBtn  = document.getElementById('poly-sort-tri');
  const sortB9Btn   = document.getElementById('poly-sort-b9');
  const sortDisBtn  = document.getElementById('poly-sort-dis');

  if (!rootSelect) return;

  rootSelect.innerHTML = POLY_NOTES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  baseQSelect.innerHTML = POLY_BASE_QUALITIES.map(q => `<option value="${q}">${POLY_BASE_LABELS[q]}</option>`).join('');
  triQSelect.innerHTML  = [{q:'',l:'Todas'}, ...POLY_TRIAD_QUALITIES.map(q => ({q, l: POLY_TRIAD_LABELS[q]}))].map(o => `<option value="${o.q}">${o.l}</option>`).join('');

  rootSelect.addEventListener('change', () => { polyState.baseRoot = +rootSelect.value; polyRender(); });
  baseQSelect.addEventListener('change', () => { polyState.baseQ = baseQSelect.value; polyRender(); });
  triQSelect.addEventListener('change', () => { polyState.triQ = triQSelect.value; polyRender(); });
  disToggle.addEventListener('change', () => { polyState.showDissonance = disToggle.checked; polyRender(); });
  filterTri.addEventListener('change', () => { polyState.filterTri = filterTri.checked; polyRender(); });
  filterB9.addEventListener('change', () => { polyState.filterB9 = filterB9.checked; polyRender(); });

  const sortHandler = (key) => () => {
    if (polyState.sortBy === key) polyState.sortDir *= -1;
    else { polyState.sortBy = key; polyState.sortDir = -1; }
    polyRender();
  };
  sortTriBtn.addEventListener('click', sortHandler('tri'));
  sortB9Btn.addEventListener('click', sortHandler('b9'));
  sortDisBtn.addEventListener('click', sortHandler('dis'));

  polyTable  = document.getElementById('poly-table');
  polyStarEl = document.getElementById('poly-star');
  polyData   = polyBuildAll();
  polyStar   = polyBuildStar();
  polyRender();
}

if (typeof document !== 'undefined') polyInit();
