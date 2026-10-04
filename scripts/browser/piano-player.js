const trackData = {
  baghdad: {
    title: "Baghdad at dusk",
    bpm: 80,
    notes: [
      [0, [45, 57, 60, 64], 1.55], [1.5, [64], .5], [2, [48, 55, 60, 64], 1.5], [3.5, [62], .5],
      [4, [41, 53, 57, 60], 1.55], [5.5, [60], .5], [6, [43, 55, 59, 62], 1.5], [7.5, [60], .5],
      [8, [45, 57, 60, 64], 1.5], [9.5, [67], .5], [10, [48, 55, 60, 64], 1.5], [11.5, [64], .5],
      [12, [41, 53, 57, 60], 1.5], [13.5, [59], .5], [14, [45, 57, 60, 64], 2]
    ]
  },
  obor: {
    title: "After Piața Obor",
    bpm: 88,
    notes: [
      [0, [50, 57, 62], 1], [.75, [66], .5], [1.5, [69], .5], [2, [45, 57, 60], 1], [3, [64], .5], [3.5, [69], .5],
      [4, [48, 55, 60], 1], [5, [67], .5], [5.5, [72], .5], [6, [43, 55, 59], 1], [7, [62], .5], [7.5, [67], .5],
      [8, [50, 57, 62], 1], [9, [66], .5], [9.5, [69], .5], [10, [45, 57, 60], 1], [11, [64], .5], [11.5, [69], .5],
      [12, [43, 55, 59, 62], 1.3], [13.3, [57, 62, 67, 71], 1.8]
    ]
  },
  "three-cities": {
    title: "Three cities",
    bpm: 92,
    notes: [
      [0, [48, 60, 64, 67], 1.75], [.5, [72], .5], [1.5, [76], .5], [2, [43, 55, 59, 62], 1.75], [2.5, [74], .5], [3.5, [71], .5],
      [4, [45, 57, 60, 64], 1.75], [4.5, [72], .5], [5.5, [69], .5], [6, [41, 53, 57, 60], 1.75], [6.5, [69], .5], [7.5, [72], .5],
      [8, [48, 60, 64, 67], 1.75], [8.5, [76], .5], [9.5, [74], .5], [10, [43, 55, 59, 62], 1.75], [10.5, [71], .5], [11.5, [67], .5],
      [12, [45, 57, 60, 64], 2.6], [14.5, [48, 60, 64, 67], 2]
    ]
  },
  melting: window.pianoMeltingTrack
};

const encodeVariableLength = (value) => {
  const bytes = [value & 0x7f];
  let remaining = value >>> 7;
  while (remaining > 0) {
    bytes.unshift((remaining & 0x7f) | 0x80);
    remaining >>>= 7;
  }
  return bytes;
};

const createMidiDownload = (key) => {
  const piece = trackData[key];
  const events = [];
  piece.notes.forEach(([beat, chord, beatLength, midiVelocity], eventIndex) => {
    chord.forEach((note, chordIndex) => {
      const velocity = Number.isFinite(midiVelocity)
        ? midiVelocity
        : Math.round((.76 - Math.min(chordIndex, 3) * .07 - (eventIndex % 3) * .035) * 127);
      events.push({ tick: Math.round(beat * 480), priority: 1, bytes: [0x90, note, Math.max(1, Math.min(127, velocity))] });
      events.push({ tick: Math.round((beat + beatLength) * 480), priority: 0, bytes: [0x80, note, 0] });
    });
  });
  events.sort((a, b) => a.tick - b.tick || a.priority - b.priority || a.bytes[1] - b.bytes[1]);

  const microsecondsPerBeat = Math.round(60000000 / piece.bpm);
  const trackBytes = [0x00, 0xff, 0x51, 0x03, (microsecondsPerBeat >> 16) & 0xff, (microsecondsPerBeat >> 8) & 0xff, microsecondsPerBeat & 0xff];
  let previousTick = 0;
  events.forEach((event) => {
    trackBytes.push(...encodeVariableLength(event.tick - previousTick), ...event.bytes);
    previousTick = event.tick;
  });
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  const header = [0x4d, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xe0];
  const trackHeader = [0x4d, 0x54, 0x72, 0x6b, (trackBytes.length >>> 24) & 0xff, (trackBytes.length >>> 16) & 0xff, (trackBytes.length >>> 8) & 0xff, trackBytes.length & 0xff];
  return new Blob([Uint8Array.from([...header, ...trackHeader, ...trackBytes])], { type: "audio/midi" });
};

