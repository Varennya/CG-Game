// ========================================
// SOUND EFFECTS & PROCEDURAL AUDIO (Web Audio API)
// Synthesized audio waveforms with no external audio assets.
// ========================================

let audioContext = null;
let masterGain = null;
let sfxGain = null;
let musicGain = null;

let muted = false;
let masterVol = 1.0;
let sfxVol = 1.0;
let musicVol = 0.6;

// Continuous sentinel proximity drone
let sentinelOsc = null;
let sentinelGain = null;

// Ambient world synth drone
let ambientOsc1 = null;
let ambientOsc2 = null;
let ambientGain = null;
let currentAmbientWorld = null;

function getAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();

        masterGain = audioContext.createGain();
        masterGain.gain.value = muted ? 0 : masterVol;
        masterGain.connect(audioContext.destination);

        sfxGain = audioContext.createGain();
        sfxGain.gain.value = sfxVol;
        sfxGain.connect(masterGain);

        musicGain = audioContext.createGain();
        musicGain.gain.value = musicVol;
        musicGain.connect(masterGain);
    }

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    return audioContext;
}

export function setVolumes({ master, sfx, music, isMuted }) {
    if (typeof isMuted === 'boolean') muted = isMuted;
    if (typeof master === 'number') masterVol = Math.max(0, Math.min(1, master));
    if (typeof sfx === 'number') sfxVol = Math.max(0, Math.min(1, sfx));
    if (typeof music === 'number') musicVol = Math.max(0, Math.min(1, music));

    if (masterGain) {
        masterGain.gain.value = muted ? 0 : masterVol;
    }
    if (sfxGain) {
        sfxGain.gain.value = sfxVol;
    }
    if (musicGain) {
        musicGain.gain.value = musicVol;
    }

    if (muted) {
        stopSentinelHum();
    }
}

export function setMuted(value) {
    setVolumes({ isMuted: value });
}

export function isMuted() {
    return muted;
}

function playTone(frequency, duration, type = 'sine', volume = 0.2, delay = 0) {
    if (muted) return;
    const audio = getAudioContext();
    const startTime = audio.currentTime + delay;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.connect(gain);
    gain.connect(sfxGain || masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
}

function playSweep(fromHz, toHz, duration, type = 'triangle', volume = 0.15, delay = 0) {
    if (muted) return;
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
    gain.connect(sfxGain || masterGain);

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

export function playCountdownTick() {
    playTone(392, 0.14, 'triangle', 0.18);
}

export function playCountdownGo() {
    playTone(523.25, 0.18, 'triangle', 0.22);
    playTone(783.99, 0.4, 'triangle', 0.22, 0.08);
}

// ----------------------------------------
// Environmental Mechanics Audio
// ----------------------------------------

export function playSwitchSound() {
    playTone(320, 0.08, 'sawtooth', 0.2, 0);
    playTone(540, 0.18, 'triangle', 0.22, 0.06);
}

export function playPressurePlateSound() {
    playTone(180, 0.15, 'triangle', 0.25, 0);
    playSweep(220, 140, 0.2, 'sawtooth', 0.15, 0.05);
}

export function playTeleportSound() {
    playSweep(200, 880, 0.35, 'sine', 0.25, 0);
    playSweep(880, 440, 0.25, 'triangle', 0.2, 0.15);
}

export function playCheckpointSound() {
    playTone(587.33, 0.2, 'sine', 0.25, 0);
    playTone(880, 0.25, 'sine', 0.25, 0.12);
    playTone(1174.66, 0.45, 'sine', 0.3, 0.24);
}

export function playRelicSound() {
    playTone(523.25, 0.18, 'triangle', 0.25, 0);
    playTone(659.25, 0.18, 'triangle', 0.25, 0.1);
    playTone(783.99, 0.22, 'triangle', 0.28, 0.2);
    playTone(1046.5, 0.5, 'sine', 0.35, 0.3);
}

export function playLavaSizzleSound() {
    playSweep(600, 120, 0.3, 'sawtooth', 0.2);
}

export function playSecretRevealSound() {
    playSweep(90, 180, 0.6, 'triangle', 0.2);
}

export function playBossAlertSound() {
    playTone(110, 0.6, 'sawtooth', 0.3, 0);
    playTone(82.4, 0.8, 'sawtooth', 0.35, 0.2);
}

export function playBossDefeatedSound() {
    playTone(440, 0.4, 'sine', 0.3, 0);
    playTone(554.37, 0.4, 'sine', 0.3, 0.25);
    playTone(659.25, 0.5, 'sine', 0.35, 0.5);
    playTone(880, 0.9, 'triangle', 0.4, 0.75);
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
        sentinelGain.connect(sfxGain || masterGain);
        sentinelOsc.start();
    }

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
