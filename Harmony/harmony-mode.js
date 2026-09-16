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
    ['i', 'VII', 'baja por grado'], ['i', 'VI', 'continúa'], ['i', 'III', 'relativa'], ['i', 'v', 'tensiona'],
    ['iv', 'i', 'plagal'], ['v', 'i', 'resuelve'], ['iv', 'v', 'prepara'],
    ['VI', 'iv', 'conecta'], ['VI', 'III', 'baja por grado'], ['III', 'VII', 'baja por grado'],
    ['VII', 'VI', 'baja por grado'], ['VII', 'iv', 'prepara'],
    ['ii°', 'i', 'resuelve'],
  ],
};

const HARMONY_POSITIONS = {
  maj: { I: [50, 50], ii: [27, 76], iii: [73, 76], IV: [50, 17], V: [82, 28], vi: [18, 28], 'vii°': [84, 52], iv: [18, 52], bVII: [50, 91] },
  min: { i: [50, 50], 'ii°': [27, 76], III: [73, 76], iv: [50, 17], v: [82, 28], VI: [18, 28], VII: [50, 91] },
};

const HARMONY_VARIANTS = {
  major: {
    label: 'Mayor', mod: 'maj', intervals: HARMONY_SCALE_INTERVALS.maj,
    degrees: HARMONY_DEGREES.maj, edges: HARMONY_EDGES.maj, positions: HARMONY_POSITIONS.maj,
  },
  natural: {
    label: 'Menor natural', mod: 'min', intervals: HARMONY_SCALE_INTERVALS.min,
    degrees: HARMONY_DEGREES.min, edges: HARMONY_EDGES.min, positions: HARMONY_POSITIONS.min,
  },
  harmonic: {
    label: 'Menor armónica', mod: 'min', intervals: [0, 2, 3, 5, 7, 8, 11],
    degrees: [
      { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'El centro menor con sensible elevada: la dominante puede resolver con fuerza.' },
      { degree: 'ii°', quality: 'dim', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Acorde disminuido que prepara la dominante.' },
      { degree: 'III+', quality: 'aug', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Acorde aumentado producido por la sensible elevada.' },
      { degree: 'iv', quality: 'm', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Subdominante menor de la escala armónica.' },
      { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Dominante mayor: contiene la sensible y resuelve al centro.' },
      { degree: 'VI', quality: '', interval: 8, origin: 'diatonic', role: 'Sobretónica', description: 'Sexto grado mayor de la escala armónica.' },
      { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'La sensible forma un acorde disminuido que resuelve al centro.' },
    ],
    edges: [
      ['i', 'VI', 'continúa'], ['i', 'III+', 'relativa'], ['i', 'iv', 'abre'],
      ['ii°', 'V', 'prepara'], ['iv', 'V', 'prepara'], ['V', 'i', 'resuelve'],
      ['VI', 'iv', 'conecta'], ['vii°', 'i', 'resuelve'],
    ],
    positions: { i: [50, 50], 'ii°': [27, 76], 'III+': [73, 76], iv: [50, 17], V: [82, 28], VI: [18, 28], 'vii°': [50, 91] },
  },
  melodic: {
    label: 'Menor melódica', mod: 'min', intervals: [0, 2, 3, 5, 7, 9, 11],
    degrees: [
      { degree: 'i', quality: 'm', interval: 0, origin: 'diatonic', role: 'Centro', description: 'Centro menor; la sexta y séptima elevadas favorecen el movimiento ascendente.' },
      { degree: 'ii', quality: 'm', interval: 2, origin: 'diatonic', role: 'Preparación', description: 'Preparación menor de la dominante.' },
      { degree: 'III+', quality: 'aug', interval: 3, origin: 'diatonic', role: 'Relativa mayor', description: 'Color aumentado de la escala menor melódica.' },
      { degree: 'IV', quality: '', interval: 5, origin: 'diatonic', role: 'Subdominante', description: 'Subdominante mayor con sexta elevada.' },
      { degree: 'V', quality: '', interval: 7, origin: 'diatonic', role: 'Dominante', description: 'Dominante mayor con sensible.' },
      { degree: 'vi°', quality: 'dim', interval: 9, origin: 'diatonic', role: 'Paso', description: 'Sexto grado disminuido de la escala melódica ascendente.' },
      { degree: 'vii°', quality: 'dim', interval: 11, origin: 'diatonic', role: 'Sensible', description: 'Acorde de sensible que resuelve al centro.' },
    ],
    edges: [
      ['i', 'IV', 'asciende'], ['i', 'V', 'tensiona'], ['i', 'III+', 'color'],
      ['ii', 'V', 'prepara'], ['IV', 'V', 'prepara'], ['V', 'i', 'resuelve'],
      ['vi°', 'vii°', 'asciende'], ['vii°', 'i', 'resuelve'],
    ],
    positions: { i: [50, 50], ii: [27, 76], 'III+': [73, 76], IV: [50, 17], V: [82, 28], 'vi°': [18, 28], 'vii°': [50, 91] },
  },
};

function openStudyMode(mode) {
  const navBtn = document.querySelector(`.nav-btn[data-mode="${mode}"]`);
  if (navBtn) { navBtn.click(); return true; }
  return false;
}

let harmonyKey = { root: 'C', mod: 'maj', variant: 'major' };
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
  return harmonyEdges(mod).filter(([from, to]) => to === tonic);
}

function harmonDominantName() {
  return HARMONY_NOTES[(harmonyRootIdx() + HARMONY_SCALE_INTERVALS.maj[4]) % 12] + '7';
}

function harmonSecondaryDominant(def) {
  const idx = (harmonyRootIdx() + def.interval + 7) % 12;
  return { name: HARMONY_NOTES[idx] + '7', root: HARMONY_NOTES[idx] };
}

function harmonDomChain() {
  const start = (harmonyRootIdx() + HARMONY_SCALE_INTERVALS.maj[4]) % 12;
  const chain = [];
  let pc = start;
  do {
    chain.push(HARMONY_NOTES[pc] + '7');
    pc = (pc + 5) % 12;
  } while (pc !== start);
  chain.push(HARMONY_NOTES[start] + '7');
  return chain;
}

function harmonTwoFiveOne() {
  const get = (mod, deg) => harmonyDegrees(mod).find(d => d.degree === deg);
  const root = harmonyKey.root;
  const major = ['ii', 'V', 'I'].map((deg, i) => {
    const q = ['m7', '7', 'maj7'][i];
    const d = get('maj', deg);
    return d ? harmonChordName('maj', root, { ...d, quality: q }) : '';
  });
  const minor = [['ii°', 'dim'], ['v', '7'], ['i', 'm']].map(([deg, q]) => {
    const d = get('min', deg);
    return d ? harmonChordName('min', root, { ...d, quality: q }) : '';
  });
  return { major, minor };
}

function harmonSet251(which) {
  harmonyKey.mod = which === 'min' ? 'min' : 'maj';
  harmonyKey.variant = which === 'min' ? 'natural' : 'major';
  const keySelect = document.getElementById('harmony-key');
  const variantSelect = document.getElementById('harmony-variant');
  if (keySelect) keySelect.value = harmonyKey.root;
  if (variantSelect) variantSelect.value = harmonyKey.variant;
  const path = which === 'min' ? ['ii°', 'v', 'i'] : ['ii', 'V', 'I'];
  harmonySelected = path[path.length - 1];
  harmonyPath = path.slice();
  renderHarmony();
}

function harmonyChord(def) {
  return harmonChordName(harmonyKey.mod, harmonyKey.root, def);
}

function harmonyVariant(variant = harmonyKey.variant) {
  return HARMONY_VARIANTS[variant] || HARMONY_VARIANTS[variant === 'min' ? 'natural' : 'major'];
}

function harmonyDegrees(mod, variant = harmonyKey.variant) {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.degrees : HARMONY_DEGREES[mod === 'min' ? 'min' : 'maj'];
}

function harmonyEdges(mod, variant = harmonyKey.variant) {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.edges : HARMONY_EDGES[mod === 'min' ? 'min' : 'maj'];
}

function harmonyPositions(mod, variant = harmonyKey.variant) {
  const scale = harmonyVariant(variant);
  return scale.mod === mod ? scale.positions : HARMONY_POSITIONS[mod === 'min' ? 'min' : 'maj'];
}

function harmonyLinePoints(from, to) {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const distance = Math.hypot(x2 - x1, y2 - y1) || 1;
  const inset = Math.min(11, distance / 3);
  const dx = (x2 - x1) / distance * inset;
  const dy = (y2 - y1) / distance * inset;
  return { x1: x1 + dx, y1: y1 + dy, x2: x2 - dx, y2: y2 - dy };
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
      legend: '<i class="on"></i> hacia la tónica = cierre de frase',
      hint: harmonyKey.mod === 'min'
        ? harmonyKey.variant === 'natural'
          ? 'Perfecta (v→i), plagal (iv→i) y la bajada i→VII→VI: recorridos propios de la menor natural.'
          : 'Perfecta (V→i con sensible), plagal y resoluciones disminuidas: recorridos de la escala menor activa.'
        : 'Perfecta (V→I), plagal (IV→I), amarga (4→4m→1) y sensible (vii°→I): los finales que cierran.',
    },
    dominantes: {
      legend: '<i class="on"></i> cada acorde tiene su dominante: la dominante que no es del centro es secundaria',
      hint: 'Toda dominante que no sea la del I es una dominante secundaria. Cualquier acorde puede ser alcanzado por "su" V7.',
    },
    prog: {
      legend: '<i class="on"></i> la línea dorada marca el orden de la progresión generada',
      hint: 'Generá una progresión por estilo: cada paso se etiqueta con el tipo de enlace que usa.',
    },
  };
  return byMode[harmonyMode];
}

function renderHarmony() {
  const map = document.getElementById('harmony-map');
  const keySelect = document.getElementById('harmony-key');
  if (!map || !keySelect) return;

  const mod = harmonyKey.mod;
  const variant = harmonyVariant();
  const degrees = harmonyDegrees(mod);
  const positions = harmonyPositions(mod);
  const tonicName = harmonChordName(mod, harmonyKey.root, degrees[0]);
  const tonic = HARMONY_TONIC[mod];
  const variantBadge = document.getElementById('harmony-variant-badge');
  if (variantBadge) variantBadge.textContent = `Mapa · ${variant.label}`;

  map.innerHTML = '<svg class="harmony-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="harmony-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path fill="context-stroke" d="M 0 0 L 10 5 L 0 10 z"></path></marker></defs></svg>';
  const svg = map.querySelector('svg');

  const isCad = harmonyMode === 'cadencias';
  const isProx = harmonyMode === 'prox';
  const isDom = harmonyMode === 'dominantes';
  const isProg = harmonyMode === 'prog';

  harmonyEdges(mod).forEach(([from, to]) => {
    const points = harmonyLinePoints(positions[from], positions[to]);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', points.x1);
    line.setAttribute('y1', points.y1);
    line.setAttribute('x2', points.x2);
    line.setAttribute('y2', points.y2);
    line.setAttribute('marker-end', 'url(#harmony-arrow)');
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
      def.quality === 'm' ? 'quality-minor' : def.quality === 'dim' ? 'quality-diminished' : 'quality-major',
      def.origin === 'borrowed' ? 'borrowed' : '',
      isProx ? `prox-${harmonSharedWithTonic(mod, harmonyKey.root, def)}` : '',
      def.degree === harmonySelected ? 'selected' : '',
      isCad && def.degree === tonic ? 'cadence-tonic' : '',
    ].filter(Boolean).join(' ');
    button.className = classes;
    button.style.left = `${left}%`;
    button.style.top = `${top}%`;
    const secDom = isDom ? `<em class="sec-dom">← ${harmonSecondaryDominant(def).name}</em>` : '';
    const progIdx = isProg ? harmonyProgSeq.findIndex(s => s.degree === def.degree) : -1;
    button.innerHTML = `<span class="harmony-degree">${def.degree}</span><strong>${harmonyChord(def)}</strong><small>${def.role}</small>${secDom}${progIdx > -1 ? `<em class="harmony-prog-badge">${progIdx + 1}</em>` : ''}${isProx ? `<em class="prox-badge">${harmonSharedWithTonic(mod, harmonyKey.root, def)}/3</em>` : ''}${isCad && harmonyKey.mod === 'min' && harmonyHarmonic && def.degree === 'v' ? `<em class="harmonic-dominant">V7 = ${harmonDominantName()}</em>` : ''}`;
    button.title = `${def.degree} · ${harmonyChord(def)}${def.origin === 'borrowed' ? ' · préstamo' : ''}`;
    button.addEventListener('click', () => selectHarmonyNode(def.degree));
    button.addEventListener('mouseenter', () => updateHarmonyLines(def.degree));
    button.addEventListener('mouseleave', () => updateHarmonyLines(harmonySelected));
    map.appendChild(button);
  });

  if (isProg && harmonyProgMap && harmonyProgSeq.length > 1) {
    for (let i = 1; i < harmonyProgSeq.length; i++) {
      const a = harmonyProgSeq[i - 1];
      const b = harmonyProgSeq[i];
      const fromPos = positions[a.degree];
      const toPos = positions[b.degree];
      if (!fromPos || !toPos) continue;
      const points = harmonyLinePoints(fromPos, toPos);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', points.x1);
      line.setAttribute('y1', points.y1);
      line.setAttribute('x2', points.x2);
      line.setAttribute('y2', points.y2);
      line.setAttribute('marker-end', 'url(#harmony-arrow)');
      line.setAttribute('class', 'prog-line');
      svg.appendChild(line);
    }
  }

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
  const isDom = harmonyMode === 'dominantes';
  document.querySelectorAll('.harmony-lines line').forEach(line => {
    if (isCad) {
      const active = line.dataset.to === tonic;
      line.classList.toggle('active', active);
      line.classList.toggle('muted', !active);
      return;
    }
    if (isDom) {
      const dominantish = line.dataset.from === 'ii' || line.dataset.from === 'V'
        || line.dataset.from === 'iv' || line.dataset.from === 'v' || line.dataset.from === 'vii°';
      line.classList.toggle('active', dominantish);
      line.classList.toggle('muted', !dominantish);
      return;
    }
    const active = line.dataset.from === focusDegree || line.dataset.to === focusDegree;
    line.classList.toggle('active', active);
    line.classList.toggle('muted', false);
  });
}

