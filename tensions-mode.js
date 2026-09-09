const TENSION_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const TENSION_DATA = [
  { label: 'b9', interval: 1, kind: 'fricción', description: 'Fricción intensa. Úsala cuando quieras empujar con fuerza hacia otro acorde.' },
  { label: '9', interval: 2, kind: 'color', description: 'Color abierto y claro. Amplía el acorde sin cambiar su función principal.' },
  { label: '#9', interval: 3, kind: 'fricción', description: 'Una tensión áspera y expresiva, ideal para un dominante con carácter.' },
  { label: '11', interval: 5, kind: 'color', description: 'Aire suspendido. Deja espacio y evita cerrar demasiado pronto.' },
  { label: '#11', interval: 6, kind: 'fricción', description: 'Brillo extraño y flotante. Marca una distancia clara del acorde mayor común.' },
  { label: '13', interval: 9, kind: 'estable', description: 'Color cálido y cantable. Suma amplitud manteniendo la sensación de reposo.' },
];

let tensionRoot = 'C';
let tensionQuality = 'maj7';
let selectedTension = '9';

function tensionNote(interval) {
  return TENSION_NOTES[(TENSION_NOTES.indexOf(tensionRoot) + interval) % 12];
}

function tensionKind(tension) {
  const classification = {
    maj7: { b9: 'fricción', 9: 'color', '#9': 'fricción', 11: 'fricción', '#11': 'color', 13: 'estable' },
    m7: { b9: 'fricción', 9: 'color', '#9': 'fricción', 11: 'estable', '#11': 'fricción', 13: 'color' },
    7: { b9: 'fricción', 9: 'color', '#9': 'fricción', 11: 'fricción', '#11': 'color', 13: 'estable' },
  };
  return classification[tensionQuality][tension.label];
}

function renderTensions() {
  const map = document.getElementById('tension-map');
  if (!map) return;
  const qualityIntervals = tensionQuality === 'm7' ? [0, 3, 7, 10] : tensionQuality === '7' ? [0, 4, 7, 10] : [0, 4, 7, 11];
  const baseNotes = qualityIntervals.map(tensionNote);
  map.innerHTML = '<div class="tension-ring ring-base"><span>acorde<br>base</span></div><div class="tension-ring ring-color"></div>';

  const center = document.createElement('div');
  center.className = 'tension-center';
  center.innerHTML = `<strong>${tensionRoot}${tensionQuality}</strong><small>${baseNotes.join(' · ')}</small>`;
  map.appendChild(center);

  TENSION_DATA.forEach((tension, index) => {
    const button = document.createElement('button');
    const angle = (index * 60) - 90;
    const kind = tensionKind(tension);
    button.className = `tension-node ${kind} ${tension.label === selectedTension ? 'selected' : ''}`;
    button.style.setProperty('--tension-angle', `${angle}deg`);
    button.innerHTML = `<span>${tension.label}</span><strong>${tensionNote(tension.interval)}</strong><small>${kind}</small>`;
    button.title = `${tension.label}: ${tensionNote(tension.interval)}`;
    button.addEventListener('click', () => {
      selectedTension = tension.label;
      renderTensions();
    });
    map.appendChild(button);
  });

  updateTensionDetails(baseNotes);
}

function updateTensionDetails(baseNotes) {
  const tension = TENSION_DATA.find(item => item.label === selectedTension) || TENSION_DATA[1];
  const fullNotes = [...baseNotes, tensionNote(tension.interval)];
  document.getElementById('tension-selected').textContent = `${tension.label} · ${tensionNote(tension.interval)}`;
  document.getElementById('tension-description').textContent = tension.description;
  document.getElementById('tension-symbol').textContent = `${tensionRoot}${tensionQuality}(${tension.label})`;
  document.getElementById('tension-notes').textContent = fullNotes.join(' · ');
}

function initializeTensions() {
  const rootSelect = document.getElementById('tension-root');
  const qualitySelect = document.getElementById('tension-quality');
  rootSelect.innerHTML = TENSION_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');
  rootSelect.value = tensionRoot;
  rootSelect.addEventListener('change', () => {
    tensionRoot = rootSelect.value;
    renderTensions();
  });
  qualitySelect.addEventListener('change', () => {
    tensionQuality = qualitySelect.value;
    renderTensions();
  });
  document.getElementById('tension-clear').addEventListener('click', () => {
    selectedTension = '9';
    renderTensions();
  });
  renderTensions();
}

initializeTensions();
