import * as THREE from 'three';

import { getLevel, LEVEL_COUNT, PLAYER_SPEED, KEY_NAMES } from './levels.js';
import { createWorld } from './world.js';
import { drawMinimap } from './minimap.js';
import * as sound from './audio.js';
import { loadProgress, recordResult, loadSettings, saveSettings, resetProgress } from './storage.js';
import * as ui from './ui.js';

// ========================================
// 1. SCENE, CAMERA, RENDERER
// ========================================

const FOG_COLOR = 0x0d0a07;

const scene = new THREE.Scene();
scene.background = new THREE.Color(FOG_COLOR);
scene.fog = new THREE.FogExp2(FOG_COLOR, 0.055);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.rotation.order = 'YXZ';

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
});
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

document.body.appendChild(renderer.domElement);

// ========================================
// 2. LIGHTING
// ========================================

const ambientLight = new THREE.AmbientLight(0x75654f, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffe2b0, 0.6);
directionalLight.position.set(-6, 12, 6);
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

let currentBaseTorchIntensity = 13;
const torch = new THREE.PointLight(0xffd0a0, currentBaseTorchIntensity, 22, 1.9);
scene.add(torch);

// ========================================
// 3. GAME STATE
// ========================================

// 'menu' | 'countdown' | 'playing' | 'paused' | 'complete'
let state = 'menu';
let pausedFrom = 'playing';

function isRunning() {
    return state === 'playing' || state === 'countdown';
}

const progress = loadProgress();
const settings = loadSettings();

function applyQuality() {
    const detailed = settings.quality === 'detailed';

    renderer.shadowMap.enabled = detailed;
    directionalLight.castShadow = detailed;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, detailed ? 2 : 1.25));
    renderer.setSize(window.innerWidth, window.innerHeight);

    scene.traverse((object) => {
        if (!object.material) return;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((m) => { m.needsUpdate = true; });
    });
}

applyQuality();

const levels = Array.from({ length: LEVEL_COUNT }, (_, i) => getLevel(i));

let levelIndex = Math.min(progress.unlocked, LEVEL_COUNT - 1);
let world = null;

let elapsedTime = 0;
let penaltyTime = 0;
let orbsCollected = 0;
const heldKeys = new Set();

const SENTINEL_PENALTY = 10;
const SENTINEL_HIT_RADIUS = 0.85;
let invulnerableFor = 0;
let lockedToastCooldown = 0;

const safeTrail = [];
let safeTrailTimer = 0;

// Walking Head-Bob oscillation
let headBobTimer = 0;
let headBobOffset = 0;

// 3-2-1 Countdown
const COUNT_STEP = 0.85;
let countdownTime = 0;
let lastCountShown = -1;
let goTimer = null;

// ========================================
// 4. LOADING A LEVEL
// ========================================

let yaw = Math.PI;
let pitch = 0;

function applyCameraRotation() {
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
}

function initialYaw(level) {
    const options = [[1, 0], [0, 1], [-1, 0], [0, -1]];

    for (const [dr, dc] of options) {
        const ch = level.grid[level.start.row + dr]?.[level.start.col + dc];
        if (ch !== undefined && ch !== '#') {
            return Math.atan2(-dc, -dr);
        }
    }

    return Math.PI;
}

function loadLevel(index) {
    if (world) world.dispose();

    levelIndex = index;
    const level = levels[index];

    // Adapt fog, ambient light, and torch reach to the level's tier lighting
    const lighting = level.lighting;
    if (lighting) {
        scene.fog.density = lighting.fogDensity;
        ambientLight.intensity = lighting.ambient;
        directionalLight.intensity = lighting.directional;
        torch.distance = lighting.torchDistance;
        torch.decay = lighting.torchDecay || 1.9;
        currentBaseTorchIntensity = lighting.torchIntensity || 13;
    }

    world = createWorld(scene, directionalLight, level);

    elapsedTime = 0;
    penaltyTime = 0;
    orbsCollected = 0;
    heldKeys.clear();
    invulnerableFor = 0;
    lockedToastCooldown = 0;
    safeTrail.length = 0;
    safeTrailTimer = 0;
    headBobTimer = 0;
    headBobOffset = 0;

    const start = world.toWorld(level.start.row, level.start.col);
    camera.position.set(start.x, 1.6, start.z);
    world.reveal(level.start.row, level.start.col);

    yaw = initialYaw(level);
    pitch = 0;
    applyCameraRotation();

    menuYaw = yaw;
    menuTime = 0;

    const record = progress.levels[index];
    ui.setLevelHUD(level, index, record ? record.best : undefined);
    ui.clearToast();

    if (level.visibility === 'dim') {
        ui.toast('The air grows cold and misty... Visibility is limited.', 'info', 3000);
    } else if (level.visibility === 'dark') {
        ui.toast('Deep darkness surrounds you. Keep your torch close.', 'warn', 3200);
    }
}

