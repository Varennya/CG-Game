// ========================================
// LEVELS
//   - Levels 1-2 are hand-crafted ASCII maps.
//   - Levels 3-5 are generated from a fixed seed, so a level is always
//     the same maze (best times stay meaningful).
//
// Source map legend (hand-crafted levels):
//   #  wall          .  floor
//   S  start         E  exit
//   o  orb           a/b/c  key (amber / magenta / green)
//   A/B/C  matching locked door
// ========================================

export const CELL_SIZE = 2;
export const PLAYER_SPEED = 4;

export const KEY_COLORS = [0xffb020, 0xd946ef, 0x34d399];
export const KEY_NAMES = ['amber', 'magenta', 'green'];

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function isDoorChar(ch) {
    return ch === 'A' || ch === 'B' || ch === 'C';
}

export function doorChar(id) {
    return String.fromCharCode(65 + id);
}

// ----------------------------------------
// Level definitions
// ----------------------------------------

const LEVEL_DEFS = [
    {
        id: 1,
        name: 'First Steps',
        subtitle: 'Learn the ropes. Collect the glowing orbs if you can.',
        grid: [
            '#############',
            '#S#........o#',
            '#.#.#########',
            '#.#.....#..E#',
            '#.#####.#.###',
            '#..o..#.#...#',
            '#####.#.###.#',
            '#.....#.....#',
            '#.#########.#',
            '#.....o.....#',
            '#############'
        ]
    },
    {
        id: 2,
        name: 'The Amber Gate',
        subtitle: 'A locked gate, a hidden key and a patrolling sentinel.',
        grid: [
            '###################',
            '#S......#a........#',
            '#.#####.#####.###.#',
            '#.#..o#.....#...#.#',
            '#.#.#####.#####.#.#',
            '#.....#...#o......#',
            '###.#.###.###.#####',
            '#...#.....#...#...#',
            '#.###.#.###.###.#.#',
            '#.#.....#.......#o#',
            '#.#.###.#.###.#####',
            '#.....#.....#.A...#',
            '###.#.#####.#.#.#.#',
            '#o..#.........#..E#',
            '###################'
        ],
        sentinels: [{ route: [[9, 5], [11, 9]], speed: 1.7 }]
    },
    {
        id: 3,
        name: 'Winding Halls',
        subtitle: 'A bigger maze with a locked door and a sentinel on patrol.',
        generate: { seed: 31, cellsW: 8, cellsH: 8, doors: 1, orbs: 5, loops: 0.12, sentinels: 1, sentinelSpeed: 1.8 }
    },
    {
        id: 4,
        name: 'Crossroads',
        subtitle: 'More loops, more ways to go wrong, and a faster sentinel.',
        generate: { seed: 7, cellsW: 10, cellsH: 10, doors: 1, orbs: 6, loops: 0.14, sentinels: 1, sentinelSpeed: 2.2 }
    },
    {
        id: 5,
        name: 'The Labyrinth',
        subtitle: 'Two doors, two sentinels, and a very large maze.',
        generate: { seed: 19, cellsW: 12, cellsH: 12, doors: 2, orbs: 8, loops: 0.14, sentinels: 2, sentinelSpeed: 2.4 }
    }
];

export const LEVEL_COUNT = LEVEL_DEFS.length;

// ----------------------------------------
// Grid helpers
// ----------------------------------------

function passable(grid, row, col, blocked) {
    const ch = grid[row]?.[col];
    if (ch === undefined || ch === '#') return false;
    if (isDoorChar(ch) && blocked.has(ch)) return false;
    return true;
}

// Breadth-first search. `blocked` is a Set of door characters treated as walls.
function bfs(grid, start, blocked = new Set()) {
    const rows = grid.length;
    const cols = grid[0].length;
    const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));

    if (!passable(grid, start.row, start.col, blocked)) return { dist, prev };

    dist[start.row][start.col] = 0;
    const queue = [start];

    for (let head = 0; head < queue.length; head++) {
        const { row, col } = queue[head];

        for (const [dr, dc] of DIRS) {
            const nr = row + dr;
            const nc = col + dc;

            if (passable(grid, nr, nc, blocked) && dist[nr][nc] < 0) {
                dist[nr][nc] = dist[row][col] + 1;
                prev[nr][nc] = { row, col };
                queue.push({ row: nr, col: nc });
            }
        }
    }

    return { dist, prev };
}

