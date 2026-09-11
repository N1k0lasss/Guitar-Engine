const MODE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MODE_DATA = [
  { name: 'Jónico', degree: 'I', offset: 0, quality: 'maj7', triadQuality: '', tension: 'maj7', character: 'sin alteración', description: 'El centro mayor: abierto, estable y luminoso.', color: '#c08a43' },
  { name: 'Dórico', degree: 'II', offset: 2, quality: 'm7', triadQuality: 'm', tension: '6', character: '6 mayor', characterInterval: 9, description: 'Menor con una sexta mayor: oscuro, pero con movimiento.', color: '#6e9166' },
  { name: 'Frigio', degree: 'III', offset: 4, quality: 'm7', triadQuality: 'm', tension: '(addb9)', character: '2 menor', characterInterval: 1, description: 'Menor con segunda menor: tensión cercana y un color antiguo.', color: '#a45a46' },
  { name: 'Lidio', degree: 'IV', offset: 5, quality: 'maj7', triadQuality: '', tension: '(add#11)', character: '4 aumentada', characterInterval: 6, description: 'Mayor con cuarta aumentada: flotante, amplio y luminoso.', color: '#6e91a3' },
  { name: 'Mixolidio', degree: 'V', offset: 7, quality: '7', triadQuality: '', tension: '7', character: '7 menor', characterInterval: 10, description: 'Mayor con séptima menor: directo, cálido y terrenal. En tríada, sin la séptima: el libro lo usa así.', color: '#9b7352' },
  { name: 'Eólico', degree: 'VI', offset: 9, quality: 'm7', triadQuality: 'm', tension: 'm7', character: '6 menor', characterInterval: 8, description: 'La menor natural: introspectivo, familiar y melancólico.', color: '#806b83' },
  { name: 'Locrio', degree: 'VII', offset: 11, quality: 'm7b5', triadQuality: 'dim', tension: 'm7b5', character: '5 disminuida', characterInterval: 6, description: 'Menor con quinta disminuida: inestable y lleno de tensión.', color: '#8b625f' },
];

let modesRoot = 'C';
let modesTetrad = false;
let selectedMode = 0;

function modeNote(interval) {
  return MODE_NOTES[(MODE_NOTES.indexOf(modesRoot) + interval) % 12];
}

function modeScale(mode) {
  const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
  const modeIndex = MODE_DATA.indexOf(mode);
  return majorIntervals.map((_, index) => modeNote(majorIntervals[(index + modeIndex) % 7]));
}

function modeTensionName(mode) {
  return modeNote(mode.offset) + mode.tension;
}

function modeChordName(mode, tetrad) {
  return modeNote(mode.offset) + (tetrad ? mode.quality : mode.triadQuality);
}

function renderModes() {
  const wheel = document.getElementById('modes-wheel');
  const strip = document.getElementById('modes-scale-strip');
  const mode = MODE_DATA[selectedMode];
  const modeRoot = modeNote(mode.offset);
  const notes = modeScale(mode);
  wheel.innerHTML = '<div class="modes-wheel-core"><span>misma<br>escala</span></div>';

  MODE_DATA.forEach((item, index) => {
    const button = document.createElement('button');
    const angle = (index * (360 / MODE_DATA.length)) - 90;
    const qualityClass = item.triadQuality === 'm' ? 'quality-minor' : item.triadQuality === 'dim' ? 'quality-diminished' : 'quality-major';
    button.className = `mode-orbit mode-${index} ${qualityClass} ${index === selectedMode ? 'selected' : ''}`;
    button.style.setProperty('--mode-angle', `${angle}deg`);
    button.style.setProperty('--mode-color', item.color);
    button.innerHTML = `<span>${item.degree}</span><strong>${item.name}</strong><small>${modeNote(item.offset)}</small>`;
    button.title = `${item.name} en ${modeNote(item.offset)}`;
    button.addEventListener('click', () => {
      selectedMode = index;
      renderModes();
    });
    wheel.appendChild(button);
  });

  strip.innerHTML = notes.map((note, index) => `<span class="${index === 0 ? 'mode-tonic' : ''}">${note}</span>`).join('');
  document.getElementById('mode-name').textContent = mode.name;
  document.getElementById('mode-chord').textContent = modeChordName(mode, modesTetrad);
  document.getElementById('mode-tension').textContent = modeTensionName(mode);
  document.getElementById('mode-description').textContent = mode.description;
  document.getElementById('mode-degree').textContent = mode.degree;
  document.getElementById('mode-characteristic').textContent = mode.characterInterval === undefined
    ? mode.character
    : `${mode.character} · ${modeNote(mode.offset + mode.characterInterval)}`;
}

function initializeModes() {
  const rootSelect = document.getElementById('modes-root');
  rootSelect.innerHTML = MODE_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');
  rootSelect.value = modesRoot;
  rootSelect.addEventListener('change', () => {
    modesRoot = rootSelect.value;
    renderModes();
  });
  document.querySelectorAll('#modes-voicing-seg .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modesTetrad = btn.dataset.voicing === 'tetrad';
      document.querySelectorAll('#modes-voicing-seg .seg-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderModes();
    });
  });
  renderModes();
}

if (typeof document !== 'undefined') initializeModes();