// ========================================
// 5. MOUSE LOOK
// ========================================

let isPointerLocked = false;

function requestLock() {
    try {
        const result = renderer.domElement.requestPointerLock();
        if (result && result.catch) result.catch(() => {});
    } catch (error) {
        // Pointer lock unavailable fallback
    }
}

renderer.domElement.addEventListener('click', () => {
    if (!isPointerLocked && isRunning()) {
        requestLock();
    }
});

document.addEventListener('pointerlockchange', () => {
    isPointerLocked = document.pointerLockElement === renderer.domElement;

    if (!isPointerLocked && isRunning()) {
        pauseGame();
    }
});

document.addEventListener('mousemove', (event) => {
    if (!isPointerLocked || !isRunning()) return;

    const sensitivity = 0.002 * settings.sensitivity;

    yaw -= event.movementX * sensitivity;
    pitch -= event.movementY * sensitivity;
    pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));

    applyCameraRotation();
});

// ========================================
// 6. KEYBOARD CONTROLS
// ========================================

const keys = {};

function releaseAllKeys() {
    Object.keys(keys).forEach((key) => {
        keys[key] = false;
    });
}

window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();

    if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        event.preventDefault();
        keys[key] = true;
    }

    if (key === 'p' || (key === 'escape' && isRunning())) {
        if (isRunning()) pauseGame();
        else if (state === 'paused') resumeGame();
    }
});

window.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

window.addEventListener('blur', () => {
    releaseAllKeys();
    if (isRunning()) pauseGame();
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden && isRunning()) pauseGame();
});

// ========================================
// 7. COLLISION AND MOVEMENT
// ========================================

const PLAYER_RADIUS = 0.25;

function canMoveTo(x, z) {
    const points = [
        [x - PLAYER_RADIUS, z - PLAYER_RADIUS],
        [x + PLAYER_RADIUS, z - PLAYER_RADIUS],
        [x - PLAYER_RADIUS, z + PLAYER_RADIUS],
        [x + PLAYER_RADIUS, z + PLAYER_RADIUS]
    ];

    for (const [checkX, checkZ] of points) {
        const { row, col } = world.toCell(checkX, checkZ);
        if (world.isBlocked(row, col)) return false;
    }

    return true;
}

const forward = new THREE.Vector3();
const right = new THREE.Vector3();

function updateMovement(delta) {
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    let moveX = 0;
    let moveZ = 0;

    if (keys['w'] || keys['arrowup']) {
        moveX += forward.x;
        moveZ += forward.z;
    }

    if (keys['s'] || keys['arrowdown']) {
        moveX -= forward.x;
        moveZ -= forward.z;
    }

    if (keys['a'] || keys['arrowleft']) {
        moveX -= right.x;
        moveZ -= right.z;
    }

    if (keys['d'] || keys['arrowright']) {
        moveX += right.x;
        moveZ += right.z;
    }

    const length = Math.hypot(moveX, moveZ);
    if (length === 0) return false;

    moveX /= length;
    moveZ /= length;

    const distance = PLAYER_SPEED * delta;
    const nextX = camera.position.x + moveX * distance;
    const nextZ = camera.position.z + moveZ * distance;

    if (canMoveTo(nextX, camera.position.z)) camera.position.x = nextX;
    if (canMoveTo(camera.position.x, nextZ)) camera.position.z = nextZ;

    return true;
}

// ========================================
// 8. PICKUPS, DOORS, SENTINELS, EXIT
// ========================================

function slugName(id) {
    return KEY_NAMES[id];
}

