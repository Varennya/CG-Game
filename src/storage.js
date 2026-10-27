// ========================================
// SAVED PROGRESS, ACHIEVEMENTS & SETTINGS (localStorage)
// Versioned save system (v2) with backwards compatibility and migration.
// ========================================

const PROGRESS_KEY_V1 = 'mazeExplorer.progress.v1';
const PROGRESS_KEY_V2 = 'mazeExplorer.progress.v2';
const SETTINGS_KEY_V1 = 'mazeExplorer.settings.v1';
const SETTINGS_KEY_V2 = 'mazeExplorer.settings.v2';

export const ACHIEVEMENTS = [
    {
        id: 'first_escape',
        name: 'First Escape',
        desc: 'Escape your first ancient maze.',
        icon: '🚪',
        tokens: 50
    },
    {
        id: 'treasure_hunter',
        name: 'Treasure Hunter',
        desc: 'Collect every glowing orb on at least 5 different levels.',
        icon: '✨',
        tokens: 100
    },
    {
        id: 'speed_runner',
        name: 'Speed Runner',
        desc: 'Beat the target par time on at least 5 levels.',
        icon: '⚡',
        tokens: 150
    },
    {
        id: 'untouched',
        name: 'Untouched',
        desc: 'Complete a level with 0 damage and 0 sentinel penalties.',
        icon: '🛡️',
        tokens: 100
    },
    {
        id: 'hidden_explorer',
        name: 'Hidden Explorer',
        desc: 'Discover a secret hidden passage or ancient relic.',
        icon: '🔍',
        tokens: 120
    },
    {
        id: 'realm_hopper',
        name: 'Realm Hopper',
        desc: 'Unlock and gain access to your second world.',
        icon: '🌀',
        tokens: 200
    },
    {
        id: 'world_conqueror',
        name: 'World Conqueror',
        desc: 'Conquer all 20 chambers in any single world.',
        icon: '👑',
        tokens: 250
    },
    {
        id: 'guardian_slayer',
        name: 'Guardian Slayer',
        desc: 'Overcome at least one ancient guardian encounter.',
        icon: '⚔️',
        tokens: 250
    },
    {
        id: 'relic_collector',
        name: 'Relic Collector',
        desc: 'Collect 3 or more sacred ancient relics.',
        icon: '💎',
        tokens: 300
    },
    {
        id: 'master_of_the_maze',
        name: 'Master of the Maze',
        desc: 'Conquer all 80 chambers across the 4 themed worlds.',
        icon: '🏆',
        tokens: 600
    },
    {
        id: 'ultimate_explorer',
        name: 'Ultimate Explorer',
        desc: 'Attain 100 or more campaign stars across your adventure.',
        icon: '🌟',
        tokens: 1200
    }
];

export const COSMETICS = [
    { id: 'default', name: 'Standard Aura', desc: 'Subtle torchlight reflection', unlockStars: 0 },
    { id: 'gold_spark', name: 'Golden Sparks', desc: 'Radiant gold embers trailing your steps', unlockStars: 15 },
    { id: 'frost_shimmer', name: 'Frost Shimmer', desc: 'Chilled crystalline glints that cool the stone', unlockStars: 35 },
    { id: 'ember_flame', name: 'Volcanic Embers', desc: 'Fiery magma sparks rising from your heels', unlockStars: 70 },
    { id: 'void_mist', name: 'Void Mist', desc: 'Ethereal purple shadow motes from the architect', unlockStars: 120 }
];

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? { ...fallback, ...JSON.parse(raw) } : { ...fallback };
    } catch (error) {
        return { ...fallback };
    }
}

function write(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        // Fallback for private windows or storage quotas
    }
}

