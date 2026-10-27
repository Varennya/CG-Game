// ========================================
// UI CONTROLLER & OVERLAYS
// MAZE EXPLORER 3D: ADVANCED EXPANSION (PHASE 2)
// ========================================

import { KEY_COLORS, KEY_NAMES, TIERS, WORLDS } from './levels.js';
import { getProgressSummary, ACHIEVEMENTS, COSMETICS, isLevelUnlocked, canUnlockWorld } from './storage.js';

const $ = (id) => document.getElementById(id);

// ----------------------------------------
// Time Formatting Helpers
// ----------------------------------------

export function formatTime(seconds) {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    return String(minutes).padStart(2, '0') + ':' + String(remaining).padStart(2, '0');
}

export function formatTimePrecise(seconds) {
    if (seconds === undefined || seconds === null || isNaN(seconds)) return '--:--.-';
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds - minutes * 60;
    return String(minutes).padStart(2, '0') + ':' + remaining.toFixed(1).padStart(4, '0');
}

export function roman(n) {
    return [
        '', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
        'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
    ][n] || String(n);
}

// ----------------------------------------
// Overlays Management
// ----------------------------------------

const overlays = {
    title: $('start-overlay'),
    levels: $('levels-overlay'),
    worlds: $('worlds-overlay'),
    achievements: $('achievements-overlay'),
    settings: $('settings-overlay'),
    help: $('help-overlay'),
    credits: $('credits-overlay'),
    pause: $('pause-overlay'),
    complete: $('victory-overlay'),
    grandVictory: $('grand-victory-overlay'),
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
    const chamberNum = level.worldLevelNumber || (index % 20 + 1);
    $('hud-level-num').textContent = roman(chamberNum);
    $('hud-level-name').textContent = level.name;

    const tierBadge = $('hud-tier-badge');
    if (tierBadge) {
        tierBadge.textContent = `${level.tierName || 'Ancient Ruins'} • Chamber ${roman(chamberNum)}`;
        tierBadge.className = `badge-tier tier-${level.tier || 1}`;
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
        slot.style.setProperty('--c', '#' + (KEY_COLORS[key.id] || 0xffb020).toString(16).padStart(6, '0'));
        slot.title = (KEY_NAMES[key.id] || 'ancient') + ' key';
        slots.appendChild(slot);
    });

    $('hud-keys-stat').classList.toggle('hidden', level.keys.length === 0);

    const relicStat = $('hud-relic-stat');
    if (relicStat) relicStat.classList.add('hidden');

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

export function showRelicHUD(found) {
    const relicStat = $('hud-relic-stat');
    if (relicStat) relicStat.classList.toggle('hidden', !found);
}

// ----------------------------------------
// Notifications & Visual Feedback
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

const teleportFlash = $('teleport-flash');
export function flashTeleport() {
    if (!teleportFlash) return;
    teleportFlash.classList.remove('active');
    void teleportFlash.offsetWidth;
    teleportFlash.classList.add('active');
    setTimeout(() => {
        teleportFlash.classList.remove('active');
    }, 400);
}

// ----------------------------------------
// Title Screen
// ----------------------------------------

export function setStartButton(mainText, subText) {
    const btn = $('start-button');
    if (!btn) return;
    const mainEl = btn.querySelector('.btn-main-text');
    const subEl = $('start-button-sub');
    if (mainEl) {
        mainEl.textContent = mainText;
    } else {
        btn.textContent = mainText;
    }
    if (subEl && subText !== undefined) {
        subEl.textContent = subText;
    }
}

