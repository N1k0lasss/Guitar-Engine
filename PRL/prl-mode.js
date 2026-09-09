// ===== Neoriemanniano P/R/L (Armonía Ilustrada 2, p.115 Teoría Neoriemanniana) =====
// Reutiliza globals de Chords/chord-mode.js (NOTE_NAMES, CHORD_TYPES, getChordInfo)
// y proxCanonicalName de Proximity/proximity-mode.js (mismo pool canónico).

const PRL_OP_INFO = {
  P: { name: 'Paralelo', desc: 'mismo tono, solo cambia la 3ra' },
  R: { name: 'Relativo', desc: 'la tónica viaja una 3ra menor' },
  L: { name: 'Leittonwechsel', desc: 'una voz se mueve un semitono' },
};
const PRL_DEGREES = ['raíz', '3ra', '5ta', '7ma'];

let prlRoot = 'C';
let prlQuality = '';
let prlHistory = [];

function prlTriadSet(rootName, quality) {
  const root = NOTE_NAMES.indexOf(rootName);
  if (root < 0 || (quality !== '' && quality !== 'm')) return null;
  return CHORD_TYPES[quality].intervals.map(iv => (root + iv) % 12);
}

function prlChordName(root, quality) {
  return root + quality;
}

function prlSplitName(name) {
  if (name.length > 1 && name.endsWith('m')) return { root: name.slice(0, -1), quality: 'm' };
  return { root: name, quality: '' };
}

function prlTransformations(rootName, quality) {
  const rootIdx = NOTE_NAMES.indexOf(rootName);
  if (rootIdx < 0 || (quality !== '' && quality !== 'm')) return [];
  const base = prlTriadSet(rootName, quality);
  const other = quality === 'm' ? '' : 'm';
  const ops = [
    { op: 'P', rel: 0 },
    { op: 'R', rel: quality === 'm' ? 3 : 9 },
    { op: 'L', rel: quality === 'm' ? 8 : 4 },
  ];
  return ops.map(({ op, rel }) => {
    const tRootIdx = (rootIdx + rel) % 12;
    const set = CHORD_TYPES[other].intervals.map(iv => (tRootIdx + iv) % 12);
    const movedFrom = base.find(pc => !set.includes(pc));
    const movedTo = set.find(pc => !base.includes(pc));
    const deltaRaw = (movedTo - movedFrom + 12) % 12;
    return {
      op,
      name: prlChordName(NOTE_NAMES[tRootIdx], other),
      root: NOTE_NAMES[tRootIdx],
      quality: other,
      set,
      common: base.filter(pc => set.includes(pc)),
      movedIdx: base.indexOf(movedFrom),
      movedFrom,
      movedTo,
      delta: deltaRaw > 6 ? deltaRaw - 12 : deltaRaw,
    };
  });
}

// ===== Render =====

function renderPrlDiagram(container, barreEl, chordName) {
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

function prlMoveLabel(delta) {
  if (delta === 1) return 'st arriba';
  if (delta === -1) return 'st abajo';
  return `${Math.abs(delta)} st ${delta > 0 ? 'arriba' : 'abajo'}`;
}

function renderPRL() {
  const transforms = prlTransformations(prlRoot, prlQuality);
  const current = prlChordName(prlRoot, prlQuality);
  const currentSet = prlTriadSet(prlRoot, prlQuality);

  document.getElementById('prl-current').textContent = current;
  document.getElementById('prl-source-notes').textContent = currentSet.map(pc => NOTE_NAMES[pc]).join(' · ');
  renderPrlDiagram(
    document.getElementById('prl-source-diagram'),
    document.getElementById('prl-source-barre'),
    current,
  );

  document.getElementById('prl-cards').innerHTML = transforms.map(t => `
    <button type="button" class="prl-card" data-op="${t.op}">
      <span class="prl-op">${t.op}</span><span class="prl-opname">${PRL_OP_INFO[t.op].name}</span>
      <b class="prl-name">${t.name}</b>
      <span class="prl-voice">${PRL_DEGREES[t.movedIdx]} ${NOTE_NAMES[t.movedFrom]} → ${NOTE_NAMES[t.movedTo]} · ${prlMoveLabel(t.delta)}</span>
      <span class="prl-keeps">quedan: ${t.common.map(pc => NOTE_NAMES[pc]).join(' · ')}</span>
      <span class="glue-dots">${Array.from({ length: 3 }, (_, dot) => `<i${dot < t.common.length ? ' class="on"' : ''}></i>`).join('')}</span>
      <small class="glue-familiar">${t.common.length} notas en común</small>
    </button>`).join('');

  document.querySelectorAll('#prl-cards .prl-card').forEach(card => {
    card.onclick = () => prlApply(card.dataset.op);
  });

  const historyEl = document.getElementById('prl-history');
  historyEl.innerHTML = prlHistory.length
    ? prlHistory.map((name, idx) => `<button type="button" class="prl-chip" data-idx="${idx}">← ${name}</button>`).join('')
    : '';
  historyEl.querySelectorAll('.prl-chip').forEach(chip => {
    chip.onclick = () => {
      const idx = Number(chip.dataset.idx);
      const prev = prlSplitName(prlHistory[idx]);
      prlHistory = prlHistory.slice(0, idx);
      prlRoot = prev.root;
      prlQuality = prev.quality;
      renderPRL();
    };
  });

  document.getElementById('prl-tip').innerHTML =
    `<b>P</b> paralelo (cambia la 3ra) · <b>R</b> relativo (tónica a la 3ra menor) · ` +
    `<b>L</b> leittonwechsel (semitono, la sensible). Cada operación deja 2 notas quietas: ` +
    `ese es el mismo glue mágico del libro, ahora con nombre. Aplicando dos veces volvés al acorde original.`;
}

function prlApply(op) {
  const transforms = prlTransformations(prlRoot, prlQuality);
  const target = transforms.find(t => t.op === op);
  if (!target) return;
  prlHistory.push(prlChordName(prlRoot, prlQuality));
  prlRoot = target.root;
  prlQuality = target.quality;
  renderPRL();
}

function prlReset() {
  prlHistory = [];
  prlRoot = 'C';
  prlQuality = '';
  renderPRL();
}

function initializePRL() {
  const view = document.getElementById('prl-view');
  if (!view) return;
  const rootSelect = document.getElementById('prl-root');
  rootSelect.innerHTML = NOTE_NAMES.map(n => `<option value="${n}">${n}</option>`).join('');
  rootSelect.value = prlRoot;
  const qualitySelect = document.getElementById('prl-quality');
  qualitySelect.value = prlQuality;
  rootSelect.onchange = () => { prlRoot = rootSelect.value; renderPRL(); };
  qualitySelect.onchange = () => { prlQuality = qualitySelect.value; renderPRL(); };
  document.getElementById('prl-reset').onclick = prlReset;
  renderPRL();
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initializePRL);