function pathBetween(grid, a, b, blocked = new Set()) {
    const { dist, prev } = bfs(grid, a, blocked);
    if (dist[b.row][b.col] < 0) return null;

    const path = [];
    let cur = { row: b.row, col: b.col };

    while (cur) {
        path.push(cur);
        cur = prev[cur.row][cur.col];
    }

    return path.reverse();
}

function openNeighbours(grid, row, col) {
    let n = 0;
    for (const [dr, dc] of DIRS) {
        if (passable(grid, row + dr, col + dc, new Set())) n++;
    }
    return n;
}

function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function mulberry32(seed) {
    let a = seed;
    return function () {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ----------------------------------------
// Hand-crafted levels
// ----------------------------------------

function parseLevel(def) {
    const rows = def.grid.length;
    const cols = def.grid[0].length;
    const grid = [];
    const orbs = [];
    const keys = [];
    const doors = [];
    let start = null;
    let exit = null;

    for (let r = 0; r < rows; r++) {
        if (def.grid[r].length !== cols) {
            throw new Error(`Level ${def.id}: row ${r} has the wrong length`);
        }

        const line = [];

        for (let c = 0; c < cols; c++) {
            const ch = def.grid[r][c];
            let cell = '.';

            if (ch === '#') cell = '#';
            else if (ch === 'S') start = { row: r, col: c };
            else if (ch === 'E') exit = { row: r, col: c };
            else if (ch === 'o') orbs.push({ row: r, col: c });
            else if (ch >= 'a' && ch <= 'c') keys.push({ id: ch.charCodeAt(0) - 97, row: r, col: c });
            else if (isDoorChar(ch)) {
                cell = ch;
                doors.push({ id: ch.charCodeAt(0) - 65, row: r, col: c });
            }

            line.push(cell);
        }

        grid.push(line);
    }

    const level = {
        id: def.id,
        name: def.name,
        subtitle: def.subtitle,
        rows,
        cols,
        grid,
        start,
        exit,
        orbs,
        keys: keys.sort((a, b) => a.id - b.id),
        doors: doors.sort((a, b) => a.id - b.id),
        sentinels: []
    };

    (def.sentinels || []).forEach((s) => {
        const a = { row: s.route[0][0], col: s.route[0][1] };
        const b = { row: s.route[1][0], col: s.route[1][1] };
        const path = pathBetween(grid, a, b, new Set(level.doors.map((d) => doorChar(d.id))));

        if (!path) throw new Error(`Level ${def.id}: sentinel route is not connected`);
        level.sentinels.push({ path, speed: s.speed });
    });

    return level;
}

// ----------------------------------------
// Generated levels
// ----------------------------------------

function generateLevel(def) {
    const cfg = def.generate;
    const rng = mulberry32(cfg.seed);
    const rows = cfg.cellsH * 2 + 1;
    const cols = cfg.cellsW * 2 + 1;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));

    // 1. Perfect maze (recursive backtracker)
    const stack = [[1, 1]];
    grid[1][1] = '.';

    while (stack.length) {
        const [r, c] = stack[stack.length - 1];
        const options = [];

        for (const [dr, dc] of DIRS) {
            const nr = r + dr * 2;
            const nc = c + dc * 2;
            if (nr > 0 && nr < rows - 1 && nc > 0 && nc < cols - 1 && grid[nr][nc] === '#') {
                options.push([dr, dc]);
            }
        }

        if (!options.length) {
            stack.pop();
            continue;
        }

        const [dr, dc] = options[Math.floor(rng() * options.length)];
        grid[r + dr][c + dc] = '.';
        grid[r + dr * 2][c + dc * 2] = '.';
        stack.push([r + dr * 2, c + dc * 2]);
    }

    const start = { row: 1, col: 1 };

    // 2. Exit = the cell farthest from the start
    const fromStart = bfs(grid, start).dist;
    let exit = start;
    let best = -1;

    for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
            if (fromStart[r][c] > best) {
                best = fromStart[r][c];
                exit = { row: r, col: c };
            }
        }
    }

    // 3. Doors on the (unique) solution path, always on a straight passage cell
    const solution = pathBetween(grid, start, exit);
    const doors = [];
    const fractions = cfg.doors === 1 ? [0.55] : cfg.doors === 2 ? [0.38, 0.72] : [];

    for (let i = 0; i < cfg.doors; i++) {
        const target = Math.floor((solution.length - 1) * fractions[i]);
        let chosen = null;

        for (let offset = 0; offset < solution.length && !chosen; offset++) {
            for (const idx of [target + offset, target - offset]) {
                const cell = solution[idx];
                if (!cell) continue;

                const isPassage = (cell.row % 2 === 0) !== (cell.col % 2 === 0);
                const farFromOthers = doors.every((d) => manhattan(d, cell) >= 6);
                const notEnds = manhattan(cell, start) > 4 && manhattan(cell, exit) > 4;

                if (isPassage && farFromOthers && notEnds) {
                    chosen = cell;
                    break;
                }
            }
        }

        grid[chosen.row][chosen.col] = doorChar(i);
        doors.push({ id: i, row: chosen.row, col: chosen.col });
    }

    // 4. Keys: key i lives in an area reachable while doors i.. are still closed
    const keys = [];
    let previousDist = null;

    for (let i = 0; i < cfg.doors; i++) {
        const blocked = new Set(doors.filter((d) => d.id >= i).map((d) => doorChar(d.id)));
        const { dist } = bfs(grid, start, blocked);
        let candidates = [];

        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                if (dist[r][c] > 0 && grid[r][c] === '.') {
                    const beyondPrevious = i === 0 || previousDist[r][c] < 0;
                    if (beyondPrevious) candidates.push({ row: r, col: c, d: dist[r][c] });
                }
            }
        }

        const deadEnds = candidates.filter((cell) => openNeighbours(grid, cell.row, cell.col) === 1);
        if (deadEnds.length) candidates = deadEnds;

        candidates.sort((a, b) => b.d - a.d);
        const pick = candidates[Math.floor(rng() * Math.min(3, candidates.length))];

        keys.push({ id: i, row: pick.row, col: pick.col });
        previousDist = dist;
    }

    // 5. Loops (extra openings), but never ones that let you skip a door
    const doorChars = doors.map((d) => doorChar(d.id));
    const doorsIntact = () =>
        doorChars.every((ch) => bfs(grid, start, new Set([ch])).dist[exit.row][exit.col] < 0);

    const wallCandidates = [];

    for (let r = 1; r < rows - 1; r++) {
        for (let c = 1; c < cols - 1; c++) {
            if (grid[r][c] !== '#') continue;

            const horizontalWall = r % 2 === 1 && c % 2 === 0 && grid[r][c - 1] === '.' && grid[r][c + 1] === '.';
            const verticalWall = r % 2 === 0 && c % 2 === 1 && grid[r - 1][c] === '.' && grid[r + 1][c] === '.';

            if (horizontalWall || verticalWall) wallCandidates.push({ row: r, col: c });
        }
    }

    for (let i = wallCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [wallCandidates[i], wallCandidates[j]] = [wallCandidates[j], wallCandidates[i]];
    }

    const loopTarget = Math.round(cfg.loops * cfg.cellsW * cfg.cellsH);
    let loopsAdded = 0;

    for (const wall of wallCandidates) {
        if (loopsAdded >= loopTarget) break;

        grid[wall.row][wall.col] = '.';

        if (doorsIntact()) loopsAdded++;
        else grid[wall.row][wall.col] = '#';
    }

    // 6. Orbs: spread out, dead ends first
    const used = [start, exit, ...keys, ...doors];
    const orbCells = [];

    for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
            if (grid[r][c] === '.' && !used.some((u) => u.row === r && u.col === c)) {
                orbCells.push({ row: r, col: c, dead: openNeighbours(grid, r, c) === 1 });
            }
        }
    }

    for (let i = orbCells.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [orbCells[i], orbCells[j]] = [orbCells[j], orbCells[i]];
    }

    orbCells.sort((a, b) => Number(b.dead) - Number(a.dead));

    const orbs = [];

    for (const spacing of [10, 6, 3, 0]) {
        for (const cell of orbCells) {
            if (orbs.length >= cfg.orbs) break;
            if (orbs.includes(cell)) continue;

            const farEnough = [...orbs, ...keys, start].every((o) => manhattan(o, cell) >= spacing);
            if (farEnough) orbs.push(cell);
        }
    }

    // 7. Sentinels: patrol a stretch of corridor away from the start, keys and exit
    const allDoors = new Set(doorChars);
    const fromStartClosed = bfs(grid, start, allDoors).dist;
    const sentinels = [];
    const nodeCells = [];

    for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
            if (grid[r][c] === '.') nodeCells.push({ row: r, col: c });
        }
    }

    for (let s = 0; s < cfg.sentinels; s++) {
        for (let attempt = 0; attempt < 80; attempt++) {
            const a = nodeCells[Math.floor(rng() * nodeCells.length)];
            if (fromStartClosed[a.row][a.col] < 8) continue;

            const { dist } = bfs(grid, a, allDoors);
            const ends = nodeCells.filter((b) => dist[b.row][b.col] >= 7 && dist[b.row][b.col] <= 13);
            if (!ends.length) continue;

            const b = ends[Math.floor(rng() * ends.length)];
            const path = pathBetween(grid, a, b, allDoors);

            const safe = path.every(
                (cell) =>
                    manhattan(cell, start) > 5 &&
                    manhattan(cell, exit) > 3 &&
                    keys.every((k) => manhattan(cell, k) > 2) &&
                    sentinels.every((o) => o.path.every((p) => manhattan(p, cell) > 3))
            );

            if (safe) {
                sentinels.push({ path, speed: cfg.sentinelSpeed });
                break;
            }
        }
    }

    return {
        id: def.id,
        name: def.name,
        subtitle: def.subtitle,
        rows,
        cols,
        grid,
        start,
        exit,
        orbs: orbs.map(({ row, col }) => ({ row, col })),
        keys,
        doors,
        sentinels
    };
}