function renderChordDiagram(containerId, chordName) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const info = getChordInfo ? getChordInfo(chordName) : null;
  const frets = info && info.fingering ? info.fingering.frets : null;
  const barre = info && info.fingering ? info.fingering.label : '';
  if (!frets) {
    container.innerHTML = `<p class="study-hint">Sin digitación para ${chordName}</p>`;
    return;
  }
  const cells = ['E', 'A', 'D', 'G', 'B', 'e'].map((sn, i) => {
    const f = frets[i];
    return `<div class="diagram-cell"><span class="string-label">${sn}</span><b class="${f === null ? 'mute' : f === 0 ? 'open' : 'dot'}">${f === null ? '×' : f === 0 ? '○' : f}</b></div>`;
  }).join('');
  container.innerHTML = `<div class="harmony-prog-diagram">${cells}</div><p class="barre-label">${barre}</p>`;
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
  renderChordDiagram('harmony-selected-diagram', harmonyChord(selected));

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
  } else if (harmonyMode === 'dominantes') {
    const dom = harmonSecondaryDominant(selected);
    if (selected.degree === tonic) {
      metric = `<b>${dom.name}</b> es la dominante que llega al centro: resuelve a <b>${harmonyChord(selected)}</b> o a su paralela menor (doble resolución). El famoso <b>F → Fm → C</b>.`;
    } else if (selected.degree === 'V' || selected.degree === 'v') {
      metric = `<b>${dom.name}</b>: la dominante del V (la clásica "V del V"), el pivote natural para modular hacia otra región.`;
    } else {
      metric = `La dominante que tira hacia <b>${harmonyChord(selected)}</b> es <b>${dom.name}</b> (V de ${harmonyChord(selected)}).`;
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

  renderHarmonyDominantes();
  renderHarmonyProgression();
  renderHarmonyNexts();
  updateHarmonyLines(harmonySelected);
}

function renderHarmonyDominantes() {
  const panel = document.getElementById('harmony-dom-panel');
  if (!panel) return;
  const visible = harmonyMode === 'dominantes';
  panel.classList.toggle('hidden', !visible);
  if (!visible) return;
  const chainEl = document.getElementById('harmony-dom-chain');
  const majEl = document.getElementById('harmony-251-major-names');
  const minEl = document.getElementById('harmony-251-minor-names');
  if (!chainEl) return;
  const join = (arr) => arr.map((c, i, a) => `<span>${c}</span>${i < a.length - 1 ? '<b>→</b>' : ''}`).join('');
  chainEl.innerHTML = join(harmonDomChain());
  const { major, minor } = harmonTwoFiveOne();
  majEl.innerHTML = join(major);
  minEl.innerHTML = join(minor);
}

function setHarmonyMode(mode) {
  harmonyMode = mode;
  document.querySelectorAll('#harmony-mode-seg .seg-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hmode === mode);
  });
  harmonySelected = harmonyKey.mod === 'min' ? 'i' : 'I';
  if (mode === 'prog' && !harmonyProgGenerated) onHarmonyGenerate();
  renderHarmony();
}

