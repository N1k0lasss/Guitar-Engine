const CIRCLE_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
const KEY_SIGNS = {
  C: 'sin alteraciones', G: '1 sostenido', D: '2 sostenidos', A: '3 sostenidos', E: '4 sostenidos', B: '5 sostenidos',
  'F#': '6 sostenidos', 'C#': '7 sostenidos', 'G#': '4 bemoles (Ab)', 'D#': '3 bemoles (Eb)', 'A#': '2 bemoles (Bb)', F: '1 bemol',
};
const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MAJOR_QUALITIES = ['', 'm', 'm', '', '', 'm', 'dim'];
const MAJOR_ROMANS = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];

const CIRCLE_SVG_NS = 'http://www.w3.org/2000/svg';
const CIRCLE_FALLBACK_R = 175;   // translateY(-175px) del CSS .circle-note
const CIRCLE_NODE_HALF = 24;     // .circle-note es 48px: ancla top/left al 50% sin translate(-50%,-50%)
const CIRCLE_BULGE = 16;         // arco del anillo hacia afuera

let circleSelected = 'C';
let circleFocused = null;

function circleNoteAt(root, interval) {
  return CIRCLE_NOTES[(CIRCLE_NOTES.indexOf(root) + interval) % 12];
}

// Posición de cada nodo en coordenadas del contenedor. Prioriza medir el botón
// real (fiel al transform CSS); si la vista está oculta usa la fórmula exacta
// del transform: rot A al centro del nodo + translateY(-R) desde el ancla 50%.
function circleNodePositions(size) {
  const circle = document.getElementById('circle-of-fifths');
  const rect = circle.getBoundingClientRect();
  const measured = [];
  circle.querySelectorAll('.circle-note').forEach(button => {
    const r = button.getBoundingClientRect();
    measured.push({ note: button.textContent, x: r.left + r.width / 2 - rect.left, y: r.top + r.height / 2 - rect.top });
  });
  const usable = measured.length === FIFTHS.length && measured.some(p => p.x !== 0 || p.y !== 0);
  if (usable) return measured;
  const cx = size / 2;
  const cy = size / 2;
  return FIFTHS.map((note, index) => {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return { note, x: cx + CIRCLE_NODE_HALF + CIRCLE_FALLBACK_R * Math.sin(angle), y: cy + CIRCLE_NODE_HALF - CIRCLE_FALLBACK_R * Math.cos(angle) };
  });
}

function circleLinePath(from, to) {
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
}

function circleBulgePath(from, to, c, bulge) {
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = midX - c.x;
  const dy = midY - c.y;
  const len = Math.hypot(dx, dy) || 1;
  const cx = midX + (dx / len) * bulge;
  const cy = midY + (dy / len) * bulge;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

function createCircleEdge({ from, to, d, className }) {
  const edge = document.createElementNS(CIRCLE_SVG_NS, 'path');
  edge.setAttribute('d', d);
  edge.setAttribute('class', className);
  edge.setAttribute('marker-start', 'url(#circle-edge-arrow)');
  edge.setAttribute('marker-end', 'url(#circle-edge-arrow)');
  edge.dataset.from = from;
  edge.dataset.to = to;
  edge.title = `${from} → ${to}`;
  return edge;
}

function buildCircleGraph(size, positions) {
  const svg = document.createElementNS(CIRCLE_SVG_NS, 'svg');
  svg.setAttribute('class', 'circle-graph');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

  const defs = document.createElementNS(CIRCLE_SVG_NS, 'defs');
  const marker = document.createElementNS(CIRCLE_SVG_NS, 'marker');
  marker.setAttribute('id', 'circle-edge-arrow');
  marker.setAttribute('viewBox', '0 0 10 10');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '5');
  marker.setAttribute('markerWidth', '5');
  marker.setAttribute('markerHeight', '5');
  marker.setAttribute('orient', 'auto-start-reverse');
  const arrow = document.createElementNS(CIRCLE_SVG_NS, 'path');
  arrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
  arrow.setAttribute('fill', 'context-stroke');
  marker.appendChild(arrow);
  defs.appendChild(marker);
  svg.appendChild(defs);

  const c = { x: size / 2, y: size / 2 };
  for (let i = 0; i < FIFTHS.length; i++) {
    const from = positions[i];
    const to = positions[(i + 1) % FIFTHS.length];
    svg.appendChild(createCircleEdge({ from: from.note, to: to.note, d: circleBulgePath(from, to, c, CIRCLE_BULGE), className: 'circle-edge' }));
  }
  for (let i = 0; i < FIFTHS.length; i++) {
    const from = positions[i];
    const to = positions[(i + 3) % FIFTHS.length];
    svg.appendChild(createCircleEdge({ from: from.note, to: to.note, d: circleLinePath(from, to), className: 'circle-edge rel' }));
  }
  return svg;
}

