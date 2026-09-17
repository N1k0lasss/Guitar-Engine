<script lang="ts">
  import { writable } from 'svelte/store';
  import { SABOR_DATA, saborNote } from '../lib/theory/sabores';
  import { go } from '../lib/nav';
  import { sendCross } from '../lib/cross';

  const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAVORS = ['casa', 'flamenco', 'antiguo', 'magia', 'dulce', 'epico', 'dominante'];

  const root = writable('C');
  const selected = writable(0);

  $: entry = SABOR_DATA[$selected];
  $: note = saborNote($root, entry.interval);
  $: flavoredCount = SABOR_DATA.filter(s => s.flavor).length;

  function openCartography() {
    sendCross({ cartoRoot: note });
    go('cartography');
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">MODOS ILUSTRADOS · P. 184–188</p>
    <h2>Cada nota tiene su propio sabor</h2>
  </div>
  <span class="signal-badge">6 sabores · contra la tónica</span>
</div>

<section class="panel sabor-toolbar">
  <label>
    <span>Tónica</span>
    <select class="sel" value={$root} onchange={(e) => root.set((e.currentTarget as HTMLSelectElement).value)}>
      {#each ROOT_NOTES as n (n)}<option value={n}>{n}</option>{/each}
    </select>
  </label>
</section>

<section class="sabor-layout">
  <section class="panel sabor-grid-panel">
    <p class="eyebrow">NOTAS A PARTIR DE LA TÓNICA</p>
    <div class="sabor-grid">
      {#each SABOR_DATA as s, i (s.interval)}
        {@const n = saborNote($root, s.interval)}
        <button type="button" class="sabor-chip {s.flavor ? 'sabor-' + s.flavor : 'sabor-neutral'} {i === $selected ? 'selected' : ''}"
          title={s.flavor ? `${n} = ${s.label} (${s.mode})` : `${n} · sin sabor marcado en el libro`}
          onclick={() => selected.set(i)}>
          <b>{n}</b>
          <span>{s.label || '—'}</span>
        </button>
      {/each}
    </div>
    <p class="sabor-legend">
      {#each FLAVORS as f, i (f)}{#if i > 0}<span class="sep">·</span>{/if}<span class="leg"><i class="dot {f}"></i>{f === 'epico' ? 'épico' : f}</span>{/each}
    </p>
    <p class="study-hint">En el libro el sabor se mide siempre contra C (la "casa"). Mover la tónica transpone los sabores a la nota correspondiente.</p>
  </section>

  <aside class="panel sabor-detail">
    {#if !entry.flavor}
      <p class="eyebrow">NOTA SIN SABOR MARCADO</p>
      <h3>{note}</h3>
      <span class="sabor-mode">{entry.intervalLabel}</span>
      <p class="sabor-desc">El libro deja sin nombre a esta nota: no altera sola el color, pero combina con las otras {flavoredCount} con sabor para cocinar una escala.</p>
    {:else}
      <p class="eyebrow">SABOR · {note}</p>
      <h3 class="sabor-title {entry.flavor}">{entry.label}</h3>
      <span class="sabor-mode">{entry.mode} · {entry.intervalLabel}</span>
      <p class="sabor-desc">{entry.desc}</p>
    {/if}
    <button type="button" class="btn-ghost cross-btn" onclick={openCartography}>Abrir en Cartografía →</button>
  </aside>
</section>

<style>
  .sabor-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; margin-bottom: 22px; }
  .sabor-toolbar label { display: flex; flex-direction: column; gap: 6px; }
  .sabor-toolbar label > span { color: var(--muted); font: 10px var(--font-mono); text-transform: uppercase; letter-spacing: 1.4px; }

  .sabor-layout { display: grid; grid-template-columns: 1.7fr 1fr; gap: 22px; align-items: start; }
  @media (max-width: 1024px) { .sabor-layout { grid-template-columns: 1fr; } }
  .sabor-grid-panel, .sabor-detail { padding: 14px; }
  .sabor-detail { max-height: min(56vh, 500px); overflow-y: auto; }

  .sabor-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
  @media (max-width: 1024px) { .sabor-grid { grid-template-columns: repeat(4, 1fr); } }
  @media (max-width: 700px) { .sabor-grid { grid-template-columns: repeat(3, 1fr); } }
  .sabor-chip {
    display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 9px 6px;
    background: #121414; border: 1px solid #555954; border-radius: 2px; cursor: pointer;
    transition: border-color .15s, background .15s;
  }
  .sabor-chip:hover { background: #181b1a; }
  .sabor-chip.selected { border-color: var(--accent); }
  .sabor-chip b { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--ink); letter-spacing: -.4px; }
  .sabor-chip span { color: var(--muted); font-size: 11px; text-transform: capitalize; }
  .sabor-chip.sabor-casa b { color: #d9dbd4; }
  .sabor-chip.sabor-flamenco b { color: #ff8b7a; }
  .sabor-chip.sabor-antiguo b { color: #d3a35c; }
  .sabor-chip.sabor-magia b { color: #b48cff; }
  .sabor-chip.sabor-dulce b { color: #ffb3d4; }
  .sabor-chip.sabor-epico b { color: #ffcf5c; }
  .sabor-chip.sabor-dominante b { color: #7fd6ff; }
  .sabor-chip.sabor-neutral b { color: #6d7168; }
  .sabor-chip.sabor-neutral span { color: #43463f; }

  .sabor-legend { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; margin: 14px 0 0; color: var(--muted); font-size: 11px; }
  .leg { display: inline-flex; align-items: center; gap: 4px; }
  .sep { color: #43463f; }
  .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
  .dot.casa { background: #d9dbd4; }
  .dot.flamenco { background: #ff8b7a; }
  .dot.antiguo { background: #d3a35c; }
  .dot.magia { background: #b48cff; }
  .dot.dulce { background: #ffb3d4; }
  .dot.epico { background: #ffcf5c; }
  .dot.dominante { background: #7fd6ff; }

  .sabor-detail h3 { font-family: var(--font-display); font-weight: 600; font-size: 24px; color: var(--ink); margin: 0 0 10px; letter-spacing: -.5px; }
  .sabor-detail h3.sabor-casa { color: #d9dbd4; }
  .sabor-detail h3.sabor-flamenco { color: #ff8b7a; }
  .sabor-detail h3.sabor-antiguo { color: #d3a35c; }
  .sabor-detail h3.sabor-magia { color: #b48cff; }
  .sabor-detail h3.sabor-dulce { color: #ffb3d4; }
  .sabor-detail h3.sabor-epico { color: #ffcf5c; }
  .sabor-detail h3.sabor-dominante { color: #7fd6ff; }
  .sabor-mode { display: inline-block; color: var(--accent); font: 12px var(--font-mono); margin-bottom: 12px; }
  .sabor-desc { color: var(--muted); font-size: 13px; line-height: 1.6; margin: 0 0 16px; }
  .cross-btn { width: 100%; }
</style>