export function updateHomeProfile(progress, totalLevels, worlds) {
    const starsEl = $('home-stars-stat');
    const tokensEl = $('home-tokens-stat');
    const clearedEl = $('home-cleared-stat');
    const realmsEl = $('home-realms-stat');

    if (starsEl) {
        const totalStars = progress.totalStars || 0;
        const maxStars = totalLevels * 3;
        starsEl.textContent = `★ ${totalStars}/${maxStars}`;
    }
    if (tokensEl) {
        tokensEl.textContent = `🪙 ${progress.tokens || 0}`;
    }
    if (clearedEl) {
        const clearedCount = Object.keys(progress.levels || {}).length;
        clearedEl.textContent = `${clearedCount}/${totalLevels}`;
    }
    if (realmsEl) {
        const unlockedCount = progress.unlockedWorlds ? progress.unlockedWorlds.length : 1;
        const totalWorlds = worlds ? worlds.length : 4;
        realmsEl.textContent = `${unlockedCount}/${totalWorlds}`;
    }
}

// ----------------------------------------
// World & Chamber Selection (20 Chambers per World)
// ----------------------------------------

let activeWorldId = 'ruins';

export function setActiveWorld(worldId) {
    activeWorldId = worldId;
}

export function getActiveWorld() {
    return activeWorldId;
}

