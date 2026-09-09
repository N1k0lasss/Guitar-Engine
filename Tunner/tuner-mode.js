// afinación estándar
const STANDARD_TUNING = [
  { note: 'E2', freq: 82.41 },
  { note: 'A2', freq: 110.00 },
  { note: 'D3', freq: 146.83 },
  { note: 'G3', freq: 196.00 },
  { note: 'B3', freq: 246.94 },
  { note: 'E4', freq: 329.63 },
];

// autocorrelación: busca el período que mejor se repite en la señal
// (mucho más preciso que el chroma para pitch de una sola nota)
function autoCorrelate(buffer, sampleRate) {
  const SIZE = buffer.length;

  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // silencio, ni intentamos

  // recortamos los bordes de bajo volumen para no ensuciar la correlación
  let start = 0, end = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) > thres) { start = i; break; }
  for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - 1 - i]) > thres) { end = SIZE - 1 - i; break; }

  const trimmed = buffer.slice(start, end);
  const n = trimmed.length;
  if (n < 2) return -1;

  const c = new Array(n).fill(0);
  for (let lag = 0; lag < n; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += trimmed[i] * trimmed[i + lag];
    c[lag] = sum;
  }

  // saltamos la caída inicial (lag=0 siempre es el máximo absoluto)
  let d = 0;
  while (d < n - 1 && c[d] > c[d + 1]) d++;

  let maxVal = -1, maxPos = -1;
  for (let i = d; i < n; i++) {
    if (c[i] > maxVal) { maxVal = c[i]; maxPos = i; }
  }
  if (maxPos <= 0 || maxPos >= n - 1) return -1;

  // interpolación parabólica para afinar el resultado entre muestras
  const x1 = c[maxPos - 1], x2 = c[maxPos], x3 = c[maxPos + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const shift = a ? -b / (2 * a) : 0;
  const period = maxPos + shift;

  return sampleRate / period;
}

function closestTuningNote(freq) {
  let best = STANDARD_TUNING[0];
  let bestDiff = Infinity;
  for (const t of STANDARD_TUNING) {
    const diff = Math.abs(t.freq - freq);
    if (diff < bestDiff) { bestDiff = diff; best = t; }
  }
  return best;
}

function centsOff(freq, targetFreq) {
  return 1200 * Math.log2(freq / targetFreq);
}

function renderTuner(freq) {
  const noteEl = document.getElementById('tuner-note');
  const freqEl = document.getElementById('tuner-freq');
  const needle = document.getElementById('meter-needle');
  const hint = document.getElementById('tuner-hint');

  if (freq < 0) {
    noteEl.textContent = '--';
    freqEl.textContent = '';
    needle.style.left = '50%';
    needle.style.background = '#4caf50';
    hint.textContent = 'Tocá una cuerda al aire';
    return;
  }

  const target = closestTuningNote(freq);
  const cents = centsOff(freq, target.freq);
  const clamped = Math.max(-50, Math.min(50, cents));

  noteEl.textContent = target.note;
  freqEl.textContent = `${freq.toFixed(1)} Hz (${cents > 0 ? '+' : ''}${cents.toFixed(0)} cents)`;

  // 0 cents = centro (50%), -50 = borde izq, +50 = borde derecho
  const percent = 50 + clamped;
  needle.style.left = `${percent}%`;

  if (Math.abs(cents) < 5) {
    needle.style.background = '#4caf50'; // afinado
    hint.textContent = '✓ Afinado';
  } else if (cents < 0) {
    needle.style.background = '#e74c3c';
    hint.textContent = 'Grave, subí un poco';
  } else {
    needle.style.background = '#e74c3c';
    hint.textContent = 'Agudo, bajá un poco';
  }
}

// llamado desde main.js en cada frame cuando el modo activo es 'tuner'
function tunerLoop(timeData, sampleRate) {
  const freq = autoCorrelate(timeData, sampleRate);
  renderTuner(freq);
}