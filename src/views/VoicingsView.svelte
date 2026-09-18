<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES } from '../lib/theory/notes';
  import { getChordVoicings } from '../lib/theory/voicings';
  import { VOICING_QUALITIES, DROP_TYPES, INVERSION_LABELS, getVoicingData, voiBestFretPosition } from '../lib/theory/voicings';
  import SegTabs from '../lib/ui/SegTabs.svelte';
  import { onCrossAny } from '../lib/cross';

  const root = writable('Cmaj7');
  const quality = writable('maj7');
  const inversion = writable(0);
  const drop = writable('close');

  onCrossAny(['voicingRoot', 'voicingQuality'], v => {
    const q = v.voicingQuality ?? '';
    if (v.voicingRoot) root.set(v.voicingRoot + q);
    else if (v.voicingQuality) root.set('C' + q);
    if (v.voicingQuality) quality.set(v.voicingQuality);
  });

  $: q = VOICING_QUALITIES[$quality];
  $: name = `C${$quality}`;
  $: data = getVoicingData('C', $quality, $inversion, $drop);
  $: fretpos = voiBestFretPosition(data.intervals);
  $: all = getChordVoicings(name);
  $: frets = all[0] ? all[0].frets : [];
  $: tones = all[0] ? all[0].tones : [];
</script>

<div class="view-head">
  <p class="eyebrow">INVERSIONES / DROPS</p>
  <h2>Voicings de cuatríada</h2>
  <p class="sub">Cada calidad y vuelta tiene su respiración propia. Posición cerrada y drops para jazz guitar.</p>
</div>

<section class="panel controls-panel">
  <SegTabs
    items={Object.entries(VOICING_QUALITIES).map(([id, def]) => ({ id, label: def.label }))}
    value={$quality}
    onchange={(id) => quality.set(id)}
    label="Calidad"
    controls="voices-panel"
  />
  <SegTabs
    items={INVERSION_LABELS.map((label, i) => ({ id: String(i), label }))}
    value={String($inversion)}
    onchange={(id) => inversion.set(+id)}
    label="Inversión"
    controls="voices-panel"
  />
  <SegTabs
    items={DROP_TYPES.map(d => ({ id: d.id, label: d.label }))}
    value={$drop}
    onchange={(id) => drop.set(id)}
    label="Drop"
    controls="voices-panel"
  />
</section>

<div id="voices-panel" role="tabpanel" aria-labelledby="{$quality}-tab">
<section class="layout">
  <section class="panel info-panel">
    <p class="eyebrow">NOMBRE</p>
    <div class="name-row">
      <span class="big-name mono">{name}</span>
      <span class="color" style="background: {q.color}"></span>
    </div>
    <p class="muted desc">{DROP_TYPES.find(d => d.id === $drop)?.desc}</p>

    <p class="eyebrow mt">NOTAS ({data.notes.length})</p>
    <div class="voicenotes">
      {#each data.notes as n, i (i)}
        <span class="vnote mono" style="--c: {q.color}">
          <b>{n}</b>
          <small>{data.degrees[i]}</small>
        </span>
      {/each}
    </div>

    {#if fretpos}
      <p class="eyebrow mt">DIAGRAMA</p>
      <div class="mast">
        {#each fretpos.strings as str, i (i)}
          <div class="mrow">
            <span class="slabel">{['E', 'A', 'D', 'G', 'B', 'e'][str]}</span>
            <span class="mcell" class:on={fretpos.frets[i] >= 0} style="--c: {q.color}">
              <i class="mdot"></i>
            </span>
            <span class="mfret mono">{fretpos.frets[i]}</span>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="panel scale-panel">
    <p class="eyebrow">DISTANCIAS (semitonos)</p>
    <div class="steps">
      {#each data.intervals as iv, i (i)}
        <span class="step mono" style="--c: {q.color}">{iv}</span>
      {/each}
    </div>
    <p class="muted mt">El intervalo 0 es la fundamental. Los drops reordenan las voces por octavas.</p>
  </section>
</section>
</div>

<style>
  .view-head { margin-bottom: 12px; }
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.5; font-size: 12px; }
  .controls-panel { display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3); overflow-x: auto; }
  .layout { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .layout > .panel { max-height: min(48vh, 440px); overflow-y: auto; }
  .mono { font-family: var(--font-mono); }
  .name-row { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
  .big-name { font-family: var(--font-display); font-size: 28px; font-weight: 700; letter-spacing: -1.2px; color: var(--ink); white-space: nowrap; }
  .color { width: 16px; height: 16px; border-radius: 50%; border: 1px solid rgba(233, 232, 226, .25); }
  .desc { color: var(--muted); font-size: 12px; line-height: 1.5; }
  .mt { margin-top: var(--sp-3); }
  .voicenotes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .vnote { display: flex; flex-direction: column; align-items: center; padding: 6px 8px; border-radius: 2px; border: 1px solid color-mix(in srgb, var(--c) 50%, #555954); background: #121414; color: var(--c); }
  .vnote b { font-size: 13px; }
  .vnote small { font-size: 10px; opacity: .75; }
  .mast { display: flex; flex-direction: column; gap: 3px; margin-top: 6px; max-width: 170px; padding: 6px; background-color: #080909; border: 1px solid var(--line); border-radius: 2px; }
  .mrow { display: grid; grid-template-columns: 18px 26px 30px; gap: 4px; align-items: center; }
  .slabel { font-family: var(--font-mono); font-size: 10px; color: var(--muted); text-align: center; }
  .mcell { height: 20px; display: grid; place-items: center; border-right: 1px solid var(--line); border-left: 1px solid rgba(255, 255, 255, .04); background: #080909; }
  .mcell.on { background: color-mix(in srgb, var(--c) 12%, #080909); }
  .mdot { width: 10px; height: 10px; border-radius: 50%; background: var(--c); }
  .mfret { font-size: 10px; color: var(--muted); }
  .steps { display: flex; gap: 6px; flex-wrap: wrap; }
  .step { padding: 6px 8px; border-radius: 2px; border: 1px solid color-mix(in srgb, var(--c) 40%, var(--line)); background: var(--panel-raised); color: var(--c); font-size: 12px; }
</style>