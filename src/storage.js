// ========================================
// SAVED PROGRESS AND SETTINGS (localStorage)
// Every access is wrapped in try/catch because storage can be
// unavailable (private windows, blocked site data, etc.)
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
        // Ignore: the game still works, progress just won't persist
    }
}

// progress = { unlocked: <highest unlocked level index>, levels: { [index]: { best, stars } } }
export function loadProgress() {
    const progress = read(PROGRESS_KEY, { unlocked: 0, levels: {} });
    progress.levels = progress.levels || {};
    return progress;
}

export function saveProgress(progress) {
    write(PROGRESS_KEY, progress);
}

// Records a finished level. Returns whether it was a new best time.
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
    return read(SETTINGS_KEY, { sensitivity: 1, muted: false, quality: 'smooth' });
}

export function saveSettings(settings) {
    write(SETTINGS_KEY, settings);
}
