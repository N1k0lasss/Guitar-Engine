// Ejes de Bartók — Armonía Ilustrada 2, pp 196–214
let ejesAnchorPc = 0;
let ejesMinorOn = false;
let ejesExcludeOn = false;
let ejesExcludePc = null;
let ejesFreeA = 0;
let ejesFreeB = 3;

function bartokAxisOf(pc) {
  const seed = pc % 3;
  return {
    seed,
    poles: [0, 1, 2, 3].map(k => (seed + 3 * k) % 12),
    pairs: [[seed, (seed + 6) % 12], [(seed + 3) % 12, (seed + 9) % 12]],
  };
}
function bartokTriad(pc) {
  return CHORD_TYPES[''].intervals.map(iv => (pc + iv) % 12);
}
function bartokGlueBetween(a, b) {
  const aa = bartokTriad(a);
  const bb = bartokTriad(b);
  return aa.filter(pc => bb.includes(pc)).length;
}
function bartokSharedDominants(poles) {
  return poles.map(p => {
    const domRoot = (p + 7) % 12;
    return {
      pole: p,
      domRoot,
      name: NOTE_NAMES[domRoot] + '7',
      pcs: CHORD_TYPES['7'].intervals.map(iv => (domRoot + iv) % 12),
    };
  });
}
function bartokFreeScales(a, c) {
  const fixed = [...new Set([...bartokTriad(a), ...bartokTriad(c)])].sort((x, y) => x - y);
  const v4 = (a + 5) % 12;
  const v6 = (a + 9) % 12;
  const combos = [];
  for (const di of [0, 1]) {
    for (const si of [0, 1]) {
      let set = [...fixed, (v4 + di) % 12, (v6 + si) % 12];
      set = [...new Set(set)].sort((x, y) => x - y);
      combos.push({ fpc: (v4 + di) % 12, spc: (v6 + si) % 12, set });
    }
  }
  return { fixed, fixedFmt: fixed.map(pc => NOTE_NAMES[pc]).join(', '), v4, v6, combos };
}

function bartokRenderPoles(elRoot) {
  let html = '';
  for (let seed = 0; seed < 3; seed++) {
    const axis = bartokAxisOf(seed);
    const isActive = seed === ejesAnchorPc % 3;
    html += `<div class="ejes-axis ${isActive ? 'active' : ''}" data-seed="${seed}">`;
    html += `<div class="ejes-axis-label">${isActive ? 'TU EJE' : 'Eje'}</div>`;
    axis.pairs.forEach(pair => {
      html += `<div class="ejes-pair">`;
      pair.forEach(pc => {
        const excluded = ejesExcludeOn && ejesExcludePc === pc;
        html += `<span class="ejes-pole ${pc === ejesAnchorPc ? 'anchor' : ''} ${excluded ? 'excluded' : ''}" data-pc="${pc}">${NOTE_NAMES[pc]}</span>`;
      });
      html += `<i class="ejes-tritone" title="polos opuestos a distancia de tritono (tres tonos)">↔ tritono</i>`;
      html += `</div>`;
    });
    html += `</div>`;
  }
  elRoot.innerHTML = html;
}

function bartokRenderInfo() {
  const axis = bartokAxisOf(ejesAnchorPc);
  const mates = axis.poles.filter(p => p !== ejesAnchorPc);
  const summary = document.getElementById('ejes-summary');
  const matesHtml = mates.map(p => {
    const glue = bartokGlueBetween(ejesAnchorPc, p);
    return `<span class="ejes-mate" data-pc="${p}">
      ${NOTE_NAMES[ejesAnchorPc]} → ${NOTE_NAMES[p]}
      <i class="ejes-glue">${'●'.repeat(glue)}${'○'.repeat(3 - glue)} ${glue}</i>
    </span>`;
  }).join('');
  summary.innerHTML =
    `Desde <b>${NOTE_NAMES[ejesAnchorPc]}</b> podés saltar a las otras tres cruces del eje: enlaces bruscos, pero no desagradables. ` +
    `<b>${NOTE_NAMES[ejesAnchorPc]} → ${NOTE_NAMES[(ejesAnchorPc + 6) % 12]}</b> suena a superhéroes de los 80. ` +
    `<div class="ejes-mates">${matesHtml}</div>`;
  document.querySelectorAll('#ejes-summary [data-pc]').forEach(function (el2) {
    el2.onclick = function () { ejesAnchorPc = Number(el2.dataset.pc); bartokRender(); };
  });
}

