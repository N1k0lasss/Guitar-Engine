// ===== Tritono sustituto (Illustrated Harmony, vol. 1, p.129-143) =====
// Reutiliza globals de Chords/chord-mode.js: NOTE_NAMES, CHORD_TYPES, getChordInfo.

const TT_FLAT_ROOTS = {
  0: 'C', 1: 'Db', 2: 'D', 3: 'Eb', 4: 'E', 5: 'F',
  6: 'Gb', 7: 'G', 8: 'Ab', 9: 'A', 10: 'Bb', 11: 'B',
};

let ttRoot = 'G';
let ttRight = 'sub';

function ttChordSet(rootName, quality) {
  const root = NOTE_NAMES.indexOf(rootName);
  if (root < 0 || !CHORD_TYPES[quality]) return null;
  return CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
}

function ttTritonePcs(rootName) {
  const set = ttChordSet(rootName, '7');
  if (!set) return null;
  return [set[1], set[3]].sort((a, b) => a - b);
}

function ttTritoneNames(rootName) {
  const pcs = ttTritonePcs(rootName);
  return pcs ? pcs.map(pc => NOTE_NAMES[pc]) : [];
}

function ttWithRoot(rootIdx, quality) {
  return NOTE_NAMES[rootIdx] + quality;
}

function ttFlatName(rootName, quality) {
  const root = NOTE_NAMES.indexOf(rootName);
  return TT_FLAT_ROOTS[root] + quality;
}

function ttSubstitute(rootName) {
  const root = NOTE_NAMES.indexOf(rootName);
  return ttWithRoot((root + 6) % 12, '7');
}

function ttTonic(rootName, quality) {
  const root = NOTE_NAMES.indexOf(rootName);
  return ttWithRoot((root + 5) % 12, quality);
}

function ttOptions(rootName) {
  const root = NOTE_NAMES.indexOf(rootName);
  if (root < 0) return [];
  const tritone = ttTritoneNames(rootName).join('·');
  const tonicMaj = ttTonic(rootName, '');
  const tonicMin = ttTonic(rootName, 'm');
  const subRoot = (root + 6) % 12;
  const pivotTonic = ttWithRoot((subRoot + 5) % 12, '');
  const pivotTonicMin = ttWithRoot((subRoot + 5) % 12, 'm');
  return [
    { id: 'resolve', arrow: '↘', name: `${tonicMaj} / ${tonicMin}`, note: 'V → I (mayor y menor)', reroot: false },
    { id: 'chain', arrow: '→', name: ttWithRoot((root + 5) % 12, '7'), note: 'cadena de dominantes (G7→C7→F7…)', reroot: true },
    { id: 'sub', arrow: '⇄', name: ttWithRoot(subRoot, '7'), note: `tritono sustituto: mismo ${tritone}`, reroot: true },
    { id: 'vii', arrow: '→', name: ttWithRoot((root + 4) % 12, 'dim'), note: 'vii°: casi el mismo acorde (B°≈G7)', reroot: false },
    { id: 'aug', arrow: '→', name: ttWithRoot(root, 'aug'), note: 'aumentado como dominante (G7→G+→C)', reroot: false },
    { id: 'pivot', arrow: '↘', name: `${pivotTonic} / ${pivotTonicMin}`, note: 'actúa como sustituto de esta tonalidad', reroot: false },
  ];
}

// ===== Render =====

function ttDiagram(container, barreEl, chordName) {
  const info = getChordInfo(chordName);
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

function ttNotesAccent(el, names, accentedPcs) {
  el.innerHTML = '';
  names.forEach((name, i) => {
    const span = document.createElement('span');
    span.textContent = (i ? ' · ' : '') + name;
    if (accentedPcs.includes(NOTE_NAMES.indexOf(name))) span.style.color = 'var(--accent)';
    el.appendChild(span);
  });
}

function ttRender() {
  if (!document.getElementById('tt-root')) return;
  const rootIdx = NOTE_NAMES.indexOf(ttRoot);
  const current = ttWithRoot(rootIdx, '7');
  const tritone = ttTritoneNames(ttRoot);
  const tritonePcs = ttTritonePcs(ttRoot);
  const sub = ttSubstitute(ttRoot);
  const subRoot = NOTE_NAMES[(rootIdx + 6) % 12];

  document.getElementById('tt-sel').textContent = current;
  ttNotesAccent(document.getElementById('tt-notes'), ttChordSet(ttRoot, '7').map(pc => NOTE_NAMES[pc]), tritonePcs);
  ttDiagram(document.getElementById('tt-diagram'), document.getElementById('tt-barre'), current);

  const tonicMaj = ttTonic(ttRoot, '');
  const tonicMin = ttTonic(ttRoot, 'm');
  const flat = ttFlatName(ttRoot, '7');
  document.getElementById('tt-resolves').innerHTML =
    `Tritono <b>${tritone.join(' · ')}</b>: la tensión que resuelve en <b>${tonicMaj} / ${tonicMin}</b>${flat !== current ? ` (≡ ${flat})` : ''}.`;

  document.getElementById('tt-sub-name').textContent = sub;
  ttNotesAccent(document.getElementById('tt-sub-notes'), ttChordSet(subRoot, '7').map(pc => NOTE_NAMES[pc]), tritonePcs);
  ttDiagram(document.getElementById('tt-sub-diagram'), document.getElementById('tt-sub-barre'), sub);

  const subTonicMaj = ttTonic(subRoot, '');
  const subTonicMin = ttTonic(subRoot, 'm');
  const subFlat = ttFlatName(subRoot, '7');
  document.getElementById('tt-sub-tip').innerHTML =
    `Mismo tritono <b>${tritone.join(' · ')}</b> → resuelve a <b>${subTonicMaj} / ${subTonicMin}</b>${subFlat !== sub ? ` (≡ ${subFlat})` : ''}.`;

  document.getElementById('tt-options-grid').innerHTML = ttOptions(ttRoot).map(opt => `
    <button type="button" class="tt-card${opt.reroot ? ' tt-reroot' : ''}" data-id="${opt.id}">
      <span class="tt-arrow">${opt.arrow}</span>
      <b>${opt.name}</b>
      <small>${opt.note}</small>
      ${opt.reroot ? '<em>hacé clic para saltar</em>' : ''}
    </button>`).join('');

  document.querySelectorAll('#tt-options-grid .tt-reroot').forEach(card => {
    card.onclick = () => {
      const target = card.querySelector('b').textContent;
      ttRoot = target.replace('7', '');
      renderTritone();
    };
  });

  document.getElementById('tt-glue').innerHTML =
    `El pegamento: la melodía. Quedate en el tritono <b>${tritone.join(' · ')}</b> mientras viajás entre ${current} y ${sub}.`;
}

function renderTritone() {
  if (typeof document !== 'undefined' && document.getElementById('tt-root')) {
    document.getElementById('tt-root').value = ttRoot;
  }
  ttRender();
}

function initializeTritone() {
  const view = document.getElementById('tritone-view');
  if (!view) return;
  const rootSelect = document.getElementById('tt-root');
  rootSelect.innerHTML = NOTE_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');
  rootSelect.value = ttRoot;
  rootSelect.onchange = () => { ttRoot = rootSelect.value; renderTritone(); };
  renderTritone();
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initializeTritone);