function resetHarmony() {
  harmonySelected = harmonyKey.mod === 'min' ? 'i' : 'I';
  harmonyPath = [harmonySelected];
  if (harmonyMode === 'prog') onHarmonyGenerate();
  else renderHarmony();
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

// ===== Generador de progresiones (todo lo que se sabe) =====

const HARMONY_PROG_PALETTES = {
  pop:        { label: 'Pop',       step: 1,    dom: 0.25, axis: 0,     tritone: 0,     borrow: 0.05, glueBias: 0.6, seventh: false, unison: 0 },
  dominantes: { label: 'Dominantes', step: 0.5, dom: 1.5,  axis: 0,     tritone: 0.1,   borrow: 0,    glueBias: 0.3, seventh: true,  unison: 0 },
  glue:       { label: 'Glue / Puente', step: 1, dom: 0.6, axis: 0,    tritone: 0,      borrow: 0.15, glueBias: 1.8, seventh: false, unison: 0 },
  tritone:    { label: 'Tritono',    step: 0.4, dom: 1.0,  axis: 1.0,  tritone: 1.6,   borrow: 0.2,  glueBias: 0,   seventh: true,  unison: 0 },
  bartok:     { label: 'Bartók',     step: 0.3, dom: 0.6,  axis: 2.0,  tritone: 1.2,   borrow: 0.1,  glueBias: 0,   seventh: false, unison: 0 },
  libre:      { label: 'Libre',      step: 0.7, dom: 0.8,  axis: 0.6,  tritone: 0.6,   borrow: 0.5,  glueBias: 0.5, seventh: false, unison: 0.2 },
};

let harmonyProgPalette = 'libre';
let harmonyProgLength = 8;
let harmonyProgTonic = true;
let harmonyProgMap = true;
let harmonyProgSeq = [];
let harmonyProgLabels = [];
let harmonyProgSummary = [];
let harmonyProgSelected = -1;
let harmonyProgGenerated = false;

function harmonProgQual(mod, degree, palette) {
  const cfg = HARMONY_PROG_PALETTES[palette];
  const up = cfg && cfg.seventh
    ? (mod === 'min' ? { v: '7', V: '7', 'ii°': 'dim', i: 'm7', IV: 'maj7' } : { ii: 'm7', V: '7', I: 'maj7' })
    : {};
  const def = harmonyDegrees(mod).find(d => d.degree === degree);
  return up[degree] || (def ? def.quality : '');
}

function harmonProgStep(name, mod, rootIdx, def, quality) {
  const base = (rootIdx + def.interval + 12) % 12;
  return {
    degree: def.degree,
    name: HARMONY_NOTES[base] + quality,
    quality,
    rootPc: base,
    origin: def.origin,
    notes: CHORD_TYPES[quality].intervals.map(iv => (base + iv) % 12),
  };
}

function harmonProgGlue(prevNotes, nextNotes) {
  return nextNotes.filter(pc => prevNotes.includes(pc)).length;
}

function harmonProgCandidates(mod, rootIdx, palette, fromIdx, fromDef, fromNotes) {
  const cfg = HARMONY_PROG_PALETTES[palette];
  const degrees = harmonyDegrees(mod);
  const tonicIdx = 0;
  const fromPc = (rootIdx + fromDef.interval) % 12;
  const candidates = [];
  degrees.forEach((to, toIdx) => {
    if (toIdx === fromIdx && cfg.unison <= 0) return;
    const step = harmonProgStep(to.name, mod, rootIdx, to, harmonProgQual(mod, to.degree, palette));
    const diff = (step.rootPc - fromPc + 12) % 12;
    const tritone = diff === 6;
    const axis = diff === 3 || diff === 9;
    const fourthUp = diff === 5;
    const hasEdge = harmonyEdges(mod).some(([a, b]) => a === fromDef.degree && b === to.degree);
    const glue = harmonProgGlue(fromNotes, step.notes);
    let w = cfg.step + (hasEdge ? 1.2 : 0);
    if (toIdx === tonicIdx) w += 3.2;
    if (tritone) w += cfg.tritone * 5;
    if (axis && !tritone) w += cfg.axis * 5;
    if (fourthUp) w += cfg.dom * 4;
    w += glue * cfg.glueBias;
    if (to.origin === 'borrowed') w *= (cfg.borrow + 0.02);
    if (w > 0) candidates.push({ toIdx, kind: hasEdge ? 'edge' : 'mov', w });
  });
  if (cfg.dom > 0) {
    degrees.forEach((to, toIdx) => {
      if (toIdx === fromIdx) return;
      const domRoot = (rootIdx + to.interval + 7) % 12;
      const domName = HARMONY_NOTES[domRoot] + '7';
      candidates.push({ toIdx, kind: 'secdom', domName, domRoot, w: cfg.dom * 5 });
    });
  }
  return candidates;
}

function harmonProgPick(candidates, avoidIdx) {
  const viable = candidates.filter(c => c.toIdx !== avoidIdx);
  const list = viable.length ? viable : candidates;
  const total = list.reduce((s, c) => s + c.w, 0);
  if (total <= 0) return list[0];
  let r = Math.random() * total;
  for (const c of list) { r -= c.w; if (r <= 0) return c; }
  return list[list.length - 1];
}

function harmonProgDomStep(domRoot, domName) {
  return {
    degree: 'V',
    name: domName,
    quality: '7',
    rootPc: domRoot,
    origin: 'diatonic',
    notes: CHORD_TYPES['7'].intervals.map(iv => (domRoot + iv) % 12),
  };
}

function harmonProgGenerate(len, mod, root, palette, tonicCheck) {
  const rootIdx = HARMONY_NOTES.indexOf(root);
  const degrees = harmonyDegrees(mod);
  const tonicIdx = 0;
  const steps = [];
  const startIdx = tonicCheck ? 0 : Math.floor(Math.random() * degrees.length);
  let curIdx = startIdx;
  const pushCur = () => {
    const def = degrees[curIdx];
    const q = harmonProgQual(mod, def.degree, palette);
    steps.push(harmonProgStep(def.name, mod, rootIdx, def, q));
  };
  pushCur();
  for (let i = 1; i < len; i++) {
    const fromDef = degrees[curIdx];
    const fromNotes = CHORD_TYPES[harmonProgQual(mod, fromDef.degree, palette)].intervals
      .map(iv => (rootIdx + fromDef.interval + iv) % 12);
    const cands = harmonProgCandidates(mod, rootIdx, palette, curIdx, fromDef, fromNotes);
    const picked = harmonProgPick(cands, curIdx);
    if (picked && picked.kind === 'secdom') {
      steps.push(harmonProgDomStep(picked.domRoot, picked.domName));
      curIdx = picked.toIdx;
    } else {
      curIdx = picked ? picked.toIdx : curIdx;
      pushCur();
    }
    if (steps.length >= len) break;
  }
  const tonicStep = () => harmonProgStep(degrees[tonicIdx].name, mod, rootIdx, degrees[tonicIdx], harmonProgQual(mod, degrees[tonicIdx].degree, palette));
  if (tonicCheck) steps[len - 1] = tonicStep();
  while (steps.length < len) steps.push(tonicStep());
  return steps;
}

function harmonProgLabel(mod, rootIdx, prev, cur) {
  const tonic = mod === 'min' ? 'i' : 'I';
  const diff = (cur.rootPc - prev.rootPc + 12) % 12;
  const prevIsDom7 = prev.quality.indexOf('7') >= 0 && prev.quality.indexOf('maj') < 0 && prev.quality.indexOf('m7') < 0 && prev.quality.indexOf('maj7') < 0;
  const isDomOfCur = (cur.rootPc + 7) % 12 === prev.rootPc;
  const isParallel = prev.rootPc === cur.rootPc;
  const prevIsMajor = !/m|dim/.test(prev.quality) && prev.quality.indexOf('7') < 0;
  const curIsMajor = !/m|dim/.test(cur.quality) && cur.quality.indexOf('7') < 0;
  const isRelative = (prevIsMajor && !curIsMajor && diff === 9) || (curIsMajor && !prevIsMajor && diff === 3);
  const isTritone = diff === 6;
  const isAxisMate = diff === 3 || diff === 9;
  const isFourth = diff === 5;
  const isMinorStepDown = mod === 'min' && diff === 10
    && ['i', 'III', 'VI', 'VII'].includes(prev.degree)
    && ['III', 'VI', 'VII'].includes(cur.degree);
  const prefix = cur.origin === 'borrowed' ? 'préstamo · ' : '';
  const curIsDom7 = !/m|dim/.test(cur.quality) && cur.quality.indexOf('7') >= 0
    && cur.quality.indexOf('maj') < 0 && cur.quality.indexOf('m7') < 0;
  if (cur.degree === tonic) {
    const subtype = mod === 'min'
      ? (prevIsDom7 ? 'perfecta armonizada (V7→i)' : prev.degree === 'v' ? 'perfecta (v→i)' : prev.degree === 'iv' ? 'plagal (iv→i)' : 'cierre')
      : prev.degree === 'V' || prevIsDom7 ? 'perfecta (V→I)'
        : prev.degree === 'iv' ? 'amarga (4m→1)' : prev.degree === 'IV' ? 'plagal (IV→I)'
          : prev.degree === 'vii°' ? 'sensible (vii°→I)' : 'cierre';
    return { t: prefix ? prefix + subtype : subtype, kind: 'resol', subtype };
  }
  if (isParallel) return { t: 'paralela (P)', kind: 'prl' };
  if (isRelative) return { t: 'relativa (R)', kind: 'prl' };
  if (isMinorStepDown) return { t: 'bajada diatónica', kind: 'step' };
  if (prevIsDom7 && curIsDom7 && isFourth) return { t: 'cadena por cuartas', kind: 'chain' };
  if (prevIsDom7 && isDomOfCur) return { t: `${prev.name} → ${cur.name} (V de ${cur.degree})`, kind: 'secdom' };
  if (isTritone) return { t: 'tritono · eje de Bartók', kind: 'axis' };
  if (isAxisMate) return { t: 'eje de Bartók', kind: 'axis' };
  if (isFourth && prevIsDom7) return { t: 'cadena por cuartas', kind: 'chain' };
  return { t: prefix + 'movimiento', kind: 'mov' };
}

function harmonProgLabelsFor(steps, mod, rootIdx) {
  const labels = [];
  for (let i = 1; i < steps.length; i++) {
    labels.push(harmonProgLabel(mod, rootIdx, steps[i - 1], steps[i]));
  }
  const tonic = mod === 'min' ? 'i' : 'I';
  const is251 = (a, b, c) => {
    const deg = s => s.degree;
    if (mod === 'min') return deg(a) === 'ii°' && (deg(b) === 'v' || deg(b) === 'V') && deg(c) === 'i';
    return deg(a) === 'ii' && deg(b) === 'V' && deg(c) === 'I';
  };
  const summary = {};
  labels.forEach(l => { if (l.kind === 'resol') summary['cadencia'] = true; });
  for (let i = 0; i + 2 < steps.length; i++) {
    if (is251(steps[i], steps[i + 1], steps[i + 2])) {
      labels[i + 1] = { t: '2-5-1 (ii→V→I)', kind: '251' };
      summary['2-5-1'] = true;
    }
  }
  labels.forEach(l => {
    if (l.kind === 'secdom') summary['secdom'] = true;
    if (l.kind === 'axis') summary[l.t.includes('tritono') ? 'tritono' : 'bartok'] = true;
    if (l.kind === 'chain') summary['cuartas'] = true;
    if (l.kind === 'prl') summary['prl'] = true;
  });
  steps.forEach(s => { if (s.origin === 'borrowed') summary['prestamo'] = true; });
  const order = ['2-5-1', 'secdom', 'cadencia', 'cuartas', 'tritono', 'bartok', 'prl', 'prestamo'];
  return { labels: labels.map(l => l.t), summary: order.filter(k => summary[k]) };
}

function renderHarmonyProgression() {
  const panel = document.getElementById('harmony-gen');
  if (!panel) return;
  const visible = harmonyMode === 'prog';
  panel.classList.toggle('hidden', !visible);
  if (!visible) return;
  const result = document.getElementById('harmony-prog-result');
  const labelsEl = document.getElementById('harmony-prog-labels');
  const summaryEl = document.getElementById('harmony-prog-summary');
  const detailEl = document.getElementById('harmony-prog-detail');
  if (!result) return;
  const steps = harmonyProgSeq;
  result.innerHTML = steps.map((s, i) => {
    const sel = i === harmonyProgSelected ? 'selected' : '';
    return `<span class="harmony-prog-chip ${sel}" data-idx="${i}" title="${s.name} · ${s.rootPc === 0 ? 'tónica' : ''}">${s.name}</span>` +
      (i < steps.length - 1 ? '<b class="harmony-prog-sep">→</b>' : '');
  }).join('');
  result.querySelectorAll('.harmony-prog-chip').forEach(chip => {
    chip.onclick = () => {
      harmonyProgSelected = Number(chip.dataset.idx);
      renderHarmonyProgression();
      selectHarmonyNode(steps[Number(chip.dataset.idx)].degree);
    };
  });
  labelsEl.innerHTML = harmonyProgLabels.map(t => `<span class="harmony-prog-label">${t}</span>`).join('<b class="harmony-prog-sep">·</b>');
  summaryEl.innerHTML = harmonyProgSummary.map(t => `<span class="harmony-prog-tag">${t}</span>`).join('');
  renderHarmonyProgDetail(detailEl, steps, harmonyProgSelected);
}

function renderHarmonyProgDetail(el, steps, idx) {
  const step = steps[idx > -1 && steps[idx] ? idx : steps.length - 1];
  if (!step) { el.classList.add('hidden'); return; }
  el.classList.remove('hidden');
  const prev = idx > 0 ? steps[idx - 1] : null;
  const info = getChordInfo ? getChordInfo(step.name) : null;
  const frets = info && info.fingering ? info.fingering.frets : null;
  const barre = info && info.fingering ? info.fingering.label : '';
  let cells = '';
  if (frets) {
    cells = ['E', 'A', 'D', 'G', 'B', 'e'].map((sn, i) => {
      const f = frets[i];
      return `<div class="diagram-cell"><span class="string-label">${sn}</span><b class="${f === null ? 'mute' : f === 0 ? 'open' : 'dot'}">${f === null ? '×' : f === 0 ? '○' : f}</b></div>`;
    }).join('');
  }
  const prevTxt = prev ? `<p class="harmony-prog-prev">Desde <b>${prev.name}</b> (${harmonyProgLabels[idx - 1] || ''})</p>` : '';
  el.innerHTML = `<p class="eyebrow">ACORDE GENERADO · ${step.degree}</p>
    <h4>${step.name}${step.origin === 'borrowed' ? ' <em>(préstamo)</em>' : ''}</h4>
    ${prevTxt}
    <p class="harmony-prog-notes">${step.notes.map(pc => HARMONY_NOTES[pc]).join(' · ')}</p>
    ${cells ? `<div class="harmony-prog-diagram">${cells}</div><p class="barre-label">${barre}</p>` : `<p class="study-hint">Busco digitación para ${step.name}…</p>`}
    <button type="button" class="ghost-btn" data-harmony-prog-regen>Generar de nuevo</button>`;
  const regen = el.querySelector('[data-harmony-prog-regen]');
  if (regen) regen.onclick = () => onHarmonyGenerate();
}

function onHarmonyGenerate() {
  const palette = harmonyProgPalette;
  harmonyProgSeq = harmonProgGenerate(harmonyProgLength, harmonyKey.mod, harmonyKey.root, palette, harmonyProgTonic);
  const res = harmonProgLabelsFor(harmonyProgSeq, harmonyKey.mod, harmonyRootIdx());
  harmonyProgLabels = res.labels;
  harmonyProgSummary = res.summary;
  harmonyProgSelected = -1;
  harmonyProgGenerated = true;
  renderHarmony();
}

function renderHarmonyNexts() {
  const el = document.getElementById('harmony-nexts');
  if (!el) return;
  const wrap = el.parentElement;
  if (harmonyMode === 'prog') { el.innerHTML = ''; if (wrap) wrap.classList.add('hidden'); return; }
  if (!wrap) return;
  wrap.classList.remove('hidden');
  const mod = harmonyKey.mod;
  const degrees = harmonyDegrees(mod);
  const rootIdx = harmonyRootIdx();
  const selected = degrees.find(d => d.degree === harmonySelected);
  if (!selected) { el.innerHTML = ''; return; }
  const edges = harmonyEdges(mod).filter(([a]) => a === selected.degree);
  const secDom = harmonSecondaryDominant(selected);
  el.innerHTML = edges.map(([, to, label]) => {
    const def = degrees.find(d => d.degree === to);
    const q = harmonProgQual(mod, to, 'pop');
    const name = HARMONY_NOTES[(rootIdx + def.interval) % 12] + q;
    return `<button type="button" class="harmony-next" data-idx="${to}">${name}<small>${label}</small></button>`;
  }).join('') + `<button type="button" class="harmony-next" data-secdom="${secDom.name}"><b>${secDom.name}</b><small>V de ${selected.degree} (secundaria)</small></button>`;
  el.querySelectorAll('.harmony-next').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.idx) selectHarmonyNode(btn.dataset.idx);
      else selectHarmonyNode(selected.degree);
    };
  });
}

