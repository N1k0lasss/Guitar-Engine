<script lang="ts">
  import { writable } from 'svelte/store';
  import { CARTO_MODES, cartoEdges, cartoBFS, cartoLayout, cartoNote, cartoChord, cartoFlavor } from '../lib/theory/cartography';
  import { onCross } from '../lib/cross';

  const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const RING_COLORS = ['#e9e8e2', '#5bb8ff', '#4a94cc', '#3a7199', '#2e5673', '#27455c'];

  const edges = cartoEdges();
  const layout = cartoLayout(edges);

  const destino = writable(0);
  const selected = writable(0);
  const tonic = writable(0);

  onCross('cartoRoot', v => { const i = ROOT_NOTES.indexOf(v); if (i >= 0) tonic.set(i); });
  const tetrad = writable(false);
  const pinned = writable<number | null>(null);
  const hovered = writable<number | null>(null);

  $: bfs = cartoBFS(edges, $destino);
  $: focus = $hovered ?? $pinned;
  $: mode = CARTO_MODES[$selected];
  $: neighbors = edges
    .filter(([i, j]) => i === $selected || j === $selected)
    .map(([i, j]) => {
      const n = i === $selected ? j : i;
      const other = CARTO_MODES[n];
      const rem = mode.intervals.filter(pc => !other.intervals.includes(pc))[0];
      const add = other.intervals.filter(pc => !mode.intervals.includes(pc))[0];
      return { n, name: other.name, delta: `${cartoNote($tonic, rem)} → ${cartoNote($tonic, add)}` };
    });
  $: flavor = mode.charPc !== undefined ? cartoFlavor($tonic, mode.charPc) : undefined;
  $: furthest = CARTO_MODES[bfs.furthest];

  function selectNode(i: number) {
    selected.set(i);
    pinned.update(p => (p === i ? null : i));
  }

  function setDestino(i: number) {
    destino.set(i);
    selected.set(i);
    pinned.set(null);
  }

  function radius(i: number): number {
    const d = Math.max(0, bfs.dist[i]);
    return Math.min(1.6 + d * 0.5, 3.2);
  }

  function stroke(i: number): string {
    const d = Math.max(0, bfs.dist[i]);
    return d === 0 ? '#e9e8e2' : RING_COLORS[Math.min(d, RING_COLORS.length - 1)];
  }

  function edgeState(from: number, to: number): 'active' | 'dimmed' | '' {
    if (focus === null) return '';
    return focus === from || focus === to ? 'active' : 'dimmed';
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">CARTOGRAFÍA MODAL</p>
    <h2>El mapa de los 13 modos</h2>
  </div>
  <span class="signal-badge">Arista = 1 nota · Anillo = distancia</span>
</div>

<section class="panel carto-toolbar">
  <label>
    <span>Destino</span>
    <select class="sel" value={$destino} onchange={(e) => setDestino(+((e.currentTarget as HTMLSelectElement).value))}>
      {#each CARTO_MODES as m, i (m.key)}<option value={i}>{m.name}</option>{/each}
    </select>
  </label>
  <label>
    <span>Tónica</span>
    <select class="sel" value={$tonic} onchange={(e) => tonic.set(+((e.currentTarget as HTMLSelectElement).value))}>
      {#each ROOT_NOTES as n, i (n)}<option value={i}>{n}</option>{/each}
    </select>
  </label>
  <div class="field">
    <span>Voicing</span>
    <div class="seg">
      <button type="button" class:on={!$tetrad} onclick={() => tetrad.set(false)}>Tríadas</button>
      <button type="button" class:on={$tetrad} onclick={() => tetrad.set(true)}>Tétradas</button>
    </div>
  </div>
</section>

<section class="carto-layout">
  <section class="panel carto-graph-panel">
    <p class="eyebrow">GRAFO · CLIC EN UN MODO</p>
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="carto-svg">
      {#each edges as [i, j] (`${i}-${j}`)}
        {@const st = edgeState(i, j)}
        <line class="carto-edge" class:active={st === 'active'} class:dimmed={st === 'dimmed'}
          x1={layout[i].x} y1={layout[i].y} x2={layout[j].x} y2={layout[j].y}></line>
      {/each}
      {#each CARTO_MODES as m, i (m.key)}
        <g class="carto-node" class:selected={$selected === i} role="button" tabindex="0"
          onclick={() => selectNode(i)} onkeydown={(e) => { if (e.key === 'Enter') selectNode(i); }}
          onmouseenter={() => hovered.set(i)} onmouseleave={() => hovered.set(null)}>
          <circle cx={layout[i].x} cy={layout[i].y} r={radius(i)} fill={m.color} stroke={stroke(i)}
            stroke-width={$selected === i ? 0.7 : 0.45}></circle>
          <text class="carto-label" x={layout[i].x} y={layout[i].y - 2.6} text-anchor="middle">{m.name}</text>
          <text class="carto-sub" x={layout[i].x} y={layout[i].y + 3.8} text-anchor="middle">{cartoNote($tonic, 0)}{m.triad}</text>
        </g>
      {/each}
    </svg>
  </section>

  <section class="panel carto-card-panel">
    <div class="carto-card" style="--c: {mode.color}">
      <p class="eyebrow">MODO SELECCIONADO · DISTANCIA {bfs.dist[$selected]}</p>
      <h3>{mode.name} <span class="carto-chord mono">{cartoChord($tonic, mode, $tetrad)}</span></h3>
      <p class="carto-notes mono">{mode.intervals.map(pc => cartoNote($tonic, pc)).join(' · ')}</p>
      <div class="carto-facts">
        <div><small>Tensión</small><b class="mono">{cartoNote($tonic, 0)}{mode.tension}</b></div>
        <div><small>Característica</small><b>{mode.char}{mode.charPc !== undefined ? ` · ${cartoNote($tonic, mode.charPc)}` : ''}</b></div>
        {#if flavor}
          <div><small>Sabor de la nota</small><b>{cartoNote($tonic, mode.charPc!)} = {flavor}</b></div>
        {/if}
        <div>
          <small>Vecinos (1 nota)</small>
          {#if neighbors.length}
            <span class="facts-neighbors">
              {#each neighbors as nb (nb.n)}
                <span class="nb">{nb.name} <i class="mono">{nb.delta}</i></span>
              {/each}
            </span>
          {:else}
            <b>—</b>
          {/if}
        </div>
      </div>
      <p class="carto-hint">
        Distancia desde {CARTO_MODES[$destino].name} · el más lejano es <b>{furthest.name}</b> (distancia {bfs.dist[bfs.furthest]}).
        {$selected === bfs.furthest ? ' Este es el modo más distante.' : ''}
      </p>
    </div>
  </section>
</section>

<style>
  .carto-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px; margin-bottom: 22px; }
  .carto-toolbar label, .carto-toolbar .field { display: flex; flex-direction: column; gap: 6px; }
  .carto-toolbar label > span, .carto-toolbar .field > span { color: var(--muted); font: 10px var(--font-mono); text-transform: uppercase; letter-spacing: 1.4px; }

  .carto-layout { display: grid; grid-template-columns: 1.7fr 1fr; gap: 22px; align-items: start; }
  @media (max-width: 1024px) { .carto-layout { grid-template-columns: 1fr; } }
  .carto-graph-panel, .carto-card-panel { padding: 16px; }
  .carto-svg {
    width: 100%; min-height: 400px; display: block; background-color: #111312;
    border: 1px solid var(--line); border-radius: 2px;
    background-image: repeating-linear-gradient(0deg, transparent 0 23px, rgba(255,255,255,.016) 24px), repeating-linear-gradient(90deg, transparent 0 23px, rgba(255,255,255,.01) 24px);
  }
  .carto-edge { stroke: #3a3d3a; stroke-width: 0.3; transition: opacity .18s, stroke .18s; }
  .carto-edge.active { stroke: var(--accent); stroke-width: 0.55; }
  .carto-edge.dimmed { opacity: .08; }
  .carto-node { cursor: pointer; transition: opacity .15s; }
  .carto-node:hover { opacity: .75; }
  .carto-label { fill: var(--color-ink); font-size: 3px; font-family: var(--font-mono); pointer-events: none; }
  .carto-sub { fill: var(--muted); font-size: 2.6px; font-family: var(--font-mono); pointer-events: none; }

  .carto-card h3 { font-family: var(--font-display); font-weight: 600; font-size: 24px; color: var(--color-ink); margin: 0 0 10px; letter-spacing: -.5px; }
  .carto-chord { color: var(--accent); font-size: 16px; font-weight: 500; }
  .carto-notes { color: var(--muted); font-size: 12px; margin: 0 0 14px; }
  .carto-facts { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; margin-bottom: 14px; }
  .carto-facts > div { background: #121414; border: 1px solid #555954; border-radius: 2px; padding: 9px; }
  .carto-facts small { display: block; color: var(--muted); font: 10px var(--font-mono); text-transform: uppercase; margin-bottom: 5px; }
  .carto-facts b { color: var(--color-ink); font-weight: 500; font-size: 13px; }
  .facts-neighbors { display: flex; flex-direction: column; gap: 3px; }
  .nb { color: var(--color-ink); font-size: 12px; }
  .nb i { color: var(--accent); font-style: normal; font-size: 11px; }
  .carto-hint { color: var(--muted); font-size: 12px; line-height: 1.55; margin: 0; }
  .carto-hint b { color: var(--color-ink); font-weight: 500; }
  .mono { font-family: var(--font-mono); }
</style>
