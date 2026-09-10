// ===== Armonía ilustrada (Illustrated Harmony, vol. 1) =====
// Reutiliza CHORD_TYPES de Chords/chord-mode.js para nombres y notas compartidas.

const HARMONY_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const HARMONY_TONIC = { maj: 'I', min: 'i' };
const HARMONY_SCALE_INTERVALS = { maj: [0, 2, 4, 5, 7, 9, 11], min: [0, 2, 3, 5, 7, 8, 10] };

const HARMONY_DEGREES = {
  maj: [
    { degree: 'I', quality: '', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro de la tonalidad. Desde acá podés abrir varios recorridos.' },
    { degree: 'ii', quality: 'm', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Prepara la dominante con un movimiento suave y muy usable.' },
    { degree: 'iii', quality: 'm', interval: 4, origin: 'diatonic', role: 'Puente', description: 'Conecta la tónica con otros acordes sin cerrar la frase.' },
    { degree: 'IV', quality: '', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Abre el movimiento y se aleja del centro sin perder estabilidad.' },
    { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Tensa el recorrido y pide volver al centro de la tonalidad.' },
    { degree: 'vi', quality: 'm', interval: 9, origin: 'diatonic', role: 'Relativa menor', description: 'Comparte notas con la tónica, pero cambia el color hacia una sensación más íntima.' },
    { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'El grado sensible: resuelve al centro con tensión concentrada (B°≈G7).' },
    { degree: 'iv', quality: 'm', interval: 5, origin: 'borrowed', role: 'Plagal menor', description: 'La subdominante menor de la tonalidad paralela: la cadencia "amarga" 4→4m→1.' },
    { degree: 'bVII', quality: '', interval: 10, origin: 'borrowed', role: 'Préstamo', description: 'Un color tomado de la tonalidad paralela para salir del camino esperado.' },
  ],
  min: [
    { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro de la tonalidad menor. Desde acá podés abrir varios recorridos.' },
    { degree: 'ii°', quality: 'dim', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Prepara la dominante con un movimiento suave y muy usable.' },
    { degree: 'III', quality: '', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Comparte notas con la tónica; el color cambia al modo relativo.' },
    { degree: 'iv', quality: 'm', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Abre el movimiento sin perder estabilidad: el color más serio.' },
    { degree: 'v', quality: 'm', interval: 7, origin: 'diatonic', role: 'Dominante menor', description: 'Tensa el recorrido; en menor natural no hay sensible.' },
    { degree: 'VI', quality: '', interval: 8, origin: 'diatonic', role: 'Sobretónica', description: 'Puerto de color: comparte dos notas con el centro.' },
    { degree: 'VII', quality: '', interval: 10, origin: 'diatonic', role: 'Puente', description: 'Subtonica: conecta hacia el subdominante sin cerrar.' },
  ],
};

const HARMONY_EDGES = {
  maj: [
    ['I', 'vi', 'misma familia'], ['I', 'IV', 'abre'], ['I', 'V', 'tensiona'],
    ['vi', 'IV', 'continúa'], ['IV', 'V', 'prepara'], ['V', 'I', 'resuelve'],
    ['ii', 'V', 'prepara'], ['iii', 'vi', 'conecta'], ['IV', 'bVII', 'cambia el color'],
    ['vii°', 'I', 'resuelve'], ['vii°', 'V', 'sinónimo'], ['IV', 'I', 'plagal'],
    ['IV', 'iv', 'plagal menor'], ['iv', 'I', 'resuelve'],
  ],
  min: [
    ['i', 'VI', 'continúa'], ['i', 'III', 'relativa'], ['i', 'v', 'tensiona'],
    ['iv', 'i', 'plagal'], ['v', 'i', 'resuelve'], ['iv', 'v', 'prepara'],
    ['VI', 'iv', 'conecta'], ['III', 'VI', 'conecta'], ['VII', 'iv', 'prepara'],
    ['ii°', 'i', 'resuelve'],
  ],
};

const HARMONY_POSITIONS = {
  maj: { I: [50, 50], ii: [27, 76], iii: [73, 76], IV: [50, 17], V: [82, 28], vi: [18, 28], 'vii°': [84, 52], iv: [18, 52], bVII: [50, 91] },
  min: { i: [50, 50], 'ii°': [27, 76], III: [73, 76], iv: [50, 17], v: [82, 28], VI: [18, 28], VII: [50, 91] },
};

let harmonyKey = { root: 'C', mod: 'maj' };
let harmonyMode = 'funciones';
let harmonyHarmonic = false;
let harmonySelected = 'I';
let harmonyPath = ['I'];

function harmonyRootIdx() {
  return HARMONY_NOTES.indexOf(harmonyKey.root);
}

function harmonChordName(mod, root, def) {
  return HARMONY_NOTES[(HARMONY_NOTES.indexOf(root) + def.interval) % 12] + def.quality;
}

function harmonChordSet(mod, root, def) {
  const base = HARMONY_NOTES.indexOf(root) + def.interval;
  return CHORD_TYPES[def.quality].intervals.map(iv => (base + iv) % 12);
}

function harmonSharedWithTonic(mod, root, def) {
  const tonicQ = mod === 'min' ? 'm' : '';
  const tonic = CHORD_TYPES[tonicQ].intervals.map(iv => (HARMONY_NOTES.indexOf(root) + iv) % 12);
  return harmonChordSet(mod, root, def).filter(pc => tonic.includes(pc)).length;
}

function harmonTonicEdges(mod) {
  const tonic = HARMONY_TONIC[mod];
  return HARMONY_EDGES[mod].filter(([from, to]) => to === tonic);
}

function harmonDominantName() {
  return HARMONY_NOTES[(harmonyRootIdx() + HARMONY_SCALE_INTERVALS.maj[4]) % 12] + '7';
}

function harmonyChord(def) {
  return harmonChordName(harmonyKey.mod, harmonyKey.root, def);
}

function harmonyDegrees(mod) {
  return HARMONY_DEGREES[mod === 'min' ? 'min' : 'maj'];
}

function harmonyEdges(mod) {
  return HARMONY_EDGES[mod === 'min' ? 'min' : 'maj'];
}

function harmonyPositions(mod) {
  return HARMONY_POSITIONS[mod === 'min' ? 'min' : 'maj'];
}

function harmonyModeMeta() {
  const byMode = {
    funciones: {
      legend: '<i class="on"></i> seleccioná un acorde: las líneas moradas marcan los saltos posibles',
      hint: 'Elegí un acorde para ver hacia dónde puede llevarte.',
    },
    prox: {
      legend: '<i class="on"></i> 2/3 cerca · <i></i> 1 media · <i class="far"></i> 0 lejos — notas compartidas con la tónica',
      hint: 'El libro de Callipari: a más notas en común, más cerca (2 = casi mismo acorde).',
    },
    cadencias: {
      legend: harmonyKey.mod === 'min' && harmonyHarmonic
        ? '<i class="on"></i> hacia la tónica = cierre · en menor la dominante suena como V7 (armónica)'
        : '<i class="on"></i> hacia la tónica = cierre de frase',
      hint: harmonyKey.mod === 'min'
        ? 'Perfecta (v→i · con sensible V7→i), plagal (iv→i): los finales que cierran en menor.'
        : 'Perfecta (V→I), plagal (IV→I), amarga (4→4m→1) y sensible (vii°→I): los finales que cierran.',
    },
  };
  return byMode[harmonyMode];
}

function renderHarmony() {
  const map = document.getElementById('harmony-map');
  const keySelect = document.getElementById('harmony-key');
  if (!map || !keySelect) return;

  const mod = harmonyKey.mod;
  const degrees = harmonyDegrees(mod);
  const positions = harmonyPositions(mod);
  const tonicName = harmonChordName(mod, harmonyKey.root, degrees[0]);
  const tonic = HARMONY_TONIC[mod];

  map.innerHTML = '<svg class="harmony-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>';
  const svg = map.querySelector('svg');

  const isCad = harmonyMode === 'cadencias';
  const isProx = harmonyMode === 'prox';

  harmonyEdges(mod).forEach(([from, to]) => {
    const [x1, y1] = positions[from];
    const [x2, y2] = positions[to];
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.dataset.from = from;
    line.dataset.to = to;
    svg.appendChild(line);
  });

  degrees.forEach(def => {
    const button = document.createElement('button');
    const [left, top] = positions[def.degree];
    const classes = [
      'harmony-node',
      `node-${def.degree.replace('°', 'dim').replace('b', 'flat')}`,
      def.origin === 'borrowed' ? 'borrowed' : '',
      isProx ? `prox-${harmonSharedWithTonic(mod, harmonyKey.root, def)}` : '',
      def.degree === harmonySelected ? 'selected' : '',
      isCad && def.degree === tonic ? 'cadence-tonic' : '',
    ].filter(Boolean).join(' ');
    button.className = classes;
    button.style.left = `${left}%`;
    button.style.top = `${top}%`;
    button.innerHTML = `<span class="harmony-degree">${def.degree}</span><strong>${harmonyChord(def)}</strong><small>${def.role}</small>${isProx ? `<em class="prox-badge">${harmonSharedWithTonic(mod, harmonyKey.root, def)}/3</em>` : ''}${isCad && harmonyKey.mod === 'min' && harmonyHarmonic && def.degree === 'v' ? `<em class="harmonic-dominant">V7 = ${harmonDominantName()}</em>` : ''}`;
    button.title = `${def.degree} · ${harmonyChord(def)}${def.origin === 'borrowed' ? ' · préstamo' : ''}`;
    button.addEventListener('click', () => selectHarmonyNode(def.degree));
    button.addEventListener('mouseenter', () => updateHarmonyLines(def.degree));
    button.addEventListener('mouseleave', () => updateHarmonyLines(harmonySelected));
    map.appendChild(button);
  });

  updateHarmonyDetails();
  updateHarmonyControls();
}

function selectHarmonyNode(degree) {
  harmonySelected = degree;
  if (harmonyPath[harmonyPath.length - 1] !== degree) harmonyPath.push(degree);
  if (harmonyPath.length > 6) harmonyPath.shift();
  renderHarmony();
}

function updateHarmonyLines(focusDegree) {
  const tonic = HARMONY_TONIC[harmonyKey.mod];
  const isCad = harmonyMode === 'cadencias';
  document.querySelectorAll('.harmony-lines line').forEach(line => {
    if (isCad) {
      const active = line.dataset.to === tonic;
      line.classList.toggle('active', active);
      line.classList.toggle('muted', !active);
      return;
    }
    const active = line.dataset.from === focusDegree || line.dataset.to === focusDegree;
    line.classList.toggle('active', active);
    line.classList.toggle('muted', false);
  });
}

function updateHarmonyDetails() {
  const degrees = harmonyDegrees(harmonyKey.mod);
  const selected = degrees.find(node => node.degree === harmonySelected);
  const selectedEl = document.getElementById('harmony-selected');
  const descriptionEl = document.getElementById('harmony-description');
  const metricEl = document.getElementById('harmony-metric');
  const legendEl = document.getElementById('harmony-legend');
  const hintEl = document.getElementById('harmony-hint');
  if (!selectedEl || !selected) return;

  const meta = harmonyModeMeta();
  if (legendEl) legendEl.innerHTML = meta.legend;
  if (hintEl) hintEl.textContent = meta.hint;

  selectedEl.textContent = `${selected.degree} · ${harmonyChord(selected)}`;
  descriptionEl.textContent = selected.description;

  const tonic = HARMONY_TONIC[harmonyKey.mod];
  let metric = '';
  if (harmonyMode === 'prox') {
    const shared = harmonSharedWithTonic(harmonyKey.mod, harmonyKey.root, selected);
    const near = shared === 2 ? ' — cerca' : shared === 1 ? ' — a mitad de camino' : ' — el más lejos';
    metric = `Comparte <b>${shared}/3</b> notas con ${harmonyChord(degrees[0])}${near}.`;
  } else if (harmonyMode === 'cadencias') {
    if (selected.degree === tonic) {
      metric = harmonyKey.mod === 'min'
        ? 'Perfecta v→i (y <b>V7→i</b> con la sensible) · plagal iv→i · sensible ii°→i. Elegí una para ver su camino.'
        : '<b>Perfecta</b> V→I · <b>plagal</b> IV→I · <b>amarga</b> 4→4m→1 · <b>sensible</b> vii°→I. Elegí una para ver su camino.';
    } else {
      metric = 'Cierre aún no tocado: los finales llegan al centro (' + tonic + ').';
    }
  } else if (selected.origin === 'borrowed') {
    metric = 'Préstamo: viene de la tonalidad paralela (menor).';
  } else if (selected.origin === 'diatonic' && selected.degree !== undefined) {
    metric = 'Diatónico: nace dentro de la escala.';
  }
  metricEl.innerHTML = metric;

  document.getElementById('harmony-path').innerHTML = harmonyPath.map(degree => {
    const node = harmonyDegrees(harmonyKey.mod).find(item => item.degree === degree);
    return `<span>${degree} · ${harmonyChord(node)}</span>`;
  }).join('<b>→</b>');

  updateHarmonyLines(harmonySelected);
}

function setHarmonyMode(mode) {
  harmonyMode = mode;
  document.querySelectorAll('#harmony-mode-seg .seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hmode === mode);
  });
  harmonySelected = harmonyKey.mod === 'min' ? 'i' : 'I';
  renderHarmony();
}

function resetHarmony() {
  harmonySelected = harmonyKey.mod === 'min' ? 'i' : 'I';
  harmonyPath = [harmonySelected];
  renderHarmony();
}

function updateHarmonyControls() {
  const wrap = document.getElementById('harmony-harmonic-wrap');
  if (!wrap) return;
  const visible = harmonyMode === 'cadencias' && harmonyKey.mod === 'min';
  wrap.classList.toggle('hidden', !visible);
}

function toggleHarmonyHarmonic() {
  const check = document.getElementById('harmony-harmonic');
  if (!check) return;
  harmonyHarmonic = check.checked;
  renderHarmony();
}

function initializeHarmony() {
  const keySelect = document.getElementById('harmony-key');
  if (!keySelect) return;
  const majors = HARMONY_NOTES.map(n => `<option value="maj:${n}">${n} mayor</option>`);
  const minors = HARMONY_NOTES.map(n => `<option value="min:${n}">${n} menor</option>`);
  keySelect.innerHTML = majors.join('') + minors.join('');
  keySelect.value = 'maj:C';

  keySelect.addEventListener('change', () => {
    const [mod, root] = keySelect.value.split(':');
    harmonyKey = { root, mod };
    resetHarmony();
  });

  document.querySelectorAll('#harmony-mode-seg .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => setHarmonyMode(btn.dataset.hmode));
  });
  document.getElementById('harmony-clear').addEventListener('click', resetHarmony);
  document.getElementById('harmony-harmonic').addEventListener('change', toggleHarmonyHarmonic);

  renderHarmony();
}

if (typeof document !== 'undefined') initializeHarmony();