function initializeHarmonyStaging() {
  document.getElementById('harmony-gen-palette').innerHTML = Object.keys(HARMONY_PROG_PALETTES).map(k =>
    `<option value="${k}">${HARMONY_PROG_PALETTES[k].label}</option>`).join('');
  document.getElementById('harmony-gen-palette').value = harmonyProgPalette;
  document.getElementById('harmony-gen-palette').onchange = e => { harmonyProgPalette = e.target.value; onHarmonyGenerate(); };
  document.getElementById('harmony-gen-length').onchange = e => { harmonyProgLength = Number(e.target.value); onHarmonyGenerate(); };
  document.getElementById('harmony-gen-tonic').onchange = e => { harmonyProgTonic = e.target.checked; onHarmonyGenerate(); };
  document.getElementById('harmony-gen-map').onchange = e => { harmonyProgMap = e.target.checked; renderHarmony(); };
  document.getElementById('harmony-gen-go').onclick = onHarmonyGenerate;
}

// --- audio: síntesis Web Audio para escuchar acordes y progresiones ---
const HARMONY_STRING_FREQS = [82.4068892281795, 110, 146.8323839587038, 195.99771799087463, 246.94165062806206, 329.6275569128699];
const HARMONY_STRUM_MS = 28;
const HARMONY_NOTE_MS = 1250;
const HARMONY_PROG_GAP_MS = 80;
let playbackCtx = null;
let playbackMaster = null;