const canvas = document.querySelector("#piano-visualizer");
const statusLine = document.querySelector("#piano-status");
const keyboard = document.querySelector("#piano-keyboard");
const keyboardScroll = document.querySelector(".keyboard-scroll");
const rollCanvas = document.querySelector("#piano-roll");
const buttons = [...document.querySelectorAll(".track-button[data-track]")];
const seekBars = [...document.querySelectorAll(".track-progress[data-track-seek]")];
const keyboardKeys = new Map();
const midiRollPositions = new Map();
const whitePitchClasses = new Set([0, 2, 4, 5, 7, 9, 11]);
let context;
let analyser;
let activePlayback;
let animationFrame;
let playbackRequest = 0;

const midiFrequency = (note) => 440 * (2 ** ((note - 69) / 12));

const buildKeyboard = () => {
  if (!keyboard) return;
  const whiteKeyCount = 52;
  let whiteIndex = 0;
  keyboard.replaceChildren();
  for (let midi = 21; midi <= 108; midi += 1) {
    const pitch = midi % 12;
    const key = document.createElement("span");
    key.className = `midi-key ${whitePitchClasses.has(pitch) ? "white-key" : "black-key"}`;
    key.dataset.midi = String(midi);
    key.setAttribute("aria-hidden", "true");
    if (whitePitchClasses.has(pitch)) {
      key.style.gridColumn = String(whiteIndex + 1);
      whiteIndex += 1;
    } else {
      key.style.left = `${((whiteIndex - .29) / whiteKeyCount) * 100}%`;
      keyboard.append(key);
      keyboardKeys.set(midi, key);
      continue;
    }
    keyboard.append(key);
    keyboardKeys.set(midi, key);
  }
};

const centerMiddleC = () => {
  const middleCKey = keyboardKeys.get(60);
  if (!keyboardScroll || !middleCKey) return;
  const keyRect = middleCKey.getBoundingClientRect();
  const scrollRect = keyboardScroll.getBoundingClientRect();
  const keyCenter = keyRect.left + keyRect.width / 2 - scrollRect.left + keyboardScroll.scrollLeft;
  const maxScroll = Math.max(0, keyboardScroll.scrollWidth - keyboardScroll.clientWidth);
  keyboardScroll.scrollLeft = Math.max(0, Math.min(maxScroll, keyCenter - keyboardScroll.clientWidth / 2));
};

const showKeyboardNotes = (notes) => {
  keyboardKeys.forEach((key, midi) => key.classList.toggle("is-active", notes.has(midi)));
};

const updateMidiRollPositions = () => {
  if (!rollCanvas) return;
  const rollRect = rollCanvas.getBoundingClientRect();
  if (!rollRect.width) return;
  keyboardKeys.forEach((key, midi) => {
    const keyRect = key.getBoundingClientRect();
    midiRollPositions.set(midi, {
      center: (keyRect.left + keyRect.width / 2 - rollRect.left) / rollRect.width,
      width: keyRect.width / rollRect.width
    });
  });
};

