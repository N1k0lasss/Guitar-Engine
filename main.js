let audioCtx, analyser, freqData, timeData, source, stream, running = false;
let currentMode = 'chords';

// --- dashboard: cambiar de vista sin tocar el audio ---
function closeModeGroups() {
  document.querySelectorAll('.mode-group.open').forEach(group => {
    group.classList.remove('open');
    group.querySelector('.nav-group-btn').setAttribute('aria-expanded', 'false');
  });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    currentMode = btn.dataset.mode;

    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const group = btn.closest('.mode-group');
    if (group) group.querySelector('.nav-group-current').textContent = btn.textContent;

    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${currentMode}-view`).classList.add('active');
    if (currentMode === 'chords') resetChordTracking();
    closeModeGroups();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
});

document.querySelectorAll('.nav-group-btn').forEach(groupBtn => {
  groupBtn.onclick = () => {
    const group = groupBtn.closest('.mode-group');
    const shouldOpen = !group.classList.contains('open');
    closeModeGroups();
    if (shouldOpen) {
      group.classList.add('open');
      groupBtn.setAttribute('aria-expanded', 'true');
    }
  };
});

document.addEventListener('click', event => {
  if (!event.target.closest('.mode-group')) closeModeGroups();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeModeGroups();
});

// --- audio: un solo AudioContext/analyser para ambos modos ---
document.getElementById('startBtn').onclick = async () => {
  if (running) return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass || !navigator.mediaDevices?.getUserMedia) throw new Error('Micrófono no disponible');
    audioCtx = new AudioContextClass();
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 8192;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    freqData = new Float32Array(analyser.frequencyBinCount);
    timeData = new Float32Array(analyser.fftSize);
    resetChordTracking();
    running = true;
    document.getElementById('status').innerHTML = '<span class="status-dot live"></span> Escuchando';
    document.getElementById('startBtn').disabled = true;
    document.getElementById('stopBtn').disabled = false;
    loop();
  } catch (error) {
    running = false;
    document.getElementById('status').innerHTML = '<span class="status-dot error"></span> Micrófono bloqueado';
    document.getElementById('confidence').textContent = 'Permite el acceso al micrófono y vuelve a intentarlo';
  }
};

document.getElementById('stopBtn').onclick = () => {
  if (!running) return;
  running = false;
  resetChordTracking();

  stream?.getTracks().forEach(track => track.stop());
  audioCtx?.close();

  document.getElementById('status').innerHTML = '<span class="status-dot"></span> Detenido';
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled = true;
};

function loop() {
  if (!running) return;

  if (currentMode === 'chords') {
    analyser.getFloatFrequencyData(freqData);
    chordLoop(freqData);
  } else if (currentMode === 'tuner') {
    analyser.getFloatTimeDomainData(timeData);
    tunerLoop(timeData, audioCtx.sampleRate);
  }

  requestAnimationFrame(loop);
}

document.getElementById('clearHistory').onclick = () => { clearHistory(); };