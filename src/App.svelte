<script lang="ts">
  import { onMount } from 'svelte';
  import type { Component } from 'svelte';
  import { activeView, go, readoutOf, type ViewId } from './lib/nav';
  import { audioStatus, audioError, startAudio, stopAudio, engineSetMode } from './lib/audio/engine';
  import { registerChordFrameHandler, resetChordTracking } from './lib/audio/chordStore';
  import { registerTunerFrameHandler } from './lib/audio/tunerStore';

  const VIEW_MODULES = {
    chords: () => import('./views/ChordsView.svelte'),
    tuner: () => import('./views/TunerView.svelte'),
    harmony: () => import('./views/HarmonyView.svelte'),
    modes: () => import('./views/ModesView.svelte'),
    cartography: () => import('./views/CartographyView.svelte'),
    sabores: () => import('./views/SaboresView.svelte'),
    ejes: () => import('./views/EjesView.svelte'),
    tensions: () => import('./views/TensionsView.svelte'),
    prl: () => import('./views/PRLView.svelte'),
    tritone: () => import('./views/TritoneView.svelte'),
    proximity: () => import('./views/ProximityView.svelte'),
    circle: () => import('./views/CircleView.svelte'),
    scales: () => import('./views/ScalesView.svelte'),
    polychords: () => import('./views/PolychordsView.svelte'),
    voicings: () => import('./views/VoicingsView.svelte'),
    triads: () => import('./views/TriadsView.svelte'),
  } satisfies Record<ViewId, () => Promise<{ default: Component }>>;

  let loadedViews = $state<Partial<Record<ViewId, Component>>>({});

  $effect(() => {
    const view = $activeView;
    if (!loadedViews[view]) {
      VIEW_MODULES[view]().then(m => { loadedViews[view] = m.default; });
    }
  });

  interface NavItem { id: ViewId; label: string; }
  interface NavGroup { name: string; items: NavItem[]; }

  const GROUPS: NavGroup[] = [
    { name: 'Detectar', items: [
      { id: 'chords', label: 'Acordes' },
      { id: 'tuner', label: 'Afinador' },
    ] },
    { name: 'Explorar', items: [
      { id: 'harmony', label: 'Armonía' },
      { id: 'triads', label: 'Triadas' },
      { id: 'circle', label: 'Círculo 5tas' },
      { id: 'scales', label: 'Escalas' },
      { id: 'modes', label: 'Modos' },
      { id: 'cartography', label: 'Cartografía' },
      { id: 'sabores', label: 'Sabores' },
    ] },
    { name: 'Color', items: [
      { id: 'tensions', label: 'Tensiones' },
      { id: 'polychords', label: 'Policordios' },
      { id: 'voicings', label: 'Voicings' },
      { id: 'ejes', label: 'Ejes Bartók' },
    ] },
    { name: 'Vínculos', items: [
      { id: 'prl', label: 'P / R / L' },
      { id: 'tritone', label: 'Tritono' },
      { id: 'proximity', label: 'Vecindad' },
    ] },
  ];

  let openGroup = $state('Explorar');

  $effect(() => {
    const view = $activeView;
    document.body.dataset.mode = view;
    engineSetMode(view);
    if (view === 'chords') resetChordTracking();
  });

  onMount(() => {
    registerChordFrameHandler();
    registerTunerFrameHandler();
    engineSetMode($activeView);
  });

  function pick(id: ViewId) {
    go(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
</script>

<div class="shell">
  <header class="topbar">
    <div class="brand">
      <span class="mark">◈</span>
      <div>
        <strong>GuitarTool</strong>
        <span class="tagline">Atlas armónico</span>
      </div>
    </div>

    <p class="readout">{readoutOf($activeView)}</p>

    <div class="audio-controls">
      <span class="status" role="status" aria-live="polite">
        <i class="status-dot {$audioStatus}"></i>
        {#if $audioStatus === 'live'}Escuchando{:else if $audioStatus === 'error'}{$audioError || 'Micrófono bloqueado'}{:else}Detenido{/if}
      </span>
      {#if $audioStatus === 'live'}
        <button class="btn btn-quiet" onclick={() => stopAudio()}>Detener</button>
      {:else}
        <button class="btn btn-primary" onclick={() => startAudio()}>Activar micrófono</button>
      {/if}
    </div>
  </header>

  <div class="body">
    <nav class="sidebar">
      {#each GROUPS as group (group.name)}
        <div class="nav-group" class:open={openGroup === group.name}>
          <button class="nav-group-btn" aria-expanded={openGroup === group.name} onclick={() => openGroup = openGroup === group.name ? '' : group.name}>
            <span>{group.name}</span>
            <i class="chev">›</i>
          </button>
          <div class="nav-items">
            {#each group.items as item (item.id)}
              <button class="nav-btn" class:active={$activeView === item.id} onclick={() => pick(item.id)}>
                {item.label}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </nav>

    <main class="stage">
      {#if loadedViews.chords}{@const Cmp = loadedViews.chords}
        <div class="view-wrap" class:hidden={$activeView !== 'chords'}><Cmp /></div>
      {/if}
      {#if loadedViews.tuner}{@const Cmp = loadedViews.tuner}
        <div class="view-wrap" class:hidden={$activeView !== 'tuner'}><Cmp /></div>
      {/if}
      {#if loadedViews.harmony}{@const Cmp = loadedViews.harmony}
        <div class="view-wrap" class:hidden={$activeView !== 'harmony'}><Cmp /></div>
      {/if}
      {#if loadedViews.modes}{@const Cmp = loadedViews.modes}
        <div class="view-wrap" class:hidden={$activeView !== 'modes'}><Cmp /></div>
      {/if}
      {#if loadedViews.cartography}{@const Cmp = loadedViews.cartography}
        <div class="view-wrap" class:hidden={$activeView !== 'cartography'}><Cmp /></div>
      {/if}
      {#if loadedViews.sabores}{@const Cmp = loadedViews.sabores}
        <div class="view-wrap" class:hidden={$activeView !== 'sabores'}><Cmp /></div>
      {/if}
      {#if loadedViews.ejes}{@const Cmp = loadedViews.ejes}
        <div class="view-wrap" class:hidden={$activeView !== 'ejes'}><Cmp /></div>
      {/if}
      {#if loadedViews.tensions}{@const Cmp = loadedViews.tensions}
        <div class="view-wrap" class:hidden={$activeView !== 'tensions'}><Cmp /></div>
      {/if}
      {#if loadedViews.prl}{@const Cmp = loadedViews.prl}
        <div class="view-wrap" class:hidden={$activeView !== 'prl'}><Cmp /></div>
      {/if}
      {#if loadedViews.tritone}{@const Cmp = loadedViews.tritone}
        <div class="view-wrap" class:hidden={$activeView !== 'tritone'}><Cmp /></div>
      {/if}
      {#if loadedViews.proximity}{@const Cmp = loadedViews.proximity}
        <div class="view-wrap" class:hidden={$activeView !== 'proximity'}><Cmp /></div>
      {/if}
      {#if loadedViews.circle}{@const Cmp = loadedViews.circle}
        <div class="view-wrap" class:hidden={$activeView !== 'circle'}><Cmp /></div>
      {/if}
      {#if loadedViews.scales}{@const Cmp = loadedViews.scales}
        <div class="view-wrap" class:hidden={$activeView !== 'scales'}><Cmp /></div>
      {/if}
      {#if loadedViews.polychords}{@const Cmp = loadedViews.polychords}
        <div class="view-wrap" class:hidden={$activeView !== 'polychords'}><Cmp /></div>
      {/if}
      {#if loadedViews.voicings}{@const Cmp = loadedViews.voicings}
        <div class="view-wrap" class:hidden={$activeView !== 'voicings'}><Cmp /></div>
      {/if}
      {#if loadedViews.triads}{@const Cmp = loadedViews.triads}
        <div class="view-wrap" class:hidden={$activeView !== 'triads'}><Cmp /></div>
      {/if}
    </main>
  </div>
</div>

<style>
  .shell { height: 100vh; display: flex; flex-direction: column; overflow: hidden; }
  .topbar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: var(--sp-3);
    min-height: 44px; padding: 0 0 10px; border-bottom: 1px solid var(--line); background: transparent; }
  .brand { display: flex; align-items: center; gap: 9px; }
  .mark { display: grid; place-items: center; width: 26px; height: 26px; color: #050606;
    background: var(--ink); border-radius: 50%; font-size: 14px; }
  .brand strong { display: block; font-family: var(--font-display); font-size: 13px; font-weight: 600; letter-spacing: .2px; }
  .tagline { display: block; margin-top: 2px; font: 8px var(--font-mono); letter-spacing: 1.1px; text-transform: uppercase; color: var(--ink); }
  .readout { flex: 1; text-align: right; margin-right: 14px; font: 8px var(--font-mono); letter-spacing: 1.4px; text-transform: uppercase; color: var(--color-muted); }
  @media (max-width: 860px) { .readout { display: none; } }
  .audio-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .status { display: inline-flex; align-items: center; gap: 6px; font: 10px var(--font-mono); color: var(--color-muted); margin-right: 4px; }
  .status-dot { width: 7px; height: 7px; border-radius: 50%; background: #5e615c; }
  .status-dot.live { background: var(--success); box-shadow: 0 0 12px var(--success); }
  .status-dot.error { background: #ff695e; }
  .audio-controls .btn-quiet { color: var(--muted); background: transparent; border: 1px solid var(--line); border-radius: 2px; }
  .audio-controls .btn-quiet:hover { color: var(--accent); border-color: var(--accent); background: transparent; }
  .body { flex: 1; min-height: 0; display: grid; grid-template-columns: 190px 1fr; gap: 0 24px;
    width: min(1440px, calc(100% - 40px)); margin: 0 auto; align-items: stretch; overflow: hidden; }
  @media (max-width: 860px) { .body { grid-template-columns: 1fr; gap: 0; width: min(100% - 28px, 620px); } }
  .sidebar { align-self: stretch; display: flex; flex-direction: column; gap: 16px;
    padding: 14px 0 24px; height: 100%; overflow-y: auto; }
  @media (max-width: 860px) { .sidebar { height: auto; flex-direction: row; flex-wrap: wrap; gap: 8px; border-bottom: 1px solid var(--color-line); padding-bottom: 12px; margin-bottom: 12px; overflow: visible; } }
  .nav-group { display: flex; flex-direction: column; padding-bottom: 8px; border-bottom: 1px solid var(--color-line); }
  @media (max-width: 860px) { .nav-group { flex-direction: row; align-items: center; border-bottom: 0; padding-bottom: 0; } }
  .nav-group-btn { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%;
    padding: 4px 0 6px; background: transparent; border: 0; color: var(--color-muted); font: 10px var(--font-mono);
    text-align: left; cursor: pointer; }
  .nav-group-btn span { text-transform: uppercase; letter-spacing: 1.4px; font-size: 8px; }
  .nav-group-btn:hover { color: var(--color-ink); }
  .chev { transition: transform .2s; font-style: normal; }
  .nav-group.open .chev { transform: rotate(90deg); }
  .nav-items { display: flex; flex-direction: column; gap: 1px; padding: 4px 0 0 10px; border-left: 1px solid var(--color-line); }
  @media (max-width: 860px) {
    .nav-items { display: none; flex-direction: row; flex-wrap: wrap; border-left: 0; padding-left: 0; }
    .nav-group.open .nav-items { display: flex; padding-top: 6px; }
  }
  .nav-btn { position: relative; text-align: left; background: transparent; border: 0; color: var(--muted);
    font: 11px var(--font-mono); padding: 4px 8px; border-radius: 0; cursor: pointer; transition: color .15s; white-space: nowrap; }
  .nav-btn:hover { color: var(--color-ink); }
  .nav-btn.active { color: var(--color-ink); }
  .nav-btn.active::before { content: ''; position: absolute; left: -14px; top: 50%; width: 6px; height: 6px;
    border: 1px solid var(--accent); border-radius: 50%; transform: translateY(-50%); }
  .stage { height: 100%; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 0 0 20px; width: 100%; min-width: 0; }
  .view-wrap.hidden { display: none; }
</style>