function checkInteractions(delta) {
    const px = camera.position.x;
    const pz = camera.position.z;

    lockedToastCooldown -= delta;

    // Orbs
    world.orbs.forEach((orb) => {
        if (orb.collected || Math.hypot(px - orb.x, pz - orb.z) > 0.8) return;

        orb.collected = true;
        orb.mesh.visible = false;
        orbsCollected++;

        sound.playOrbSound();
        ui.setOrbs(orbsCollected, world.orbs.length);
        ui.toast(`Orb collected  ${orbsCollected}/${world.orbs.length}`, 'gold', 1400);
    });

    // Keys
    world.keys.forEach((key) => {
        if (key.collected || Math.hypot(px - key.x, pz - key.z) > 0.9) return;

        key.collected = true;
        key.mesh.visible = false;
        heldKeys.add(key.id);

        sound.playKeySound();
        ui.setKeyState(key.id, 'held');
        ui.toast(`You picked up the ${slugName(key.id)} key!`, 'gold');
    });

    // Doors
    world.doors.forEach((door) => {
        if (door.open || Math.hypot(px - door.x, pz - door.z) > 1.7) return;

        if (heldKeys.has(door.id)) {
            world.openDoor(door);
            heldKeys.delete(door.id);

            sound.playDoorSound();
            ui.setKeyState(door.id, 'used');
            ui.toast(`The ${slugName(door.id)} door unlocks`, 'gold');
        } else if (lockedToastCooldown <= 0) {
            lockedToastCooldown = 2.5;
            sound.playLockedSound();
            ui.toast(`Locked. Find the ${slugName(door.id)} key.`, 'warn');
        }
    });

    // Sentinels
    invulnerableFor = Math.max(0, invulnerableFor - delta);

    if (invulnerableFor === 0) {
        const touching = world.sentinels.some(
            (s) => Math.hypot(px - s.position.x, pz - s.position.z) < SENTINEL_HIT_RADIUS
        );

        if (touching) onSentinelHit();
    }

    // Exit
    const { row, col } = world.toCell(px, pz);

    if (row === world.level.exit.row && col === world.level.exit.col) {
        completeLevel();
    }
}

function recordSafeTrail(delta) {
    safeTrailTimer -= delta;
    if (safeTrailTimer > 0) return;
    safeTrailTimer = 0.5;

    const px = camera.position.x;
    const pz = camera.position.z;
    const safe = world.sentinels.every((s) => Math.hypot(px - s.position.x, pz - s.position.z) > 5);

    if (safe) {
        safeTrail.push({ x: px, z: pz });
        if (safeTrail.length > 14) safeTrail.shift();
    }
}

function onSentinelHit() {
    const px = camera.position.x;
    const pz = camera.position.z;
    const farFromSentinels = (p) =>
        world.sentinels.every((s) => Math.hypot(p.x - s.position.x, p.z - s.position.z) > 5);

    let target = null;
    for (let i = safeTrail.length - 1; i >= 0; i--) {
        const p = safeTrail[i];
        if (Math.hypot(p.x - px, p.z - pz) >= 6 && farFromSentinels(p)) {
            target = p;
            break;
        }
    }

    if (!target) {
        target = safeTrail[0] || world.toWorld(world.level.start.row, world.level.start.col);
    }

    camera.position.x = target.x;
    camera.position.z = target.z;

    elapsedTime += SENTINEL_PENALTY;
    penaltyTime += SENTINEL_PENALTY;
    invulnerableFor = 2.5;
    safeTrail.length = 0;

    sound.playHitSound();
    ui.flashDamage();
    ui.toast(`Caught by a sentinel!  +${SENTINEL_PENALTY}s penalty`, 'warn', 2500);
}

// ========================================
// 9. FLOW: START, PAUSE, COMPLETE
// ========================================

function beginCountdown() {
    state = 'countdown';
    countdownTime = 0;
    lastCountShown = -1;
    clearTimeout(goTimer);

    ui.showOverlay(null);
    requestLock();
}

function startRun() {
    state = 'playing';

    ui.showCountdown('Go', true);
    sound.playCountdownGo();

    clearTimeout(goTimer);
    goTimer = setTimeout(ui.hideCountdown, 800);
}

function updateCountdown(delta) {
    countdownTime += delta;

    if (countdownTime >= COUNT_STEP * 3) {
        startRun();
        return;
    }

    const shown = 3 - Math.floor(countdownTime / COUNT_STEP);

    if (shown !== lastCountShown) {
        lastCountShown = shown;
        ui.showCountdown(String(shown));
        sound.playCountdownTick();
    }
}

function pauseGame() {
    if (!isRunning()) return;

    pausedFrom = state;
    state = 'paused';
    releaseAllKeys();
    sound.stopSentinelHum();

    clearTimeout(goTimer);
    ui.hideCountdown();

    ui.setPauseInfo(`Level ${ui.roman(levelIndex + 1)}, ${levels[levelIndex].name}`);
    ui.showOverlay('pause');

    if (document.pointerLockElement) document.exitPointerLock();
}