// ----------------------------------------
// Shared finishing steps
// ----------------------------------------

// Par time: the ideal route (start -> keys -> exit) at walking speed, with generous slack
function computePar(level) {
    const stops = [level.start, ...level.keys, level.exit];
    // The doors are open by the time you need to cross them, so ignore them here
    const open = level.grid.map((row) => row.map((ch) => (isDoorChar(ch) ? '.' : ch)));
    let cells = 0;

    for (let i = 0; i < stops.length - 1; i++) {
        cells += bfs(open, stops[i]).dist[stops[i + 1].row][stops[i + 1].col];
    }

    const seconds = cells * (CELL_SIZE / PLAYER_SPEED) * 2.6 + 15;
    return Math.round(seconds / 5) * 5;
}

function finish(level) {
    level.par = computePar(level);
    return level;
}

// Returns a list of problems. An empty list means the level is solvable.
export function validateLevel(level) {
    const problems = [];
    const { grid, start, exit } = level;

    if (!start) problems.push('missing start');
    if (!exit) problems.push('missing exit');
    if (problems.length) return problems;

    const held = new Set();
    let changed = true;

    // Collect keys in whatever order the doors allow
    while (changed) {
        changed = false;
        const blocked = new Set(
            level.doors.filter((d) => !held.has(d.id)).map((d) => doorChar(d.id))
        );
        const { dist } = bfs(grid, start, blocked);

        for (const key of level.keys) {
            if (!held.has(key.id) && dist[key.row][key.col] >= 0) {
                held.add(key.id);
                changed = true;
            }
        }
    }

    const finalBlocked = new Set(
        level.doors.filter((d) => !held.has(d.id)).map((d) => doorChar(d.id))
    );
    const final = bfs(grid, start, finalBlocked).dist;

    if (final[exit.row][exit.col] < 0) problems.push('exit is not reachable');
    level.keys.forEach((k) => {
        if (!held.has(k.id)) problems.push(`key ${k.id} is not reachable`);
    });
    level.doors.forEach((d) => {
        if (!level.keys.some((k) => k.id === d.id)) problems.push(`door ${d.id} has no key`);
    });
    level.orbs.forEach((o, i) => {
        if (final[o.row][o.col] < 0) problems.push(`orb ${i} is not reachable`);
    });

    // Every door must really block the exit while it is closed
    level.doors.forEach((d) => {
        const { dist } = bfs(grid, start, new Set([doorChar(d.id)]));
        if (dist[exit.row][exit.col] >= 0) problems.push(`door ${d.id} can be bypassed`);
    });

    level.sentinels.forEach((s, i) => {
        if (s.path.length < 2) problems.push(`sentinel ${i} has no route`);
    });

    return problems;
}

// ----------------------------------------
// Public API
// ----------------------------------------

const cache = new Map();

export function getLevel(index) {
    if (!cache.has(index)) {
        const def = LEVEL_DEFS[index];
        const level = def.generate ? generateLevel(def) : parseLevel(def);
        cache.set(index, finish(level));
    }

    return cache.get(index);
}
