<script lang="ts">
  import { writable } from 'svelte/store';
  import { FIFTHS, KEY_SIGNS, circleNoteAt, keyChords } from '../lib/theory/circles';
  import { go } from '../lib/nav';
  import { sendCross } from '../lib/cross';

  const root = writable('C');
  const hovered = writable<string | null>(null);
  $: focus = $hovered ?? $root;

  const CX = 230;
  const CY = 230;
  const R = 175;
  const BULGE = 16;

  function pos(i: number) {
    const a = ((i * 30 - 90) * Math.PI) / 180;
    return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
  }

  function bulgePath(i: number, j: number) {
    const from = pos(i);
    const to = pos(j);
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const dx = mx - CX;
    const dy = my - CY;
    const len = Math.hypot(dx, dy) || 1;
    const cx = mx + (dx / len) * BULGE;
    const cy = my + (dy / len) * BULGE;
    return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
  }

  function straightPath(i: number, j: number) {
    const a = pos(i);
    const b = pos(j);
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  $: nodes = FIFTHS.map((name, i) => ({ name, i, p: pos(i) }));
  $: ring = FIFTHS.map((_, i) => ({
    from: FIFTHS[i], to: FIFTHS[(i + 1) % 12],
    d: bulgePath(i, (i + 1) % 12),
  }));
  $: rel = FIFTHS.map((_, i) => ({
    from: FIFTHS[i], to: FIFTHS[(i + 3) % 12],
    d: straightPath(i, (i + 3) % 12),
  }));

  function edgeClass(from: string, to: string): string {
    if (focus === from || focus === to) return 'active';
    return 'dimmed';
  }

  function jump(name: string) {
    sendCross({ scaleRoot: name });
    go('scales');
  }

  function openHarmony() {
    sendCross({ harmonyRoot: $root, harmonyVariant: 'major' });
    go('harmony');
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">ARMONÍA</p>
    <h2>Encuentra la tonalidad vecina</h2>
  </div>
  <span class="signal-badge">Mayor · relativa menor</span>
</div>

<section class="study-grid">
  <section class="panel circle-panel">
    <div class="circle-of-fifths" aria-label="Círculo de quintas">
      <svg class="graph" viewBox="0 0 460 460" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="circle-edge-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"></path>
          </marker>
        </defs>
        {#each ring as e (e.from)}
          <path class="edge ring" class:active={edgeClass(e.from, e.to) === 'active'} class:dimmed={edgeClass(e.from, e.to) === 'dimmed'}
            d={e.d} marker-start="url(#circle-edge-arrow)" marker-end="url(#circle-edge-arrow)"></path>
        {/each}
        {#each rel as e (e.from)}
          <path class="edge rel" class:active={edgeClass(e.from, e.to) === 'active'} class:dimmed={edgeClass(e.from, e.to) === 'dimmed'}
            d={e.d} marker-start="url(#circle-edge-arrow)" marker-end="url(#circle-edge-arrow)"></path>
        {/each}
        {#each nodes as n (n.name)}
          <g class="note" class:sel={n.name === $root} class:hovered={n.name === $hovered}
            role="button" tabindex="0"
            onclick={() => root.set(n.name)}
            onkeydown={(ev) => { if (ev.key === 'Enter') root.set(n.name); }}
            onmouseenter={() => hovered.set(n.name)}
            onmouseleave={() => hovered.set(null)}>
            <circle cx={n.p.x} cy={n.p.y} r={22}></circle>
            <text x={n.p.x} y={n.p.y + 5} text-anchor="middle">{n.name}</text>
          </g>
        {/each}
      </svg>
      <div class="circle-center"><strong>{$root}</strong></div>
    </div>
    <div class="circle-legend">
      <span class="ci-item"><i class="ci-swat ci-ring"></i><i class="ci-arrow">→</i> quinta V / IV</span>
      <span class="ci-item"><i class="ci-swat ci-rel"></i> relativa menor (+3)</span>
    </div>
    <p class="study-hint">Selecciona una tonalidad para ver sus acordes diatónicos.</p>
  </section>

  <aside class="panel detail-panel">
    <p class="eyebrow">TONALIDAD SELECCIONADA</p>
    <h3 class="key mono">{$root}</h3>
    <p class="notes-list">Relativa menor: {circleNoteAt($root, 9)}m · {KEY_SIGNS[$root]}</p>
    <div class="key-chords">
      {#each keyChords($root) as rec (rec.roman)}
        <button type="button" class="key-chord" onclick={() => jump(rec.name)}>
          <b>{rec.name}</b>
          <small>{rec.roman}</small>
        </button>
      {/each}
    </div>
    <div class="circle-actions">
      <button type="button" class="btn btn-ghost" onclick={openHarmony}>Abrir en Armonía →</button>
    </div>
  </aside>
</section>

<style>
  .study-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 22px; align-items: stretch; }
  @media (max-width: 1024px) { .study-grid { grid-template-columns: 1fr; } }

  .circle-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; min-height: 500px; padding: 20px; }
  .circle-of-fifths {
    position: relative; width: min(100%, 450px); aspect-ratio: 1;
    border: 1px solid var(--line); border-radius: 50%;
    background:
      radial-gradient(circle, transparent 0 29%, color-mix(in srgb, var(--accent) 12%, transparent) 30% 31%, transparent 32% 58%, color-mix(in srgb, var(--accent) 14%, transparent) 59% 60%, transparent 61%);
  }
  .circle-of-fifths::after {
    content: ''; position: absolute; inset: 37%;
    border: 1px solid var(--line); border-radius: 50%;
  }
  .circle-center {
    position: absolute; inset: 37%; display: grid; place-items: center;
    pointer-events: none;
  }
  .circle-center strong { font: 600 26px var(--font-display); color: var(--accent); letter-spacing: -.5px; }

  .graph { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
  .edge { fill: none; stroke: rgba(255, 255, 255, .3); stroke-width: 1; transition: opacity .18s, stroke .18s; }
  .edge.rel { stroke: var(--accent); opacity: .5; stroke-dasharray: 4 3; }
  .edge.active { stroke: var(--accent); opacity: 1; }
  .edge.rel.active { stroke-dasharray: none; }
  .edge.dimmed { opacity: .06; }

  .note { cursor: pointer; }
  .note circle { fill: #121414; stroke: #555954; stroke-width: 1; transition: fill .18s, stroke .18s; }
  .note:hover circle, .note.sel circle { fill: #181b1a; stroke: var(--accent); }
  .note text { fill: var(--color-ink); font-family: var(--font-mono); font-size: 15px; pointer-events: none; }
  .note.sel text, .note:hover text { fill: var(--accent); }

  .circle-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; color: var(--muted); font: 10px var(--font-mono); text-transform: uppercase; letter-spacing: 1.1px; }
  .ci-item { display: inline-flex; align-items: center; gap: 6px; }
  .ci-swat { display: inline-block; width: 24px; height: 0; border-top: 2px solid var(--muted); vertical-align: middle; }
  .ci-ring { transform: rotate(-14deg); }
  .ci-rel { border-top-style: dashed; border-top-color: var(--accent); }
  .ci-arrow { color: var(--muted); font-size: 9px; }
  .study-hint { color: var(--muted); font-size: 12px; line-height: 1.5; margin: 0; text-align: center; }

  .detail-panel { align-self: stretch; display: flex; flex-direction: column; }
  .key { font-family: var(--font-display); font-weight: 600; font-size: clamp(56px, 8vw, 88px); line-height: 1; letter-spacing: -2px; margin: 6px 0 12px; color: var(--accent); }
  .notes-list { color: var(--muted); font-size: 12px; margin: 0; }
  .key-chords { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 30px; }
  .key-chord {
    display: grid; gap: 4px; padding: 11px 7px; text-align: center; cursor: pointer;
    color: var(--color-ink); background: #121414; border: 1px solid #555954; border-radius: 2px;
  }
  .key-chord:hover { background: #181b1a; border-color: var(--accent); }
  .key-chord b { font: 600 13px var(--font-mono); }
  .key-chord small { color: var(--muted); font: 10px var(--font-mono); }
  .circle-actions { margin-top: auto; padding-top: 26px; }
  .mono { font-family: var(--font-mono); }
</style>