function resumeGame() {
    if (state !== 'paused') return;

    state = pausedFrom;
    lastCountShown = -1;

    ui.showOverlay(null);
    requestLock();
}

function completeLevel() {
    if (state !== 'playing') return;

    state = 'complete';
    releaseAllKeys();
    clearTimeout(goTimer);
    ui.hideCountdown();
    sound.stopSentinelHum();

    const level = levels[levelIndex];
    const isLevel10 = levelIndex === LEVEL_COUNT - 1;

    if (isLevel10) {
        sound.playGrandVictorySound();
    } else {
        sound.playVictorySound();
    }

    const allOrbs = orbsCollected === level.orbs.length;
    const underPar = elapsedTime <= level.par;
    const stars = 1 + (allOrbs ? 1 : 0) + (underPar ? 1 : 0);

    const isNewBest = recordResult(progress, levelIndex, elapsedTime, stars, LEVEL_COUNT);

    ui.showResults({
        levelNumber: levelIndex + 1,
        levelName: level.name,
        isLastLevel: isLevel10,
        stars,
        orbsCollected,
        orbsTotal: level.orbs.length,
        par: level.par,
        time: elapsedTime,
        penalty: penaltyTime,
        best: progress.levels[levelIndex].best,
        isNewBest
    });

    const flash = document.getElementById('victory-flash');
    flash.classList.remove('active');
    void flash.offsetWidth;
    flash.classList.add('active');

    setTimeout(() => {
        if (state === 'complete') ui.showOverlay('complete');
    }, 250);

    if (document.pointerLockElement) document.exitPointerLock();
}

function playLevel(index) {
    loadLevel(index);
    beginCountdown();
}

// ========================================
// 10. MENUS AND BUTTONS
// ========================================

let levelsBackTarget = 'title';

function openLevelSelect(from) {
    levelsBackTarget = from;
    ui.renderLevelGrid(levels, progress, (index) => {
        sound.playStartSound();
        playLevel(index);
    });
    ui.showOverlay('levels');
}

function refreshTitle() {
    const hasProgress = progress.unlocked > 0 || Object.keys(progress.levels).length > 0;
    ui.setStartButton(
        hasProgress ? `Continue, Level ${ui.roman(levelIndex + 1)}` : 'Start exploring'
    );
}

// Start Screen Buttons
document.getElementById('start-button').addEventListener('click', () => {
    sound.playStartSound();
    playLevel(Math.min(progress.unlocked, LEVEL_COUNT - 1));
});

document.getElementById('levels-button').addEventListener('click', () => openLevelSelect('title'));

document.getElementById('levels-back-button').addEventListener('click', () => {
    if (levelsBackTarget === 'pause') ui.showOverlay('pause');
    else if (levelsBackTarget === 'complete') ui.showOverlay('complete');
    else {
        refreshTitle();
        ui.showOverlay('title');
    }
});

// How to Play Modal
document.getElementById('help-button').addEventListener('click', () => {
    ui.showOverlay('help');
});

document.getElementById('help-back-button').addEventListener('click', () => {
    ui.showOverlay('title');
    refreshTitle();
});

// Reset Progress Modal
document.getElementById('reset-progress-button').addEventListener('click', () => {
    ui.showOverlay('reset');
});

document.getElementById('confirm-reset-button').addEventListener('click', () => {
    resetProgress();
    progress.unlocked = 0;
    progress.levels = {};
    levelIndex = 0;
    loadLevel(0);
    refreshTitle();
    ui.renderLevelGrid(levels, progress, (index) => {
        sound.playStartSound();
        playLevel(index);
    });
    ui.showOverlay('levels');
    ui.toast('Campaign progress has been reset.', 'info');
});

document.getElementById('cancel-reset-button').addEventListener('click', () => {
    ui.showOverlay('levels');
});

document.getElementById('restart-button').addEventListener('click', () => {
    if (isRunning() || state === 'paused') playLevel(levelIndex);
});

// Pause Menu
document.getElementById('pause-button').addEventListener('click', pauseGame);
document.getElementById('resume-button').addEventListener('click', resumeGame);
document.getElementById('pause-restart-button').addEventListener('click', () => playLevel(levelIndex));
document.getElementById('pause-levels-button').addEventListener('click', () => openLevelSelect('pause'));