const drawPianoRoll = (playback) => {
  if (!rollCanvas) return;
  const roll = rollCanvas.getContext("2d");
  const { width, height } = rollCanvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.floor(width * ratio));
  const pixelHeight = Math.max(1, Math.floor(height * ratio));
  if (rollCanvas.width !== pixelWidth || rollCanvas.height !== pixelHeight) {
    rollCanvas.width = pixelWidth;
    rollCanvas.height = pixelHeight;
  }
  roll.setTransform(ratio, 0, 0, ratio, 0, 0);
  roll.clearRect(0, 0, width, height);
  roll.fillStyle = "rgba(8, 12, 11, .94)";
  roll.fillRect(0, 0, width, height);

  roll.strokeStyle = "rgba(236, 228, 210, .075)";
  roll.lineWidth = 1;
  for (let key = 0; key <= 52; key += 1) {
    const x = width * key / 52;
    roll.beginPath();
    roll.moveTo(x, 0);
    roll.lineTo(x, height);
    roll.stroke();
  }
  for (let row = 1; row <= 4; row += 1) {
    const y = height * row / 4;
    roll.beginPath();
    roll.moveTo(0, y);
    roll.lineTo(width, y);
    roll.stroke();
  }
  roll.fillStyle = "rgba(209, 139, 152, .68)";
  roll.fillRect(0, height - 2, width, 2);

  if (!playback) {
    roll.fillStyle = "rgba(236, 228, 210, .56)";
    roll.font = "500 8px IBM Plex Mono, Consolas, monospace";
    roll.textAlign = "center";
    roll.textBaseline = "middle";
    roll.fillText("PRESS PLAY TO WATCH THE NOTES FALL", width / 2, height / 2);
    return;
  }

  const elapsed = getPlaybackPosition(playback);
  const fallSeconds = 1.8;
  const releaseFadeSeconds = .34;
  const flowTailSeconds = .28;
  const fallSpeed = height / fallSeconds;
  const noteColors = ["#d18b98", "#35b9d6", "#30c4a0"];
  playback.events.forEach(({ start, end, chord }) => {
    const timeUntil = start - elapsed;
    const timeSinceEnd = elapsed - end;
    const duration = end - start;
    const remaining = end - elapsed;
    const barHeight = Math.max(10, duration * fallSpeed);
    const bottom = height - timeUntil * fallSpeed;
    const y = bottom - barHeight;
    const tailProgress = Math.max(0, Math.min(1, timeSinceEnd / flowTailSeconds));
    if (timeUntil > fallSeconds + duration || timeSinceEnd > flowTailSeconds) return;

    const visible = elapsed < end && bottom > 0 && y < height;
    const fadeProgress = Math.max(0, Math.min(1, 1 - remaining / releaseFadeSeconds));
    const noteOpacity = 1 - fadeProgress * fadeProgress;
    const flowActive = remaining < releaseFadeSeconds && timeSinceEnd < flowTailSeconds;
    const flowProgress = Math.max(0, Math.min(1, 1 - remaining / releaseFadeSeconds));
    const flowMotion = flowProgress + tailProgress * .38;
    chord.forEach((midi, chordIndex) => {
      const position = midiRollPositions.get(midi);
      if (!position) return;
      const noteWidth = Math.max(4, width * position.width - 2);
      const x = width * position.center - noteWidth / 2;
      const color = noteColors[(midi + chordIndex) % noteColors.length];
      roll.save();
      if (visible) {
        roll.globalAlpha = noteOpacity;
        roll.shadowColor = color;
        roll.shadowBlur = 9 + flowProgress * 5;
        const noteGradient = roll.createLinearGradient(x, y, x, bottom);
        noteGradient.addColorStop(0, "rgba(255, 246, 232, .92)");
        noteGradient.addColorStop(.16, color);
        noteGradient.addColorStop(1, color);
        roll.fillStyle = noteGradient;
        roll.fillRect(x, y, noteWidth, barHeight);
        roll.shadowBlur = 0;
        roll.globalAlpha = noteOpacity * .82;
        roll.fillStyle = "rgba(255, 245, 235, .78)";
        roll.fillRect(x + 1, y + 1, Math.max(1, noteWidth - 2), 2);
      }
      if (flowActive) {
        const particleFade = timeSinceEnd > 0 ? 1 - tailProgress : flowProgress;
        for (let stream = 0; stream < 5; stream += 1) {
          const seed = ((midi + stream * 7) % 13) / 13;
          const travel = Math.min(1, .2 + seed * .32 + flowMotion * (.58 + stream * .045));
          const sway = Math.sin(flowMotion * 5 + stream * 1.8 + midi * .23);
          const spread = noteWidth * (.12 + flowMotion * .48);
          const particleX = x + noteWidth * .5 + sway * spread + (stream - 2) * noteWidth * .045;
          const particleY = height * (.58 + travel * .4);
          const radius = .8 + ((midi + stream) % 3) * .42;
          roll.globalAlpha = particleFade * (.7 - stream * .07);
          roll.shadowColor = color;
          roll.shadowBlur = 7;
          roll.fillStyle = color;
          roll.beginPath();
          roll.arc(particleX, particleY, radius, 0, Math.PI * 2);
          roll.fill();

          roll.globalAlpha = particleFade * .28;
          roll.lineWidth = .7;
          roll.beginPath();
          roll.moveTo(particleX, particleY - 5);
          roll.lineTo(particleX + sway * 1.5, particleY + 2);
          roll.strokeStyle = color;
          roll.stroke();
        }
      }
      roll.restore();
    });
  });
};

