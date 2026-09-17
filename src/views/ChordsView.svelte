<script lang="ts">
  import { NOTES } from '../lib/theory/notes';
  import { chordCurrent, chordConfidence, chordHistory, chordNotesList, clearHistory } from '../lib/audio/chordStore';
  import { parseChordName, qualityFamily, qualityColor } from '../lib/theory/chords';

  $: active = $chordCurrent;
  $: parsed = active ? parseChordName(active) : null;
  $: quality = active ? qualityFamily(active) : 'major';
  $: qualityTint = qualityColor(quality);
  $: chordNotes = active ? $chordNotesList : [];
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">CAPTURA CROMÁTICA</p>
    <h2>Detector de acordes</h2>
  </div>
  <span class="signal-badge" class:live={active}>señal</span>
</div>

<section class="panel chord-stage">
  <div class="stage-rail"><span>FIG. 01</span><span>ENTRADA / OÍDO / FORMA</span></div>
  <div class="chord-layout">
    <div class="chord-reading">
      <p class="label">ACORDE / DETECTADO</p>
      <strong class="chord-name" class:lit={active}>{active || '—'}</strong>
      <p class="confidence">{$chordConfidence}</p>
    </div>

    <div class="constellation-wrap">
      <div class="constellation" data-quality={quality}>
        {#each NOTES as note, i (note)}
          {@const isRoot = parsed ? note === parsed.root : false}
          {@const isTone = chordNotes.includes(note)}
          <span
            class="constellation-note {isRoot ? `root quality-${quality}` : isTone ? 'tone' : 'quiet'}"
            style="--note-angle: {i * 30 - 90}deg"
          >{note}</span>
        {/each}
      </div>
      <p class="constellation-caption">
        {#if active}{active} · {chordNotes.join(' · ')}{:else}Esperando una señal para trazar las notas.{/if}
      </p>
    </div>
  </div>
</section>

<div class="grid-main">
  <section class="panel">
    <div class="row-head">
      <p class="eyebrow">HISTORIAL</p>
      <button class="btn btn-quiet btn-sm" onclick={() => clearHistory()}>limpiar</button>
    </div>
    <div class="chips">
      {#each $chordHistory as entry, i (entry)}
        <span
          class="chip {i === $chordHistory.length - 1 ? 'current' : ''}"
          style={qualityColor(qualityFamily(entry)) !== 'var(--q-major)' ? `color:${qualityColor(qualityFamily(entry))};border-color:${qualityColor(qualityFamily(entry))}` : ''}
        >{entry}</span>
      {/each}
      {#if !$chordHistory.length}<span class="muted">Todavía no hay acordes</span>{/if}
    </div>
  </section>

  <section class="panel">
    <p class="eyebrow">NOTAS</p>
    <p class="notes-line">{$chordNotesList.length ? $chordNotesList.join(' · ') : '—'}</p>
  </section>
</div>

<style>
  .view-head { align-items: flex-start; margin: 38px 0 25px; }
  .chord-stage { position: relative; overflow: hidden; min-height: 355px; padding: 65px 7% 30px; background: #080909; }
  .chord-stage::after {
    content: '';
    position: absolute;
    right: 13%;
    bottom: 13%;
    width: 86px;
    height: 86px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 0 22px rgba(255, 85, 124, .05), 0 0 0 44px rgba(255, 85, 124, .035);
  }
  .stage-rail { position: absolute; top: 18px; right: 20px; left: 20px; z-index: 2; display: flex; justify-content: space-between; color: var(--muted); font: 9px var(--font-mono); letter-spacing: 1.5px; }
  .chord-layout { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(250px, .75fr); align-items: center; gap: clamp(28px, 7vw, 100px); }
  .chord-reading { text-align: left; }
  .chord-reading .label { margin-bottom: 12px; color: var(--muted); }
  .chord-name {
    display: block;
    font-family: var(--font-display);
    font-size: clamp(90px, 15vw, 180px);
    font-weight: 500;
    letter-spacing: -8px;
    line-height: .95;
    color: var(--ink);
  }
  .confidence { margin: 12px 0 0; color: var(--muted); font-size: 12px; }
  .constellation-wrap { display: grid; place-items: center; align-content: center; min-width: 0; }
  .grid-main { display: grid; gap: 18px; grid-template-columns: 1.2fr .8fr; margin-top: 18px; }
  .grid-main .panel { padding: 20px; }
  .row-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .row-head .eyebrow { margin: 0; }
  .chips { display: flex; flex-wrap: wrap; gap: 8px; min-height: 116px; align-content: flex-start; }
  .btn-sm { padding: 6px 9px; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; }
  .notes-line { margin: 0; font: 13px var(--font-mono); color: var(--muted); }

  @media (max-width: 860px) {
    .chord-layout, .grid-main { grid-template-columns: 1fr; }
    .chord-stage { padding: 58px 18px 25px; }
    .chord-reading { text-align: center; }
    .constellation { width: min(68vw, 245px); }
    .constellation-note { transform: rotate(var(--note-angle)) translateY(-106px) rotate(calc(var(--note-angle) * -1)); }
  }
</style>