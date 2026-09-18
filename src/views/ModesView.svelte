<script lang="ts">
  import { writable } from 'svelte/store';
  import { MODE_DATA, modeNote, modeScale, modeChordName, modeTensionName } from '../lib/theory/modes';
  import SegTabs from '../lib/ui/SegTabs.svelte';

  const ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

  const root = writable('C');
  const index = writable(0);
  const tetrad = writable(false);

  $: mode = MODE_DATA[$index];
  $: modeRootNote = modeNote($root, mode.offset);
  $: notes = modeScale($root, $index);
  $: chord = modeChordName($root, mode, $tetrad);
  $: tensionName = modeTensionName($root, mode);
  $: characterValue = mode.characterInterval === undefined
    ? mode.character
    : `${mode.character} · ${modeNote($root, mode.offset + mode.characterInterval)}`;

  function qualityClass(m: typeof MODE_DATA[number]): string {
    if (m.triadQuality === 'm') return 'quality-minor';
    if (m.triadQuality === 'dim') return 'quality-dim';
    return 'quality-major';
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">MODOS ILUSTRADOS</p>
    <h2>Una misma escala, siete maneras de sentirla</h2>
  </div>
  <span class="signal-badge">Color · carácter · nota guía</span>
</div>

<section class="panel modes-toolbar">
  <label>
    <span>Tonalidad base</span>
    <select class="sel" value={$root} onchange={(e) => root.set((e.currentTarget as HTMLSelectElement).value)}>
      {#each ROOT_NOTES as n (n)}<option value={n}>{n}</option>{/each}
    </select>
  </label>
  <div class="field">
    <span>Acorde</span>
    <SegTabs
      items={[{ id: 'triad', label: 'Tríada' }, { id: 'tetrad', label: 'Tétrada' }]}
      value={$tetrad ? 'tetrad' : 'triad'}
      onchange={(id) => tetrad.set(id === 'tetrad')}
      label="Tipo de acorde"
      controls="modes-panel"
    />
  </div>
</section>

<div id="modes-panel" role="tabpanel" aria-labelledby="{($tetrad ? 'tetrad' : 'triad')}-tab">
<section class="modes-layout">
  <section class="panel modes-wheel-panel">
    <div class="modes-wheel" aria-label="Selector de modos musicales">
      <div class="modes-wheel-core"><span>misma<br />escala</span></div>
      {#each MODE_DATA as m, i (m.name)}
        <button
          type="button"
          class="mode-orbit {qualityClass(m)}"
          class:selected={$index === i}
          style="--mode-angle: {i * (360 / MODE_DATA.length) - 90}deg; --mode-color: {m.color};"
          title="{m.name} en {modeNote($root, m.offset)}"
          onclick={() => index.set(i)}
        >
          <span>{m.degree}</span>
          <strong>{m.name}</strong>
          <small>{modeNote($root, m.offset)}</small>
        </button>
      {/each}
    </div>
    <div class="modes-scale-strip">
      {#each notes as note, i (i)}
        <span class:mode-tonic={i === 0}>{note}</span>
      {/each}
    </div>
  </section>

  <aside class="panel mode-detail" style="--c: {mode.color}">
    <p class="eyebrow">MODO SELECCIONADO</p>
    <h3 class="mode-name" style="color: {mode.color}">{mode.name}</h3>
    <p class="mode-chord mono">{chord}</p>
    <p class="mode-description">{mode.description}</p>
    <div class="mode-facts">
      <span><b>Grado</b><strong>{mode.degree}</strong></span>
      <span><b>Nota guía</b><strong>{characterValue}</strong></span>
      <span><b>Con tensión</b><strong>{tensionName}</strong></span>
    </div>
  </aside>
</section>
</div>

<style>
  .modes-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; margin-bottom: 12px; }
  .modes-toolbar label, .modes-toolbar .field { display: flex; flex-direction: column; gap: 4px; }
  .modes-toolbar label > span, .modes-toolbar .field > span { color: var(--muted); font: 9px var(--font-mono); text-transform: uppercase; letter-spacing: 1.2px; }

  .modes-layout { display: grid; grid-template-columns: 1.35fr .65fr; gap: 14px; align-items: stretch; }
  @media (max-width: 1024px) { .modes-layout { grid-template-columns: 1fr; } }

  .modes-wheel-panel { padding: 12px; }
  .modes-wheel { position: relative; --orbit-r: clamp(116px, 17vh, 152px); height: min(56vh, 450px); min-height: 340px; background: #111312; border: 1px solid var(--line); border-radius: 2px; overflow: hidden; }
  .modes-wheel::before {
    content: ''; position: absolute; inset: 16%;
    border: 1px solid rgba(244, 234, 214, .16); border-radius: 50%;
    box-shadow: 0 0 0 26px rgba(244, 234, 214, .025), 0 0 0 27px rgba(244, 234, 214, .1);
  }
  .modes-wheel-core {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    display: grid; place-items: center; width: 96px; height: 96px;
    color: var(--muted); border: 1px solid var(--line); border-radius: 50%;
    text-align: center; font: 9px var(--font-mono); text-transform: uppercase; letter-spacing: 1px;
    line-height: 1.45;
  }
  .mode-orbit {
    position: absolute; top: 50%; left: 50%;
    display: grid; gap: 1px; width: 94px; min-height: 62px; padding: 6px;
    color: var(--color-ink); background: #252826; border: 1px solid #626760; border-radius: 2px;
    cursor: pointer; text-align: center;
    transform: rotate(var(--mode-angle)) translateY(calc(var(--orbit-r) * -1)) rotate(calc(var(--mode-angle) * -1)) translate(-50%, -50%);
    transition: background .2s, color .2s, border-color .2s;
  }
  .mode-orbit:hover, .mode-orbit.selected { background: #181b1a; border-color: var(--mode-color); }
  .mode-orbit span { color: var(--mode-color); font: 9px var(--font-mono); }
  .mode-orbit strong { font: 700 13px var(--font-display); color: var(--color-ink); }
  .mode-orbit small { color: var(--muted); font-size: 9px; font-family: var(--font-mono); }
  .mode-orbit.selected small, .mode-orbit.selected span { color: var(--mode-color); }
  .mode-orbit.quality-minor { border-style: solid; }
  .mode-orbit.quality-dim { border-style: dashed; }

  .modes-scale-strip { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 12px; }
  .modes-scale-strip span { padding: 7px 4px; color: var(--color-ink); background: #252826; border-bottom: 2px solid #3b3e3b; font: 11px var(--font-mono); text-align: center; }
  .modes-scale-strip span.mode-tonic { color: #050606; background: var(--accent); border-color: var(--accent); }

  .mode-detail { align-self: stretch; max-height: min(56vh, 450px); overflow-y: auto; }
  .mode-name { margin: 6px 0 2px; font-family: var(--font-display); font-weight: 600; font-size: clamp(24px, 3vw, 36px); line-height: 1.05; letter-spacing: -.8px; }
  .mode-chord { margin: 0 0 12px; color: var(--muted); font: 13px var(--font-mono); }
  .mode-description { min-height: 56px; color: var(--muted); font-size: 13px; line-height: 1.5; margin: 0; }
  .mode-facts { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 16px; }
  .mode-facts span { display: grid; gap: 5px; padding: 9px; background: color-mix(in srgb, var(--c, var(--accent)) 10%, #080909); border: 1px solid color-mix(in srgb, var(--c, var(--accent)) 30%, var(--line)); border-radius: 2px; }
  .mode-facts b { color: var(--muted); font: 9px var(--font-mono); text-transform: uppercase; }
  .mode-facts strong { color: var(--color-ink); font: 600 14px var(--font-display); }
  .mono { font-family: var(--font-mono); }
</style>