export function loadProgress() {
    // Check v2 storage
    let rawV2 = null;
    try {
        const s = localStorage.getItem(PROGRESS_KEY_V2);
        if (s) rawV2 = JSON.parse(s);
    } catch (e) {}

    if (rawV2 && typeof rawV2 === 'object') {
        rawV2.unlocked = typeof rawV2.unlocked === 'number' ? rawV2.unlocked : 0;
        rawV2.levels = rawV2.levels || {};
        rawV2.achievements = rawV2.achievements || {};
        rawV2.tokens = typeof rawV2.tokens === 'number' ? rawV2.tokens : 0;
        rawV2.cosmetics = Array.isArray(rawV2.cosmetics) ? rawV2.cosmetics : ['default'];
        rawV2.activeCosmetic = rawV2.activeCosmetic || 'default';
        rawV2.unlockedWorlds = Array.isArray(rawV2.unlockedWorlds) ? rawV2.unlockedWorlds : ['ruins'];
        if (!rawV2.unlockedWorlds.includes('ruins')) rawV2.unlockedWorlds.unshift('ruins');

        // Safe auto-migration for players who already reached higher levels
        if (rawV2.unlocked >= 20 && !rawV2.unlockedWorlds.includes('ice')) rawV2.unlockedWorlds.push('ice');
        if (rawV2.unlocked >= 40 && !rawV2.unlockedWorlds.includes('lava')) rawV2.unlockedWorlds.push('lava');
        if (rawV2.unlocked >= 60 && !rawV2.unlockedWorlds.includes('shadow')) rawV2.unlockedWorlds.push('shadow');

        return rawV2;
    }

    // Migrate from v1
    const v1 = read(PROGRESS_KEY_V1, { unlocked: 0, levels: {} });
    const freshV2 = {
        version: 2,
        unlocked: v1.unlocked || 0,
        levels: v1.levels || {},
        achievements: {},
        tokens: 0,
        cosmetics: ['default'],
        activeCosmetic: 'default',
        unlockedWorlds: ['ruins']
    };

    saveProgress(freshV2);
    return freshV2;
}

export function saveProgress(progress) {
    progress.version = 2;
    write(PROGRESS_KEY_V2, progress);
}

export function resetProgress() {
    const fresh = {
        version: 2,
        unlocked: 0,
        levels: {},
        achievements: {},
        tokens: 0,
        cosmetics: ['default'],
        activeCosmetic: 'default',
        unlockedWorlds: ['ruins']
    };
    saveProgress(fresh);
    return fresh;
}

export function isLevelUnlocked(progress, globalIndex, level) {
    if (!level) return false;
    const worlds = Array.isArray(progress.unlockedWorlds) ? progress.unlockedWorlds : ['ruins'];
    if (!worlds.includes(level.worldId)) {
        return false;
    }
    // Chamber 1 of an unlocked world is always unlocked
    if (level.worldLevelNumber === 1) {
        return true;
    }
    // Previous chamber completed in this world
    const prevIndex = globalIndex - 1;
    if (progress.levels[prevIndex] && (progress.levels[prevIndex].stars >= 1 || progress.levels[prevIndex].best !== undefined)) {
        return true;
    }
    // Or unlocked via legacy linear index
    if (typeof progress.unlocked === 'number' && progress.unlocked >= globalIndex) {
        return true;
    }
    return false;
}

export function canUnlockWorld(progress, world, totalLevels = 80) {
    const summary = getProgressSummary(progress, totalLevels);
    const crit = world.unlockCriteria || { tokens: 0, stars: 0, achievements: 0 };
    const tokens = progress.tokens || 0;
    const stars = summary.starsEarned;
    const achievementsCount = Object.keys(progress.achievements || {}).length;

    const tokensMet = tokens >= (crit.tokens || 0);
    const starsMet = stars >= (crit.stars || 0);
    const achMet = achievementsCount >= (crit.achievements || 0);

    return {
        canUnlock: tokensMet && starsMet && achMet,
        tokensMet,
        starsMet,
        achMet,
        currentTokens: tokens,
        requiredTokens: crit.tokens || 0,
        currentStars: stars,
        requiredStars: crit.stars || 0,
        currentAchievements: achievementsCount,
        requiredAchievements: crit.achievements || 0
    };
}

export function unlockWorld(progress, worldId, cost = 0) {
    progress.unlockedWorlds = progress.unlockedWorlds || ['ruins'];
    if (!progress.unlockedWorlds.includes(worldId)) {
        if (cost > 0) {
            progress.tokens = Math.max(0, (progress.tokens || 0) - cost);
        }
        progress.unlockedWorlds.push(worldId);
        saveProgress(progress);
        return true;
    }
    return false;
}

export function getProgressSummary(progress, totalLevels = 80) {
    let starsEarned = 0;
    let completedLevels = 0;
    let totalTime = 0;
    let relicsFound = 0;

    for (let i = 0; i < totalLevels; i++) {
        const record = progress.levels[i];
        if (record) {
            completedLevels++;
            starsEarned += record.stars || 0;
            totalTime += record.best || 0;
            if (record.relicFound) relicsFound++;
        }
    }

    return {
        starsEarned,
        maxStars: totalLevels * 3,
        completedLevels,
        totalLevels,
        unlocked: progress.unlocked,
        totalTime,
        relicsFound,
        tokens: progress.tokens || 0,
        unlockedWorlds: progress.unlockedWorlds || ['ruins']
    };
}

