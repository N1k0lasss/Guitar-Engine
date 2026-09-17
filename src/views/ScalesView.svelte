<script lang="ts">
  import { writable } from 'svelte/store';
  import { SCALE_TYPES, CAGED_POSITIONS, scaleNotes, fretboardCells } from '../lib/theory/scales';
  import { onCross } from '../lib/cross';

  const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const root = writable('C');
  const scale = writable('major');
  const position = writable(0);

  onCross('scaleRoot', v => { if (ROOT_NOTES.includes(v)) root.set(v); });

  $: type = SCALE_TYPES[$scale] || SCALE_TYPES.major;
  $: pos = CAGED_POSITIONS[$position] || CAGED_POSITIONS[0];
  $: notes = scaleNotes($root, $scale);
  $: cells = fretboardCells($root, $scale, pos.start, pos.end);
  $: rows = [0, 1, 2, 3, 4, 5].map(si => cells.filter(c => c.string === si));
  $: frets = Array.from({ length: pos.end - pos.start + 1 }, (_, i) => pos.start + i);

  $: groups = Object.entries(SCALE_TYPES).reduce((acc, [key, d]) => {
    const g = acc.find(a => a.name === d.group);
    if (g) g.scales.push(key); else acc.push({ name: d.group, scales: [key] });
    return acc;
  }, [] as { name: string; scales: string[] }[]);
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">MAPA DEL MÁSTIL</p>
    <h2>Escalas para improvisar</h2>
  </div>
</div>

<section class="panel scale-controls">
  <label>
    <span>Tónica</span>
    <select class="sel" value={$root} onchange={(e) => root.set((e.currentTarget as HTMLSelectElement).value)}>
      {#each ROOT_NOTES as n (n)}<option value={n}>{n}</option>{/each}
    </select>
  </label>
  <label>
    <span>Escala</span>
    <select class="sel" value={$scale} onchange={(e) => scale.set((e.currentTarget as HTMLSelectElement).value)}>
      {#each groups as g (g.name)}
        <optgroup label={g.name}>
          {#each g.scales as s (s)}<option value={s}>{SCALE_TYPES[s].label}</option>{/each}
        </optgroup>
      {/each}
    </select>
  </label>
  <label>
    <span>Posición</span>
    <select class="sel" value={$position} onchange={(e) => position.set(+((e.currentTarget as HTMLSelectElement).value))}>
      {#each CAGED_POSITIONS as p, i (p.label)}<option value={i}>{p.label}</option>{/each}
    </select>
  </label>
</section>

<section class="panel scale-result">
  <div class="result-head">
    <p class="eyebrow">NOTAS DE LA ESCALA</p>
    <h3>{$root} {type.label.toLowerCase()}</h3>
    <p class="scale-notes mono">{notes.join(' · ')}</p>
  </div>
  <div class="fretboard-wrap">
    <div class="fretboard" style="--fc: {frets.length};">
      <div class="fret-numbers">
        {#each frets as f (f)}<span>{f}</span>{/each}
      </div>
      <div class="fret-grid">
        {#each rows as row, si (si)}
          {#each row as cell (si * 100 + cell.fret)}
            <span class="fret-cell" class:in-scale={cell.inScale} class:root-note={cell.isRoot} title="{cell.note} · traste {cell.fret}">
              {cell.inScale ? cell.note : ''}
            </span>
          {/each}
        {/each}
      </div>
    </div>
  </div>
</section>

<style>
  .scale-controls { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px; margin-bottom: 12px; }
  .scale-controls label { display: flex; flex-direction: column; gap: 4px; }
  .scale-controls label span { color: var(--muted); font: 9px var(--font-mono); text-transform: uppercase; letter-spacing: 1.2px; }

  .scale-result { overflow-x: auto; }
  .result-head h3 { margin: 2px 0 6px; color: var(--accent); font-family: var(--font-display); font-weight: 600; font-size: clamp(18px, 2vw, 24px); line-height: 1; letter-spacing: -.7px; }
  .scale-notes { margin: 0; color: var(--muted); font: 12px var(--font-mono); }

  .fretboard-wrap { min-width: 520px; margin-top: 14px; }
  .fretboard { --fc: 16; }
  .fret-numbers {
    display: grid; grid-template-columns: repeat(var(--fc), minmax(30px, 1fr));
    margin-left: 0; color: var(--muted); font: 10px var(--font-mono); text-align: center; margin-bottom: 4px;
  }
  .fret-grid {
    display: grid; grid-template-columns: repeat(var(--fc), minmax(30px, 1fr));
    gap: 2px; padding-top: 5px;
    background: repeating-linear-gradient(to bottom, transparent 0 21px, rgba(255, 255, 255, .18) 22px 23px);
  }
  .fret-cell {
    height: 23px; display: grid; place-items: center; color: transparent;
    border-right: 1px solid var(--line); border-left: 1px solid rgba(255, 255, 255, .04);
    font: 10px var(--font-mono);
  }
  .fret-cell.in-scale { color: var(--color-ink); background: color-mix(in srgb, var(--accent) 42%, #080909); border-radius: 50%; }
  .fret-cell.root-note { color: #050606; background: var(--accent); font-weight: 700; border-radius: 50%; }
  .mono { font-family: var(--font-mono); }
</style>
