// ========================================
// SOUND EFFECTS & PROCEDURAL AUDIO (Web Audio API)
// Synthesized audio waveforms with no external audio assets.
// ========================================

let audioContext = null;
let masterGain = null;
let muted = false;

// Continuous sentinel proximity drone
let sentinelOsc = null;
let sentinelGain = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioContext.createGain();
        masterGain.gain.value = muted ? 0 : 1;
        masterGain.connect(audioContext.destination);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    return audioContext;
}

export function setMuted(value) {
    muted = value;

    if (masterGain) {
        masterGain.gain.value = muted ? 0 : 1;
    }

    if (muted) {
        stopSentinelHum();
    }
}

export function isMuted() {
    return muted;
}

function playTone(frequency, duration, type = 'sine', volume = 0.2, delay = 0) {
    const audio = getAudioContext();
    const startTime = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function playSweep(fromHz, toHz, duration, type = 'triangle', volume = 0.15, delay = 0) {
    const audio = getAudioContext();
    const startTime = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(fromHz, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(toHz, startTime + duration);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

export function playStartSound() {
    playTone(440, 0.12);
    playTone(660, 0.16, 'sine', 0.2, 0.1);
}

export function playVictorySound() {
    playTone(523.25, 0.25, 'sine', 0.3, 0);
    playTone(659.25, 0.25, 'sine', 0.3, 0.18);
    playTone(783.99, 0.45, 'sine', 0.3, 0.36);
    playTone(1046.5, 0.6, 'sine', 0.3, 0.54);
}

export function playGrandVictorySound() {
    // Majestic fanfare for completing Level 10 (Architect's Trial)
    playTone(523.25, 0.35, 'triangle', 0.35, 0);
    playTone(659.25, 0.35, 'triangle', 0.35, 0.2);
    playTone(783.99, 0.4, 'triangle', 0.35, 0.4);
    playTone(1046.5, 0.5, 'triangle', 0.35, 0.6);
    playTone(1318.5, 0.8, 'sine', 0.4, 0.85);
    playTone(1567.98, 1.2, 'sine', 0.35, 1.1);
}

export function playFootstep() {
    playSweep(110, 55, 0.09, 'triangle', 0.12);
}

export function playOrbSound() {
    playTone(880, 0.12, 'sine', 0.18, 0);
    playTone(1318.5, 0.22, 'sine', 0.16, 0.07);
}

export function playKeySound() {
    playTone(659.25, 0.14, 'triangle', 0.22, 0);
    playTone(987.77, 0.14, 'triangle', 0.22, 0.1);
    playTone(1318.5, 0.35, 'triangle', 0.2, 0.2);
}

export function playDoorSound() {
    playTone(1800, 0.05, 'square', 0.1, 0);
    playTone(1400, 0.05, 'square', 0.1, 0.08);
    playSweep(140, 60, 0.6, 'sawtooth', 0.14, 0.15);
}

export function playLockedSound() {
    playTone(150, 0.12, 'square', 0.12, 0);
    playTone(120, 0.16, 'square', 0.12, 0.1);
}

export function playHitSound() {
    playSweep(420, 70, 0.5, 'sawtooth', 0.22);
    playTone(90, 0.4, 'square', 0.15, 0);
}

export function playClickSound() {
    playTone(620, 0.05, 'sine', 0.1);
}

export function playLabClick() {
    playTone(820, 0.04, 'triangle', 0.08);
}

export function playCountdownTick() {
    playTone(392, 0.14, 'triangle', 0.18);
}

export function playCountdownGo() {
    playTone(523.25, 0.18, 'triangle', 0.22);
    playTone(783.99, 0.4, 'triangle', 0.22, 0.08);
}

// ----------------------------------------
// Sentinel Proximity Hum
// ----------------------------------------
export function updateSentinelHum(dist) {
    if (muted || dist > 7) {
        stopSentinelHum();
        return;
    }

    const audio = getAudioContext();
    if (!sentinelOsc) {
        sentinelOsc = audio.createOscillator();
        sentinelGain = audio.createGain();

        sentinelOsc.type = 'sawtooth';
        sentinelOsc.frequency.setValueAtTime(65, audio.currentTime);

        sentinelGain.gain.setValueAtTime(0, audio.currentTime);

        sentinelOsc.connect(sentinelGain);
        sentinelGain.connect(masterGain);
        sentinelOsc.start();
    }

    // Closer distance = higher volume and slightly higher pitch
    const intensity = Math.max(0, Math.min(1, (7 - dist) / 5.5));
    const targetVol = intensity * 0.14;
    const targetFreq = 65 + intensity * 45;

    sentinelGain.gain.setTargetAtTime(targetVol, audio.currentTime, 0.1);
    sentinelOsc.frequency.setTargetAtTime(targetFreq, audio.currentTime, 0.1);
}

export function stopSentinelHum() {
    if (sentinelGain && audioContext) {
        sentinelGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.1);
    }
}
