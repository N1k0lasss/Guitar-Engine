const HARMONY_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HARMONY_DEGREES = [
  { degree: 'I', quality: '', interval: 0, role: 'Centro', description: 'El centro de la tonalidad. Desde acá podés abrir varios recorridos.' },
  { degree: 'vi', quality: 'm', interval: 9, role: 'Relativa menor', description: 'Comparte notas con la tónica, pero cambia el color hacia una sensación más íntima.' },
  { degree: 'IV', quality: '', interval: 5, role: 'Subdominante', description: 'Abre el movimiento y se aleja del centro sin perder estabilidad.' },
  { degree: 'V', quality: '', interval: 7, role: 'Dominante', description: 'Tensa el recorrido y pide volver al centro de la tonalidad.' },
  { degree: 'ii', quality: 'm', interval: 2, role: 'Preparación', description: 'Prepara la dominante con un movimiento suave y muy usable.' },
  { degree: 'iii', quality: 'm', interval: 4, role: 'Puente', description: 'Conecta la tónica con otros acordes diatónicos sin cerrar la frase.' },
  { degree: 'bVII', quality: '', interval: 10, role: 'Préstamo', description: 'Un color tomado de la tonalidad paralela para salir del camino esperado.' },
];

const HARMONY_EDGES = [
  ['I', 'vi', 'misma familia'], ['I', 'IV', 'abre'], ['I', 'V', 'tensiona'],
  ['vi', 'IV', 'continúa'], ['IV', 'V', 'prepara'], ['V', 'I', 'resuelve'],
  ['ii', 'V', 'prepara'], ['iii', 'vi', 'conecta'], ['IV', 'bVII', 'cambia el color'],
];

let harmonyRoot = 'C';
let harmonySelected = 'I';
let harmonyPath = ['I'];

function harmonyNote(interval) {
  return HARMONY_NOTES[(HARMONY_NOTES.indexOf(harmonyRoot) + interval) % 12];
}

function harmonyChord(node) {
  return `${harmonyNote(node.interval)}${node.quality}`;
}

function renderHarmony() {
  const map = document.getElementById('harmony-map');
  const rootSelect = document.getElementById('harmony-root');
  if (!map || !rootSelect) return;

  map.innerHTML = '<svg class="harmony-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg>';
  const svg = map.querySelector('svg');
  const positions = {
    I: [50, 50], vi: [18, 28], IV: [50, 17], V: [82, 28],
    ii: [27, 76], iii: [73, 76], bVII: [50, 91],
  };

  HARMONY_EDGES.forEach(([from, to]) => {
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

  HARMONY_DEGREES.forEach(node => {
    const button = document.createElement('button');
    const [left, top] = positions[node.degree];
    button.className = `harmony-node node-${node.degree.replace('b', 'flat')} ${node.degree === harmonySelected ? 'selected' : ''}`;
    button.style.left = `${left}%`;
    button.style.top = `${top}%`;
    button.innerHTML = `<span class="harmony-degree">${node.degree}</span><strong>${harmonyChord(node)}</strong><small>${node.role}</small>`;
    button.title = `${node.degree} · ${harmonyChord(node)}`;
    button.addEventListener('click', () => selectHarmonyNode(node.degree));
    map.appendChild(button);
  });

  updateHarmonyDetails();
}

function selectHarmonyNode(degree) {
  harmonySelected = degree;
  if (harmonyPath[harmonyPath.length - 1] !== degree) harmonyPath.push(degree);
  if (harmonyPath.length > 6) harmonyPath.shift();
  renderHarmony();
}

function updateHarmonyDetails() {
  const selected = HARMONY_DEGREES.find(node => node.degree === harmonySelected);
  if (!selected) return;
  document.getElementById('harmony-selected').textContent = `${selected.degree} · ${harmonyChord(selected)}`;
  document.getElementById('harmony-description').textContent = selected.description;
  document.getElementById('harmony-path').innerHTML = harmonyPath.map(degree => {
    const node = HARMONY_DEGREES.find(item => item.degree === degree);
    return `<span>${degree} · ${harmonyChord(node)}</span>`;
  }).join('<b>→</b>');

  document.querySelectorAll('.harmony-lines line').forEach(line => {
    const active = line.dataset.from === harmonySelected || line.dataset.to === harmonySelected;
    line.classList.toggle('active', active);
  });
}

function initializeHarmony() {
  const rootSelect = document.getElementById('harmony-root');
  rootSelect.innerHTML = HARMONY_NOTES.map(note => `<option value="${note}">${note}</option>`).join('');
  rootSelect.value = harmonyRoot;
  rootSelect.addEventListener('change', () => {
    harmonyRoot = rootSelect.value;
    harmonySelected = 'I';
    harmonyPath = ['I'];
    renderHarmony();
  });
  document.getElementById('harmony-clear').addEventListener('click', () => {
    harmonySelected = 'I';
    harmonyPath = ['I'];
    renderHarmony();
  });
  renderHarmony();
}

initializeHarmony();