const setTrackProgress = (key, percent) => {
  const card = document.querySelector(`[data-track-card="${key}"]`);
  const progress = card?.querySelector(".track-progress");
  if (!progress) return;
  const value = Math.max(0, Math.min(100, percent));
  progress.style.setProperty("--progress", `${value}%`);
  progress.setAttribute("aria-valuenow", String(Math.round(value)));
  progress.setAttribute("aria-valuetext", `${Math.round(value)}% played`);
};

const ensureAudio = () => {
  if (context) return;
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) throw new Error("Web Audio is not available in this browser.");
  context = new AudioContextConstructor();
  analyser = context.createAnalyser();
  analyser.fftSize = 128;
  analyser.smoothingTimeConstant = .82;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.knee.value = 18;
  compressor.ratio.value = 5;
  compressor.attack.value = .004;
  compressor.release.value = .18;
  analyser.connect(compressor);
  compressor.connect(context.destination);
};

const setButtonsIdle = () => {
  buttons.forEach((button) => {
    button.classList.remove("is-playing");
    button.setAttribute("aria-pressed", "false");
    button.setAttribute("aria-label", `Play ${trackData[button.dataset.track].title}`);
    button.querySelector(".play-symbol").textContent = "▶";
    button.querySelector(".button-text").textContent = "PLAY";
  });
};

const clearVisualizer = () => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
  if (!canvas) return;
  const canvasContext = canvas.getContext("2d");
  const { width, height } = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.floor(width * ratio));
  canvas.height = Math.max(1, Math.floor(height * ratio));
  canvasContext.scale(ratio, ratio);
  canvasContext.clearRect(0, 0, width, height);
  canvasContext.fillStyle = "rgba(48, 196, 160, .22)";
  canvasContext.fillRect(0, height / 2, width, 1);
  drawPianoRoll(undefined);
};

const stopPlayback = (invalidatePending = true) => {
  if (invalidatePending) playbackRequest += 1;
  if (!activePlayback) return;
  const playback = activePlayback;
  activePlayback = undefined;
  window.clearInterval(playback.scheduleTimer);
  window.clearTimeout(playback.endTimer);
  const now = context.currentTime;
  playback.master.gain.cancelScheduledValues(now);
  playback.master.gain.setValueAtTime(Math.max(.001, playback.master.gain.value), now);
  playback.master.gain.linearRampToValueAtTime(.0001, now + .075);
  playback.sources.forEach((source) => {
    try { source.stop(now + .08); } catch { /* already ended */ }
  });
  setTrackProgress(playback.key, 0);
  showKeyboardNotes(new Set());
  setButtonsIdle();
  if (statusLine) statusLine.textContent = "READY TO PLAY";
  clearVisualizer();
};

const drawVisualizer = () => {
  if (!activePlayback || !canvas || !analyser) return;
  const canvasContext = canvas.getContext("2d");
  const { width, height } = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.floor(width * ratio));
  const pixelHeight = Math.max(1, Math.floor(height * ratio));
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvasContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  canvasContext.clearRect(0, 0, width, height);

  const bins = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(bins);
  const count = 42;
  const gap = 4;
  const barWidth = Math.max(2, (width - gap * (count - 1)) / count);
  const midline = height * .5;
  for (let i = 0; i < count; i += 1) {
    const bin = bins[Math.min(bins.length - 1, Math.floor((i / count) * bins.length))] / 255;
    const barHeight = Math.max(3, bin * height * .82);
    const x = i * (barWidth + gap);
    const fade = .32 + bin * .68;
    canvasContext.fillStyle = i % 5 === 0 ? `rgba(209,139,152,${fade})` : `rgba(48,196,160,${fade})`;
    canvasContext.fillRect(x, midline - barHeight / 2, barWidth, barHeight);
  }
  const elapsed = getPlaybackPosition(activePlayback);
  const activeNotes = new Set();
  activePlayback.events.forEach(({ start, end, chord }) => {
    if (elapsed >= start && elapsed <= end) chord.forEach((note) => activeNotes.add(note));
  });
  showKeyboardNotes(activeNotes);
  drawPianoRoll(activePlayback);
  setTrackProgress(activePlayback.key, (elapsed / activePlayback.duration) * 100);
  animationFrame = requestAnimationFrame(drawVisualizer);
};