function updateCircleGraphFocus(note) {
  const svg = document.querySelector('.circle-graph');
  if (!svg) return;
  svg.querySelectorAll('.circle-edge').forEach(edge => {
    const hasFocus = !!note;
    const related = hasFocus && (edge.dataset.from === note || edge.dataset.to === note);
    edge.classList.toggle('active', related);
    edge.classList.toggle('dimmed', hasFocus && !related);
  });
}

function renderCircleLegend() {
  const panel = document.querySelector('.circle-panel');
  const hint = panel && panel.querySelector('.study-hint');
  if (!panel || !hint || panel.querySelector('.circle-legend')) return;
  const legend = document.createElement('div');
  legend.className = 'circle-legend';
  legend.innerHTML =
    `<span class="ci-item"><i class="ci-swat ci-ring"></i><i class="ci-arrow">→</i> quinta V / IV</span>` +
    `<span class="ci-item"><i class="ci-swat ci-rel"></i> relativa menor (+3)</span>`;
  panel.insertBefore(legend, hint);
}

function renderCircle(selected = circleSelected) {
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
    button.addEventListener('mouseenter', () => updateCircleGraphFocus(note));
    button.addEventListener('mouseleave', () => updateCircleGraphFocus(circleFocused));
    button.addEventListener('click', () => {
      circleFocused = circleFocused === note ? null : note;
      renderCircle(note);
    });
    circle.appendChild(button);
  });

  const size = circle.clientWidth || 450;
  circle.appendChild(buildCircleGraph(size, circleNodePositions(size)));

  keyEl.textContent = selected;
  relativeEl.textContent = `Relativa menor: ${circleNoteAt(selected, 9)}m · ${KEY_SIGNS[selected]}`;
  circleSelected = selected;
  renderKeyChords(selected);
  updateCircleGraphFocus(circleFocused);
  document.dispatchEvent(new CustomEvent('circle-key-selected', { detail: selected }));
}

function renderKeyChords(root) {
  const chordsEl = document.getElementById('key-chords');
  if (!chordsEl) return;

  chordsEl.innerHTML = MAJOR_INTERVALS
    .map((interval, index) => `<span class="key-chord"><b>${circleNoteAt(root, interval)}${MAJOR_QUALITIES[index]}</b><small>${MAJOR_ROMANS[index]}</small></span>`)
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCircleLegend();
  renderCircle();
  const toHarmonyBtn = document.getElementById('circle-to-harmony');
  if (toHarmonyBtn) {
    toHarmonyBtn.addEventListener('click', () => {
      const keySelect = document.getElementById('harmony-key');
      if (keySelect && keySelect.value !== circleSelected) {
        keySelect.value = circleSelected;
        keySelect.dispatchEvent(new Event('change'));
      }
      openStudyMode('harmony');
    });
  }
  const container = document.querySelector('.circle-of-fifths');
  if (!container) return;
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => renderCircle());
    ro.observe(container);
  } else {
    window.addEventListener('resize', () => {
      if (container.offsetParent) renderCircle();
    });
  }
});