function bartokRenderDominants() {
  const el2 = document.getElementById('ejes-dominant');
  if (!ejesMinorOn) { el2.innerHTML = ''; el2.classList.add('hidden'); return; }
  el2.classList.remove('hidden');
  const axis = bartokAxisOf(ejesAnchorPc);
  const doms = bartokSharedDominants(axis.poles);
  el2.innerHTML =
    `<div class="ejes-section-title">Sumatoria de ejes · dominantes compartidas</div>` +
    `<p class="ejes-hint">G7 resuelve tanto a C como a Cm: combinando el eje mayor y el menor, cada polo recibe su dominante en común.</p>` +
    `<div class="ejes-doms">${doms.map(d => `
      <span class="ejes-dom" title="${d.pcs.map(pc => NOTE_NAMES[pc]).join(' · ')}">
        <b>${d.name}</b> · ${NOTE_NAMES[d.pole]} / ${NOTE_NAMES[d.pole]}m
      </span>`).join('')}</div>`;
}

function bartokRenderFree() {
  const out = document.getElementById('ejes-free-output');
  const a = ejesFreeA, c = ejesFreeB;
  const res = bartokFreeScales(a, c);
  out.innerHTML =
    `<div class="ejes-section-title">Completar la escala (2 grados libres)</div>` +
    `<p class="ejes-hint">${NOTE_NAMES[a]} y ${NOTE_NAMES[c]}: ya tenés 5 notas (${res.fixedFmt}) — elige alguna suerte de 4ta y de 6ta (${NOTE_NAMES[res.v4]}/${NOTE_NAMES[(res.v4 + 1) % 12]} y ${NOTE_NAMES[res.v6]}/${NOTE_NAMES[(res.v6 + 1) % 12]}). Sus nombres no importan: son #9, b9, #11, b13, #13, #4, b2…</p>` +
    `<div class="ejes-scales">${res.combos.map(cm => `
      <span class="ejes-scale"><em>${NOTE_NAMES[cm.fpc]} · ${NOTE_NAMES[cm.spc]}</em>
        <b>${cm.set.length} notas</b>: ${cm.set.map(pc => NOTE_NAMES[pc]).join(' ')}</span>`).join('')}</div>`;
}

function bartokRender() {
  const grid = document.getElementById('ejes-grid');
  if (!grid) return;
  bartokRenderPoles(grid);
  bartokRenderInfo();
  bartokRenderDominants();
  bartokRenderFree();
}

function initializeBartok() {
  const anchor = document.getElementById('ejes-anchor');
  anchor.innerHTML = NOTE_NAMES.map((n, i) => `<option value="${i}">${n}</option>`).join('');
  anchor.value = ejesAnchorPc;
  anchor.onchange = () => { ejesAnchorPc = Number(anchor.value); bartokRender(); };
  const freeA = document.getElementById('ejes-free-a');
  const freeB = document.getElementById('ejes-free-b');
  freeA.innerHTML = NOTE_NAMES.map((n, k) => `<option value="${k}">${n}</option>`).join('');
  freeB.innerHTML = NOTE_NAMES.map((n, k) => `<option value="${k}">${n}</option>`).join('');
  freeA.value = ejesFreeA;
  freeB.value = ejesFreeB;
  freeA.onchange = () => { ejesFreeA = Number(freeA.value); bartokRender(); };
  freeB.onchange = () => { ejesFreeB = Number(freeB.value); bartokRender(); };
  const excluded = document.getElementById('ejes-excluded');
  excluded.innerHTML = NOTE_NAMES.map((n, k) => `<option value="${k}">${n}</option>`).join('');
  excluded.value = ejesExcludePc === null ? ejesAnchorPc : ejesExcludePc;
  excluded.onchange = () => { ejesExcludePc = Number(excluded.value); bartokRender(); };
  document.getElementById('ejes-minor').onclick = () => { ejesMinorOn = !ejesMinorOn; bartokRender(); };
  document.getElementById('ejes-excl-toggle').onclick = () => { ejesExcludeOn = !ejesExcludeOn; bartokRender(); };
  const grid = document.getElementById('ejes-grid');
  grid.onclick = function (event) {
    const pole = event.target.closest ? event.target.closest('[data-pc]') : null;
    if (pole) { ejesAnchorPc = Number(pole.dataset.pc); anchor.value = ejesAnchorPc; bartokRender(); }
  };
  bartokRender();
}

if (typeof document !== 'undefined') document.addEventListener('DOMContentLoaded', initializeBartok);