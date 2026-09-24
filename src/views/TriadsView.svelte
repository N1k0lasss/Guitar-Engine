<script lang="ts">
  import { writable } from 'svelte/store';
  import { spellPc } from '../lib/theory/notes';
  import { parseChordName, qualityFamilyOf, qualityColor } from '../lib/theory/chords';
  import {
    TRIAD_PRESETS, triadOf, triadShapes, splitChords, ROTATION_LABELS,
    type TriadDef, type TriadShape,
  } from '../lib/theory/triads';
  import { harmonyPlanForName, harmonySound, harmonyProgTempo } from '../lib/theory/harmony';
  import { playChordPlan, playProgPlan } from '../lib/audio/playback';
  import TriadFretboard from '../lib/ui/TriadFretboard.svelte';
  import SegTabs from '../lib/ui/SegTabs.svelte';
  import Field from '../lib/ui/Field.svelte';
  import Panel from '../lib/ui/Panel.svelte';
  import SignalBadge from '../lib/ui/SignalBadge.svelte';

  const progText = writable('C G Am F');
  const selIndex = writable(0);
  const mode = writable<'single' | 'overview'>('single');
  const rotation = writable<'all' | '0' | '1' | '2'>('all');
  const zone = writable<'all' | '0' | '1' | '2' | '3'>('all');
  const highlight = writable<string | null>(null);

  interface Item { name: string; triad: TriadDef | null; shapes: TriadShape[]; }

  const items = $derived(splitChords($progText).map(name => ({ name, triad: triadOf(name), shapes: triadShapes(name) })));
  const valid = $derived(items.filter((i): i is Item & { triad: TriadDef } => i.triad !== null));
  const invalid = $derived(items.filter(i => i.triad === null).map(i => i.name));
  const selIdx = $derived(valid.length ? Math.min($selIndex, valid.length - 1) : -1);
  const sel = $derived(selIdx >= 0 ? valid[selIdx] : null);
  const selShapes = $derived(sel
    ? sel.shapes.filter(s =>
        ($rotation === 'all' || s.rotation === Number($rotation)) &&
        ($zone === 'all' || s.stringSet[0] === Number($zone)))
    : []);
  const allShapes = $derived(valid.flatMap(i => i.shapes));
  const palette = $derived(Object.fromEntries(valid.map(i => [i.name, colorOf(i.name)])));

  function colorOf(name: string): string {
    const parsed = parseChordName(name);
    const q = parsed?.quality ?? '';
    return qualityColor(qualityFamilyOf({ quality: q } as never));
  }

  function spellTriad(t: TriadDef | null): string {
    if (!t) return '';
    const sig: 'flat' | 'sharp' = t.root.includes('b') ? 'flat' : 'sharp';
    return t.pcs.map(pc => spellPc(pc, sig)).join(' · ');
  }

  function commit(txt: string) {
    progText.set(txt);
    selIndex.set(0);
    highlight.set(null);
  }

  function pickShape(id: string) {
    highlight.update(h => (h === id ? null : id));
  }

  function select(i: number) {
    selIndex.set(i);
    highlight.set(null);
  }

  function playSel() {
    if (sel) playChordPlan(harmonyPlanForName(sel.name), $harmonySound as 'synth' | 'pluck');
  }

  function playAll() {
    const names = valid.map(i => i.name);
    if (names.length) playProgPlan(names.map(n => harmonyPlanForName(n)), $harmonyProgTempo);
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">CARGAR PROGRESIÓN</p>
    <h2>Tríadas de tu armonía en el mástil</h2>
  </div>
  <SignalBadge label={`${valid.length || 0} acordes · ${allShapes.length} formas`} />
</div>

<div id="triads-panel" role="tabpanel" aria-labelledby="{String($mode)}-tab">

<Panel class="toolbar">
  <Field label="Progresión">
    <input
      class="ctl prog-input"
      value={$progText}
      oninput={(e) => commit((e.currentTarget as HTMLInputElement).value)}
      placeholder="C G Am F · Dm7 G7 Cmaj7"
    />
  </Field>
  <button class="btn btn-ghost btn-sm" onclick={() => commit('')}>Limpiar</button>
  <div class="presets">
    {#each TRIAD_PRESETS as p (p.value)}
      <button type="button" class="preset" class:on={$progText === p.value} onclick={() => commit(p.value)}>{p.label}</button>
    {/each}
  </div>
</Panel>

{#if invalid.length}
  <p class="warn">&nbsp;No reconocí: {invalid.join(' · ')} (tríadas, t4das y sus variantes)</p>
{/if}

<Panel class="prog-panel">
  <div class="row-head">
    <p class="eyebrow">PROGRESIÓN</p>
    <button class="btn btn-ghost btn-sm" onclick={playAll} disabled={!valid.length}>▶ Tocar progresión</button>
  </div>
  <div class="chip-row">
    {#each valid as v, i (v.name + '·' + i)}
      <div
        class="prog-chip"
        class:on={i === selIdx}
        role="button" tabindex="0"
        onclick={() => select(i)}
        onkeydown={(e) => { if (e.key === 'Enter') select(i); }}
      >
        <i class="swatch" style="background: {palette[v.name]}"></i>
        <b class="mono">{v.name}</b>
        <small>{v.shapes.length} formas</small>
      </div>
    {/each}
    {#if !valid.length}
      <span class="muted">Escribí una progresión (ej: C G Am F) para ver sus tríadas.</span>
    {/if}
  </div>
</Panel>

<Panel class="filters">
  <div class="field view-seg">
    <span>Modo</span>
    <SegTabs
      items={[{ id: 'single', label: 'Por acorde' }, { id: 'overview', label: 'Todos juntos' }]}
      value={$mode}
      onchange={(id) => { mode.set(id as 'single' | 'overview'); highlight.set(null); }}
      label="Modo del diapasón"
      controls="triads-panel"
    />
  </div>
  {#if $mode === 'single'}
    <div class="field view-seg">
      <span>Inversión</span>
      <SegTabs
        items={[{ id: 'all', label: 'Todas' }, ...ROTATION_LABELS.map((l, r) => ({ id: String(r), label: l }))]}
        value={$rotation}
        onchange={(id) => { rotation.set(id as typeof $rotation); highlight.set(null); }}
        label="Filtro por inversión"
        controls="triads-panel"
      />
    </div>
    <div class="field view-seg">
      <span>Cuerdas</span>
      <SegTabs
        items={[
          { id: 'all', label: 'Todas' },
          { id: '0', label: 'E-A-D' },
          { id: '1', label: 'A-D-G' },
          { id: '2', label: 'D-G-B' },
          { id: '3', label: 'G-B-e' },
        ]}
        value={$zone}
        onchange={(id) => { zone.set(id as typeof $zone); highlight.set(null); }}
        label="Filtro por juego de cuerdas"
        controls="triads-panel"
      />
    </div>
    {#if sel}
      <button class="btn btn-primary btn-sm play-sel" onclick={playSel}>▶ {sel.name}</button>
    {/if}
  {/if}
</Panel>

<section class="layout">
  <Panel class="board-panel">
    <div class="board-head">
      <p class="eyebrow">DIAPASÓN {#if $mode === 'single' && sel}· {sel.name}{:else}· TODA LA PROGRESIÓN{/if}</p>
      {#if $mode === 'single' && sel}
        <p class="mono board-notes">{spellTriad(sel.triad)}</p>
      {/if}
    </div>
    <div class="board-wrap">
      <TriadFretboard
        shapes={$mode === 'single' ? selShapes : allShapes}
        palette={palette}
        mode={$mode}
        highlight={$highlight}
        onpick={pickShape}
      />
      {#if selShapes.length === 0}
        <p class="hint">Sin formas para estos filtros: probá otra inversión o juego de cuerdas.</p>
      {/if}
    </div>
    {#if $mode === 'single' && sel}
      <div class="legend">
        <span><i class="lg" style="background: {palette[sel.name]}"></i>raíz (grave)</span>
        <span><i class="lg third" style="border-color: {palette[sel.name]}"></i>3ª</span>
        <span><i class="lg fifth"></i>5ª</span>
      </div>
    {:else if valid.length}
      <div class="legend">
        {#each valid as v (v.name)}
          <span><i class="lg" style="background: {palette[v.name]}"></i>{v.name}</span>
        {/each}
      </div>
    {/if}
    <p class="hint">Cada triángulo es una tríada completa. {#if $mode === 'single'}Tocá un punto o una fila del listado para resaltarla.{/if}</p>
  </Panel>

  <Panel class="list-panel">
    {#if $mode === 'single' && sel}
      <p class="eyebrow">POSICIONES DE {sel.name} · {selShapes.length}</p>
      <div class="shape-list">
        {#each selShapes as s (s.id)}
          <button
            type="button"
            class="shape-row"
            class:on={$highlight === s.id}
            onclick={() => pickShape(s.id)}
            onmouseenter={() => highlight.set(s.id)}
            onmouseleave={() => highlight.update(h => (h === s.id ? null : h))}
          >
            <span class="snum">{s.minFret}</span>
            <span class="srot">{s.rotationLabel}</span>
            <span class="sset mono">{s.stringNames.join('')}</span>
            <span class="sfret mono">{s.frets.join('-')}</span>
            <span class="stones mono">{s.tones.join(' · ')}</span>
          </button>
        {/each}
      </div>
      <p class="hint">Traste inicial {selShapes.length ? Math.min(...selShapes.map(s => s.minFret)) : '—'} · total de formas de {sel.name}: {sel.shapes.length}</p>
    {:else if valid.length}
      <p class="eyebrow">ARMONÍA COMPLETA</p>
      <div class="chord-cards">
        {#each valid as v, i (v.name + '·' + i)}
          <div class="chord-card">
            <i class="swatch" style="background: {palette[v.name]}"></i>
            <b class="mono">{v.name}</b>
            <span class="mono tones">{spellTriad(v.triad)}</span>
            <small>{v.shapes.length} formas</small>
          </div>
        {/each}
      </div>
      <p class="hint">Cada color marca dónde vive la tríada de ese acorde. Las zonas superpuestas son puentes naturales entre acordes.</p>
    {:else}
      <p class="muted">Cargá una progresión para empezar.</p>
    {/if}
  </Panel>
</section>

</div>

<style>
  :global(.toolbar) { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; margin-bottom: 12px; }
  :global(.toolbar .field) { min-width: 260px; flex: 1 1 280px; }
  .btn-sm { padding: 6px 10px; font-size: 11px; }
  .presets { display: flex; flex-wrap: wrap; gap: 6px; align-items: flex-end; }
  .preset {
    padding: 6px 9px; font: 10px var(--font-mono); color: var(--muted);
    background: var(--panel-raised); border: 1px solid var(--line); border-radius: 2px; cursor: pointer;
  }
  .preset:hover { color: var(--accent); border-color: var(--accent); }
  .preset.on { color: #050606; background: var(--accent); border-color: var(--accent); }

  .warn { margin: 0 0 10px; font-size: 11px; color: var(--warn); }

  :global(.prog-panel) { margin-bottom: 12px; }
  .row-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
  .row-head .eyebrow { margin: 0; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .prog-chip {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 11px; background: #121414; border: 1px solid #555954; border-radius: 2px;
    cursor: pointer; color: var(--color-ink);
  }
  .prog-chip:hover { border-color: var(--accent); }
  .prog-chip.on { border-color: var(--accent); background: #181b1a; box-shadow: 0 0 0 3px rgba(91, 184, 255, .12); }
  .prog-chip b { font-size: 14px; font-weight: 600; }
  .prog-chip small { font-size: 9px; color: var(--muted); }
  .prog-chip.on small { color: var(--accent); }
  .swatch { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }

  :global(.filters) { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; margin-bottom: 12px; }
  .view-seg { gap: 6px; }
  .play-sel { margin-left: auto; }

  .layout { display: grid; grid-template-columns: 1.55fr .55fr; gap: 14px; align-items: stretch; }
  @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

  :global(.board-panel) { display: flex; flex-direction: column; gap: 10px; }
  .board-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  .board-notes { font-size: 11px; color: var(--muted); }
  .board-wrap { overflow-x: auto; }

  .legend { display: flex; flex-wrap: wrap; gap: 16px; font: 10px var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; }
  .legend span { display: inline-flex; align-items: center; gap: 6px; }
  .lg { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--muted); background: var(--panel-raised); }
  .lg.third { background: #080909; }
  .lg.fifth { background: #080909; border-color: var(--line); }

  :global(.list-panel) { max-height: min(70vh, 540px); overflow-y: auto; }
  .shape-list { display: flex; flex-direction: column; gap: 4px; margin-top: 10px; }
  .shape-row {
    display: grid; grid-template-columns: 22px 72px 44px 52px 1fr; align-items: center; gap: 8px;
    padding: 8px 10px; text-align: left; background: #121414; border: 1px solid #555954; border-radius: 2px;
    cursor: pointer; color: var(--color-ink);
  }
  .shape-row:hover { border-color: var(--accent); }
  .shape-row.on { border-color: var(--accent); background: #181b1a; }
  .snum { font: 700 13px var(--font-mono); color: var(--accent); }
  .srot { font-size: 11px; color: var(--color-ink); }
  .sset, .stones { font-size: 10px; color: var(--muted); }
  .sfret { font-size: 11px; color: var(--accent); }

  .chord-cards { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
  .chord-card {
    display: grid; grid-template-columns: 12px 1fr auto; column-gap: 10px; align-items: center;
    padding: 10px 12px; background: #121414; border: 1px solid #555954; border-radius: 2px;
    color: var(--color-ink);
  }
  .chord-card b { font-size: 15px; }
  .chord-card .tones { font-size: 10px; color: var(--muted); grid-column: 2 / 4; grid-row: 2; margin-top: 3px; }
  .chord-card small { font-size: 9px; color: var(--muted); }

  .hint { margin-top: 10px; color: var(--muted); font-size: 12px; line-height: 1.5; }
  .mono { font-family: var(--font-mono); }
  .muted { color: var(--muted); font-size: 12px; }
</style>