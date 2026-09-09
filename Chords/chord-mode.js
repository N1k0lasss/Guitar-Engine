const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const NOTE_ALIASES = { 'Cb': 'B', 'B#': 'C', 'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

const CHORD_TYPES = {
  '': { label: '', intervals: [0, 4, 7], template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0] },
  m: { label: 'm', intervals: [0, 3, 7], template: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0] },
  '7': { label: '7', intervals: [0, 4, 7, 10], template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0] },
  maj7: { label: 'maj7', intervals: [0, 4, 7, 11], template: [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1] },
  m7: { label: 'm7', intervals: [0, 3, 7, 10], template: [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0] },
  sus2: { label: 'sus2', intervals: [0, 2, 7], template: [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0] },
  sus4: { label: 'sus4', intervals: [0, 5, 7], template: [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0] },
  dim: { label: 'dim', intervals: [0, 3, 6], template: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0] },
  aug: { label: 'aug', intervals: [0, 4, 8], template: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0] },
};

const OPEN_SHAPES = {
  C: { frets: [null, 3, 2, 0, 1, 0], label: 'Forma abierta de C' },
  D: { frets: [null, null, 0, 2, 3, 2], label: 'Forma abierta de D' },
  E: { frets: [0, 2, 2, 1, 0, 0], label: 'Forma abierta de E' },
  G: { frets: [3, 2, 0, 0, 0, 3], label: 'Forma abierta de G' },
  A: { frets: [null, 0, 2, 2, 2, 0], label: 'Forma abierta de A' },
  Am: { frets: [null, 0, 2, 2, 1, 0], label: 'Forma abierta de Am' },
  Dm: { frets: [null, null, 0, 2, 3, 1], label: 'Forma abierta de Dm' },
  Em: { frets: [0, 2, 2, 0, 0, 0], label: 'Forma abierta de Em' },
  A7: { frets: [null, 0, 2, 0, 2, 0], label: 'Forma abierta de A7' },
  E7: { frets: [0, 2, 0, 1, 0, 0], label: 'Forma abierta de E7' },
  D7: { frets: [null, null, 0, 2, 1, 2], label: 'Forma abierta de D7' },
};

// formas móviles (barre) por calidad; E = raíz en 6ª cuerda, A = raíz en 5ª
const MOBILE_SHAPES = {
  '':    { E: [0, 2, 2, 1, 0, 0],  A: [null, 0, 2, 2, 2, 0] },
  m:     { E: [0, 2, 2, 0, 0, 0],  A: [null, 0, 2, 2, 1, 0] },
  '7':   { E: [0, 2, 0, 1, 0, 0],  A: [null, 0, 2, 0, 2, 0] },
  maj7:  { E: [0, 2, 1, 1, 0, 0],  A: [null, 0, 2, 1, 2, 0] },
  m7:    { E: [0, 2, 0, 0, 3, 0],  A: [null, 0, 2, 0, 1, 0] },
  sus2:  { E: [0, 2, 4, 4, 0, 0],  A: [null, 0, 2, 2, 0, 0] },
  sus4:  { E: [0, 2, 2, 2, 0, 0],  A: [null, 0, 2, 2, 3, 0] },
  aug:   { E: [0, 3, 2, 1, 1, 0],  A: [null, 0, 3, 2, 2, 1] },
  dim:   { E: [0, 1, 2, 0, 1, 0] }, // 7ª disminuida, única forma móvil correcta
};

let history = [];
let smoothedChroma = new Array(12).fill(0);
let candidateName = null;
let candidateFrames = 0;
let stableName = null;
let chordCooldownUntil = 0;

function resetChordTracking() {
  smoothedChroma = new Array(12).fill(0);
  candidateName = null;
  candidateFrames = 0;
  stableName = null;
  chordCooldownUntil = 0;
}

function noteIndex(name) { return NOTE_NAMES.indexOf(name); }

