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
  <div class="meter" aria-label="Indicador de afinación">
    <span class="meter-mark mark-left">♭</span>
    <span class="meter-mark mark-center">0</span>
    <span class="meter-mark mark-right">♯</span>
    <div class="meter-needle" style="left: {needleLeft}%; background: {needleColor}"></div>
    <div class="meter-center"></div>
  </div>
  <p class="tuner-hint">{hint}</p>
</section>

<div class="tuning-strip">
  {#each TUNING as s (s)}<span>{s}</span>{/each}
</div>

<style>
  .view-head { align-items: flex-start; margin: 38px 0 25px; }

  .tuner-stage {
    position: relative;
    overflow: hidden;
    min-height: 355px;
    padding: 40px 6%;
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
    width: 86px;
    height: 86px;
    border: 1px solid var(--accent);
    border-radius: 50%;
    box-shadow: 0 0 0 22px rgba(255, 85, 124, .05), 0 0 0 44px rgba(255, 85, 124, .035);
  }
  .tuner-stage .label { position: absolute; top: 18px; left: 20px; margin: 0; color: var(--muted); font-size: 9px; letter-spacing: 1.5px; }

  .tuner-note {
    position: relative;
    z-index: 1;
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: clamp(80px, 15vw, 150px);
    letter-spacing: -8px;
    line-height: 1;
  }
  .tuner-freq {
    position: relative;
    z-index: 1;
    min-height: 19px;
    margin: 14px 0 42px;
    color: var(--muted);
    font: 13px var(--font-mono);
  }

  .meter {
    position: relative;
    z-index: 1;
    height: 90px;
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
    height: 70px;
    box-shadow: 0 0 14px currentColor;
    transform: translateX(-50%);
    transition: left .15s ease, background .15s;
  }
  .meter-center {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 1px;
    height: 90px;
    background: var(--accent);
    opacity: .6;
  }
  .meter-mark { position: absolute; bottom: 8px; color: var(--muted); font: 12px var(--font-mono); }
  .mark-left { left: 4px; }
  .mark-center { left: 50%; transform: translateX(-50%); }
  .mark-right { right: 4px; }

  .tuner-hint { position: relative; z-index: 1; margin: 25px 0 0; color: var(--muted); font-size: 14px; }

  .tuning-strip {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-top: 18px;
    color: var(--muted);
    text-align: center;
    font: 12px var(--font-mono);
  }

  @media (max-width: 700px) {
    .tuner-stage { min-height: 300px; }
  }
</style>