const addPianoNote = (midiNote, startAt, duration, velocity, master, sources) => {
  const partials = [[1, 1], [2.01, .24], [3.98, .09], [6.08, .035]];
  partials.forEach(([harmonic, amount], index) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.type = index === 0 ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(midiFrequency(midiNote) * harmonic, startAt);
    const peak = Math.max(.0002, velocity * amount * .19);
    const sustain = Math.max(.0001, peak * (index === 0 ? .19 : .08));
    envelope.gain.setValueAtTime(.0001, startAt);
    envelope.gain.exponentialRampToValueAtTime(peak, startAt + .012);
    envelope.gain.exponentialRampToValueAtTime(sustain, startAt + .24);
    envelope.gain.setValueAtTime(sustain, startAt + duration);
    envelope.gain.exponentialRampToValueAtTime(.0001, startAt + duration + .78);
    oscillator.connect(envelope);
    envelope.connect(master);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + .82);
    sources.add(oscillator);
    oscillator.addEventListener("ended", () => sources.delete(oscillator), { once: true });
  });
};

const getPlaybackPosition = (playback) => playback.offset + Math.max(0, context.currentTime - playback.startAt);

const scheduleUpcomingNotes = (playback) => {
  if (activePlayback !== playback) return;
  const now = context.currentTime;
  const currentPosition = getPlaybackPosition(playback);
  const scheduleThrough = playback.offset + Math.max(0, now + .22 - playback.startAt);
  while (playback.scheduledIndex < playback.events.length && playback.events[playback.scheduledIndex].start <= scheduleThrough) {
    const event = playback.events[playback.scheduledIndex++];
    const eventStart = Math.max(event.start, currentPosition, playback.offset);
    const duration = event.end - eventStart;
    if (duration <= 0) continue;
    const startAt = Math.max(now + .006, playback.startAt + eventStart - playback.offset);
    event.chord.forEach((midiNote, chordIndex) => {
      const velocity = Number.isFinite(event.velocity) ? event.velocity / 127 : .76 - Math.min(chordIndex, 3) * .07 - (event.index % 3) * .035;
      addPianoNote(midiNote, startAt, duration, velocity, playback.master, playback.sources);
    });
  }
};

const armPlaybackEnd = (playback) => {
  window.clearTimeout(playback.endTimer);
  const remaining = Math.max(0, playback.duration - playback.offset);
  playback.endTimer = window.setTimeout(() => finishPlayback(playback), (remaining + 1.05) * 1000);
};

const finishPlayback = (playback) => {
  if (activePlayback !== playback) return;
  activePlayback = undefined;
  window.clearInterval(playback.scheduleTimer);
  setTrackProgress(playback.key, 100);
  showKeyboardNotes(new Set());
  setButtonsIdle();
  if (statusLine) statusLine.textContent = "READY TO PLAY";
  clearVisualizer();
};

const startPlayback = async (key, button, offset = 0) => {
  const request = ++playbackRequest;
  stopPlayback(false);
  const piece = trackData[key];
  try {
    ensureAudio();
    await context.resume();
    if (request !== playbackRequest) return;
    const secondsPerBeat = 60 / piece.bpm;
    const events = piece.notes.map(([beat, chord, beatLength, velocity], index) => ({
      start: beat * secondsPerBeat,
      end: (beat + beatLength) * secondsPerBeat,
      chord,
      velocity,
      index
    })).sort((a, b) => a.start - b.start);
    const duration = events.reduce((latest, event) => Math.max(latest, event.end), 0);
    const playFrom = Math.max(0, Math.min(duration - .02, offset));
    const startAt = context.currentTime + .04;
    const master = context.createGain();
    master.gain.setValueAtTime(.72, startAt);
    master.connect(analyser);
    const playback = {
      key,
      master,
      sources: new Set(),
      startAt,
      offset: playFrom,
      duration,
      events,
      scheduledIndex: events.findIndex((event) => event.end > playFrom),
      scheduleTimer: undefined,
      endTimer: undefined
    };
    if (playback.scheduledIndex < 0) playback.scheduledIndex = events.length;
    activePlayback = playback;
    setTrackProgress(key, (playFrom / duration) * 100);
    buttons.forEach((item) => {
      const isCurrent = item === button;
      item.classList.toggle("is-playing", isCurrent);
      item.setAttribute("aria-pressed", String(isCurrent));
      item.setAttribute("aria-label", isCurrent ? `Stop ${piece.title}` : `Play ${trackData[item.dataset.track].title}`);
      item.querySelector(".play-symbol").textContent = isCurrent ? "■" : "▶";
      item.querySelector(".button-text").textContent = isCurrent ? "STOP" : "PLAY";
    });
    if (statusLine) statusLine.textContent = `PLAYING / ${piece.title.toUpperCase()}`;
    scheduleUpcomingNotes(playback);
    playback.scheduleTimer = window.setInterval(() => scheduleUpcomingNotes(playback), 40);
    drawVisualizer();
    armPlaybackEnd(playback);
  } catch (error) {
    if (request !== playbackRequest) return;
    stopPlayback(false);
    if (statusLine) statusLine.textContent = "AUDIO IS NOT AVAILABLE IN THIS BROWSER";
  }
};

