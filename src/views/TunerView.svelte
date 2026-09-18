<script lang="ts">
  import { tunerFrame } from '../lib/audio/tunerStore';

  const TUNING = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];

  let active = $derived($tunerFrame.active);
  let note = $derived(active ? $tunerFrame.note : '--');
  let freqText = $derived(active ? `${$tunerFrame.freq.toFixed(1)} Hz (${$tunerFrame.cents > 0 ? '+' : ''}${$tunerFrame.cents.toFixed(0)} cents)` : '');
  let needleLeft = $derived(active ? 50 + $tunerFrame.clamped : 50);
  let needleColor = $derived(!active || $tunerFrame.tuned ? '#4caf50' : '#e74c3c');
  let hint = $derived(
    !active
      ? 'Tocá una cuerda al aire'
      : $tunerFrame.tuned
        ? '✓ Afinado'
        : $tunerFrame.cents < 0
          ? 'Grave, subí un poco'
          : 'Agudo, bajá un poco'
  );
</script>

<div class="view-head">
  <div>
    <p class="eyebrow">AFINACIÓN ESTÁNDAR</p>
    <h2>Deja cada cuerda en su sitio</h2>
  </div>
</div>

<section class="tuner-stage">
  <p class="label">LISTEN / REPEAT / NOTICE</p>
  <div class="tuner-note">{note}</div>
  <div class="tuner-freq">{freqText}</div>
  <div
    class="meter"
    role="meter"
    aria-label="Desviación de la afinación de {$tunerFrame.note}"
    aria-valuemin="-50"
    aria-valuemax="50"
    aria-valuenow="{Math.round(active ? $tunerFrame.clamped : 0)}"
    aria-valuetext="{active ? (($tunerFrame.tuned ? 'afinado' : ($tunerFrame.cents < 0 ? 'grave' : 'agudo')) + ', ' + Math.round($tunerFrame.cents) + ' cent') : 'sin señal'}"
  >
    <span class="meter-zone" aria-hidden="true"></span>
    <span class="meter-mark mark-left" aria-hidden="true">♭</span>
    <span class="meter-mark mark-center" aria-hidden="true">0</span>
    <span class="meter-mark mark-right" aria-hidden="true">♯</span>
    <div class="meter-needle" aria-hidden="true" style="left: {needleLeft}%; background: {needleColor}"></div>
    <div class="meter-center" aria-hidden="true"></div>
  </div>
  <p class="tuner-hint">{hint}</p>
</section>

<div class="tuning-strip">
  {#each TUNING as s (s)}<span>{s}</span>{/each}
</div>

<style>
  .view-head { align-items: flex-start; margin: 12px 0 14px; }

  .tuner-stage {
    position: relative;
    overflow: hidden;
    min-height: min(46vh, 360px);
    padding: 26px 6% 20px;
    text-align: center;
    background: #080909;
    border: 1px solid var(--line);
    border-radius: 2px;
  }
  .tuner-stage::after {
    content: '';
    position: absolute;
    right: 13%;
    bottom: 13%;
    width: 64px;
    height: 64px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 0 18px rgba(255, 85, 124, .05), 0 0 0 34px rgba(255, 85, 124, .035);
  }
  .tuner-stage .label { position: absolute; top: 10px; left: 16px; margin: 0; color: var(--muted); font-size: 9px; letter-spacing: 1.5px; }

  .tuner-note {
    position: relative;
    z-index: 1;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(52px, 9vw, 104px);
    letter-spacing: -4px;
    line-height: 1;
  }
  .tuner-freq {
    position: relative;
    z-index: 1;
    min-height: 17px;
    margin: 8px 0 22px;
    color: var(--muted);
    font: 12px var(--font-mono);
  }

  .meter {
    position: relative;
    z-index: 1;
    height: 64px;
    max-width: 700px;
    margin: auto;
    overflow: hidden;
    border-bottom: 1px solid var(--line);
    background: repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), var(--line) 10%);
  }
  .meter-needle {
    position: absolute;
    bottom: 0;
    width: 3px;
    height: 50px;
    box-shadow: 0 0 14px currentColor;
    transform: translateX(-50%);
    transition: left .15s ease, background .15s;
  }
  .meter-zone {
    position: absolute;
    bottom: 0;
    left: 45%;
    width: 10%;
    height: 64px;
    background: rgba(76, 175, 80, .07);
    border-left: 1px solid rgba(76, 175, 80, .45);
    border-right: 1px solid rgba(76, 175, 80, .45);
  }
  .meter-center {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1px;
    height: 64px;
    background: var(--accent);
    opacity: .6;
  }
  .meter-mark { position: absolute; bottom: 5px; color: var(--muted); font: 11px var(--font-mono); }
  .mark-left { left: 4px; }
  .mark-center { left: 50%; transform: translateX(-50%); }
  .mark-right { right: 4px; }

  .tuner-hint { position: relative; z-index: 1; margin: 14px 0 0; color: var(--muted); font-size: 13px; }

  .tuning-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-top: 12px;
    color: var(--muted);
    text-align: center;
    font: 12px var(--font-mono);
  }

  @media (max-width: 700px) {
    .tuner-stage { min-height: 300px; }
  }
</style>
