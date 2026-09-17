<script lang="ts">
  import { writable } from 'svelte/store';
  import { NOTES, pcOf } from '../lib/theory/notes';
  import { getChordInfo } from '../lib/theory/chords';
  import { getChordVoicings } from '../lib/theory/voicings';
  import ChordDiagram from '../lib/ui/ChordDiagram.svelte';
  import {
    HARMONY_VARIANTS, harmonyKey, harmonyMode, harmonySelected, harmonyPath,
    harmonyHarmonic, harmonyDegrees, harmonyEdges, harmonyPositions, harmonyRootIdx,
    harmonChordName, harmonChordSet, harmonSharedWithTonic, harmonSignatureFor, harmonSpellPc,
    harmonDominantName, harmonSecondaryDominant, harmonDomChain, harmonTwoFiveOne, harmonPivotKeys,
    harmonDominantOptions, harmonEdgeGlue, harmonyLinePoints, harmonyEdgeKind, harmonProgQual,
    HARMONY_PROG_PALETTES, harmonyProgPalette, harmonyProgLength, harmonyProgTonic,
    harmonyProgMap, harmonyProgSeq, harmonyProgLabels, harmonyProgSummary, harmonyProgSelected,
    harmonyMyProg, harmonyMyProgSeven, harmonyMyProgSelected, harmonyMyProgSteps,
    harmonySound, harmonyStrumStyle, harmonyStrumBass, harmonyProgTempo,
    harmonyPlanForName, setHarmonyVoicing, onHarmonyGenerate,
  } from '../lib/theory/harmony';
  import { playChordPlan, playProgPlan } from '../lib/audio/playback';
  import type { HarmonyMode } from '../lib/theory/harmony';
  import { onCross, sendCross } from '../lib/cross';
  import { go } from '../lib/nav';

  const ROOT_OPTIONS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

  onCross('harmonyRoot', v => harmonyKey.update(k => ({ ...k, root: v })));
  onCross('harmonyVariant', v => { if (HARMONY_VARIANTS[v]) harmonyKey.update(k => ({ ...k, variant: v })); });

  const preview = writable<{ degree: string; chord: string; notes: string } | null>(null);
  const voicingSel = writable<string | null>(null);

  $: key = $harmonyKey;
  $: variant = HARMONY_VARIANTS[key.variant] || HARMONY_VARIANTS.major;
  $: mod = variant.mod;
  $: tonic = mod === 'min' ? 'i' : 'I';
  $: degrees = harmonyDegrees(mod, key.variant);
  $: edges = harmonyEdges(mod, key.variant);
  $: positions = harmonyPositions(mod, key.variant);
  $: rootIdx = harmonyRootIdx(key.root);
  $: sig = harmonSignatureFor(rootIdx, mod);
  $: selDef = degrees.find(d => d.degree === $harmonySelected) || degrees[0];
  $: selChord = selDef ? harmonChordName(mod, key.root, selDef) : '';
  $: selPcs = selDef ? harmonChordSet(mod, key.root, selDef) : [];
  $: selNotes = selPcs.map(pc => harmonSpellPc(pc, sig));
  $: selInfo = selChord ? getChordInfo(selChord) : null;
  $: selVoicings = selChord ? getChordVoicings(selChord) : [];
  $: voicing = selVoicings.find(v => v.id === $voicingSel) || selVoicings[0] || null;
  $: selShared = selDef ? harmonSharedWithTonic(mod, key.root, selDef) : 0;
  $: secDom = selDef ? harmonSecondaryDominant(key.root, mod, selDef) : null;
  $: domin = harmonDominantName(key.root, mod);
  $: chain = harmonDomChain(key.root, mod);
  $: tfo = harmonTwoFiveOne(key.root, key.variant);
  $: pivots = selDef ? harmonPivotKeys(key.root, selDef) : [];
  $: domOptions = selDef ? harmonDominantOptions(key.root, mod, selDef) : [];
  $: selPc = selDef ? (((rootIdx + selDef.interval) % 12) + 12) % 12 : 0;
  $: tritoneSub = harmonSpellPc((selPc + 7 - 6 + 12) % 12, sig) + '7';
  $: pathSet = new Set($harmonyPath);
  $: pathNodes = $harmonyPath.map(deg => {
    const def = degrees.find(d => d.degree === deg);
    return { deg, name: def ? harmonChordName(mod, key.root, def) : '' };
  });
  $: nexts = selDef ? edges.filter(([from]) => from === selDef.degree).map(([, to, label]) => {
    const def = degrees.find(d => d.degree === to);
    const q = harmonProgQual(mod, to, 'pop');
    const name = def ? harmonSpellPc((rootIdx + def.interval + 12) % 12, sig) + q : to;
    return { to, label, name, glue: harmonEdgeGlue(mod, key.root, selDef.degree, to) };
  }) : [];
  $: progLines = ($harmonyMode === 'prog' && $harmonyProgMap && $harmonyProgSeq.length > 1)
    ? $harmonyProgSeq.slice(1).map((step, i) => {
        const pa = positions[$harmonyProgSeq[i].degree], pb = positions[step.degree];
        if (!pa || !pb) return null;
        return harmonyLinePoints(pa, pb);
      }).filter((l): l is { x1: number; y1: number; x2: number; y2: number } => !!l)
    : [];
  $: progDetail = $harmonyProgSelected >= 0 && $harmonyProgSeq[$harmonyProgSelected]
    ? $harmonyProgSeq[$harmonyProgSelected] : null;
  $: myProgSteps = harmonyMyProgSteps(key.root, mod, $harmonyMyProgSeven);
  $: metric = selDef
    ? `${selDef.role} · comparte ${selShared} de ${mod === 'min' ? 3 : 3} notas con ${tonic} · pegamento ${selShared}/3`
    : '';

  const TABS: { id: HarmonyMode; label: string }[] = [
    { id: 'funciones', label: 'Funciones' },
    { id: 'prox', label: 'Proximidad' },
    { id: 'cadencias', label: 'Cadencias' },
    { id: 'dominantes', label: 'Dominantes' },
    { id: 'puentes', label: 'Puentes' },
    { id: 'prog', label: 'Progresiones' },
  ];

  const META: Record<HarmonyMode, { legend: { on: string; mid: string; far: string }; hint: string }> = {
    funciones: {
      legend: { on: 'saltos posibles', mid: '', far: '' },
      hint: 'Elegí un acorde para ver hacia dónde puede llevarte.',
    },
    prox: {
      legend: { on: '2/3 cerca', mid: '1 media', far: '0 lejos' },
      hint: 'El libro de Callipari: a más notas en común, más cerca (2 = casi el mismo acorde).',
    },
    cadencias: {
      legend: { on: 'hacia la tónica = cierre', mid: '', far: '' },
      hint: 'Perfecta (V→I), plagal (IV→I), amarga (4→4m→1) y sensible (vii°→I): los finales que cierran.',
    },
    dominantes: {
      legend: { on: 'cada acorde tiene su dominante', mid: '', far: '' },
      hint: 'Toda dominante que no sea la del I es secundaria. Cualquier acorde puede ser alcanzado por "su" V7.',
    },
    puentes: {
      legend: { on: 'el acorde elegido como pivote', mid: '', far: '' },
      hint: 'Cada tríada existe en pocas tonalidades: usala como puente para cruzar sin forzar.',
    },
    prog: {
      legend: { on: 'la línea marca el orden generado', mid: '', far: '' },
      hint: 'Generá una progresión por estilo: cada paso se etiqueta con el tipo de enlace.',
    },
  };
  $: meta = META[$harmonyMode];

  function spell(pc: number): string {
    return harmonSpellPc(pc, sig);
  }

  function displayRoot(root: string): string {
    const pc = NOTES.indexOf(root as never);
    return ROOT_OPTIONS[pc] ?? root;
  }

  function setRoot(display: string) {
    const pc = pcOf(display);
    harmonyKey.update(k => ({ ...k, root: pc < 0 ? k.root : NOTES[pc] }));
    resetForScale();
  }

  function setVariant(id: string) {
    harmonyKey.update(k => ({ ...k, variant: id }));
    resetForScale();
  }

  function resetForScale() {
    const m = (HARMONY_VARIANTS[$harmonyKey.variant] || HARMONY_VARIANTS.major).mod;
    const t = m === 'min' ? 'i' : 'I';
    harmonySelected.set(t);
    harmonyPath.set([t]);
    voicingSel.set(null);
    if ($harmonyMode === 'prog') onHarmonyGenerate($harmonyKey.root, m);
  }

  function selectDegree(degree: string) {
    harmonySelected.set(degree);
    harmonyPath.update(p => {
      if (p[p.length - 1] === degree) return p;
      const next = [...p, degree];
      return next.length > 6 ? next.slice(next.length - 6) : next;
    });
  }

  function clearPath() {
    harmonySelected.set(tonic);
    harmonyPath.set([tonic]);
  }

  function line(from: string, to: string) {
    const pa = positions[from] || [50, 50];
    const pb = positions[to] || [50, 50];
    return harmonyLinePoints(pa, pb);
  }

  function edgeActive(from: string, to: string): boolean {
    if ($harmonyMode === 'cadencias') return to === tonic;
    if ($harmonyMode === 'dominantes') return ['ii', 'V', 'iv', 'v', 'ii°', 'vii°'].includes(from);
    if ($harmonyMode === 'prox') return from === selDef?.degree || to === selDef?.degree;
    if ($harmonyMode === 'prog') return false;
    return pathSet.has(from) || pathSet.has(to);
  }

  function hear(name: string) {
    playChordPlan(harmonyPlanForName(name), $harmonySound as 'synth' | 'pluck');
  }

  function hearCadence(names: string[]) {
    playProgPlan(names.filter(Boolean).map(n => harmonyPlanForName(n)), $harmonyProgTempo);
  }

  function hearMotion(motion: string[]) {
    playProgPlan(motion.map(n => harmonyPlanForName(n)), $harmonyProgTempo);
  }

  function hearProg() {
    playProgPlan($harmonyProgSeq.map(s => harmonyPlanForName(s.name)), $harmonyProgTempo);
  }

  function hearMyProg() {
    playProgPlan(myProgSteps.map(s => harmonyPlanForName(s.name)), $harmonyProgTempo);
  }

  function toggleMyProg(deg: string) {
    harmonyMyProg.update(list => list.includes(deg) ? list.filter(x => x !== deg) : [...list, deg]);
  }

  function pickVoicing(id: string) {
    voicingSel.set(id);
    if (selChord) setHarmonyVoicing(selChord, id);
  }

  function goToKey(rootPc: number, modKey: 'maj' | 'min') {
    harmonyKey.set({ root: NOTES[rootPc], mod: modKey, variant: modKey === 'min' ? 'natural' : 'major' });
    resetForScale();
  }

  function toTensions() {
    sendCross({ tensionRoot: key.root, tensionQuality: mod === 'min' ? 'm7' : 'maj7' });
    go('tensions');
  }

  function toVoicings() {
    const q = selDef?.quality === 'm' ? 'm7' : selDef?.quality === 'dim' ? 'm7' : selDef?.quality === '' ? 'maj7' : 'maj7';
    sendCross({ voicingRoot: key.root, voicingQuality: q });
    go('voicings');
  }

  function toTritone() {
    const from = secDom ? NOTES[pcOf(secDom.root)] ?? secDom.root : key.root;
    sendCross({ tritoneRoot: from });
    go('tritone');
  }
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">ARMONÍA ILUSTRADA</p>
    <h2>Seguí las conexiones entre acordes</h2>
  </div>
  <span class="signal-badge">Mapa · {variant.label}</span>
