<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES } from '../lib/theory/notes';
  import { TENSION_DATA, tensionKind, tensionNote, tenBasePcs, tenTensionCounts, tenRuling, tenFullNotes, type TensionQuality } from '../lib/theory/tensions';
  import { onCross } from '../lib/cross';
  import SegTabs from '../lib/ui/SegTabs.svelte';

  const root = writable('C');
  const quality = writable<TensionQuality>('maj7');

  onCross('tensionRoot', v => root.set(v));
  onCross('tensionQuality', v => quality.set(v as TensionQuality));

  $: basePcs = tenBasePcs($root, $quality);
  $: baseNotes = basePcs.map(pc => NOTES[pc]);
  $: qualityLabel = { maj7: 'maj7', m7: 'm7', '7': 'dominante 7' }[$quality];
</script>

<div class="view-head">
  <p class="eyebrow">EXTENSIONES / FRICCIÓN</p>
  <h2>Extensiones sobre {$root} {qualityLabel}</h2>
  <p class="sub">Cada tensión se mide contra las notas del acorde: segundas menores (fricción) y tritonos (ambigüedad).</p>
</div>

<section class="panel controls-panel">
  <SegTabs
    items={[{ id: 'maj7', label: 'maj7' }, { id: 'm7', label: 'm7' }, { id: '7', label: 'Dominante 7' }]}
    value={$quality}
    onchange={(id) => quality.set(id as TensionQuality)}
    label="Calidad del acorde"
    controls="ten-panel"
  />
  <div class="rootrow">
    {#each ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as n (n)}
      <button type="button" class="rootchip" class:on={$root === n} onclick={() => root.set(n)}>{n}</button>
    {/each}
  </div>
</section>

<div id="ten-panel" role="tabpanel" aria-labelledby="{$quality}-tab">

<section class="panel base-panel">
  <p class="eyebrow">ACORDE BASE</p>
  <div class="notes">
    {#each baseNotes as n (n)}<span class="nnote mono">{n}</span>{/each}
  </div>
</section>

<section class="tensions-grid">
  {#each TENSION_DATA as t (t.label)}
    {@const kind = tensionKind($quality, t.label)}
    {@const counts = tenTensionCounts($root, basePcs, t.interval)}
    {@const ruling = tenRuling($quality, t.label)}
    {@const full = tenFullNotes($root, $quality, t.interval)}
    <article class="tcard" data-kind={kind} data-ruling={ruling.id}>
      <div class="tcard-head">
        <span class="tlabel mono">{t.label}</span>
        <span class="tnote mono">{tensionNote($root, t.interval)}</span>
      </div>
      <p class="tkind">{kind}</p>
      <p class="tdesc">{t.description}</p>
      <div class="counts">
        <span class="count" data-on={counts.b9 > 0}>b9 × {counts.b9}</span>
        <span class="count" data-on={counts.tri > 0}>tritono × {counts.tri}</span>
      </div>
      <div class="ruling" data-id={ruling.id}>
        <b>{ruling.label}</b>
        <span>{ruling.tip}</span>
      </div>
      <p class="full mono">acorde: {full.join(' · ')}</p>
    </article>
  {/each}
</section>

</div>

<style>
  .view-head { margin-bottom: 12px; }
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.5; font-size: 12px; }
  .controls-panel { display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3); }
  .rootrow { display: flex; flex-wrap: wrap; gap: 6px; }
  .rootchip { font-family: var(--font-mono); font-size: 12px; padding: 6px 9px; border: 1px solid var(--line); border-radius: 2px; background: var(--panel-raised); color: var(--muted); cursor: pointer; }
  .rootchip.on { color: #050606; background: var(--accent); border-color: var(--accent); font-weight: 700; }
  .notes { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .nnote { font-family: var(--font-mono); font-size: 12px; padding: 6px 9px; border-radius: 2px; border: 1px solid var(--line); background: var(--panel-raised); color: var(--ink); }
  .tensions-grid { display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); margin-top: 12px; max-height: min(56vh, 520px); overflow-y: auto; }
  .tcard { padding: 12px; border: 1px solid #555954; border-radius: 2px; background: #121414; }
  .tcard[data-ruling="safe"] { border-color: color-mix(in srgb, #8ca66c 60%, #555954); }
  .tcard[data-ruling="accept"] { border-color: color-mix(in srgb, #6e91a3 60%, #555954); }
  .tcard[data-ruling="care"] { border-color: color-mix(in srgb, #c9a056 60%, #555954); }
  .tcard[data-ruling="avoid"] { border-color: color-mix(in srgb, #c96b56 60%, #555954); }
  .mono { font-family: var(--font-mono); }
  .tcard-head { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
  .tlabel { font-family: var(--font-display); font-size: 18px; font-weight: 700; letter-spacing: -0.4px; color: var(--accent); }
  .tnote { font-family: var(--font-mono); font-size: 12px; color: var(--ink); }
  .tkind { color: var(--muted); font: 9px var(--font-mono); letter-spacing: 1.3px; text-transform: uppercase; margin: 6px 0; }
  .tcard[data-kind="estable"] .tkind { color: #8ca66c; }
  .tcard[data-kind="color"] .tkind { color: #6e91a3; }
  .tcard[data-kind="fricción"] .tkind { color: #a45a46; }
  .tdesc { color: var(--muted); font-size: 12px; line-height: 1.5; margin: 0 0 10px; }
  .counts { display: flex; gap: 6px; margin: 10px 0; }
  .count { font-family: var(--font-mono); font-size: 11px; padding: 4px 7px; border-radius: 2px; border: 1px solid var(--line); color: var(--muted); }
  .count[data-on="true"] { color: var(--accent); border-color: color-mix(in srgb, var(--accent) 50%, var(--line)); }
  .ruling { display: flex; flex-direction: column; gap: 3px; padding: 9px; border-radius: 2px; background: var(--panel-raised); border: 1px solid var(--line); }
  .ruling b { font-family: var(--font-display); font-size: 12px; font-weight: 600; color: var(--ink); }
  .ruling[data-id="safe"] b { color: #8ca66c; }
  .ruling[data-id="accept"] b { color: #6e91a3; }
  .ruling[data-id="care"] b { color: #c9a056; }
  .ruling[data-id="avoid"] b { color: #c96b56; }
  .ruling span { font-size: 12px; color: var(--muted); line-height: 1.45; }
  .full { margin-top: 10px; font-size: 11px; color: var(--muted); line-height: 1.55; }
</style>