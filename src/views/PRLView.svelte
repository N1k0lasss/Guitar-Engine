<script lang="ts">
  import { writable } from 'svelte/store';
  import { notesFromPcs } from '../lib/theory/notes';
  import { PRL_OP_INFO, prlTransformations, prlMoveLabel } from '../lib/theory/prl';

  const root = writable('C');
  const quality = writable('');
  $: name = $root + $quality;
  $: transforms = prlTransformations($root, $quality);
</script>

<div class="view-head">
  <p class="eyebrow">TRANSFORMACIONES P / R / L</p>
  <h2>Triadas vecinas por una sola voz</h2>
  <p class="sub">P, R y L mueven una sola nota (dos quedan en común) y exploran el espacio físico de las triadas mayores y menores.</p>
</div>

<section class="panel controls-panel">
  <div class="rootrow">
    {#each ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as n (n)}
      <button type="button" class="rootchip" class:on={$root === n} onclick={() => root.set(n)}>{n}</button>
    {/each}
  </div>
  <div class="seg">
    <button type="button" class:on={$quality === ''} onclick={() => quality.set('')}>Mayor</button>
    <button type="button" class:on={$quality === 'm'} onclick={() => quality.set('m')}>Menor</button>
  </div>
</section>

<section class="panel result-panel">
  <p class="eyebrow">ACORDE BASE · {name}</p>
  <div class="cards">
    {#each transforms as t, i (t.op)}
      {@const shared = notesFromPcs(t.common)}
      {@const all = notesFromPcs(t.set)}
      {@const movedName = notesFromPcs([t.movedTo])[0]}
      <div class="tcard">
        <div class="tcard-head">
          <b class="op">{t.op}</b>
          <span class="opname">{PRL_OP_INFO[t.op].name}</span>
        </div>
        <p class="muted desc">{PRL_OP_INFO[t.op].desc}</p>
        <p class="result-name mono">{t.name}</p>
        <div class="notes-row">
          {#each all as n (n)}
            <span class="note mono" class:common={shared.includes(n)} class:moved={n === movedName}>{n}</span>
          {/each}
        </div>
        <p class="moved-line">mueve {notesFromPcs([t.movedFrom])[0]} → {movedName} · {prlMoveLabel(t.delta)}</p>
      </div>
    {/each}
  </div>
</section>

<style>
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.5; font-size: 12px; }
  .controls-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
  .rootrow { display: flex; flex-wrap: wrap; gap: 5px; }
  .rootchip { padding: 5px 8px; color: var(--muted); background: var(--panel-raised); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; }
  .rootchip:hover { color: var(--ink); border-color: var(--accent); }
  .rootchip.on { color: #050606; background: var(--accent); border-color: var(--accent); }
  .cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: min(56vh, 520px); overflow-y: auto; }
  .tcard { display: grid; gap: 6px; align-content: start; padding: 10px 12px; color: var(--ink); background: #121414; border: 1px solid #555954; border-radius: 2px; text-align: left; }
  .tcard:hover { background: #181b1a; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255, 85, 124, 0.12); }
  .tcard-head { display: flex; align-items: baseline; gap: 8px; }
  .op { color: var(--accent); font-family: var(--font-display); font-weight: 700; font-size: 22px; letter-spacing: -1px; line-height: 1; }
  .opname { color: var(--muted); font-family: var(--font-mono); font-size: 10px; text-transform: uppercase; }
  .muted { font-size: 12px; line-height: 1.45; }
  .desc { margin: 2px 0; }
  .result-name { font-family: var(--font-display); font-weight: 700; font-size: 17px; color: var(--ink); margin: 4px 0 2px; }
  .notes-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .note { font-family: var(--font-mono); font-size: 11px; padding: 4px 8px; border: 1px solid var(--line); border-radius: 2px; color: var(--muted); }
  .note.common { color: var(--ink); border-color: var(--accent); }
  .note.moved { color: var(--accent); border-color: var(--accent); }
  .moved-line { margin-top: 4px; color: var(--muted); font-family: var(--font-mono); font-size: 11px; line-height: 1.5; }
  @media (max-width: 1024px) { .cards { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 700px) { .cards { grid-template-columns: 1fr; } .controls-panel { align-items: stretch; flex-direction: column; } }
</style>