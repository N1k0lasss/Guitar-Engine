<script lang="ts">
  import { FRET_COUNT, type TriadShape } from '../theory/triads';

  let {
    shapes = [],
    palette = {} as Record<string, string>,
    mode = 'single' as 'single' | 'overview',
    highlight = null as string | null,
    onpick = (_id: string) => {},
  }: {
    shapes?: TriadShape[];
    palette?: Record<string, string>;
    mode?: 'single' | 'overview';
    highlight?: string | null;
    onpick?: (id: string) => void;
  } = $props();

  const F = FRET_COUNT;
  const W = 1080;
  const H = 320;
  const PAD_L = 46;
  const PAD_R = 14;
  const PAD_T = 26;
  const PAD_B = 12;

  const cellW = $derived((W - PAD_L - PAD_R) / F);
  const cellH = $derived((H - PAD_T - PAD_B) / 5);
  const clock = $derived(Math.min(cellW, cellH));

  const stringNames = $derived(['E', 'A', 'D', 'G', 'B', 'e']);
  const markerFrets = $derived([3, 5, 7, 9, 12, 15]);

  const xAt = (f: number) => PAD_L + f * cellW;
  const yAt = (s: number) => PAD_T + (5 - s) * cellH;

  const isDim = (s: TriadShape) => highlight !== null && highlight !== s.id;

  function colorOf(s: TriadShape): string {
    return palette[s.chord] || 'var(--accent)';
  }

  function triPath(s: TriadShape): string {
    const [a, b, c] = s.dots;
    return `M ${xAt(a.fret)} ${yAt(a.string)} L ${xAt(b.fret)} ${yAt(b.string)} L ${xAt(c.fret)} ${yAt(c.string)} Z`;
  }

  function dotRadius(s: TriadShape, i: number): number {
    const hl = highlight === s.id;
    const base = hl ? clock * 0.16 : clock * 0.11;
    const root = s.dots[i].role === 'root';
    return root ? base + clock * 0.035 : base;
  }

  function dotFill(s: TriadShape, i: number, color: string): string {
    const role = s.dots[i].role;
    if (mode === 'overview') return role === 'root' ? color : `color-mix(in srgb, ${color} 62%, #080909)`;
    if (role === 'root') return color;
    if (role === 'third') return `color-mix(in srgb, ${color} 46%, #080909)`;
    return '#080909';
  }

  function dotStroke(s: TriadShape, i: number, color: string): string {
    if (mode === 'overview') {
      return s.dots[i].role === 'root' ? '#e9e8e2' : color;
    }
    return color;
  }
</script>

<svg viewBox="0 0 {W} {H}" class="fboard" role="img" aria-label="Diapasón con tríadas">
  <rect x="0" y="0" width={W} height={H} rx="2" fill="#080909" />

  {#each markerFrets as f (f)}
    <circle cx={xAt(f) - cellW / 2} cy={PAD_T + cellH * 2.5} r="2.6" fill="rgba(233,232,226,.07)" />
  {/each}
  {#if [12, 15].includes(12)}
    <circle cx={xAt(12) - cellW / 2} cy={PAD_T + cellH * 3.4} r="2.3" fill="rgba(233,232,226,.07)" />
    <circle cx={xAt(15) - cellW / 2} cy={PAD_T + cellH * 1.6} r="2.3" fill="rgba(233,232,226,.07)" />
  {/if}

  {#each stringNames as _, s (s)}
    <text x={PAD_L - 12} y={yAt(s) + 4} text-anchor="end" class="sname">{stringNames[s]}</text>
    <line x1={xAt(0)} y1={yAt(s)} x2={xAt(F)} y2={yAt(s)} class="sline" />
  {/each}

  {#each Array.from({ length: F + 1 }, (_, f) => f) as f (f)}
    <line x1={xAt(f)} y1={PAD_T} x2={xAt(f)} y2={PAD_T + cellH * 5} class:nut={f === 0} class="fline" />
    {#if f > 0}
      <text x={xAt(f) - cellW / 2} y={PAD_T - 8} text-anchor="middle" class="fnum">{f}</text>
    {/if}
  {/each}

  {#each shapes as s, si (si + s.id)}
    {@const color = colorOf(s)}
    {@const dim = isDim(s)}
    {@const hl = highlight === s.id}
    <g
      class="shape-g"
      class:dim={dim}
      class:hl={hl}
      role="button"
      tabindex="0"
      aria-label={s.label}
      onclick={() => onpick(s.id)}
      onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onpick(s.id); } }}
    >
      <path d={triPath(s)} fill="none" stroke={color} stroke-width={hl ? 1.8 : 1.1} stroke-opacity={hl ? 0.95 : 0.5} />
      {#each s.dots as dot, di (dot.string + '-' + dot.fret)}
        <circle
          cx={xAt(dot.fret)}
          cy={yAt(dot.string)}
          r={dotRadius(s, di)}
          fill={dotFill(s, di, color)}
          stroke={dotStroke(s, di, color)}
          stroke-width={dot.role === 'root' && mode === 'overview' ? 1.1 : 0.9}
          class="dot"
        />
      {/each}
    </g>
  {/each}
</svg>

<style>
  .fboard { display: block; width: 100%; height: auto; background: #080909; border: 1px solid var(--line); border-radius: 2px; }
  .sname { font: 600 11px var(--font-mono); fill: var(--muted); }
  .fnum { font: 600 10px var(--font-mono); fill: var(--muted); }
  .sline { stroke: #4b4f4a; stroke-width: 1; }
  .fline { stroke: rgba(233, 232, 226, .16); stroke-width: 1; }
  .fline.nut { stroke: rgba(233, 232, 226, .55); stroke-width: 3.5; }
  .dot { cursor: pointer; }
  .shape-g { transition: opacity .18s; cursor: pointer; }
  .shape-g:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .shape-g.dim { opacity: .28; }
  .shape-g.hl { opacity: 1; }
</style>