// Plan puro y testeable: qué notas/cuerdas se tocan, con qué frecuencia y timing.
function harmonyChordPlan(chordName) {
  const info = getChordInfo ? getChordInfo(chordName) : null;
  const frets = info && info.fingering ? info.fingering.frets : null;
  if (frets) {
    const plan = [];
    frets.forEach((fret, i) => {
      if (fret === null) return;
      plan.push({
        note: ['E', 'A', 'D', 'G', 'B', 'E'][i],
        freq: HARMONY_STRING_FREQS[i] * Math.pow(2, fret / 12),
        t0: i * HARMONY_STRUM_MS,
        dur: HARMONY_NOTE_MS,
      });
    });
    if (plan.length) return plan;
  }
  const notes = info ? info.notes : null;
  if (!notes || !notes.length) return [];
  const sorted = notes.map(note => NOTE_NAMES.indexOf(note)).filter(i => i > -1).sort((a, b) => a - b);
  if (!sorted.length) return [];
  return notes.map(note => {
    const midi = 48 + NOTE_NAMES.indexOf(note);
    const pitch = midi < 48 ? midi + 12 : midi;
    return { note, freq: 440 * Math.pow(2, (pitch - 69) / 12), t0: 0, dur: HARMONY_NOTE_MS };
  });
}

