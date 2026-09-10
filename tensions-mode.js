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

const TENSION_RULINGS = {
  maj7: {
    b9:  { id: 'care',   label: 'Cuidado',           tip: 'La b9 pega contra la raíz y arma tritono con la 5ta: solo como color pasajero.' },
    9:   { id: 'safe',   label: 'Aceptada',          tip: 'La 9 amplía sin fricción: el sonido "maj9" clásico.' },
    '#9': { id: 'care',  label: 'Cuidado',           tip: 'Pesa como 3ra ♯ contra la 3ra mayor: mejor probarla en otro acorde.' },
    11:  { id: 'avoid',  label: 'Evitada',           tip: 'La 11 es b9 de la 3ra y tritono de la 7ma. El libro la cruza (resuena a b11 ≈ 3ra).' },
    '#11': { id: 'accept', label: 'Aceptada (Lidia)', tip: 'Tritono con la raíz (y semitono con la 5ta): es el color Lidio, de uso constante.' },
    13:  { id: 'safe',   label: 'Aceptada',          tip: 'La 13 cae lejos de las otras notas: suma amplitud sin fricción.' },
  },
  m7: {
    b9:  { id: 'avoid', label: 'Evitada',           tip: 'La b9 choca con la raíz y arma tritono con la 5ta: el ejemplo del libro es Em(addb9), "una catástrofe".' },
    9:   { id: 'accept', label: 'Aceptada (m9)',     tip: 'El semitono con la 3ra♭ es el sonido m9 de costumbre: el libro la usa.' },
    '#9': { id: 'care',  label: 'Cuidado',           tip: 'En m7 duplica la 3ra♭ (enarmónica): suena como color apretado.' },
    11:  { id: 'safe',   label: 'Aceptada',          tip: 'La 11 cae lejos de todo: el aire suspendido del m11.' },
    '#11': { id: 'care', label: 'Cuidado',           tip: 'La #11 es semitono con la 3ra♭: tensión filosa dentro del m7.' },
    13:  { id: 'avoid',  label: 'Evitada',           tip: 'La 13 es tritono con la 3ra y semitono con la 7ma (y una subdominante no empuja como dominante).' },
  },
  7: {
    b9:  { id: 'accept', label: 'Aceptada (V7♭9)',  tip: 'b9 y tritono contra la 5ta son el alma del dominante alterado: el turnaround clásico.' },
    9:   { id: 'safe',   label: 'Aceptada',          tip: 'La 9 extiende el dominante sin fricción: sonido estándar.' },
    '#9': { id: 'care',  label: 'Cuidado',           tip: 'La #9 contra la 3ra es el color del rock/blues (Hendrix): usala así, con intención.' },
    11:  { id: 'avoid',  label: 'Evitada',           tip: 'La 11 natural es b9 de la 3ra y tritono de la b7: en el dominante se evita, mejor la #11.' },
    '#11': { id: 'accept', label: 'Aceptada (Lidia dominante)', tip: 'Tritono con la 3ra a un lado y la b7: el color lemmy de la "Lydian dominant".' },
    13:  { id: 'accept', label: 'Aceptada',          tip: 'El semitono con la b7 es el sonido "C13" de siempre: la 13 es nota de dominante.' },
  },
};

function tenBasePcs() {
  const root = TENSION_NOTES.indexOf(tensionRoot);
  const qualityIntervals = tensionQuality === 'm7' ? [0, 3, 7, 10] : tensionQuality === '7' ? [0, 4, 7, 10] : [0, 4, 7, 11];
  return qualityIntervals.map(iv => (root + iv) % 12);
}

function tenTensionCounts(basePcs, interval) {
  const pc = (TENSION_NOTES.indexOf(tensionRoot) + interval) % 12;
  let b9 = 0, tri = 0;
  basePcs.forEach(b => {
    const d = Math.abs(pc - b);
    const dist = Math.min(d, 12 - d);
    if (dist === 1) b9++;
    if (dist === 6) tri++;
  });
  return { b9, tri, pc };
}

function tenRuling(tension) {
  return TENSION_RULINGS[tensionQuality][tension.label] || { id: 'care', label: 'Cuidado', tip: '' };
}

function renderTensions() {
  const map = document.getElementById('tension-map');
  if (!map) return;
  const basePcs = tenBasePcs();
  const baseNotes = basePcs.map(pc => TENSION_NOTES[pc]);
  map.innerHTML = '<div class="tension-ring ring-base"><span>acorde<br>base</span></div><div class="tension-ring ring-color"></div>';

  const center = document.createElement('div');
  center.className = 'tension-center';
  center.innerHTML = `<strong>${tensionRoot}${tensionQuality}</strong><small>${baseNotes.join(' · ')}</small>`;
  map.appendChild(center);

  TENSION_DATA.forEach((tension, index) => {
    const button = document.createElement('button');
    const angle = (index * 60) - 90;
    const kind = tensionKind(tension);
    const ruling = tenRuling(tension);
    const { b9, tri } = tenTensionCounts(basePcs, tension.interval);
    button.className = `tension-node ${kind} ten-${ruling.id} ${tension.label === selectedTension ? 'selected' : ''}`;
    button.style.setProperty('--tension-angle', `${angle}deg`);
    button.innerHTML = `<span>${tension.label}</span><strong>${tensionNote(tension.interval)}</strong><small>${kind}</small><i class="ten-dis">${b9 ? b9 + '●' : ''}${tri ? tri + '▲' : ''}</i>`;
    button.title = `${tension.label}: ${tensionNote(tension.interval)} · ${ruling.label}`;
    button.addEventListener('click', () => {
      selectedTension = tension.label;
      renderTensions();
    });
    map.appendChild(button);
  });

  updateTensionDetails();
}

function updateTensionDetails() {
  const tension = TENSION_DATA.find(item => item.label === selectedTension) || TENSION_DATA[1];
  const basePcs = tenBasePcs();
  const baseNotes = basePcs.map(pc => TENSION_NOTES[pc]);
  const fullPcs = [...new Set([...basePcs, (TENSION_NOTES.indexOf(tensionRoot) + tension.interval) % 12])].sort((a, b) => a - b);
  const fullNotes = fullPcs.map(pc => TENSION_NOTES[pc]);
  const { b9, tri } = tenTensionCounts(basePcs, tension.interval);
  const ruling = tenRuling(tension);
  document.getElementById('tension-selected').textContent = `${tension.label} · ${tensionNote(tension.interval)}`;
  document.getElementById('tension-description').textContent = tension.description;
  document.getElementById('tension-symbol').textContent = `${tensionRoot}${tensionQuality}(${tension.label})`;
  document.getElementById('tension-notes').textContent = fullNotes.join(' · ');
  const levelEl = document.getElementById('tension-level');
  if (levelEl) {
    levelEl.innerHTML = `<span class="ten-level-label ten-${ruling.id}">${ruling.label}</span>
      <span class="ten-level-counts">${b9 ? b9 + '● b9' : ''}${tri ? (b9 ? ' · ' : '') + tri + '▲ tritono' : ''}${b9 + tri === 0 ? 'sin fricción' : ''}</span>
      <small>${ruling.tip}</small>`;
  }
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
