<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES } from '../lib/theory/notes';
  import { PROX_QUALITIES, PROX_QUALITY_LABELS, findNeighbors, findCommonChords, proxCommonCounts, proxBridgeScan, proxCanonicalName, type ProxNeighbor } from '../lib/theory/proximity';

  const root = writable('C');
  const quality = writable('');
  const moves = writable(1);
  const mode = writable<'any' | 'two' | 'exact'>('any');
  const selected = writable<number[]>([]);
  const bridgeTarget = writable<string>('');

  $: neighbors = findNeighbors($root, $quality, $moves);
  $: counts = proxCommonCounts();
  $: commonChords = findCommonChords($selected, $mode);
  $: maxCount = Math.max(...counts);
  $: bridge = computeBridge($bridgeTarget, $root, $quality);

  function computeBridge(name: string, r: string, q: string) {
    if (!name) return null;
    const match = name.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return null;
    const tr = NOTES.indexOf(match[1] as never);
    if (tr < 0) return null;
    return proxBridgeScan(NOTES.indexOf(r as never), q, tr, match[2]);
  }

  function toggleNote(pc: number) {
    selected.update(list => list.includes(pc) ? list.filter(x => x !== pc) : [...list, pc]);
  }
</script>

<div class="view-head">
  <p class="eyebrow">VECINDAD ARMÓNICA</p>
  <h2>El mapa de los vecinos</h2>
  <p class="sub">Un acorde vive entre acordes que comparten notas. Explorá los que están a uno o dos semitonos y qué acordes comunes aparecen.</p>
</div>

