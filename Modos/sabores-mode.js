// ===== Sabores de nota (Modos Ilustrados, pp 184–188) =====
// Cada intervalo desde la tónica tiene un "sabor" propio que se memoriza
// y permite "cocinar" escalas. El libro marca el sabor siempre contra C.

const SABOR_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const SABOR_DATA = [
  { interval: 0,  flavor: 'casa',      label: 'Casa',      intervalLabel: 'unísono',   mode: 'Jónico (I)',    desc: 'El centro: la nota neutra y de reposo. Todo lo demás se mide contra ella.' },
  { interval: 1,  flavor: 'flamenco',  label: 'Flamenco',  intervalLabel: 'b9',         mode: 'Frigio (III)',  desc: 'La 9na bemol: filosa y rasgada. Es la nota que vuelve flamenco al Frigio.' },
  { interval: 2,  flavor: null,        label: '',          intervalLabel: '9',          mode: '',              desc: '' },
  { interval: 3,  flavor: 'antiguo',   label: 'Antiguo',   intervalLabel: 'b3',         mode: 'Menor (i)',     desc: 'La 3ra menor: vuelve todo menor y suena a viejo, medieval o rústico.' },
  { interval: 4,  flavor: null,        label: '',          intervalLabel: '3',          mode: '',              desc: '' },
  { interval: 5,  flavor: null,        label: '',          intervalLabel: '11',         mode: '',              desc: '' },
  { interval: 6,  flavor: 'magia',     label: 'Magia',     intervalLabel: '#4',         mode: 'Lidio (IV)',    desc: 'La 4ta aumentada: el poder mágico del Lidio. Flotante, amplio, de película.' },
  { interval: 7,  flavor: null,        label: '',          intervalLabel: '5',          mode: '',              desc: '' },
  { interval: 8,  flavor: null,        label: '',          intervalLabel: 'b13',        mode: '',              desc: '' },
  { interval: 9,  flavor: 'dulce',     label: 'Dulce',     intervalLabel: '6',          mode: 'Dórico (II)',   desc: 'La 6ta mayor: el color suave y cantable que define al Dórico.' },
  { interval: 10, flavor: 'epico',     label: 'Épico',     intervalLabel: 'b7',         mode: 'Mixolidio (V)', desc: 'La 7ma menor: la épica del Mixolidio. Grande, heroica, de celebración.' },
  { interval: 11, flavor: 'dominante', label: 'Dominante', intervalLabel: '7',          mode: 'Dominante V7',  desc: 'La 7ma mayor: la sensible que tira hacia la tónica y arma el V7.' },
];

let saborRoot = 'C';
let saborSelected = 0;

function saborNote(interval) {
  return SABOR_NOTES[(SABOR_NOTES.indexOf(saborRoot) + interval) % 12];
}

function renderSabores() {
  const grid = document.getElementById('sabor-grid');
  if (!grid) return;
  grid.innerHTML = SABOR_DATA.map((entry, index) => {
    const note = saborNote(entry.interval);
    const flavored = !!entry.flavor;
    const classes = ['sabor-chip', flavored ? 'sabor-' + entry.flavor : 'sabor-neutral', index === saborSelected ? 'selected' : ''].filter(Boolean).join(' ');
    const title = flavored ? `${note} = ${entry.label} (${entry.mode})` : `${note} · sin sabor marcado en el libro`;
    return `<button type="button" class="${classes}" title="${title}" data-sabor="${index}"><b>${note}</b><span>${entry.label || '—'}</span></button>`;
  }).join('');
  grid.querySelectorAll('.sabor-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      saborSelected = Number(btn.dataset.sabor);
      renderSabores();
    });
  });
  renderSaborDetail();
}

function renderSaborDetail() {
  const entry = SABOR_DATA[saborSelected];
  const note = saborNote(entry.interval);
  const detail = document.getElementById('sabor-detail');
  if (!detail) return;
  if (!entry.flavor) {
    const intervalCount = SABOR_DATA.filter(e => e.flavor).length;
    detail.innerHTML = `<p class="eyebrow">NOTA SIN SABOR MARCADO</p>
      <h3>${note}</h3>
      <span class="sabor-mode">${entry.intervalLabel}</span>
      <p class="sabor-desc">El libro deja sin nombre a esta nota: no altera sola el color, pero combina con las otras ${intervalCount} con sabor para cocinar una escala.</p>`;
    return;
  }
  detail.innerHTML = `<p class="eyebrow">SABOR · ${note}</p>
    <h3>${entry.label}</h3>
    <span class="sabor-mode">${entry.mode} · ${entry.intervalLabel}</span>
    <p class="sabor-desc">${entry.desc}</p>`;
}

function initializeSabores() {
  const rootSelect = document.getElementById('sabor-root');
  if (!rootSelect) return;
  rootSelect.innerHTML = SABOR_NOTES.map(n => `<option value="${n}">${n}</option>`).join('');
  rootSelect.value = saborRoot;
  rootSelect.addEventListener('change', () => {
    saborRoot = rootSelect.value;
    renderSabores();
  });
  renderSabores();
}

if (typeof document !== 'undefined') initializeSabores();