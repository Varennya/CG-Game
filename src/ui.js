// ========================================
// UI HELPERS
// Overlays, HUD, toasts, level select and the results screen.
// (All game rules live in main.js; this file only touches the DOM.)
// ========================================

import { KEY_COLORS, KEY_NAMES } from './levels.js';

const $ = (id) => document.getElementById(id);

// ----------------------------------------
// Time formatting
// ----------------------------------------

export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);

    return String(minutes).padStart(2, '0') + ':' + String(remaining).padStart(2, '0');
}

export function formatTimePrecise(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds - minutes * 60;

    return String(minutes).padStart(2, '0') + ':' + remaining.toFixed(1).padStart(4, '0');
}

export function roman(n) {
    return ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n);
}

// ----------------------------------------
// Overlays: only one is visible at a time
// ----------------------------------------

const overlays = {
    title: $('start-overlay'),
    levels: $('levels-overlay'),
    pause: $('pause-overlay'),
    complete: $('victory-overlay')
};

export function showOverlay(name) {
    // Menus get a clean screen: the HUD is hidden behind them
    document.body.classList.toggle('in-menu', Boolean(name));
    Object.entries(overlays).forEach(([key, element]) => {
        element.classList.toggle('hidden', key !== name);
    });
}

// ----------------------------------------
// HUD
// ----------------------------------------

const timerDisplay = $('timer');
let lastTimerText = '';

export function setTimer(seconds) {
    const text = formatTime(seconds);

    if (text !== lastTimerText) {
        timerDisplay.textContent = text;
        lastTimerText = text;
    }
}

export function setLevelHUD(level, index, best) {
    $('hud-level-num').textContent = roman(index + 1);
    $('hud-level-name').textContent = level.name;
    $('hud-par').textContent = formatTime(level.par);
    $('hud-best').textContent = best === undefined ? '--:--' : formatTime(best);

    setOrbs(0, level.orbs.length);

    const slots = $('hud-keys');
    slots.innerHTML = '';

    level.keys.forEach((key) => {
        const slot = document.createElement('span');
        slot.className = 'key-slot';
        slot.id = 'key-slot-' + key.id;
        slot.style.setProperty('--c', '#' + KEY_COLORS[key.id].toString(16).padStart(6, '0'));
        slot.title = KEY_NAMES[key.id] + ' key';
        slots.appendChild(slot);
    });

    $('hud-keys-stat').classList.toggle('hidden', level.keys.length === 0);
    lastTimerText = '';
    setTimer(0);
}

export function setOrbs(collected, total) {
    const element = $('hud-orbs');
    element.textContent = collected + '/' + total;
    element.classList.toggle('gold', total > 0 && collected === total);
}

// state: 'held' | 'used'
export function setKeyState(id, state) {
    const slot = $('key-slot-' + id);
    if (!slot) return;

    slot.classList.toggle('held', state === 'held');
    slot.classList.toggle('used', state === 'used');
}

// ----------------------------------------
// Toast and damage flash
// ----------------------------------------

const toastElement = $('toast');
let toastTimer = null;

export function toast(text, kind = 'info', duration = 2200) {
    toastElement.textContent = text;
    toastElement.className = 'show ' + kind;

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastElement.classList.remove('show');
    }, duration);
}

export function clearToast() {
    clearTimeout(toastTimer);
    toastElement.classList.remove('show');
}

const damageFlash = $('damage-flash');

export function flashDamage() {
    damageFlash.classList.remove('active');
    void damageFlash.offsetWidth; // restart the animation
    damageFlash.classList.add('active');
}

// ----------------------------------------
// Title screen
// ----------------------------------------

export function setStartButton(text) {
    $('start-button').textContent = text;
}

// ----------------------------------------
// Level select
// ----------------------------------------