export function renderLevelGrid(worlds, levels, progress, onSelect, onUnlockWorld) {
    const navTabs = $('world-nav-tabs');
    const grid = $('level-grid');
    const lockPortal = $('world-lock-portal');
    if (!navTabs || !grid || !lockPortal) return;

    const unlockedWorlds = progress.unlockedWorlds || ['ruins'];

    // Ensure activeWorldId is valid
    if (!worlds.some(w => w.id === activeWorldId)) {
        activeWorldId = worlds[0] ? worlds[0].id : 'ruins';
    }

    // 1. Render World Navigation Tabs
    navTabs.innerHTML = '';
    worlds.forEach(w => {
        const isUnlocked = unlockedWorlds.includes(w.id);
        const wLevels = levels.filter(lvl => lvl.worldId === w.id);
        const completedCount = wLevels.filter(lvl => Boolean(progress.levels[lvl.id - 1])).length;

        const tabBtn = document.createElement('button');
        tabBtn.className = `world-nav-tab world-${w.id}` + (w.id === activeWorldId ? ' active' : '') + (isUnlocked ? ' is-unlocked' : ' is-locked');

        const badgeHtml = isUnlocked
            ? `<span class="tab-badge unlocked">${completedCount}/${wLevels.length}</span>`
            : `<span class="tab-badge locked">🔒 ${w.unlockCriteria ? w.unlockCriteria.tokens : 0} 🪙</span>`;

        tabBtn.innerHTML = `
            <div class="tab-left">
                <span class="tab-icon">${w.icon}</span>
                <div class="tab-text">
                    <strong class="tab-title">${w.name}</strong>
                    <span class="tab-sub">Tier ${roman(w.tier)}</span>
                </div>
            </div>
            ${badgeHtml}
        `;

        tabBtn.addEventListener('click', () => {
            activeWorldId = w.id;
            renderLevelGrid(worlds, levels, progress, onSelect, onUnlockWorld);
        });

        navTabs.appendChild(tabBtn);
    });

    const currentWorld = worlds.find(w => w.id === activeWorldId) || worlds[0];
    const isCurrentWorldUnlocked = unlockedWorlds.includes(currentWorld.id);
    const worldLevels = levels.filter(lvl => lvl.worldId === currentWorld.id);

    // 2. Update Active World Banner & Stats
    const worldStars = worldLevels.reduce((sum, lvl) => {
        const r = progress.levels[lvl.id - 1];
        return sum + (r ? r.stars : 0);
    }, 0);
    const worldCompleted = worldLevels.filter(lvl => Boolean(progress.levels[lvl.id - 1])).length;

    const bannerEl = $('world-active-banner');
    if (bannerEl) {
        bannerEl.className = `world-active-banner slab world-${currentWorld.id}`;
    }

    const iconEl = $('active-world-icon');
    const nameEl = $('active-world-name');
    const badgeEl = $('active-world-badge');
    const descEl = $('active-world-desc');
    const starsEl = $('summary-world-stars');
    const compEl = $('summary-world-completed');
    const tokensEl = $('summary-tokens');
    const quickBtn = $('quick-play-button');

    if (iconEl) iconEl.textContent = currentWorld.icon;
    if (nameEl) nameEl.textContent = currentWorld.name;
    if (badgeEl) {
        badgeEl.textContent = `Tier ${roman(currentWorld.tier)} • ${currentWorld.theme}`;
        badgeEl.className = `badge-tier tier-${currentWorld.tier}`;
    }
    if (descEl) descEl.textContent = currentWorld.desc;
    if (starsEl) starsEl.textContent = `★ ${worldStars}/${worldLevels.length * 3}`;
    if (compEl) compEl.textContent = `${worldCompleted}/${worldLevels.length}`;
    if (tokensEl) tokensEl.textContent = `🪙 ${progress.tokens || 0}`;

    // 3. Quick Play button logic
    if (quickBtn) {
        if (isCurrentWorldUnlocked) {
            // Find next playable level in this world
            let nextPlayable = worldLevels.find(lvl => !progress.levels[lvl.id - 1] && isLevelUnlocked(progress, lvl.id - 1, lvl));
            if (!nextPlayable) {
                // If all completed, point to level 1 or boss
                nextPlayable = worldLevels[0];
            }
            const chamberNum = nextPlayable ? (nextPlayable.worldLevelNumber || 1) : 1;
            quickBtn.disabled = false;
            quickBtn.textContent = `Play Chamber ${roman(chamberNum)}`;
            quickBtn.onclick = () => {
                if (nextPlayable) onSelect(nextPlayable.id - 1);
            };
        } else {
            quickBtn.disabled = true;
            quickBtn.textContent = `Realm Locked`;
        }
    }

    // 4. Render Content (Grid of 20 levels OR World Lock Portal)
    if (isCurrentWorldUnlocked) {
        grid.classList.remove('hidden');
        lockPortal.classList.add('hidden');
        grid.innerHTML = '';

        worldLevels.forEach((level) => {
            const index = level.id - 1;
            const unlocked = isLevelUnlocked(progress, index, level);
            const record = progress.levels[index];
            const stars = record ? record.stars : 0;
            const isBoss = Boolean(level.boss);
            const chamberNum = level.worldLevelNumber || (index % 20 + 1);

            const card = document.createElement('button');
            card.className = `level-card tier-${level.tier}` +
                (unlocked && !record ? ' next-recommended' : '') +
                (record ? ' card-completed' : '') +
                (!unlocked ? ' card-locked' : '') +
                (isBoss ? ' card-boss' : '');
            card.disabled = !unlocked;

            const chips = [];
            chips.push(`<span class="chip-item">🟡 ${level.orbs.length} Orbs</span>`);
            if (level.keys && level.keys.length) {
                const keyColors = { amber: '#f59e0b', magenta: '#d946ef', green: '#10b981', cyan: '#06b6d4' };
                const keyCol = keyColors[level.keys[0].type] || '#f59e0b';
                chips.push(`<span class="chip-item" style="color:${keyCol}">🗝️ ${level.keys.length > 1 ? level.keys.length + ' Keys' : 'Key'}</span>`);
            }
            if (level.sentinels && level.sentinels.length) {
                chips.push(`<span class="chip-item chip-danger">👁️ Sentinel</span>`);
            }
            if (record && record.relicFound) chips.push('<span class="chip-item gold">💎 Relic</span>');

            const starText = [0, 1, 2]
                .map((i) => (i < stars ? '<span class="star-gold">★</span>' : '<span class="star-dim">★</span>'))
                .join('');

            card.innerHTML = !unlocked
                ? `
                    <div class="card-top">
                        <span class="card-tier tier-${level.tier}">Chamber ${roman(chamberNum)}</span>
                        <span class="tablet-numeral">${roman(chamberNum)}</span>
                    </div>
                    <div class="card-mid">
                        <span class="tablet-name locked-name">Sealed Chamber</span>
                        <span class="locked-requirement">🔒 Clear Chamber ${roman(chamberNum - 1)}</span>
                    </div>
                    <div class="tablet-foot locked-foot">
                        <span class="locked-pill">Locked</span>
                    </div>
                `
                : `
                    <div class="card-top">
                        <span class="card-tier tier-${level.tier}">Chamber ${roman(chamberNum)}</span>
                        <span class="tablet-numeral">${roman(chamberNum)}</span>
                    </div>
                    <div class="card-mid">
                        <span class="tablet-name" title="${level.name}">${level.name}</span>
                        <div class="tablet-chips-row">${chips.join('')}</div>
                    </div>
                    <div class="tablet-foot">
                        <div class="tablet-times">
                            <span class="time-par">par ${formatTime(level.par)}</span>
                            ${record ? `<span class="time-best">best ${formatTime(record.best)}</span>` : `<span class="time-new">unplayed</span>`}
                        </div>
                        <div class="tablet-stars">${starText}</div>
                    </div>
                `;

            card.addEventListener('click', () => onSelect(index));
            grid.appendChild(card);
        });
    } else {
        // Render World Lock Portal
        grid.classList.add('hidden');
        lockPortal.classList.remove('hidden');
        lockPortal.innerHTML = '';

        const unlockStatus = canUnlockWorld(progress, currentWorld, levels.length);
        const tokensPercent = Math.min(100, Math.round((unlockStatus.currentTokens / (unlockStatus.requiredTokens || 1)) * 100));
        const starsPercent = Math.min(100, Math.round((unlockStatus.currentStars / (unlockStatus.requiredStars || 1)) * 100));
        const achPercent = Math.min(100, Math.round((unlockStatus.currentAchievements / (unlockStatus.requiredAchievements || 1)) * 100));

        const portalCard = document.createElement('div');
        portalCard.className = 'world-lock-card slab';
        portalCard.innerHTML = `
            <div class="lock-card-header">
                <span class="lock-card-icon">${currentWorld.icon}</span>
                <div>
                    <div class="lock-card-badge">🔒 Realm Locked • Tier ${roman(currentWorld.tier)}</div>
                    <h3 class="lock-card-title">${currentWorld.name}</h3>
                </div>
            </div>
            <p class="lock-card-desc">${currentWorld.desc}</p>
            
            <div class="lock-criteria-section">
                <h4>Realm Unlock Criteria</h4>
                <div class="criteria-list">
                    <div class="criteria-item ${unlockStatus.tokensMet ? 'met' : ''}">
                        <span class="criteria-icon">${unlockStatus.tokensMet ? '✓' : '🪙'}</span>
                        <div class="criteria-body">
                            <div class="criteria-row">
                                <strong>Adventure Tokens (Points)</strong>
                                <span>${unlockStatus.currentTokens} / ${unlockStatus.requiredTokens}</span>
                            </div>
                            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${tokensPercent}%;"></div></div>
                        </div>
                    </div>
                    <div class="criteria-item ${unlockStatus.starsMet ? 'met' : ''}">
                        <span class="criteria-icon">${unlockStatus.starsMet ? '✓' : '★'}</span>
                        <div class="criteria-body">
                            <div class="criteria-row">
                                <strong>Campaign Stars</strong>
                                <span>${unlockStatus.currentStars} / ${unlockStatus.requiredStars}</span>
                            </div>
                            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${starsPercent}%;"></div></div>
                        </div>
                    </div>
                    <div class="criteria-item ${unlockStatus.achMet ? 'met' : ''}">
                        <span class="criteria-icon">${unlockStatus.achMet ? '✓' : '🏆'}</span>
                        <div class="criteria-body">
                            <div class="criteria-row">
                                <strong>Achievements Earned</strong>
                                <span>${unlockStatus.currentAchievements} / ${unlockStatus.requiredAchievements}</span>
                            </div>
                            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${achPercent}%;"></div></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lock-action-bar">
                ${unlockStatus.canUnlock ? `
                    <button id="btn-unlock-current-world" class="primary-button unlock-world-btn">
                        🔓 Buy & Unlock ${currentWorld.name} (🪙 ${unlockStatus.requiredTokens} Tokens)
                    </button>
                ` : `
                    <button class="secondary-button" disabled style="width: 100%; opacity: 0.65; cursor: not-allowed;">
                        🔒 Locked — Earn more tokens, stars & achievements in prior worlds
                    </button>
                    <p style="margin: 8px 0 0; font-size: 13px; color: var(--parchment-dim); text-align: center;">
                        Play more chambers in Ancient Ruins to earn tokens and achievements!
                    </p>
                `}
            </div>
        `;

        if (unlockStatus.canUnlock) {
            const unlockBtn = portalCard.querySelector('#btn-unlock-current-world');
            if (unlockBtn) {
                unlockBtn.addEventListener('click', () => {
                    if (onUnlockWorld) onUnlockWorld(currentWorld);
                });
            }
        }

        lockPortal.appendChild(portalCard);
    }
}

