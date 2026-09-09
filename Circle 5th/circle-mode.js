const CIRCLE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const KEY_SIGNS = {
  C: 'sin alteraciones', G: '1 sostenido', D: '2 sostenidos', A: '3 sostenidos', E: '4 sostenidos', B: '5 sostenidos',
  'F#': '6 sostenidos', 'C#': '7 sostenidos', 'G#': '4 bemoles (Ab)', 'D#': '3 bemoles (Eb)', 'A#': '2 bemoles (Bb)', F: '1 bemol',
};
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
const MAJOR_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

function circleNoteAt(root, interval) {
  return CIRCLE_NOTES[(CIRCLE_NOTES.indexOf(root) + interval) % 12];
}

function renderCircle(selected = 'C') {
  const circle = document.getElementById('circle-of-fifths');
  const keyEl = document.getElementById('circle-key');
  const relativeEl = document.getElementById('circle-relative');
  if (!circle || !keyEl || !relativeEl) return;

  circle.innerHTML = '';
  FIFTHS.forEach((note, index) => {
    const button = document.createElement('button');
    const angle = (index * 30) - 90;
    button.className = `circle-note ${note === selected ? 'selected' : ''}`;
    button.style.setProperty('--angle', `${angle}deg`);
    button.textContent = note;
    button.title = `Tonalidad de ${note}`;
    button.addEventListener('click', () => renderCircle(note));
    circle.appendChild(button);
  });

  keyEl.textContent = selected;
  relativeEl.textContent = `Relativa menor: ${circleNoteAt(selected, 9)}m · ${KEY_SIGNS[selected]}`;
  renderKeyChords(selected);
  document.dispatchEvent(new CustomEvent('circle-key-selected', { detail: selected }));
}

function renderKeyChords(root) {
  const chordsEl = document.getElementById('key-chords');
  if (!chordsEl) return;

  chordsEl.innerHTML = MAJOR_INTERVALS
    .map((interval, index) => `<span class="key-chord"><b>${circleNoteAt(root, interval)}${MAJOR_QUALITIES[index]}</b><small>${MAJOR_ROMANS[index]}</small></span>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => renderCircle());