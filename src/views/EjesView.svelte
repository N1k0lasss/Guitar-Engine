<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES } from '../lib/theory/notes';
  import { bartokAxisOf, bartokTriad, bartokSharedDominants, bartokFreeScales, bartokGlueBetween, bartokMates } from '../lib/theory/bartok';

  const seedPc = writable(0); // C
  $: axis = bartokAxisOf($seedPc);
  $: triad = bartokTriad($seedPc);
  $: mates = bartokMates($seedPc);
  $: doms = bartokSharedDominants(axis.poles);
  $: free = bartokFreeScales($seedPc, (($seedPc + 6) % 12));
</script>

<div class="view-head">
  <p class="eyebrow">EJES DE TENSIÓN</p>
  <h2>Los ejes de Bartók</h2>
  <p class="sub">Bartók organizó el material por ejes simétricos: cada tríada mayor tiene un mundo de tritonos y acordes "dormidos" que la sostienen.</p>
</div>

<section class="panel controls-panel">
  <div class="rootrow">
    {#each NOTES as n, i (i)}
      <button type="button" class="rootchip" class:on={$seedPc === i} onclick={() => seedPc.set(i)}>{n}</button>
    {/each}
  </div>
</section>

<section class="layout">
  <section class="panel axis-panel">
    <p class="eyebrow">EJE DE {NOTES[$seedPc]} · SEMILLA {axis.seed}</p>
    <p class="seed mono">{NOTES[$seedPc]}</p>
    <p class="eyebrow mt">POLOS DEL EJE</p>
    <div class="poles">
      {#each axis.poles as pole (pole)}
        <span class="pole" class:on={pole === $seedPc}>
          <b class="mono">{NOTES[pole]}</b>
          <small>{'tritono +' + (((pole - $seedPc + 12) % 12))}</small>
        </span>
      {/each}
    </div>
    <p class="eyebrow mt">PAREJAS DE TRITONO</p>
    <div class="pairs">
      {#each axis.pairs as [a, b] (a + '-' + b)}
        <span class="pair mono">{NOTES[a]} ↔ {NOTES[b]}</span>
      {/each}
    </div>
    <p class="muted">La tríada de {NOTES[$seedPc]} comparte {(bartokGlueBetween($seedPc, (($seedPc + 6) % 12))) } de 3 notas con su polo opuesto.</p>
  </section>

  <section class="panel triad-panel">
    <p class="eyebrow">TRÍADA MAYOR</p>
    <p class="mono big">{NOTES[$seedPc]}</p>
    <div class="notes">
      {#each triad as pc (pc)}<span class="nnote mono">{NOTES[pc]}</span>{/each}
    </div>
    <p class="eyebrow mt">VECINAS DEL EJE</p>
    <div class="mates">
      {#each mates as m (m.pc)}
        <span class="mate">
          <b class="mono">{NOTES[m.pc]}</b>
          <small>comparte {m.glue}/3</small>
        </span>
      {/each}
    </div>
  </section>

  <section class="panel dom-panel">
    <p class="eyebrow">DOMINANTES COMPARTIDOS</p>
    <p class="muted">Cada polo tiene su dominante (V7) que comparte tensión con el eje.</p>
    <div class="doms">
      {#each doms as d (d.pole)}
        <span class="dom">
          <b class="mono">{d.name}</b>
          <small>polo {NOTES[d.pole]}</small>
          <span class="pcset mono">{d.pcs.map(pc => NOTES[pc]).join(' ')}</span>
        </span>
      {/each}
    </div>
  </section>
</section>

<section class="panel free-panel">
  <p class="eyebrow">ESCALAS LIBRES (CONJUNTO FIJO)</p>
  <p class="muted">Fijas: <b class="mono">{free.fixedFmt || '—'}</b>. Las voces 4 y 6 pueden subir un semitono y generar cuatro escalas.</p>
  <div class="combos">
    {#each free.combos as combo, i (i)}
      <span class="combo">
        <small>V4 {NOTES[combo.fpc]} · V6 {NOTES[combo.spc]}</small>
        <b class="mono">{combo.set.map(pc => NOTES[pc]).join(' ')}</b>
      </span>
    {/each}
  </div>
</section>

<style>
  .mono { font-family: var(--font-mono); }
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.5; font-size: 12px; }
  .controls-panel { margin-bottom: var(--sp-3); }
  .rootrow { display: flex; flex-wrap: wrap; gap: 6px; }
  .rootchip { font-family: var(--font-mono); font-size: 12px; padding: 6px 9px; border: 1px solid #555954; border-radius: 2px; background: #121414; color: var(--muted); cursor: pointer; }
  .rootchip.on { color: var(--accent); border-color: var(--accent); background: #181b1a; box-shadow: 0 0 0 3px rgba(255, 85, 124, .12); }
  .layout { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); align-items: start; }
  .layout > .panel { max-height: min(48vh, 440px); overflow-y: auto; }
  .mt { margin-top: var(--sp-2); }
  .axis-panel .muted, .dom-panel .muted, .free-panel .muted { font-size: 12px; line-height: 1.5; }
  .seed { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--accent); letter-spacing: -1px; margin: 2px 0 10px; }
  .poles { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .pole { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 6px 8px; background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .pole.on { border-color: var(--accent); background: #181b1a; box-shadow: 0 0 0 2px var(--accent); }
  .pole b { font-size: 13px; color: var(--ink); }
  .pole.on b { color: var(--accent); }
  .pole small { font-size: 9px; color: var(--muted); letter-spacing: .05em; }
  .pairs { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .pair { font-size: 12px; color: var(--muted); }
  .big { font-family: var(--font-display); font-size: 24px; font-weight: 600; color: var(--accent); letter-spacing: -.5px; }
  .notes { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0 10px; }
  .nnote { font-size: 12px; padding: 6px 9px; background: #121414; border: 1px solid #555954; border-radius: 2px; color: var(--ink); }
  .mates { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
  .mate { display: inline-flex; align-items: center; gap: 6px; padding: 6px 8px; background: #121414; border: 1px solid #555954; border-radius: 2px; font-size: 12px; color: var(--ink); }
  .mate small { font-size: 10px; color: var(--muted); }
  .doms { display: flex; flex-direction: column; gap: 5px; margin-top: 8px; }
  .dom { display: flex; align-items: baseline; gap: 8px; padding: 6px 8px; background: #121414; border: 1px solid #555954; border-radius: 2px; font-size: 11px; color: var(--muted); }
  .dom b { font-size: 12px; font-weight: 500; color: var(--ink); }
  .dom small { font-size: 10px; color: var(--muted); }
  .pcset { margin-left: auto; font-size: 11px; color: var(--muted); }
  .free-panel { margin-top: var(--sp-3); }
  .combos { display: grid; gap: 6px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); margin-top: 10px; max-height: min(34vh, 300px); overflow-y: auto; }
  .combo { display: flex; flex-direction: column; gap: 2px; padding: 7px 9px; background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .combo small { font-size: 10px; color: var(--accent); }
  .combo b { font-size: 12px; font-weight: 500; color: var(--ink); }
</style>