// Capa de sonido: consume el plan. No hace nada headless (node/tests).
function harmonyPlayPlan(plan, baseTime = 0) {
  const AudioContextClass = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AudioContextClass) return;
  if (!plan.length) return;
  if (!playbackCtx) {
    playbackCtx = new AudioContextClass();
    playbackMaster = playbackCtx.createGain();
    playbackMaster.gain.value = 0.25;
    playbackMaster.connect(playbackCtx.destination);
  }
  if (playbackCtx.state === 'suspended') playbackCtx.resume();
  const now = playbackCtx.currentTime + 0.03 + baseTime;
  plan.forEach(item => {
    const osc = playbackCtx.createOscillator();
    const env = playbackCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = item.freq;
    env.gain.setValueAtTime(0, now + item.t0 / 1000);
    env.gain.linearRampToValueAtTime(0.9, now + item.t0 / 1000 + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, now + item.t0 / 1000 + item.dur / 1000);
    osc.connect(env);
    env.connect(playbackMaster);
    osc.start(now + item.t0 / 1000);
    osc.stop(now + item.t0 / 1000 + item.dur / 1000 + 0.12);
  });
}

function harmonyPlayChord(chordName) {
  harmonyPlayPlan(harmonyChordPlan(chordName));
}

function harmonyPlayProgression() {
  const steps = harmonyProgSeq;
  if (!steps.length) return;
  const beat = (HARMONY_NOTE_MS + HARMONY_PROG_GAP_MS) / 1000;
  steps.forEach((step, i) => {
    harmonyPlayPlan(harmonyChordPlan(step.name), i * beat);
  });
}