function parseChordName(chordName) {
  const match = chordName.match(/^([A-G])([#b]?)(m7|maj7|sus2|sus4|dim|aug|7|m)?$/);
  if (!match) return null;
  const raw = match[1] + match[2];
  return { root: NOTE_ALIASES[raw] || raw, quality: match[3] || '' };
}

function getNotes(root, quality) {
  const rootIndex = noteIndex(root);
  return CHORD_TYPES[quality].intervals.map(interval => NOTE_NAMES[(rootIndex + interval) % 12]);
}

function getFingering(root, quality) {
  const open = OPEN_SHAPES[root + quality];
  if (open) return { frets: open.frets, label: open.label };
  const shapes = MOBILE_SHAPES[quality] || MOBILE_SHAPES[''];
  if (quality === 'dim') {
    const offset = (noteIndex(root) - noteIndex('E') + 12) % 12;
    return {
      frets: shapes.E.map(fret => fret + offset),
      label: 'Forma móvil de E (7ª disminuida)',
    };
  }
  const shapeRoot = ['E', 'A'][noteIndex(root) % 2];
  const offset = (noteIndex(root) - noteIndex(shapeRoot) + 12) % 12;
  const base = shapes[shapeRoot];
  return { frets: base.map(fret => fret === null ? null : fret + offset), label: `Forma móvil de ${shapeRoot}` };
}

function getChordInfo(chordName) {
  const parsed = parseChordName(chordName);
  if (!parsed) return null;
  return { notes: getNotes(parsed.root, parsed.quality), fingering: getFingering(parsed.root, parsed.quality) };
}

function detectChord(chroma) {
  const totalEnergy = chroma.reduce((sum, value) => sum + value, 0);
  if (totalEnergy < 1.25) return null;
  let best = { score: 0, name: null };
  for (const type of Object.values(CHORD_TYPES)) {
    for (let root = 0; root < 12; root++) {
      let score = 0;
      let outside = 0;
      type.template.forEach((weight, interval) => {
        const value = chroma[(root + interval) % 12];
        score += value * (weight ? 1.3 : -0.28);
        if (!weight) outside += value;
      });
      const normalized = score / (type.intervals.length + outside * 0.75);
      if (normalized > best.score) best = { score: normalized, name: NOTE_NAMES[root] + type.label };
    }
  }
  return best.score > 0.36 ? best : null;
}

function renderChordInfo(chordName) {
  const info = getChordInfo(chordName);
  if (!info) return;
  document.getElementById('notes-list').textContent = `Notas: ${info.notes.join(' · ')}`;
  const diagram = document.getElementById('diagram');
  diagram.innerHTML = '';
  ['E', 'A', 'D', 'G', 'B', 'e'].forEach((stringName, index) => {
    const fret = info.fingering.frets[index];
    const cell = document.createElement('div');
    cell.className = 'diagram-cell';
    cell.innerHTML = `<span class="string-label">${stringName}</span>`;
    const marker = document.createElement('b');
    marker.textContent = fret === null ? '×' : fret === 0 ? '○' : fret;
    marker.className = fret === null ? 'mute' : fret === 0 ? 'open' : 'dot';
    cell.appendChild(marker);
    diagram.appendChild(cell);
  });
  document.getElementById('barre-label').textContent = info.fingering.label;
}

function renderHistory() {
  const element = document.getElementById('history');
  element.innerHTML = history.length
    ? history.map((chord, index) => `<span class="history-chip ${index === history.length - 1 ? 'current' : ''}">${chord}</span>`).join('')
    : '<span class="muted">Todavía no hay acordes</span>';
}

function clearHistory() {
  history = [];
  renderHistory();
}

function getChroma(data) {
  const chroma = new Array(12).fill(0);
  const binHz = audioCtx.sampleRate / analyser.fftSize;
  let signalEnergy = 0;
  for (let i = Math.floor(75 / binHz); i < Math.min(Math.ceil(1600 / binHz), data.length); i++) {
    if (data[i] < -72) continue;
    const midi = Math.round(69 + 12 * Math.log2((i * binHz) / 440));
    const magnitude = Math.pow(10, data[i] / 20);
    const frequencyWeight = Math.max(0.25, 1 - (i * binHz) / 2200);
    chroma[(midi % 12 + 12) % 12] += magnitude * frequencyWeight;
    signalEnergy += magnitude;
  }
  if (signalEnergy < 0.08) return null;
  const max = Math.max(...chroma);
  return max ? chroma.map(value => value / max) : chroma;
}

function chordLoop(data) {
  const now = performance.now();
  if (chordCooldownUntil > now) {
    const secondsLeft = Math.ceil((chordCooldownUntil - now) / 1000);
    document.getElementById('confidence').textContent = `Acorde capturado · escuchando de nuevo en ${secondsLeft}s`;
    return;
  }
  if (chordCooldownUntil) {
    chordCooldownUntil = 0;
    smoothedChroma = new Array(12).fill(0);
    candidateName = null;
    candidateFrames = 0;
    stableName = null;
    document.getElementById('confidence').textContent = 'Nueva captura: toca el siguiente acorde';
  }
  const chroma = getChroma(data);
  if (!chroma) {
    document.getElementById('chord').textContent = '--';
    document.getElementById('confidence').textContent = 'Escuchando una señal clara...';
    candidateName = null;
    candidateFrames = 0;
    return;
  }
  smoothedChroma = smoothedChroma.map((value, index) => value * 0.82 + chroma[index] * 0.18);
  const result = detectChord(smoothedChroma);
  if (!result) return;
  if (candidateName === result.name) candidateFrames += 1;
  else { candidateName = result.name; candidateFrames = 1; }
  if (candidateFrames >= 4) stableName = result.name;
  document.getElementById('chord').textContent = stableName || result.name;
  document.getElementById('confidence').textContent = candidateFrames < 4
    ? 'Confirmando...'
    : `Señal estable · coincidencia ${Math.round(Math.min(result.score / 0.7, 1) * 100)}%`;
  if (stableName && history[history.length - 1] !== stableName) {
    history.push(stableName);
    if (history.length > 8) history.shift();
    renderHistory();
    renderChordInfo(stableName);
    chordCooldownUntil = now + 3000;
  }
}