// ----------------------------------------
// World Hub Overlay
// ----------------------------------------

export function renderWorldsGrid(worlds, levels, progress, onSelectWorld, onUnlockWorld) {
    const grid = $('worlds-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const unlockedWorlds = progress.unlockedWorlds || ['ruins'];

    worlds.forEach((w) => {
        const isUnlocked = unlockedWorlds.includes(w.id);
        const worldLevels = levels.filter(lvl => lvl.worldId === w.id);
        const completedCount = worldLevels.filter(lvl => Boolean(progress.levels[lvl.id - 1])).length;
        const totalStars = worldLevels.reduce((sum, lvl) => {
            const r = progress.levels[lvl.id - 1];
            return sum + (r ? r.stars : 0);
        }, 0);

        const card = document.createElement('div');
        card.className = `world-card world-${w.id}` + (isUnlocked ? ' unlocked' : ' locked');

        const unlockStatus = canUnlockWorld(progress, w, levels.length);

        card.innerHTML = `
            <div class="world-card-header">
                <span class="world-card-icon">${w.icon}</span>
                <div>
                    <h3 class="world-card-name">${w.name}</h3>
                    <span class="world-card-tier">Tier ${roman(w.tier || 1)} • ${isUnlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
            </div>
            <p class="world-card-desc">${w.desc}</p>
            <div class="world-card-stats">
                <span>Chambers: <b>${completedCount}/${worldLevels.length}</b></span>
                <span>Stars: <b class="gold">★ ${totalStars}/${worldLevels.length * 3}</b></span>
            </div>
            ${isUnlocked ? `
                <button class="primary-button compact btn-explore-world" style="margin-top: 12px; width: 100%;">
                    Explore World
                </button>
            ` : `
                <div style="margin-top: 10px; font-size: 12px; color: var(--parchment-dim);">
                    Requires: 🪙 ${w.unlockCriteria ? w.unlockCriteria.tokens : 0} &bull; ★ ${w.unlockCriteria ? w.unlockCriteria.stars : 0} &bull; 🏆 ${w.unlockCriteria ? w.unlockCriteria.achievements : 0}
                </div>
                ${unlockStatus.canUnlock ? `
                    <button class="primary-button compact btn-unlock-world" style="margin-top: 8px; width: 100%;">
                        🔓 Unlock (🪙 ${w.unlockCriteria.tokens})
                    </button>
                ` : `
                    <button class="secondary-button compact" disabled style="margin-top: 8px; width: 100%; opacity: 0.6; cursor: not-allowed;">
                        🔒 Locked
                    </button>
                `}
            `}
        `;

        if (isUnlocked) {
            const btn = card.querySelector('.btn-explore-world');
            if (btn) btn.addEventListener('click', () => onSelectWorld(w));
        } else if (unlockStatus.canUnlock) {
            const btn = card.querySelector('.btn-unlock-world');
            if (btn) btn.addEventListener('click', () => onUnlockWorld(w));
        }

        grid.appendChild(card);
    });
}

// ----------------------------------------
// Achievements Overlay
// ----------------------------------------

export function renderAchievementsGrid(achievements, progress) {
    const grid = $('achievements-grid');
    if (!grid) return;
    grid.innerHTML = '';

    achievements.forEach((ach) => {
        const unlocked = Boolean(progress.achievements && progress.achievements[ach.id]);
        const card = document.createElement('div');
        card.className = `achievement-card` + (unlocked ? ' unlocked' : '');

        card.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-body">
                <h4 class="ach-name">${ach.name}</h4>
                <p class="ach-desc">${ach.desc}</p>
                <span class="ach-bounty">${unlocked ? '✓ Unlocked' : '🪙 ' + ach.tokens + ' tokens'}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ----------------------------------------
// Cosmetics Selector
// ----------------------------------------

export function populateCosmeticsSelect(cosmetics, activeId, onChange) {
    const select = $('cosmetic-select');
    if (!select) return;
    select.innerHTML = '';

    cosmetics.forEach((c) => {
        const option = document.createElement('option');
        option.value = c.id;
        option.textContent = `${c.name} (${c.desc})`;
        if (c.id === activeId) option.selected = true;
        select.appendChild(option);
    });

    select.onchange = () => onChange(select.value);
}

// ----------------------------------------
// Results Screen
// ----------------------------------------

export function showResults(result) {
    const isLevel20 = result.isLastLevel;
    $('victory-title').textContent = isLevel20 ? 'THE SHADOW ARCHITECT FALLS' : 'You Escaped!';
    $('victory-name').textContent = isLevel20
        ? 'Level XX: Final Trial &bull; The 20th Maze Mastered!'
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

    const relicBadge = $('relic-earned-badge');
    if (relicBadge) relicBadge.classList.toggle('hidden', !result.relicFound);

    const tokenEl = $('earned-tokens');
    if (tokenEl) tokenEl.textContent = `+${result.stars * 25 + (result.isNewBest ? 50 : 10)} 🪙`;

    $('next-level-button').classList.toggle('hidden', result.isLastLevel);
}

export function showGrandVictory(summary) {
    const sStars = $('grand-stars');
    const sComp = $('grand-completed');
    const sRelics = $('grand-relics');
    const sTokens = $('grand-tokens');

    if (sStars) sStars.textContent = `★ ${summary.starsEarned}/${summary.maxStars}`;
    if (sComp) sComp.textContent = `${summary.completedLevels}/${summary.totalLevels}`;
    if (sRelics) sRelics.textContent = `💎 ${summary.relicsFound}/4`;
    if (sTokens) sTokens.textContent = `🪙 ${summary.tokens}`;

    showOverlay('grandVictory');
}

// ----------------------------------------
// Settings Labels
// ----------------------------------------

export function setPauseInfo(text) {
    $('pause-level').textContent = text;
}

export function setSensitivityLabel(value) {
    $('sens-value').textContent = value.toFixed(1) + '×';
}

export function setMasterVolLabel(value) {
    const el = $('master-vol-value');
    if (el) el.textContent = Math.round(value * 100) + '%';
}

export function setSfxVolLabel(value) {
    const el = $('sfx-vol-value');
    if (el) el.textContent = Math.round(value * 100) + '%';
}

export function setMuteLabel(muted) {
    const button = $('mute-button');
    if (!button) return;
    button.textContent = muted ? 'On' : 'Off';
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

export function setShakeLabel(enabled) {
    const button = $('shake-button');
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