const sensitivitySlider = document.getElementById('sens-slider');
sensitivitySlider.value = settings.sensitivity;
ui.setSensitivityLabel(settings.sensitivity);

sensitivitySlider.addEventListener('input', () => {
    settings.sensitivity = parseFloat(sensitivitySlider.value);
    ui.setSensitivityLabel(settings.sensitivity);
    saveSettings(settings);
});

sound.setMuted(settings.muted);
ui.setMuteLabel(settings.muted);

document.getElementById('mute-button').addEventListener('click', () => {
    settings.muted = !settings.muted;
    sound.setMuted(settings.muted);
    ui.setMuteLabel(settings.muted);
    saveSettings(settings);
    if (!settings.muted) sound.playClickSound();
});

ui.setQualityLabel(settings.quality);

document.getElementById('quality-button').addEventListener('click', () => {
    settings.quality = settings.quality === 'detailed' ? 'smooth' : 'detailed';
    ui.setQualityLabel(settings.quality);
    saveSettings(settings);
    applyQuality();
});

ui.setHeadBobLabel(settings.headBob !== false);

document.getElementById('headbob-button').addEventListener('click', () => {
    settings.headBob = !(settings.headBob !== false);
    ui.setHeadBobLabel(settings.headBob);
    saveSettings(settings);
});

// Level Complete
document.getElementById('next-level-button').addEventListener('click', () => {
    sound.playStartSound();
    playLevel(Math.min(levelIndex + 1, LEVEL_COUNT - 1));
});
document.getElementById('replay-button').addEventListener('click', () => playLevel(levelIndex));
document.getElementById('victory-levels-button').addEventListener('click', () => openLevelSelect('complete'));

// Initialize Tier Tabs
ui.setupTierTabs(levels, progress, playLevel);

// ========================================
// 11. WINDOW RESIZING
// ========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ========================================
// 12. ANIMATION LOOP
// ========================================

let lastFrameTime = performance.now();
let backgroundFrame = 0;
let menuTime = 0;
let menuYaw = yaw;
let footstepCooldown = 0;

function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = Math.min((now - lastFrameTime) / 1000, 0.05);
    lastFrameTime = now;
    const playing = state === 'playing';

    if (state === 'paused' || state === 'complete') {
        backgroundFrame++;
        if (backgroundFrame % 3 !== 0) return;
    }

    if (state === 'menu') {
        menuTime += delta;
        yaw = menuYaw + Math.sin(menuTime * 0.25) * 0.55;
        pitch = Math.sin(menuTime * 0.17) * 0.04;
        applyCameraRotation();
    }

    if (state === 'countdown') updateCountdown(delta);

    if (playing) {
        elapsedTime += delta;

        const previousX = camera.position.x;
        const previousZ = camera.position.z;

        const moved = updateMovement(delta);

        // Walking head-bob
        if (moved && settings.headBob !== false) {
            headBobTimer += delta * 10;
            headBobOffset = Math.sin(headBobTimer) * 0.045;
        } else {
            headBobOffset *= Math.exp(-delta * 12);
        }
        camera.position.y = 1.6 + headBobOffset;

        if (moved) {
            footstepCooldown -= delta;
            if (footstepCooldown <= 0) {
                sound.playFootstep();
                footstepCooldown = 0.38;
            }
        } else {
            footstepCooldown = 0;
        }

        recordSafeTrail(delta);
        checkInteractions(delta);
        ui.setTimer(elapsedTime);

        // Dynamic sentinel proximity hum
        if (world) {
            const minSentinelDist = world.getMinSentinelDist(camera.position.x, camera.position.z);
            sound.updateSentinelHum(minSentinelDist);
        }
    } else {
        sound.stopSentinelHum();
    }

    // Torch follows the player and flickers
    const t = now / 1000;
    torch.position.set(camera.position.x, camera.position.y + 0.2, camera.position.z);
    torch.intensity = currentBaseTorchIntensity * (1 + 0.05 * Math.sin(t * 13) + 0.04 * Math.sin(t * 7.3 + 1.7) + 0.02 * Math.sin(t * 31));

    if (world) {
        world.update(t, delta, playing, camera.position);
    }

    // Chart cells around player
    const here = world.toCell(camera.position.x, camera.position.z);
    world.reveal(here.row, here.col);

    drawMinimap(world, camera);
    renderer.render(scene, camera);
}

// ========================================
// 13. START UP
// ========================================

loadLevel(levelIndex);
refreshTitle();
ui.showOverlay('title');
animate();