export function recordResult(progress, index, time, stars, levelCount = 80, extraInfo = {}) {
    const previous = progress.levels[index];
    const isNewBest = !previous || time < previous.best;

    progress.levels[index] = {
        best: isNewBest ? time : previous.best,
        stars: Math.max(stars, previous ? previous.stars : 0),
        relicFound: Boolean(extraInfo.relicFound || (previous && previous.relicFound)),
        bossDefeated: Boolean(extraInfo.bossDefeated || (previous && previous.bossDefeated)),
        allOrbs: Boolean(extraInfo.allOrbs || (previous && previous.allOrbs)),
        underPar: Boolean(extraInfo.underPar || (previous && previous.underPar)),
        untouched: Boolean(extraInfo.penalty === 0 || (previous && previous.untouched))
    };

    progress.unlocked = Math.max(progress.unlocked, Math.min(index + 1, levelCount - 1));

    // Award tokens for run
    const tokenReward = stars * 25 + (isNewBest ? 50 : 10) + (extraInfo.relicFound ? 100 : 0);
    progress.tokens = (progress.tokens || 0) + tokenReward;

    // Check cosmetic unlocks
    const summary = getProgressSummary(progress, levelCount);
    COSMETICS.forEach((c) => {
        if (summary.starsEarned >= c.unlockStars && !progress.cosmetics.includes(c.id)) {
            progress.cosmetics.push(c.id);
        }
    });

    saveProgress(progress);
    return isNewBest;
}

export function checkAchievements(progress, runResult = {}) {
    const newlyUnlocked = [];
    progress.achievements = progress.achievements || {};

    function award(id) {
        if (!progress.achievements[id]) {
            progress.achievements[id] = Date.now();
            const ach = ACHIEVEMENTS.find(a => a.id === id);
            if (ach) {
                progress.tokens = (progress.tokens || 0) + ach.tokens;
                newlyUnlocked.push(ach);
            }
        }
    }

    const summary = getProgressSummary(progress, 80);

    // 1. First Escape
    if (summary.completedLevels >= 1) award('first_escape');

    // 2. Treasure Hunter (all orbs on 5 levels)
    let allOrbsCount = 0;
    Object.values(progress.levels).forEach(r => { if (r.allOrbs || r.stars >= 2) allOrbsCount++; });
    if (allOrbsCount >= 5) award('treasure_hunter');

    // 3. Speed Runner (under par on 5 levels)
    let underParCount = 0;
    Object.values(progress.levels).forEach(r => { if (r.underPar || r.stars === 3) underParCount++; });
    if (underParCount >= 5) award('speed_runner');

    // 4. Untouched
    if (runResult.penalty === 0 && runResult.completed) award('untouched');

    // 5. Hidden Explorer
    if (runResult.relicFound || summary.relicsFound >= 1) award('hidden_explorer');

    // 6. Realm Hopper (unlocked at least 2 worlds)
    if ((progress.unlockedWorlds || []).length >= 2) award('realm_hopper');

    // 7. World Conqueror (any world fully cleared: 20 levels each)
    const worldCleared = [
        Array.from({ length: 20 }, (_, i) => i),
        Array.from({ length: 20 }, (_, i) => i + 20),
        Array.from({ length: 20 }, (_, i) => i + 40),
        Array.from({ length: 20 }, (_, i) => i + 60)
    ].some(indices => indices.every(idx => progress.levels[idx]));
    if (worldCleared) award('world_conqueror');

    // 8. Guardian Slayer
    if (runResult.bossDefeated || Object.values(progress.levels).some(r => r.bossDefeated)) {
        award('guardian_slayer');
    }

    // 9. Relic Collector
    if (summary.relicsFound >= 3) award('relic_collector');

    // 10. Master of the Maze (80 levels)
    if (summary.completedLevels >= 80) award('master_of_the_maze');

    // 11. Ultimate Explorer (100 stars)
    if (summary.starsEarned >= 100) award('ultimate_explorer');

    if (newlyUnlocked.length > 0) {
        saveProgress(progress);
    }

    return newlyUnlocked;
}

export function loadSettings() {
    // Check v2 settings or fallback to v1
    const v1 = read(SETTINGS_KEY_V1, { sensitivity: 1, muted: false, quality: 'smooth', headBob: true });
    const settings = read(SETTINGS_KEY_V2, {
        sensitivity: v1.sensitivity ?? 1,
        muted: v1.muted ?? false,
        masterVol: 1,
        sfxVol: 1,
        musicVol: 0.6,
        quality: v1.quality || 'smooth',
        headBob: v1.headBob !== false,
        screenShake: true,
        activeCosmetic: 'default'
    });
    return settings;
}

export function saveSettings(settings) {
    write(SETTINGS_KEY_V2, settings);
}
