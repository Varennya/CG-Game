// ========================================
// SAVED PROGRESS AND SETTINGS (localStorage)
// Safe wrappers with fallback handling.
// ========================================

const PROGRESS_KEY = 'mazeExplorer.progress.v1';
const SETTINGS_KEY = 'mazeExplorer.settings.v1';

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
        // Fallback for private windows
    }
}

export function loadProgress() {
    const progress = read(PROGRESS_KEY, { unlocked: 0, levels: {} });
    progress.levels = progress.levels || {};
    if (typeof progress.unlocked !== 'number' || isNaN(progress.unlocked)) {
        progress.unlocked = 0;
    }
    return progress;
}

export function saveProgress(progress) {
    write(PROGRESS_KEY, progress);
}

export function resetProgress() {
    const fresh = { unlocked: 0, levels: {} };
    saveProgress(fresh);
    return fresh;
}

export function getProgressSummary(progress, totalLevels = 10) {
    let starsEarned = 0;
    let completedLevels = 0;

    for (let i = 0; i < totalLevels; i++) {
        const record = progress.levels[i];
        if (record) {
            completedLevels++;
            starsEarned += record.stars || 0;
        }
    }

    return {
        starsEarned,
        maxStars: totalLevels * 3,
        completedLevels,
        totalLevels,
        unlocked: progress.unlocked
    };
}

export function recordResult(progress, index, time, stars, levelCount) {
    const previous = progress.levels[index];
    const isNewBest = !previous || time < previous.best;

    progress.levels[index] = {
        best: isNewBest ? time : previous.best,
        stars: Math.max(stars, previous ? previous.stars : 0)
    };

    progress.unlocked = Math.max(progress.unlocked, Math.min(index + 1, levelCount - 1));
    saveProgress(progress);

    return isNewBest;
}

export function loadSettings() {
    return read(SETTINGS_KEY, { sensitivity: 1, muted: false, quality: 'smooth', headBob: true });
}

export function saveSettings(settings) {
    write(SETTINGS_KEY, settings);
}