<section class="panel controls-panel">
  <div class="rootrow">
    {#each NOTES as n, i (i)}
      <button type="button" class="rootchip" class:on={$root === n} onclick={() => root.set(n)}>{n}</button>
    {/each}
  </div>
  <div class="qualrow">
    {#each PROX_QUALITIES as q (q)}
      <button type="button" class="qualchip" class:on={$quality === q} onclick={() => quality.set(q)}>{PROX_QUALITY_LABELS[q]}</button>
    {/each}
  </div>
  <div class="seg">
    {#each [1, 2, 3] as m (m)}
      <button type="button" class:on={$moves === m} onclick={() => moves.set(m)}>mover {m} nota{m > 1 ? 's' : ''}</button>
    {/each}
  </div>
</section>

<section class="layout">
  <section class="panel neighbors-panel">
    <p class="eyebrow">VECINOS · {$root}{$quality === 'm' ? 'm' : $quality}</p>
    <div class="neighbor-list">
      {#each neighbors.slice(0, 24) as nb (nb.name + nb.moves.map(m => m.label).join(''))}
        <div class="neighbor">
          <div class="nhead">
            <b class="mono">{nb.name}</b>
            <span class="glue">glue {nb.glue}/{nb.size}</span>
          </div>
          <div class="moves">
            {#each nb.moves as mv (mv.degree + mv.label)}
              <span class="move">{mv.degree}: {mv.label}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="panel common-panel">
    <p class="eyebrow">ACORDES CON NOTAS SELECCIONADAS</p>
    <div class="note-picker">
      {#each NOTES as n, i (i)}
        <button type="button" class="picknote" class:on={$selected.includes(i)} onclick={() => toggleNote(i)}>{n}</button>
      {/each}
    </div>
    <div class="seg mt">
      {#each [['any', 'cualquiera'], ['two', 'exactamente 2'], ['exact', 'todas']] as [id, label] (id)}
        <button type="button" class:on={$mode === id} onclick={() => mode.set(id as 'any')}>{label}</button>
      {/each}
    </div>
    <div class="common-list">
      {#each commonChords.slice(0, 30) as c (c.name + c.m)}
        <span class="common">
          <b class="mono">{c.name}</b>
          <small>{c.m} nota{c.m > 1 ? 's' : ''}</small>
        </span>
      {/each}
      {#if !commonChords.length}<p class="muted">Elegí notas para ver acordes que las contengan.</p>{/if}
    </div>
  </section>
</section>

<section class="panel frequency-panel">
  <p class="eyebrow">FRECUENCIA DE NOTAS EN EL POOL</p>
  <div class="freqs">
    {#each counts as c, i (i)}
      <div class="freq">
        <span class="freq-bar" style="height: {(c / maxCount) * 100}%"></span>
        <span class="freq-label mono">{NOTES[i]}</span>
        <span class="freq-count mono">{c}</span>
      </div>
    {/each}
  </div>
</section>

<section class="panel bridge-panel">
  <p class="eyebrow">PUENTE (GLUE TENSION)</p>
  <label class="bridge-input">
    <input class="bridge-field mono" placeholder="Ej: G7" value={$bridgeTarget} oninput={(e) => bridgeTarget.set((e.currentTarget as HTMLInputElement).value)} />
  </label>
  {#if bridge?.length}
    {#each bridge as b (b.kind)}
      <div class="bridge">
        <p class="bridge-label">{b.label}</p>
        <p class="bridge-head mono">{b.headline}</p>
        <div class="bridge-rows">
          {#each b.rows as row (row.pc)}
            <span class="brow" data-allowed={row.allowed}>
              {row.note} · {row.ext}{row.b9 ? ' · b9' : ''}{row.tri ? ' · trí' : ''}
            </span>
          {/each}
        </div>
      </div>
    {/each}
  {:else}
    <p class="muted mt">Escribí un acorde destino (ej. G7, Dm) para ver los puentes desde {$root}{$quality}.</p>
  {/if}
</section>

<style>
  .view-head { margin-bottom: 2rem; }
  .sub { color: var(--muted); max-width: 62ch; line-height: 1.55; font-size: 0.86rem; }
  .panel { padding: 20px; background: var(--panel); border: 1px solid var(--line); border-radius: 2px; }
  .controls-panel { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
  .rootrow { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .rootchip { font-family: var(--font-mono); font-size: 0.72rem; padding: 0.34rem 0.6rem; border: 1px solid var(--line); border-radius: 2px; background: transparent; color: var(--muted); cursor: pointer; }
  .rootchip.on { color: var(--accent); border-color: var(--accent); }
  .qualrow { display: flex; flex-wrap: wrap; gap: 0.3rem; }
  .qualchip { font-size: 0.72rem; padding: 0.34rem 0.6rem; border: 1px solid var(--line); border-radius: 2px; background: transparent; color: var(--muted); cursor: pointer; }
  .qualchip.on { color: var(--accent); border-color: var(--accent); }
  .seg { display: inline-flex; flex-wrap: wrap; gap: 3px; }
  .seg button { border: 1px solid var(--line); background: var(--panel-raised); color: var(--muted); font-size: 0.75rem; padding: 0.4rem 0.7rem; border-radius: 2px; cursor: pointer; }
  .seg button.on { background: var(--accent); color: var(--ink); }
  .mt { margin-top: 0.75rem; }
  .layout { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-bottom: 1rem; }
  .neighbor-list { display: flex; flex-direction: column; gap: 0.45rem; margin-top: 0.5rem; max-height: 420px; overflow-y: auto; }
  .neighbor { padding: 0.55rem 0.7rem; color: var(--ink); background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .nhead { display: flex; justify-content: space-between; align-items: baseline; }
  .nhead b { font-size: 0.9rem; color: var(--ink); }
  .glue { font-size: 0.62rem; color: var(--accent); }
  .moves { display: flex; gap: 0.35rem; flex-wrap: wrap; margin-top: 0.3rem; }
  .move { font-size: 0.62rem; color: var(--muted); font-family: var(--font-mono); }
  .note-picker { display: flex; flex-wrap: wrap; gap: 0.28rem; margin-top: 0.4rem; }
  .picknote { font-family: var(--font-mono); font-size: 0.72rem; padding: 0.32rem 0.55rem; border: 1px solid var(--line); border-radius: 2px; background: transparent; color: var(--muted); cursor: pointer; }
  .picknote.on { background: var(--accent); color: #050606; }
  .common-list { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.75rem; max-height: 320px; overflow-y: auto; }
  .common { display: flex; justify-content: space-between; align-items: baseline; padding: 0.4rem 0.6rem; color: var(--ink); background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .common b { color: var(--ink); font-size: 0.85rem; }
  .common small { font-size: 0.62rem; color: var(--muted); }
  .frequency-panel { margin-bottom: 1rem; }
  .freqs { display: flex; gap: 0.5rem; align-items: flex-end; height: 120px; margin-top: 0.75rem; }
  .freq { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; gap: 4px; }
  .freq-bar { width: 100%; max-width: 26px; border-radius: 2px 2px 0 0; background: var(--accent); }
  .freq-label { font-size: 0.62rem; color: var(--ink); }
  .freq-count { font-size: 0.56rem; color: var(--muted); }
  .bridge-input { display: block; margin-top: 0.4rem; }
  .bridge-field { font-size: 0.9rem; padding: 0.5rem 0.7rem; border: 1px solid var(--line); border-radius: 2px; background: var(--panel-raised); color: var(--ink); width: min(240px, 100%); }
  .bridge { margin-top: 0.75rem; padding: 0.75rem; color: var(--ink); background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .bridge-label { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
  .bridge-rows { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .brow { font-size: 0.68rem; font-family: var(--font-mono); padding: 0.28rem 0.5rem; border: 1px solid var(--line); border-radius: 2px; color: var(--muted); background: var(--panel-raised); }
  .brow[data-allowed="true"] { color: var(--success); border-color: color-mix(in srgb, var(--success) 45%, transparent); }
  .muted { color: var(--muted); font-size: 0.78rem; line-height: 1.5; }
  .mono { font-family: var(--font-mono); }
  .bridge .bridge-head { font-size: 0.9rem; color: var(--accent); margin: 0.3rem 0; font-family: var(--font-display); }
</style>