export function renderLevelGrid(levels, progress, onSelect) {
    const grid = $('level-grid');
    grid.innerHTML = '';

    levels.forEach((level, index) => {
        const locked = index > progress.unlocked;
        const record = progress.levels[index];
        const stars = record ? record.stars : 0;

        const card = document.createElement('button');
        card.className = 'level-card';
        card.disabled = locked;

        const chips = [`<span>${level.orbs.length} orbs</span>`];
        if (level.keys.length) chips.push(`<span>${level.keys.length === 1 ? '1 key' : level.keys.length + ' keys'}</span>`);
        if (level.sentinels.length) {
            chips.push(`<span>${level.sentinels.length === 1 ? '1 sentinel' : level.sentinels.length + ' sentinels'}</span>`);
        }

        const starText = [0, 1, 2]
            .map((i) => (i < stars ? '<span>★</span>' : '<span class="dim">★</span>'))
            .join('');

        card.innerHTML = locked
            ? `
                <span class="tablet-numeral">${roman(index + 1)}</span>
                <span class="tablet-name">Sealed</span>
                <span class="tablet-meta">Finish level ${roman(index)} to open this one.</span>
                <svg class="icon tablet-lock"><use href="#i-lock"/></svg>
            `
            : `
                <span class="tablet-numeral">${roman(index + 1)}</span>
                <span class="tablet-name">${level.name}</span>
                <span class="tablet-meta">${chips.join('')}</span>
                <span class="tablet-foot">
                    <span class="tablet-times">
                        <span>${record ? 'Best ' + formatTime(record.best) : 'Not played yet'}</span>
                        <span>Par ${formatTime(level.par)}</span>
                    </span>
                    <span class="tablet-stars">${starText}</span>
                </span>
            `;

        card.addEventListener('click', () => onSelect(index));
        grid.appendChild(card);
    });
}

// ----------------------------------------
// Level complete screen
// ----------------------------------------

export function showResults(result) {
    $('victory-title').textContent = result.isLastLevel ? 'You conquered the labyrinth' : 'You escaped';
    $('victory-name').textContent = `Level ${roman(result.levelNumber)}, ${result.levelName}`;

    // Stars
    const starElements = document.querySelectorAll('#victory-stars .star');
    starElements.forEach((star, i) => {
        star.classList.remove('earned');
        void star.offsetWidth;

        if (i < result.stars) {
            star.style.setProperty('--delay', 0.35 + i * 0.3 + 's');
            star.classList.add('earned');
        }
    });

    // What each star needed
    $('res-orbs-text').textContent = `Collect every orb, ${result.orbsCollected} of ${result.orbsTotal}`;
    $('res-par-text').textContent = `Finish under par, ${formatTime(result.par)}`;
    $('res-orbs').classList.toggle('earned', result.orbsCollected === result.orbsTotal);
    $('res-par').classList.toggle('earned', result.time <= result.par);

    $('final-time').textContent = formatTimePrecise(result.time);
    $('penalty-note').textContent = result.penalty > 0 ? `Includes ${result.penalty} seconds of sentinel penalties.` : '';
    $('final-best').textContent = formatTimePrecise(result.best);
    $('new-best-badge').classList.toggle('hidden', !result.isNewBest);
    $('next-level-button').classList.toggle('hidden', result.isLastLevel);
}

// ----------------------------------------
// Pause menu
// ----------------------------------------

export function setPauseInfo(text) {
    $('pause-level').textContent = text;
}

export function setSensitivityLabel(value) {
    $('sens-value').textContent = value.toFixed(1) + '×';
}

export function setMuteLabel(muted) {
    const button = $('mute-button');
    button.textContent = muted ? 'Off' : 'On';
    button.classList.toggle('off', muted);
}

export function setQualityLabel(quality) {
    $('quality-button').textContent = quality === 'detailed' ? 'Detailed' : 'Smooth';
}

// ----------------------------------------
// 3-2-1 countdown
// ----------------------------------------

const countdownElement = $('countdown');
const countdownText = $('countdown-text');

export function showCountdown(text, go = false) {
    countdownText.textContent = text;
    countdownElement.classList.remove('hidden');
    countdownElement.classList.toggle('go', go);

    // Restart the pop animation for every new number
    countdownText.style.animation = 'none';
    void countdownText.offsetWidth;
    countdownText.style.animation = '';
}

export function hideCountdown() {
    countdownElement.classList.add('hidden');
}