function initializeHarmony() {
  const keySelect = document.getElementById('harmony-key');
  if (!keySelect) return;
  keySelect.innerHTML = HARMONY_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');
  keySelect.value = harmonyKey.root;

  const variantSelect = document.getElementById('harmony-variant');
  if (variantSelect) {
    variantSelect.value = harmonyKey.variant;
    variantSelect.addEventListener('change', () => {
      harmonyKey.variant = variantSelect.value;
      harmonyKey.mod = harmonyVariant().mod;
      resetHarmony();
    });
  }

  keySelect.addEventListener('change', () => {
    harmonyKey.root = keySelect.value;
    resetHarmony();
  });

  document.querySelectorAll('#harmony-mode-seg .seg-btn').forEach(btn => {
    btn.addEventListener('click', () => setHarmonyMode(btn.dataset.hmode));
  });
  const clearButton = document.getElementById('harmony-clear');
  if (clearButton) clearButton.addEventListener('click', resetHarmony);
  initializeHarmonyStaging();
  const btn251maj = document.getElementById('harmony-251-major');
  if (btn251maj) btn251maj.addEventListener('click', () => harmonSet251('maj'));
  const btn251min = document.getElementById('harmony-251-minor');
  if (btn251min) btn251min.addEventListener('click', () => harmonSet251('min'));

  const crossNav = document.getElementById('harmony-cross-nav');
  if (crossNav) {
    const toTensionsBtn = document.createElement('button');
    toTensionsBtn.type = 'button';
    toTensionsBtn.className = 'ghost-btn';
    toTensionsBtn.textContent = 'Ver en Tensiones →';
    toTensionsBtn.addEventListener('click', () => {
      const rootSelect = document.getElementById('tension-root');
      const qualitySelect = document.getElementById('tension-quality');
      if (rootSelect && rootSelect.value !== harmonyKey.root) {
        rootSelect.value = harmonyKey.root;
        rootSelect.dispatchEvent(new Event('change'));
      }
      if (qualitySelect) {
        const q = harmonyKey.mod === 'min' ? 'm7' : 'maj7';
        if (qualitySelect.value !== q) {
          qualitySelect.value = q;
          qualitySelect.dispatchEvent(new Event('change'));
        }
      }
      openStudyMode('tensions');
    });
    crossNav.appendChild(toTensionsBtn);
  }

  const playBtn = document.getElementById('harmony-play');
  if (playBtn) playBtn.addEventListener('click', () => {
    const degrees = harmonyDegrees(harmonyKey.mod);
    const selected = degrees.find(node => node.degree === harmonySelected);
    if (selected) harmonyPlayChord(harmonyChord(selected));
  });
  const progPlayBtn = document.getElementById('harmony-prog-play');
  if (progPlayBtn) progPlayBtn.addEventListener('click', harmonyPlayProgression);

  renderHarmony();
}

if (typeof document !== 'undefined') initializeHarmony();