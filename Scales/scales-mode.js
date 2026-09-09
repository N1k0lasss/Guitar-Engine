const SCALE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALE_TYPES = {
  major: { label: 'Mayor', intervals: [0, 2, 4, 5, 7, 9, 11] },
  minor: { label: 'Menor natural', intervals: [0, 2, 3, 5, 7, 8, 10] },
  pentatonic: { label: 'Pentatónica mayor', intervals: [0, 2, 4, 7, 9] },
  blues: { label: 'Blues menor', intervals: [0, 3, 5, 6, 7, 10] },
  dorian: { label: 'Dórico', intervals: [0, 2, 3, 5, 7, 9, 10] },
  mixolydian: { label: 'Mixolidio', intervals: [0, 2, 4, 5, 7, 9, 10] },
};
const STRING_TUNING = [4, 9, 2, 7, 11, 4];
const FRET_COUNT = 15;

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

  const cells = [];
  for (let string = 0; string < STRING_TUNING.length; string++) {
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      const note = SCALE_NOTES[(STRING_TUNING[string] + fret) % 12];
      const inScale = notes.includes(note);
      cells.push(`<span class="fret-cell ${inScale ? 'in-scale' : ''} ${note === root ? 'root-note' : ''}" title="${note} · traste ${fret}">${inScale ? note : ''}</span>`);
    }
  }

  fretboard.innerHTML = '<div class="fret-numbers">'
    + Array.from({ length: FRET_COUNT + 1 }, (_, fret) => `<span>${fret}</span>`).join('')
    + '</div><div class="fret-grid">' + cells.join('') + '</div>';
}

function initializeScales() {
  const rootSelect = document.getElementById('scale-root');
  const typeSelect = document.getElementById('scale-type');
  if (!rootSelect || !typeSelect) return;

  rootSelect.innerHTML = SCALE_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');
  typeSelect.innerHTML = Object.entries(SCALE_TYPES).map(([key, scale]) => `<option value="${key}">${scale.label}</option>`).join('');

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