const seekToPercent = (key, button, percent) => {
  const piece = trackData[key];
  const duration = piece.notes.reduce((latest, [beat, , beatLength]) => Math.max(latest, (beat + beatLength) * (60 / piece.bpm)), 0);
  const target = Math.min(duration - .02, Math.max(0, percent / 100 * duration));
  if (activePlayback?.key !== key) {
    startPlayback(key, button, target);
    return;
  }

  const playback = activePlayback;
  const now = context.currentTime;
  playback.sources.forEach((source) => {
    try { source.stop(now + .02); } catch { /* already ended */ }
  });
  playback.sources.clear();
  playback.master.gain.cancelScheduledValues(now);
  playback.master.gain.setValueAtTime(Math.max(.001, playback.master.gain.value), now);
  playback.master.gain.linearRampToValueAtTime(.0001, now + .018);
  playback.offset = target;
  playback.startAt = now + .04;
  playback.scheduledIndex = playback.events.findIndex((event) => event.end > target);
  if (playback.scheduledIndex < 0) playback.scheduledIndex = playback.events.length;
  playback.master.gain.setValueAtTime(.0001, playback.startAt);
  playback.master.gain.linearRampToValueAtTime(.72, playback.startAt + .025);
  scheduleUpcomingNotes(playback);
  setTrackProgress(key, (target / duration) * 100);
  armPlaybackEnd(playback);
};

buttons.forEach((button) => button.addEventListener("click", () => {
  if (activePlayback?.key === button.dataset.track) stopPlayback();
  else startPlayback(button.dataset.track, button);
}));

seekBars.forEach((seekBar) => {
  const key = seekBar.dataset.trackSeek;
  const button = document.querySelector(`.track-button[data-track="${key}"]`);
  seekBar.addEventListener("click", (event) => {
    const bounds = seekBar.getBoundingClientRect();
    seekToPercent(key, button, ((event.clientX - bounds.left) / bounds.width) * 100);
  });
  seekBar.addEventListener("keydown", (event) => {
    const current = Number(seekBar.getAttribute("aria-valuenow")) || 0;
    let target;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") target = current - 3;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") target = current + 3;
    else if (event.key === "PageDown") target = current - 10;
    else if (event.key === "PageUp") target = current + 10;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = 100;
    if (target !== undefined) {
      event.preventDefault();
      seekToPercent(key, button, target);
    }
  });
});

document.querySelectorAll("[data-midi-download]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const key = link.dataset.midiDownload;
    const download = document.createElement("a");
    download.href = URL.createObjectURL(createMidiDownload(key));
    download.download = `${key}-improvised-by-noor.mid`;
    download.click();
    window.setTimeout(() => URL.revokeObjectURL(download.href), 1000);
  });
});

const warmAudioOnPress = (event) => {
  if (!event.target.closest(".track-button[data-track],.track-progress[data-track-seek]")) return;
  try {
    ensureAudio();
    if (context.state === "suspended") context.resume().catch(() => {});
  } catch { /* playback reports unsupported audio when requested */ }
};
document.addEventListener("pointerdown", warmAudioOnPress, { passive: true });
window.addEventListener("resize", () => {
  centerMiddleC();
  updateMidiRollPositions();
  if (activePlayback) drawVisualizer();
  else clearVisualizer();
});
buildKeyboard();
centerMiddleC();
updateMidiRollPositions();
clearVisualizer();
