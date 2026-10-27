// ========================================
// UI CONTROLLER & OVERLAYS
// MAZE EXPLORER 3D: ULTIMATE EDITION
// ========================================

import { KEY_COLORS, KEY_NAMES, TIERS } from './levels.js';
import { getProgressSummary } from './storage.js';

const $ = (id) => document.getElementById(id);

// ----------------------------------------
// Time Formatting Helpers
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
// Overlays Management
// ----------------------------------------

const overlays = {
    title: $('start-overlay'),
    levels: $('levels-overlay'),
    pause: $('pause-overlay'),
    complete: $('victory-overlay'),
    help: $('help-overlay'),
    reset: $('reset-modal')
};

export function showOverlay(name) {
    document.body.classList.toggle('in-menu', Boolean(name));
    Object.entries(overlays).forEach(([key, element]) => {
        if (!element) return;
        element.classList.toggle('hidden', key !== name);
    });
}

// ----------------------------------------
// Gameplay HUD
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

    const tierBadge = $('hud-tier-badge');
    if (tierBadge) {
        tierBadge.textContent = `Tier ${roman(level.tier)}: ${level.tierName}`;
        tierBadge.className = `badge-tier tier-${level.tier}`;
    }

    const objEl = $('hud-objective');
    if (objEl) {
        objEl.textContent = level.objective || 'Find the golden exit portal.';
    }

    $('hud-par').textContent = formatTime(level.par);
    $('hud-best').textContent = best === undefined ? '--:--' : formatTime(best);

    document.body.classList.toggle('dim-level', level.visibility === 'dim');
    document.body.classList.toggle('dark-level', level.visibility === 'dark');

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

export function setKeyState(id, state) {
    const slot = $('key-slot-' + id);
    if (!slot) return;
    slot.classList.toggle('held', state === 'held');
    slot.classList.toggle('used', state === 'used');
}

// ----------------------------------------
// Notifications & Damage Flash
// ----------------------------------------

const toastElement = $('toast');
let toastTimer = null;

export function toast(text, kind = 'info', duration = 2400) {
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
    void damageFlash.offsetWidth;
    damageFlash.classList.add('active');
}

// ----------------------------------------
// Title Screen
// ----------------------------------------

export function setStartButton(text) {
    $('start-button').textContent = text;
}

// ----------------------------------------
// Level Selection (10 Levels with Tier Filtering)
// ----------------------------------------

let currentTierFilter = 'all';

export function renderLevelGrid(levels, progress, onSelect) {
    const grid = $('level-grid');
    grid.innerHTML = '';

    // Update Campaign Summary Banner
    const summary = getProgressSummary(progress, levels.length);
    const starsEl = $('summary-stars');
    const compEl = $('summary-completed');
    if (starsEl) starsEl.textContent = `★ ${summary.starsEarned}/${summary.maxStars}`;
    if (compEl) compEl.textContent = `${summary.completedLevels}/${summary.totalLevels}`;

    const quickBtn = $('quick-play-button');
    if (quickBtn) {
        const nextIndex = Math.min(progress.unlocked, levels.length - 1);
        quickBtn.textContent = `Play Level ${roman(nextIndex + 1)}`;
        quickBtn.onclick = () => onSelect(nextIndex);
    }

    // Filter levels
    const filteredLevels = levels.filter((lvl) => {
        if (currentTierFilter === 'all') return true;
        return String(lvl.tier) === String(currentTierFilter);
    });

    filteredLevels.forEach((level) => {
        const index = level.id - 1;
        const locked = index > progress.unlocked;
        const isNext = index === progress.unlocked;
        const record = progress.levels[index];
        const stars = record ? record.stars : 0;

        const card = document.createElement('button');
        card.className = `level-card tier-${level.tier}` + (isNext && !locked ? ' next-recommended' : '');
        card.disabled = locked;

        const chips = [`<span>${level.orbs.length} orbs</span>`];
        if (level.keys.length) chips.push(`<span>${level.keys.length === 1 ? '1 key' : level.keys.length + ' keys'}</span>`);
        if (level.sentinels.length) {
            chips.push(`<span>${level.sentinels.length === 1 ? '1 sentinel' : level.sentinels.length + ' sentinels'}</span>`);
        }
        if (level.visibility === 'dim') {
            chips.push('<span class="chip-dim">dim light</span>');
        } else if (level.visibility === 'dark') {
            chips.push('<span class="chip-dark">darkness</span>');
        }

        const starText = [0, 1, 2]
            .map((i) => (i < stars ? '<span>★</span>' : '<span class="dim">★</span>'))
            .join('');

        card.innerHTML = locked
            ? `
                <div class="card-top">
                    <span class="card-tier tier-${level.tier}">Tier ${roman(level.tier)}</span>
                    <span class="tablet-numeral">${roman(level.id)}</span>
                </div>
                <span class="tablet-name">Sealed Chamber</span>
                <span class="tablet-meta">Conquer Level ${roman(level.id - 1)} to unlock.</span>
                <svg class="icon tablet-lock"><use href="#i-lock"/></svg>
            `
            : `
                <div class="card-top">
                    <span class="card-tier tier-${level.tier}">Tier ${roman(level.tier)}: ${level.tierName}</span>
                    <span class="tablet-numeral">${roman(level.id)}</span>
                </div>
                <span class="tablet-name">${level.name}</span>
                <span class="tablet-objective">${level.objective || ''}</span>
                <span class="tablet-meta">${chips.join('')}</span>
                <span class="tablet-foot">
                    <span class="tablet-times">
                        <span>${record ? 'Best ' + formatTime(record.best) : 'Not played'}</span>
                        <span>Par ${formatTime(level.par)}</span>
                    </span>
                    <span class="tablet-stars">${starText}</span>
                </span>
            `;

        card.addEventListener('click', () => onSelect(index));
        grid.appendChild(card);
    });
}

export function setupTierTabs(levels, progress, onSelect) {
    const tabs = document.querySelectorAll('.tier-tab');
    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            currentTierFilter = tab.getAttribute('data-tier');
            renderLevelGrid(levels, progress, onSelect);
        });
    });
}

// ----------------------------------------
// Results Screen
// ----------------------------------------

export function showResults(result) {
    const isLevel10 = result.isLastLevel;
    $('victory-title').textContent = isLevel10 ? 'THE ARCHITECT IS CONQUERED' : 'You Escaped!';
    $('victory-name').textContent = isLevel10
        ? 'Level X: The Architect\'s Trial &bull; All 10 Mazes Mastered!'
        : `Level ${roman(result.levelNumber)}, ${result.levelName}`;

    const starElements = document.querySelectorAll('#victory-stars .star');
    starElements.forEach((star, i) => {
        star.classList.remove('earned');
        void star.offsetWidth;

        if (i < result.stars) {
            star.style.setProperty('--delay', 0.35 + i * 0.3 + 's');
            star.classList.add('earned');
        }
    });

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
// Settings & Pause
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

export function setHeadBobLabel(enabled) {
    const button = $('headbob-button');
    if (!button) return;
    button.textContent = enabled ? 'On' : 'Off';
    button.classList.toggle('off', !enabled);
}

// ----------------------------------------
// 3-2-1 Countdown
// ----------------------------------------

const countdownElement = $('countdown');
const countdownText = $('countdown-text');

export function showCountdown(text, go = false) {
    countdownText.textContent = text;
    countdownElement.classList.remove('hidden');
    countdownElement.classList.toggle('go', go);

    countdownText.style.animation = 'none';
    void countdownText.offsetWidth;
    countdownText.style.animation = '';
}

export function hideCountdown() {
    countdownElement.classList.add('hidden');
}
