<script lang="ts">
  import { writable } from 'svelte/store';
  import { notesFromPcs } from '../lib/theory/notes';
  import { ttChordSet, ttTritonePcs, ttTritoneNames, ttSubstitute, ttTonic, ttOptions } from '../lib/theory/tritone';
  import { onCross } from '../lib/cross';

  const seed = writable('B');
  const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  onCross('tritoneRoot', v => { if (SHARP_NOTES.includes(v)) seed.set(v); });
  $: tritonePcs = ttTritonePcs($seed) ?? [];
  $: tritoneNames = ttTritoneNames($seed);
  $: chordPcs = ttChordSet($seed, '7') ?? [];
  $: chordNotes = notesFromPcs(chordPcs);
  $: subName = ttSubstitute($seed);
  $: subPcs = ttChordSet(ttSubstitute($seed).slice(0, -1), '7') ?? [];
  $: subNotes = notesFromPcs(subPcs);
  $: tonicMaj = ttTonic($seed, '');
  $: tonicMin = ttTonic($seed, 'm');
  $: options = ttOptions($seed);

  function pc(n: string): number {
    return { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 }[n];
  }
</script>

<div class="view-head">
  <p class="eyebrow">EQUIVALENCIA DEL TRITONO</p>
  <h2>El tritono, dos dominantes a la vez</h2>
  <p class="sub">Cada tritono (b3 + b7) pertenece a dos acordes de dominante separados por quinta disminuida. El sustituto tritonal usa esa ambigüedad.</p>
</div>

<section class="panel seed-panel">
  <p class="eyebrow">EL TRITONO · {tritoneNames.join(' + ')}</p>
  <div class="seed-row">
    <span class="seed-note mono on">{tritoneNames[0]}</span>
    <span class="seed-gap">↔</span>
    <span class="seed-note mono">{tritoneNames[1]}</span>
    <p class="muted">tritono = 6 semitonos. Su línea de simetría es un eje del mundo de Bartók.</p>
  </div>
  <div class="seed-options">
    {#each ['B', 'Bb', 'F', 'F#', 'C', 'C#', 'G', 'G#', 'D', 'D#', 'A', 'A#'] as n (n)}
      <button type="button" class="seed-chip" class:on={$seed === n} onclick={() => seed.set(n)}>{n}</button>
    {/each}
  </div>
</section>

<section class="layout">
  <section class="panel dom-panel">
    <p class="eyebrow">DOMINANTE DE REFERENCIA</p>
    <p class="big mono">{$seed}7</p>
    <div class="notes">
      {#each chordNotes as n (n)}
        <span class="nnote mono" class:tritone={tritonePcs.includes(pc(n))}>{n}</span>
      {/each}
    </div>
    <p class="muted">resuelve a {tonicMaj} o {tonicMin}</p>
  </section>

  <section class="panel sub-panel">
    <p class="eyebrow">SUSTITUTO TRITONAL</p>
    <p class="big mono" style="color: var(--color-accent)">{subName}</p>
    <div class="notes">
      {#each subNotes as n (n)}
        <span class="nnote mono" class:tritone={tritonePcs.includes(pc(n))}>{n}</span>
      {/each}
    </div>
    <p class="muted">mismo tritono, fundamental una b5 más lejos</p>
  </section>
</section>

<section class="panel options-panel">
  <p class="eyebrow">QUÉ PODÉS HACER CON ESTE TRITONO</p>
  <div class="options">
    {#each options as opt, i (opt.id)}
      <div class="opt">
        <b class="opt-arrow">{opt.arrow}</b>
        <p class="opt-name mono">{opt.name}</p>
        <p class="opt-note">{opt.note}</p>
      </div>
    {/each}
  </div>
</section>

<style>
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.55; font-size: 12px; }
  .seed-panel { display: flex; flex-wrap: wrap; align-items: center; gap: 13px; margin-bottom: 22px; }
  .seed-row { display: flex; align-items: center; gap: 18px; }
  .seed-note { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; letter-spacing: -1px; line-height: 1; color: var(--ink); }
  .seed-note.on { color: var(--accent); }
  .seed-gap { color: var(--muted); font-size: 1.1rem; }
  .seed-options { display: flex; flex-wrap: wrap; gap: 6px; }
  .seed-chip { padding: 7px 11px; color: var(--muted); background: var(--panel-raised); border: 1px solid var(--line); border-radius: 2px; cursor: pointer; font-family: var(--font-mono); font-size: 11px; }
  .seed-chip:hover { color: var(--ink); border-color: var(--accent); }
  .seed-chip.on { color: #050606; background: var(--accent); border-color: var(--accent); }
  .layout { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin: 0 0 22px; }
  .big { font-family: var(--font-display); font-size: 2.2rem; font-weight: 700; letter-spacing: -1px; line-height: 1; color: var(--accent); margin: 6px 0; }
  .muted { font-size: 12px; line-height: 1.6; }
  .notes { display: flex; flex-wrap: wrap; gap: 6px; }
  .nnote { font-family: var(--font-mono); font-size: 11px; padding: 5px 9px; border: 1px solid var(--line); border-radius: 2px; color: var(--muted); }
  .nnote.tritone { color: var(--accent); border-color: var(--accent); }
  .options-panel { margin-top: 22px; }
  .options { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
  .opt { display: grid; gap: 3px; padding: 12px 11px; color: var(--ink); background: #121414; border: 1px solid #555954; border-radius: 2px; text-align: left; }
  .opt:hover { background: #181b1a; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(255, 85, 124, 0.12); }
  .opt-arrow { color: var(--accent); font-family: var(--font-display); font-weight: 700; font-size: 20px; line-height: 1; }
  .opt-name { font-family: var(--font-display); font-weight: 700; font-size: 18px; color: var(--ink); margin: 2px 0; }
  .opt-note { color: var(--muted); font-family: var(--font-mono); font-size: 11px; line-height: 1.5; }
  @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }
  @media (max-width: 700px) { .layout { grid-template-columns: 1fr; } .seed-panel { align-items: stretch; flex-direction: column; } }
</style>