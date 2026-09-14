const SCALE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_TYPES = {
  // ─── Escalas principales ───────────────────────────────────────────
  major:          { label: 'Mayor (Jónico)',          intervals: [0,2,4,5,7,9,11],  group: 'Diatónicas' },
  minor:          { label: 'Menor natural (Eólico)',  intervals: [0,2,3,5,7,8,10],  group: 'Diatónicas' },
  dorian:         { label: 'Dórico',                  intervals: [0,2,3,5,7,9,10],  group: 'Diatónicas' },
  phrygian:       { label: 'Frigio',                  intervals: [0,1,3,5,7,8,10],  group: 'Diatónicas' },
  lydian:         { label: 'Lidio',                   intervals: [0,2,4,6,7,9,11],  group: 'Diatónicas' },
  mixolydian:     { label: 'Mixolidio',               intervals: [0,2,4,5,7,9,10],  group: 'Diatónicas' },
  locrian:        { label: 'Locrio',                  intervals: [0,1,3,5,6,8,10],  group: 'Diatónicas' },
  // ─── Pentatónicas y Blues ──────────────────────────────────────────
  pentatonic:     { label: 'Pentatónica mayor',       intervals: [0,2,4,7,9],        group: 'Pentatónicas' },
  pentatonicMin:  { label: 'Pentatónica menor',       intervals: [0,3,5,7,10],       group: 'Pentatónicas' },
  blues:          { label: 'Blues menor',             intervals: [0,3,5,6,7,10],     group: 'Pentatónicas' },
  bluesMaj:       { label: 'Blues mayor',             intervals: [0,2,3,4,7,9],      group: 'Pentatónicas' },
  // ─── Menor armónica y melódica ─────────────────────────────────────
  harmonicMinor:  { label: 'Menor armónica',          intervals: [0,2,3,5,7,8,11],  group: 'Menores alteradas' },
  melodicMinor:   { label: 'Menor melódica (asc.)',   intervals: [0,2,3,5,7,9,11],  group: 'Menores alteradas' },
  // ─── Simétricas ────────────────────────────────────────────────────
  dimWH:          { label: 'Disminuida tono-semitono',intervals: [0,2,3,5,6,8,9,11],group: 'Simétricas' },
  dimHW:          { label: 'Disminuida semitono-tono',intervals: [0,1,3,4,6,7,9,10],group: 'Simétricas' },
  augmented:      { label: 'Aumentada',               intervals: [0,3,4,7,8,11],     group: 'Simétricas' },
  // ─── Modos especiales ──────────────────────────────────────────────
  lydianDom:      { label: 'Lidio dominante (Lidio b7)', intervals: [0,2,4,6,7,9,10], group: 'Modos especiales' },
  altered:        { label: 'Alterada (Super Locrio)',   intervals: [0,1,3,4,6,8,10],   group: 'Modos especiales' },
  phrygianDom:    { label: 'Frigio dominante',          intervals: [0,1,4,5,7,8,10],   group: 'Modos especiales' },
};

const STRING_TUNING = [4, 9, 2, 7, 11, 4];
const FRET_COUNT = 15;

// CAGED positions: [startFret for each of 5 boxes]
// position 0 = todo el mástil
const CAGED_POSITIONS = [
  { label: 'Todo el mástil', start: 0, end: 15 },
  { label: 'Posición 1 (0-4)',  start: 0,  end: 4  },
  { label: 'Posición 2 (2-7)',  start: 2,  end: 7  },
  { label: 'Posición 3 (5-9)', start: 5,  end: 9  },
  { label: 'Posición 4 (7-12)', start: 7,  end: 12 },
  { label: 'Posición 5 (10-15)',start: 10, end: 15 },
];

let scalePosition = 0; // index into CAGED_POSITIONS

function scaleNoteAt(root, interval) {
  return SCALE_NOTES[(SCALE_NOTES.indexOf(root) + interval) % 12];
}

function renderScale(root, type) {
  const titleEl = document.getElementById('scale-title');
  const notesEl = document.getElementById('scale-notes');
  const fretboard = document.getElementById('fretboard');
  if (!titleEl || !notesEl || !fretboard) return;

  const scale = SCALE_TYPES[type];
  const notes = scale.intervals.map(interval => scaleNoteAt(root, interval));
  titleEl.textContent = `${root} ${scale.label.toLowerCase()}`;
  notesEl.textContent = notes.join(' · ');

  const pos = CAGED_POSITIONS[scalePosition];
  const fretStart = pos.start;
  const fretEnd = pos.end;

  const cells = [];
  for (let string = 0; string < STRING_TUNING.length; string++) {
    for (let fret = fretStart; fret <= fretEnd; fret++) {
      const note = SCALE_NOTES[(STRING_TUNING[string] + fret) % 12];
      const inScale = notes.includes(note);
      cells.push(`<span class="fret-cell ${inScale ? 'in-scale' : ''} ${note === root ? 'root-note' : ''}" title="${note} · traste ${fret}">${inScale ? note : ''}</span>`);
    }
  }

  const fretCount = fretEnd - fretStart + 1;
  fretboard.style.setProperty('--fret-cols', fretCount);
  fretboard.innerHTML =
    `<div class="fret-numbers" style="grid-template-columns:repeat(${fretCount},minmax(38px,1fr))">` +
    Array.from({ length: fretCount }, (_, i) => `<span>${fretStart + i}</span>`).join('') +
    `</div><div class="fret-grid" style="grid-template-columns:repeat(${fretCount},minmax(38px,1fr))">` +
    cells.join('') + '</div>';
}

function initializeScales() {
  const rootSelect = document.getElementById('scale-root');
  const typeSelect = document.getElementById('scale-type');
  const posSelect  = document.getElementById('scale-position');
  if (!rootSelect || !typeSelect) return;

  rootSelect.innerHTML = SCALE_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');

  // Group options
  const groups = [...new Set(Object.values(SCALE_TYPES).map(s => s.group))];
  typeSelect.innerHTML = groups.map(g => {
    const opts = Object.entries(SCALE_TYPES)
      .filter(([,s]) => s.group === g)
      .map(([k,s]) => `<option value="${k}">${s.label}</option>`)
      .join('');
    return `<optgroup label="${g}">${opts}</optgroup>`;
  }).join('');

  if (posSelect) {
    posSelect.innerHTML = CAGED_POSITIONS.map((p, i) => `<option value="${i}">${p.label}</option>`).join('');
    posSelect.addEventListener('change', () => { scalePosition = Number(posSelect.value); update(); });
  }

  const update = () => renderScale(rootSelect.value, typeSelect.value);
  rootSelect.addEventListener('change', update);
  typeSelect.addEventListener('change', update);
  document.addEventListener('circle-key-selected', event => {
    rootSelect.value = event.detail;
    update();
  });
  update();
}

document.addEventListener('DOMContentLoaded', initializeScales);