</div>

<section class="panel toolbar">
  <label class="field">
    <span>Tonalidad</span>
    <select class="sel" value={displayRoot(key.root)} onchange={(e) => setRoot((e.currentTarget as HTMLSelectElement).value)}>
      {#each ROOT_OPTIONS as r (r)}<option value={r}>{r}</option>{/each}
    </select>
  </label>
  <label class="field">
    <span>Escala</span>
    <select class="sel" value={key.variant} onchange={(e) => setVariant((e.currentTarget as HTMLSelectElement).value)}>
      {#each Object.entries(HARMONY_VARIANTS) as [id, v] (id)}<option value={id}>{v.label}</option>{/each}
    </select>
  </label>
  <div class="field view-seg">
    <span>Vista</span>
    <div class="seg">
      {#each TABS as tab (tab.id)}
        <button type="button" class:on={$harmonyMode === tab.id} onclick={() => harmonyMode.set(tab.id)}>{tab.label}</button>
      {/each}
    </div>
  </div>
  <button class="btn btn-ghost btn-sm clear" onclick={clearPath}>Limpiar recorrido</button>
</section>

{#if $harmonyMode === 'prog'}
  <section class="panel prog-controls">
    <div class="prog-row">
      <label class="field">
        <span>Estilo</span>
        <select class="sel" value={$harmonyProgPalette} onchange={(e) => { harmonyProgPalette.set((e.currentTarget as HTMLSelectElement).value); if (key.root) onHarmonyGenerate(key.root, mod); }}>
          {#each Object.entries(HARMONY_PROG_PALETTES) as [id, p] (id)}<option value={id}>{p.label}</option>{/each}
        </select>
      </label>
      <label class="field">
        <span>Pasos</span>
        <select class="sel" value={$harmonyProgLength} onchange={(e) => { harmonyProgLength.set(+((e.currentTarget as HTMLSelectElement).value)); onHarmonyGenerate(key.root, mod); }}>
          {#each [4, 6, 8, 12, 16] as n (n)}<option value={n}>{n}</option>{/each}
        </select>
      </label>
      <label class="check-inline">
        <input type="checkbox" checked={$harmonyProgTonic} onchange={(e) => harmonyProgTonic.set((e.currentTarget as HTMLInputElement).checked)} />
        terminar en tónica
      </label>
      <label class="check-inline">
        <input type="checkbox" checked={$harmonyProgMap} onchange={(e) => harmonyProgMap.set((e.currentTarget as HTMLInputElement).checked)} />
        marcar en el mapa
      </label>
      <label class="field">
        <span>Tempo</span>
        <input class="ctl" type="number" min="40" max="200" step="2" value={$harmonyProgTempo} onchange={(e) => harmonyProgTempo.set(+((e.currentTarget as HTMLInputElement).value))} />
      </label>
      <button class="btn btn-ghost btn-sm" onclick={() => onHarmonyGenerate(key.root, mod)}>Generar</button>
      {#if $harmonyProgSeq.length}
        <button class="btn btn-ghost btn-sm" onclick={hearProg}>▶ Tocar progresión</button>
      {/if}
    </div>
  </section>

  <section class="panel myprog">
    <div class="row-head">
      <p class="eyebrow">TU PROGRESIÓN</p>
      <div class="row-actions">
        <label class="check-inline">
          <input type="checkbox" checked={$harmonyMyProgSeven} onchange={(e) => harmonyMyProgSeven.set((e.currentTarget as HTMLInputElement).checked)} />
          7as
        </label>
        {#if myProgSteps.length}
          <button class="btn btn-ghost btn-sm" onclick={hearMyProg}>▶ Tocar</button>
        {/if}
        <button class="btn btn-quiet btn-sm" onclick={() => { harmonyMyProg.set([]); harmonyMyProgSelected.set(-1); }}>Vaciar</button>
      </div>
    </div>
    <div class="chip-row">
      {#each degrees as d (d.degree)}
        <button type="button" class="chip" class:on={$harmonyMyProg.includes(d.degree)} onclick={() => toggleMyProg(d.degree)}>
          {d.degree} · {harmonChordName(mod, key.root, d)}
        </button>
      {/each}
    </div>
    <p class="hint">Tocá un grado para sumarlo a tu recorrido; el orden define la progresión.</p>
    {#if myProgSteps.length}
      <div class="prog-chain mt">
        {#each myProgSteps as step, i (i + step.name)}
          <div class="prog-node" class:selected={$harmonyMyProgSelected === i} role="button" tabindex="0"
            onclick={() => harmonyMyProgSelected.set(i)} onkeydown={(e) => { if (e.key === 'Enter') harmonyMyProgSelected.set(i); }}>
            <small class="degree mono">{step.degree}</small>
            <b class="mono">{step.name}</b>
          </div>
        {/each}
      </div>
    {/if}
  </section>
{/if}

  <section class="layout">
    <section class="panel map-panel">
      <div class="map-wrap">
        <svg viewBox="0 0 100 100" class="map" preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="harmony-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse">
              <path fill="context-stroke" d="M 0 0 L 10 5 L 0 10 z"></path>
            </marker>
          </defs>
          {#each edges as [from, to, label] (`${from}-${to}-${label}`)}
            {@const l = line(from, to)}
            <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} marker-end="url(#harmony-arrow)"
              class="edge edge-{harmonyEdgeKind(label)}" class:glue2={harmonEdgeGlue(mod, key.root, from, to) === 2}
              class:active={edgeActive(from, to)} class:muted={!edgeActive(from, to)} />
          {/each}
          {#if $harmonyMode === 'prog'}
            {#each progLines as l, i (i)}
              <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} class="prog-line" marker-end="url(#harmony-arrow)" />
            {/each}
          {/if}
          {#each degrees as d (d.degree)}
            {@const p = positions[d.degree] || [50, 50]}
            {@const isSel = d.degree === $harmonySelected}
            {@const isTonic = d.degree === tonic}
            {@const shared = harmonSharedWithTonic(mod, key.root, d)}
            <g class="node" class:sel={isSel} class:borrowed={d.origin === 'borrowed'}
              class:prox-2={shared === 2} class:prox-1={shared === 1} class:prox-0={shared === 0}
              role="button" tabindex="0" onclick={() => selectDegree(d.degree)}
              onkeydown={(e) => { if (e.key === 'Enter') selectDegree(d.degree); }}
              onmouseenter={() => preview.set({ degree: d.degree, chord: harmonChordName(mod, key.root, d), notes: harmonChordSet(mod, key.root, d).map(pc => spell(pc)).join(' · ') })}
              onmouseleave={() => preview.set(null)}>
              <circle cx={p[0]} cy={p[1]} r={isSel ? 6 : 5.4} />
              <text x={p[0]} y={p[1] - 0.4} text-anchor="middle" font-size="2.9" class="deg">{d.degree}</text>
              <text x={p[0]} y={p[1] + 3} text-anchor="middle" font-size="1.9" class="chord">{harmonChordName(mod, key.root, d)}</text>
              {#if $harmonyMode === 'prox'}
                <text x={p[0]} y={p[1] - 4} text-anchor="middle" font-size="1.7" class="prox-badge">{shared}/3</text>
              {/if}
              {#if $harmonyMode === 'cadencias' && mod === 'min' && $harmonyHarmonic && d.degree === 'v'}
                <text x={p[0]} y={p[1] + 5} text-anchor="middle" font-size="1.6" class="harm-note">V7 {domin}</text>
              {/if}
            </g>
          {/each}
        </svg>
        {#if $preview}
          {@const p = positions[$preview.degree] || [50, 50]}
          <div class="preview show" style="left: {p[0]}%; top: {p[1]}%;">
            <b>{$preview.degree} · {$preview.chord}</b>
            <span>{$preview.notes}</span>
          </div>
        {/if}
      </div>
      <div class="legend">
        <i class="dot on"></i> {meta.legend.on}
        {#if meta.legend.mid}<i class="dot mid"></i> {meta.legend.mid}{/if}
        {#if meta.legend.far}<i class="dot far"></i> {meta.legend.far}{/if}
      </div>
      <p class="hint">{meta.hint}</p>
    </section>

    <aside class="panel detail-panel">
      <p class="eyebrow">CONEXIÓN SELECCIONADA</p>
      <h3 class="big mono">{selDef?.degree} · {selChord}</h3>
      <p class="desc">{selDef?.description}</p>

      <div class="cross-nav">
        <button class="btn btn-ghost btn-sm" onclick={toTensions}>Ver en Tensiones →</button>
        <button class="btn btn-ghost btn-sm" onclick={toVoicings}>Ver voicings →</button>
      </div>

      <p class="metric muted">{metric}</p>

      <p class="label mt">RECORRIDO</p>
      <div class="path">
        {#each pathNodes as node, i (i + node.deg)}
          <button type="button" class="path-chip mono" class:on={node.deg === $harmonySelected} onclick={() => selectDegree(node.deg)}>{node.deg} · {node.name}</button>
          {#if i < pathNodes.length - 1}<b class="arrow">→</b>{/if}
        {/each}
      </div>

      <div class="play-row">
        {#if voicing}
          <ChordDiagram frets={voicing.frets} tones={voicing.tones} quality={selDef?.quality ?? ''} />
        {:else if selInfo}
          <ChordDiagram frets={selInfo.fingering.frets} tones={selInfo.notes} quality={selDef?.quality ?? ''} />
        {/if}
        <button class="btn btn-primary btn-sm" onclick={() => hear(selChord)}>▶ Escuchar</button>
      </div>
      <p class="selected-notes mono">Notas · {selNotes.join(' · ')}</p>

      {#if selVoicings.length > 1}
        <div class="chip-row">
          {#each selVoicings as v (v.id)}
            <button type="button" class="chip" class:on={voicing?.id === v.id} onclick={() => pickVoicing(v.id)} title={v.label}>{v.label}</button>
          {/each}
        </div>
      {/if}

      <div class="timbre">
        <label class="field">
          <span>Sonido</span>
          <select class="sel" value={$harmonySound} onchange={(e) => harmonySound.set((e.currentTarget as HTMLSelectElement).value)}>
            <option value="synth">Synth</option>
            <option value="pluck">Cuerda (K-S)</option>
          </select>
        </label>
        <label class="field">
          <span>Rasgueo</span>
          <select class="sel" value={$harmonyStrumStyle} onchange={(e) => harmonyStrumStyle.set((e.currentTarget as HTMLSelectElement).value)}>
            <option value="arpeggio">Arpegiado</option>
            <option value="block">Bloque</option>
          </select>
        </label>
        <label class="check-inline">
          <input type="checkbox" checked={$harmonyStrumBass} onchange={(e) => harmonyStrumBass.set((e.currentTarget as HTMLInputElement).checked)} />
          bajo de raíz
        </label>
      </div>

      {#if $harmonyMode !== 'prog'}
      <div class="nexts">
        <p class="label mt">PUEDE SEGUIR CON</p>
        <div class="next-list">
          {#each nexts as n (n.to)}
            <button type="button" class="next" onclick={() => selectDegree(n.to)}>
              {n.name}<small>{n.label} · pegamento {n.glue}/3</small>
            </button>
          {/each}
          {#if secDom}
            <button type="button" class="next" onclick={() => hear(secDom.name)}>
              <b>{secDom.name}</b><small>V de {selDef?.degree} (secundaria)</small>
            </button>
          {/if}
        </div>
      </div>
      {/if}

      {#if $harmonyMode === 'dominantes'}
        <div class="dom-panel">
          <p class="label mt">CADENA DE DOMINANTES</p>
          <div class="chain">
            {#each chain as c, i (i + c)}
              <button type="button" class="chain-link mono" onclick={() => hear(c)}>{c}</button>
              {#if i < chain.length - 1}<b class="arrow">→</b>{/if}
            {/each}
          </div>
          <p class="label mt">2-5-1</p>
          <div class="two-five">
            <button class="btn btn-ghost btn-sm" onclick={() => hearCadence(tfo.major)}>Ver mayor</button>
            <span class="mono">{tfo.major.join(' → ')}</span>
          </div>
          <div class="two-five">
            <button class="btn btn-ghost btn-sm" onclick={() => hearCadence(tfo.minor)}>Ver menor</button>
            <span class="mono">{tfo.minor.join(' → ')}</span>
          </div>
          <p class="label mt">SUSTITUTO TRITONAL</p>
          <div class="dom-sub mono">{secDom?.name} <b>⇄</b> {tritoneSub} <b>·</b> mismo tritono</div>
          <div class="dom-opts">
            {#each domOptions as o, i (i)}
              <button type="button" class="dom-opt" onclick={() => hearMotion(o.motion)}>
                <b>{o.label}</b><small>{o.note}</small>
              </button>
            {/each}
          </div>
          <button class="btn btn-ghost btn-sm mt" onclick={toTritone}>Ver en Tritono →</button>
        </div>
      {/if}

      {#if $harmonyMode === 'cadencias' && mod === 'min'}
        <label class="check-inline mt">
          <input type="checkbox" checked={$harmonyHarmonic} onchange={(e) => harmonyHarmonic.set((e.currentTarget as HTMLInputElement).checked)} />
          sumar la menor armónica (V7 con sensible)
        </label>
      {/if}

      {#if $harmonyMode === 'puentes'}
        <div class="bridges">
          <p class="label mt">PUENTES · {selChord} es pivote en</p>
          {#each pivots as p (p.modKey + p.rootPc)}
            <div class="bridge-card">
              <div class="bridge-head">
                <span class="bridge-key">{p.rootName} {p.modKey === 'min' ? 'menor' : 'mayor'}</span>
                <small>grado {p.role}</small>
                <button type="button" class="btn btn-ghost btn-xs" onclick={() => goToKey(p.rootPc, p.modKey)}>Ir a {p.rootName} →</button>
              </div>
              <div class="bridge-chords">
                {#each p.chords as c, i (i)}
                  <span class="bridge-chord mono" class:pivot={i === (['I', 'i', 'ii', 'ii°', 'iii', 'III', 'IV', 'iv', 'V', 'v', 'vi', 'VI', 'vii°', 'VII', 'bVII'].indexOf(p.role))}>{c}</span>
                {/each}
              </div>
            </div>
          {/each}
          <p class="hint">El acorde pivote vive en varias tonalidades: por eso sirve para modular sin forzar.</p>
        </div>
      {/if}
    </aside>
  </section>

{#if $harmonyMode === 'prog' && $harmonyProgSeq.length}
  <section class="panel">
    <p class="eyebrow">PROGRESIÓN GENERADA</p>
    <div class="prog-chain">
      {#each $harmonyProgSeq as step, i (i + step.name)}
        <div class="prog-node" class:selected={$harmonyProgSelected === i} role="button" tabindex="0"
          onclick={() => harmonyProgSelected.set(i)} onkeydown={(e) => { if (e.key === 'Enter') harmonyProgSelected.set(i); }}>
          <small class="degree mono">{step.degree}</small>
          <b class="mono">{step.name}</b>
          {#if $harmonyProgLabels[i]}<span class="step-label">{$harmonyProgLabels[i]}</span>{/if}
        </div>
      {/each}
    </div>
    {#if progDetail}
      <div class="prog-detail">
        <b class="mono">{progDetail.name}</b>
        <span>grado {progDetail.degree} · {progDetail.origin === 'borrowed' ? 'préstamo' : 'diatónico'}</span>
        <span class="mono">notas · {progDetail.notes.map(pc => spell(pc)).join(' · ')}</span>
      </div>
    {/if}
    {#if $harmonyProgSummary.length}
      <div class="summary">
        {#each $harmonyProgSummary as s (s)}<span class="summary-chip">{s}</span>{/each}
      </div>
    {/if}
  </section>
{/if}

<style>
  .toolbar { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; margin-bottom: 22px; }
  .toolbar .field { min-width: 130px; }
  .view-seg { flex: 1 1 100%; }
  .clear { margin-left: auto; }
  .btn-sm { padding: 7px 11px; font-size: 11px; }
  .btn-xs { padding: 3px 7px; font-size: 10px; }
  .mt { margin-top: 16px; }
  .mono { font-family: var(--font-mono); }

  .prog-controls { margin-bottom: 22px; }
  .prog-row { display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end; }
  .myprog { margin-bottom: 22px; }
  .row-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
  .row-head .eyebrow { margin: 0; }
  .row-actions { display: flex; align-items: center; gap: 10px; }
  .chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }

  .layout { display: grid; grid-template-columns: 1.35fr .65fr; gap: 22px; align-items: start; margin-bottom: 22px; }
  @media (max-width: 1024px) { .layout { grid-template-columns: 1fr; } }

  .map-panel { padding: 16px; }
  .map-wrap { position: relative; }
  .map {
    display: block; width: 100%; min-height: 430px;
    background-color: #080909;
    background-image:
      repeating-linear-gradient(0deg, transparent 0 23px, rgba(255,255,255,.016) 24px),
      repeating-linear-gradient(90deg, transparent 0 23px, rgba(255,255,255,.01) 24px);
    border: 1px solid var(--line);
    border-radius: 2px;
  }
  .preview {
    position: absolute; transform: translate(-50%, -125%);
    display: none; flex-direction: column; gap: 2px;
    padding: 7px 10px; max-width: 200px;
    background: #181b1a; border: 1px solid var(--accent); border-radius: 2px;
    pointer-events: none; z-index: 3;
  }
  .preview.show { display: flex; }
  .preview b { font: 600 11px var(--font-mono); color: var(--ink); }
  .preview span { font: 10px var(--font-mono); color: var(--accent); }

  .edge { stroke: rgba(255,255,255,.35); stroke-width: .35; stroke-dasharray: 1.2 1.5; overflow: visible; }
  .edge.active { stroke: var(--accent); stroke-dasharray: none; opacity: 1; stroke-width: .55; }
  .edge.muted { opacity: .28; }
  .edge.edge-cadence.active { stroke: var(--q-dim, var(--accent)); }
  .edge.glue2 { stroke-width: .5; }
  .prog-line { stroke: var(--accent); stroke-width: .5; opacity: .9; }

  .map :global(g.node) { cursor: pointer; }
  .map :global(g.node circle) { fill: #121414; stroke: #555954; stroke-width: .5; transition: fill .2s, stroke .2s; }
  .map :global(g.node:hover circle), .map :global(g.node.sel circle) { fill: #181b1a; stroke: var(--accent); }
  .map :global(g.node .deg) { fill: var(--accent); font-family: var(--font-mono); font-weight: 500; }
  .map :global(g.node .chord) { fill: var(--color-ink); font-family: var(--font-display); font-weight: 600; }
  .map :global(g.node.borrowed circle) { stroke-dasharray: 1.4 1.2; }
  .map :global(g.node.prox-2 circle) { stroke: var(--accent); }
  .map :global(g.node.prox-1 circle) { stroke: var(--muted); }
  .map :global(g.node.prox-0 circle) { stroke: var(--line); opacity: .7; }
  .map :global(g.node .prox-badge) { fill: var(--accent); font-family: var(--font-mono); }
  .map :global(g.node .harm-note) { fill: var(--accent); font-family: var(--font-mono); }

  .legend { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; font: 10px var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1.2px; }
  .legend .dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .legend .dot.mid { background: var(--muted); }
  .legend .dot.far { background: var(--line); }
  .hint { margin-top: 10px; color: var(--muted); font-size: 12px; line-height: 1.5; }

  .detail-panel .eyebrow { margin-bottom: 6px; }
  .big {
    font-family: var(--font-display);
    font-size: clamp(28px, 3.4vw, 40px);
    font-weight: 600; letter-spacing: -1.2px; line-height: 1.05;
    margin: 4px 0 10px;
  }
  .desc { color: var(--muted); font-size: 13px; line-height: 1.55; margin: 0; }
  .cross-nav { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .metric { font-size: 12px; line-height: 1.55; margin: 12px 0 0; }
  .path { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin-top: 8px; }
  .path-chip { font-size: 11px; padding: 5px 8px; background: #121414; border: 1px solid #555954; border-radius: 2px; color: var(--color-ink); cursor: pointer; }
  .path-chip:hover { border-color: var(--accent); }
  .path-chip.on { border-color: var(--accent); background: #181b1a; color: var(--accent); }
  .arrow { color: var(--muted); font-size: 11px; }

  .play-row { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 16px; }
  .selected-notes { font-size: 11px; color: var(--muted); margin: 10px 0 0; }
  .timbre { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; margin-top: 16px; }

  .nexts { margin-top: 6px; }
  .next-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .next {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    padding: 8px 11px; background: #121414; border: 1px solid #555954; border-radius: 2px;
    color: var(--color-ink); cursor: pointer; text-align: left;
  }
  .next:hover { border-color: var(--accent); background: #181b1a; }
  .next b { font: 600 13px var(--font-mono); }
  .next small { font: 10px var(--font-mono); color: var(--muted); }

  .dom-panel { margin-top: 8px; }
  .chain { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 8px; }
  .chain-link { padding: 7px 11px; background: #121414; border: 1px solid #555954; border-radius: 2px; color: var(--color-ink); cursor: pointer; font-size: 12px; }
  .chain-link:hover { border-color: var(--accent); }
  .two-five { display: flex; align-items: center; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
  .two-five .mono { font-size: 12px; color: var(--color-ink); }
  .dom-sub { margin-top: 8px; font-size: 13px; color: var(--color-ink); }
  .dom-sub b { color: var(--accent); }
  .dom-opts { display: flex; flex-direction: column; gap: 6px; margin-top: 10px; }
  .dom-opt {
    display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
    padding: 8px 10px; background: #121414; border: 1px solid #555954; border-radius: 2px;
    color: var(--color-ink); cursor: pointer; text-align: left;
  }
  .dom-opt:hover { border-color: var(--accent); }
  .dom-opt b { font: 600 12px var(--font-mono); }
  .dom-opt small { font: 10px var(--font-mono); color: var(--muted); }

  .bridges { margin-top: 8px; }
  .bridge-card { padding: 12px; background: #121414; border: 1px solid #555954; border-radius: 2px; margin-top: 10px; }
  .bridge-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .bridge-key { font: 600 12px var(--font-mono); color: var(--color-ink); }
  .bridge-head small { font: 10px var(--font-mono); color: var(--muted); }
  .bridge-chords { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
  .bridge-chord { font-size: 11px; padding: 4px 8px; background: var(--panel-raised); border: 1px solid var(--line); border-radius: 2px; color: var(--muted); }
  .bridge-chord.pivot { color: var(--accent); border-color: var(--accent); }

  .prog-chain { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .prog-node {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    padding: 10px 12px 12px; min-width: 80px;
    background: #121414; border: 1px solid #555954; border-radius: 2px; cursor: pointer;
  }
  .prog-node:hover { border-color: var(--accent); }
  .prog-node.selected { background: #181b1a; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(91, 184, 255, .12); }
  .prog-node b { font: 700 14px var(--font-mono); color: var(--color-ink); }
  .prog-node .degree { font-size: 10px; color: var(--accent); }
  .step-label { font: 10px var(--font-mono); color: var(--accent); margin-top: 2px; text-align: center; }
  .prog-detail { display: flex; flex-wrap: wrap; gap: 14px; align-items: baseline; margin-top: 14px; padding: 10px 12px; background: #121414; border: 1px solid #555954; border-radius: 2px; }
  .prog-detail b { font-size: 14px; color: var(--color-ink); }
  .prog-detail span { font-size: 11px; color: var(--muted); }
  .summary { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .summary-chip {
    font: 600 9px var(--font-mono); text-transform: uppercase; letter-spacing: .6px;
    padding: 4px 8px; background: #121414;
    border: 1px solid color-mix(in srgb, var(--accent) 45%, var(--line));
    border-radius: 2px; color: var(--accent);
  }
</style>
