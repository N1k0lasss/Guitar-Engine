<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES } from '../lib/theory/notes';
  import { POLY_TEMPLATES, POLY_BASE_QUALITIES, POLY_TRIAD_QUALITIES, POLY_BASE_LABELS, POLY_TRIAD_LABELS, polyFindName, polyCountDissonance, polyIntervals } from '../lib/theory/polychords';
  import SegTabs from '../lib/ui/SegTabs.svelte';

  const bassRoot = writable(0);
  const bassQ = writable('');
  const triRoot = writable(0);
  const triQ = writable('');

  function iv(key: string): number[] {
    return (POLY_TEMPLATES.find(t => t.key === (key || '')) || POLY_TEMPLATES[4]).intervals;
  }

  $: bassPcs = polyIntervals($bassRoot, iv($bassQ));
  $: triPcs = polyIntervals($triRoot, iv($triQ));
  $: union = [...new Set([...bassPcs, ...triPcs])].sort((a, b) => a - b);
  $: name = polyFindName($bassRoot, union);
  $: dis = polyCountDissonance(union);
  $: isHybrid = $bassRoot !== $triRoot;
  $: polyName = isHybrid ? NOTES[$triRoot] + ($triQ || '') + '/' + NOTES[$bassRoot] + ($bassQ || '') : name;
  $: notes = union.map(pc => NOTES[pc]);
</script>

<div class="view-head">
  <p class="eyebrow">SUPERPOSICIÓN DE VOCES</p>
  <h2>Policordios y estructuras superiores</h2>
  <p class="sub">Apoyá una tríada sobre otra. El atlas bautiza la unión, mide disonancias (semitonos y tritonos) y la reconoce como estructura superior.</p>
</div>

<div id="poly-panel" role="tabpanel" aria-labelledby="{$bassQ}-tab">
<section class="panel builder">
  <div class="stack">
    <div class="stack-row">
      <span class="stack-label">Base (bajo)</span>
      <SegTabs
        items={POLY_BASE_QUALITIES.map(q => ({ id: q, label: POLY_BASE_LABELS[q] }))}
        value={$bassQ}
        onchange={(id) => bassQ.set(id)}
        label="Calidad del bajo"
        controls="poly-panel"
      />
      <div class="rootrow">
        {#each NOTES as n, i (i)}
          <button type="button" class="rootchip" class:on={$bassRoot === i} onclick={() => bassRoot.set(i)}>{n}</button>
        {/each}
      </div>
    </div>

    <div class="stack-row">
      <span class="stack-label">Tríada superior</span>
      <SegTabs
        items={POLY_TRIAD_QUALITIES.map(q => ({ id: q, label: POLY_TRIAD_LABELS[q] }))}
        value={$triQ}
        onchange={(id) => triQ.set(id)}
        label="Calidad de la tríada superior"
        controls="poly-panel"
      />
      <div class="rootrow">
        {#each NOTES as n, i (i)}
          <button type="button" class="rootchip" class:on={$triRoot === i} onclick={() => triRoot.set(i)}>{n}</button>
        {/each}
      </div>
    </div>
  </div>

  <div class="result">
    <p class="eyebrow">RESULTADO</p>
    <p class="poly-name mono">{polyName}</p>
    <p class="analysis mono">{name}</p>
    <p class="muted">{isHybrid ? 'estructura superior (slash)' : 'acorde reconocido directamente'}</p>

    <p class="eyebrow mt">NOTAS DE LA UNIÓN</p>
    <div class="notes">
      {#each notes as n (n)}<span class="nnote mono">{n}</span>{/each}
    </div>

    <div class="dissonance">
      <span class="dcount" data-on={dis.b9 > 0}>segundas menores: {dis.b9}</span>
      <span class="dcount" data-on={dis.tri > 0}>tritonos: {dis.tri}</span>
      <span class="dcount good" data-on={dis.b9 === 0 && dis.tri === 0}>sonoridad limpia</span>
    </div>
  </div>
</section>
</div>

<style>
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.5; font-size: 12px; }
  .builder { display: grid; gap: 12px; grid-template-columns: 1.5fr 1fr; align-items: start; }
  .stack { display: flex; flex-direction: column; gap: 12px; max-height: min(56vh, 520px); overflow-y: auto; }
  .stack-row { display: flex; flex-direction: column; gap: 6px; }
  .stack-label { font-family: var(--font-mono); font-size: 9px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--muted); }
  .rootrow { display: flex; flex-wrap: wrap; gap: 5px; }
  .rootchip { padding: 5px 8px; color: var(--muted); background: var(--panel-raised); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; }
  .rootchip:hover { color: var(--ink); border-color: var(--accent); }
  .rootchip.on { color: #050606; background: var(--accent); border-color: var(--accent); }
  .result { border-left: 1px solid var(--line); padding-left: 14px; max-height: min(56vh, 520px); overflow-y: auto; }
  .poly-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -1px; color: var(--accent); margin: 2px 0 0; }
  .analysis { color: var(--muted); font-size: 12px; margin: 2px 0 0; }
  .muted { font-size: 12px; }
  .mt { margin-top: 12px; }
  .notes { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .nnote { font-family: var(--font-mono); font-size: 11px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 2px; color: var(--ink); }
  .dissonance { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .dcount { font-family: var(--font-mono); font-size: 11px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 2px; color: var(--muted); background: var(--panel-raised); }
  .dcount[data-on="true"] { color: var(--accent); border-color: var(--accent); }
  .dcount.good[data-on="true"] { color: var(--success); border-color: var(--success); }
  @media (max-width: 700px) { .builder { grid-template-columns: 1fr; } .result { border-left: 0; padding-left: 0; } }
</style>