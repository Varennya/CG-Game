// ========================================
// LEVELS & GRAPH ALGORITHMS
// MAZE EXPLORER 3D: ULTIMATE EDITION
//
// 10 Progressive Levels across 4 Difficulty Tiers:
//   Tier 1: BEGINNER — Ruins of Discovery (Levels 1-2)
//   Tier 2: INTERMEDIATE — The Forgotten Temple (Levels 3-5)
//   Tier 3: ADVANCED — The Shadow Labyrinth (Levels 6-8)
//   Tier 4: EXPERT — The Architect's Trial (Levels 9-10)
//
// Graph Algorithms:
//   - BFS (Shortest path, level connectivity & reachability verification)
//   - DFS (Deep tree exploration demonstration)
//   - A* (Heuristic-guided optimal pathfinding with Manhattan distance)
//   - Graph Complexity Metrics (Junctions, dead ends, branching factor)
// ========================================

export const CELL_SIZE = 2;
export const PLAYER_SPEED = 4;

export const KEY_COLORS = [0xffb020, 0xd946ef, 0x34d399];
export const KEY_NAMES = ['amber', 'magenta', 'green'];

export const TIERS = [
    { id: 1, name: 'Beginner', subtitle: 'Ruins of Discovery', color: '#5fa896', badge: 'Tier I' },
    { id: 2, name: 'Intermediate', subtitle: 'The Forgotten Temple', color: '#f0a63a', badge: 'Tier II' },
    { id: 3, name: 'Advanced', subtitle: 'The Shadow Labyrinth', color: '#a78bfa', badge: 'Tier III' },
    { id: 4, name: 'Expert', subtitle: "The Architect's Trial", color: '#ef4444', badge: 'Tier IV' }
];

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function isDoorChar(ch) {
    return ch === 'A' || ch === 'B' || ch === 'C';
}

export function doorChar(id) {
    return String.fromCharCode(65 + id);
}

// ----------------------------------------
// Level Definitions (10 Levels across 4 Tiers)
// ----------------------------------------

const LEVEL_DEFS = [
    // ---------------- Tier 1: BEGINNER (Ruins of Discovery) ----------------
    {
        id: 1,
        tier: 1,
        tierName: 'Beginner',
        name: 'First Steps',
        subtitle: 'Learn the ropes. Collect the glowing orbs and step into the exit.',
        theme: 'sunstone',
        objective: 'Learn basic movement and reach the golden exit portal.',
        hint: 'Use W, A, S, D to walk and mouse to look around. Follow corridors to find the glowing exit.',
        visibility: 'clear',
        lighting: {
            fogDensity: 0.045,
            torchDistance: 24,
            torchDecay: 1.8,
            ambient: 0.65,
            directional: 0.6,
            torchIntensity: 13
        },
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
        tier: 1,
        tierName: 'Beginner',
        name: 'The Amber Gate',
        subtitle: 'A locked amber gate, a hidden key and a patrolling sentinel.',
        theme: 'sunstone',
        objective: 'Find the Amber Key, unlock the Amber Gate and escape.',
        hint: 'Walk over the Amber Key to pick it up, then walk up to the glowing Amber Door to unlock it.',
        visibility: 'clear',
        lighting: {
            fogDensity: 0.052,
            torchDistance: 22,
            torchDecay: 1.8,
            ambient: 0.60,
            directional: 0.6,
            torchIntensity: 13
        },
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

    // ---------------- Tier 2: INTERMEDIATE (The Forgotten Temple) ----------------
    {
        id: 3,
        tier: 2,
        tierName: 'Intermediate',
        name: 'Winding Halls',
        subtitle: 'A bigger maze veiled in mist, with a locked door and sentinel.',
        theme: 'mossy',
        objective: 'Locate the key in the misty halls, avoid the sentinel, and escape.',
        hint: 'Sentinels add a 10-second penalty on contact. Track their patrol route and sneak past.',
        visibility: 'dim',
        lighting: {
            fogDensity: 0.088,
            torchDistance: 15,
            torchDecay: 2.0,
            ambient: 0.32,
            directional: 0.22,
            torchIntensity: 12
        },
        generate: { seed: 31, cellsW: 8, cellsH: 8, doors: 1, orbs: 5, loops: 0.12, sentinels: 1, sentinelSpeed: 1.8 }
    },
    {
        id: 4,
        tier: 2,
        tierName: 'Intermediate',
        name: 'Crossroads',
        subtitle: 'Dim torchlight, twisting loops, and a swift sentinel in the mist.',
        theme: 'mossy',
        objective: 'Explore branching corridors, locate the key and unlock the way forward.',
        hint: 'Use the minimap in the corner to see charted paths and avoid getting turned around.',
        visibility: 'dim',
        lighting: {
            fogDensity: 0.105,
            torchDistance: 13,
            torchDecay: 2.1,
            ambient: 0.25,
            directional: 0.18,
            torchIntensity: 11.5
        },
        generate: { seed: 7, cellsW: 10, cellsH: 10, doors: 1, orbs: 6, loops: 0.14, sentinels: 1, sentinelSpeed: 2.2 }
    },
    {
        id: 5,
        tier: 2,
        tierName: 'Intermediate',
        name: 'The Labyrinth',
        subtitle: 'Two doors, two sentinels, and deep darkness swallowing the maze.',
        theme: 'mossy',
        objective: 'Retrieve both keys in sequence, evade twin sentinels, and escape.',
        hint: 'Keys must be retrieved in order: unlock the first door to reach the area containing the second key.',
        visibility: 'dark',
        lighting: {
            fogDensity: 0.125,
            torchDistance: 10.5,
            torchDecay: 2.3,
            ambient: 0.16,
            directional: 0.08,
            torchIntensity: 10.5
        },
        generate: { seed: 19, cellsW: 12, cellsH: 12, doors: 2, orbs: 8, loops: 0.14, sentinels: 2, sentinelSpeed: 2.4 }
    },

    // ---------------- Tier 3: ADVANCED (The Shadow Labyrinth) ----------------
    {
        id: 6,
        tier: 3,
        tierName: 'Advanced',
        name: 'Echoes of the Deep',
        subtitle: 'Complex junctions, eerie echoes, two locked gates, and fast sentinels.',
        theme: 'slate',
        objective: 'Navigate deep subterranean halls and unlock both sealed passages.',
        hint: 'Look for the golden beam of the exit portal high in the ceiling to orient yourself.',
        visibility: 'dim',
        lighting: {
            fogDensity: 0.095,
            torchDistance: 13.5,
            torchDecay: 2.1,
            ambient: 0.22,
            directional: 0.15,
            torchIntensity: 11
        },
        generate: { seed: 43, cellsW: 13, cellsH: 13, doors: 2, orbs: 8, loops: 0.15, sentinels: 2, sentinelSpeed: 2.5 }
    },
    {
        id: 7,
        tier: 3,
        tierName: 'Advanced',
        name: 'The Shifting Fortress',
        subtitle: 'A grand subterranean fortress with 3 sentinels patrolling branching halls.',
        theme: 'slate',
        objective: 'Infiltrate the fortress, slip past three patrolling sentinels, and break the seals.',
        hint: 'Side alcoves and dead ends can serve as safe hiding spots while sentinels pass by.',
        visibility: 'dark',
        lighting: {
            fogDensity: 0.12,
            torchDistance: 11,
            torchDecay: 2.2,
            ambient: 0.15,
            directional: 0.07,
            torchIntensity: 10.5
        },
        generate: { seed: 89, cellsW: 14, cellsH: 14, doors: 2, orbs: 9, loops: 0.16, sentinels: 3, sentinelSpeed: 2.6 }
    },
    {
        id: 8,
        tier: 3,
        tierName: 'Advanced',
        name: 'The Veil of Shadows',
        subtitle: 'Three locked gates hidden deep in shadow, with vigilant temple guardians.',
        theme: 'slate',
        objective: 'Break through all three seals in darkness while dodging vigilant guardians.',
        hint: 'Collect Amber, Magenta, and Green keys in sequence. Listen for sentinel hums.',
        visibility: 'dark',
        lighting: {
            fogDensity: 0.13,
            torchDistance: 10,
            torchDecay: 2.3,
            ambient: 0.12,
            directional: 0.05,
            torchIntensity: 10
        },
        generate: { seed: 103, cellsW: 15, cellsH: 15, doors: 3, orbs: 10, loops: 0.16, sentinels: 3, sentinelSpeed: 2.7 }
    },

    // ---------------- Tier 4: EXPERT (The Architect\'s Trial) ----------------
    {
        id: 9,
        tier: 4,
        tierName: 'Expert',
        name: 'The Endless Descent',
        subtitle: 'A sprawling ancient necropolis requiring master navigation and route planning.',
        theme: 'obsidian',
        objective: 'Traverse the sprawling necropolis, unlock 3 gates, and conquer par time.',
        hint: 'Do not detour for orbs until keys are secured, or you risk running over par.',
        visibility: 'dark',
        lighting: {
            fogDensity: 0.135,
            torchDistance: 9.8,
            torchDecay: 2.4,
            ambient: 0.10,
            directional: 0.04,
            torchIntensity: 9.5
        },
        generate: { seed: 137, cellsW: 16, cellsH: 16, doors: 3, orbs: 12, loops: 0.17, sentinels: 3, sentinelSpeed: 2.8 }
    },
    {
        id: 10,
        tier: 4,
        tierName: 'Expert',
        name: "The Architect's Trial",
        subtitle: 'The ultimate trial. Four relentless sentinels, three ancient seals, and the throne of the maze.',
        theme: 'obsidian',
        objective: 'Overcome the Architect: break 3 ancient seals, evade 4 apex sentinels, and escape!',
        hint: 'Use every skill: listen for sentinel hums, check the minimap, and dash down open corridors!',
        visibility: 'dark',
        lighting: {
            fogDensity: 0.14,
            torchDistance: 9.5,
            torchDecay: 2.4,
            ambient: 0.09,
            directional: 0.03,
            torchIntensity: 9.2
        },
        generate: { seed: 251, cellsW: 18, cellsH: 18, doors: 3, orbs: 14, loops: 0.18, sentinels: 4, sentinelSpeed: 2.9 }
    }
];

export const LEVEL_COUNT = LEVEL_DEFS.length;

// ----------------------------------------
// Grid & Graph Helpers
// ----------------------------------------

function passable(grid, row, col, blocked = new Set()) {
    const ch = grid[row]?.[col];
    if (ch === undefined || ch === '#') return false;
    if (isDoorChar(ch) && blocked.has(ch)) return false;
    return true;
}

export function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

export function openNeighbours(grid, row, col) {
    let n = 0;
    for (const [dr, dc] of DIRS) {
        if (passable(grid, row + dr, col + dc, new Set())) n++;
    }
    return n;
}

// ----------------------------------------
// Graph Search Algorithms: BFS, DFS, A*
// ----------------------------------------

/**
 * Breadth-First Search (BFS)
 * Guarantees shortest path in unweighted graphs.
 * Used for level generation, path verification, and reachability.
 */
export function bfs(grid, start, blocked = new Set()) {
    const rows = grid.length;
    const cols = grid[0].length;
    const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
    const visitedOrder = [];

    if (!passable(grid, start.row, start.col, blocked)) return { dist, prev, visitedOrder };

    dist[start.row][start.col] = 0;
    const queue = [start];
    visitedOrder.push(start);

    for (let head = 0; head < queue.length; head++) {
        const { row, col } = queue[head];

        for (const [dr, dc] of DIRS) {
            const nr = row + dr;
            const nc = col + dc;

            if (passable(grid, nr, nc, blocked) && dist[nr][nc] < 0) {
                dist[nr][nc] = dist[row][col] + 1;
                prev[nr][nc] = { row, col };
                const node = { row: nr, col: nc };
                queue.push(node);
                visitedOrder.push(node);
            }
        }
    }

    return { dist, prev, visitedOrder };
}

/**
 * Depth-First Search (DFS)
 * Explores deeply along branches before backtracking.
 * Used in maze generation and traversal comparison.
 */
export function dfs(grid, start, target, blocked = new Set()) {
    const rows = grid.length;
    const cols = grid[0].length;
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
    const visitedOrder = [];

    if (!passable(grid, start.row, start.col, blocked)) return { path: null, visitedOrder };

    const stack = [start];
    visited[start.row][start.col] = true;
    visitedOrder.push(start);
    let found = false;

    while (stack.length && !found) {
        const cur = stack.pop();

        if (target && cur.row === target.row && cur.col === target.col) {
            found = true;
            break;
        }

        for (const [dr, dc] of DIRS) {
            const nr = cur.row + dr;
            const nc = cur.col + dc;

            if (passable(grid, nr, nc, blocked) && !visited[nr][nc]) {
                visited[nr][nc] = true;
                prev[nr][nc] = cur;
                const nextNode = { row: nr, col: nc };
                stack.push(nextNode);
                visitedOrder.push(nextNode);

                if (target && nr === target.row && nc === target.col) {
                    found = true;
                    break;
                }
            }
        }
    }

    if (!found && target) return { path: null, visitedOrder };

    const path = [];
    if (target) {
        let cur = target;
        while (cur) {
            path.push(cur);
            cur = prev[cur.row][cur.col];
        }
        path.reverse();
    }

    return { path, visitedOrder };
}

/**
 * A* Pathfinding Algorithm
 * Uses Manhattan distance heuristic f(n) = g(n) + h(n).
 * Demonstrates informed search versus blind BFS/DFS.
 */
export function astar(grid, start, target, blocked = new Set()) {
    const rows = grid.length;
    const cols = grid[0].length;
    const gScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const fScore = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    const prev = Array.from({ length: rows }, () => Array(cols).fill(null));
    const visitedOrder = [];

    if (!passable(grid, start.row, start.col, blocked) || !passable(grid, target.row, target.col, blocked)) {
        return { path: null, visitedOrder, length: 0 };
    }

    gScore[start.row][start.col] = 0;
    fScore[start.row][start.col] = manhattan(start, target);

    const openSet = [{ ...start, f: fScore[start.row][start.col] }];
    const closedSet = Array.from({ length: rows }, () => Array(cols).fill(false));

    while (openSet.length) {
        // Find node with minimum fScore
        let lowestIdx = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < openSet[lowestIdx].f) lowestIdx = i;
        }

        const current = openSet.splice(lowestIdx, 1)[0];
        closedSet[current.row][current.col] = true;
        visitedOrder.push({ row: current.row, col: current.col });

        if (current.row === target.row && current.col === target.col) {
            const path = [];
            let curr = target;
            while (curr) {
                path.push(curr);
                curr = prev[curr.row][curr.col];
            }
            path.reverse();
            return { path, visitedOrder, length: path.length };
        }

        for (const [dr, dc] of DIRS) {
            const nr = current.row + dr;
            const nc = current.col + dc;

            if (!passable(grid, nr, nc, blocked) || closedSet[nr][nc]) continue;

            const tentativeG = gScore[current.row][current.col] + 1;

            if (tentativeG < gScore[nr][nc]) {
                prev[nr][nc] = { row: current.row, col: current.col };
                gScore[nr][nc] = tentativeG;
                fScore[nr][nc] = tentativeG + manhattan({ row: nr, col: nc }, target);

                if (!openSet.some((node) => node.row === nr && node.col === nc)) {
                    openSet.push({ row: nr, col: nc, f: fScore[nr][nc] });
                }
            }
        }
    }

    return { path: null, visitedOrder, length: 0 };
}

export function pathBetween(grid, a, b, blocked = new Set()) {
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

/**
 * Computes graph topological complexity metrics for academic and viva review
 */
export function computeMazeMetrics(level) {
    const { grid, rows, cols, start, exit } = level;
    let floorCells = 0;
    let junctions = 0;
    let deadEnds = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== '#') {
                floorCells++;
                const open = openNeighbours(grid, r, c);
                if (open >= 3) junctions++;
                else if (open === 1) deadEnds++;
            }
        }
    }

    const openGrid = grid.map((row) => row.map((ch) => (isDoorChar(ch) ? '.' : ch)));
    const solPath = pathBetween(openGrid, start, exit);
    const solutionLength = solPath ? solPath.length : 0;

    return {
        floorCells,
        junctions,
        deadEnds,
        solutionLength,
        branchingRatio: floorCells > 0 ? (junctions / floorCells).toFixed(3) : '0.000'
    };
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
// Level Parsers & Generators
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
        tier: def.tier || 1,
        tierName: def.tierName || 'Beginner',
        name: def.name,
        subtitle: def.subtitle,
        theme: def.theme || 'sunstone',
        objective: def.objective || 'Escape the ruins.',
        hint: def.hint || 'Find the way out.',
        visibility: def.visibility || 'clear',
        lighting: def.lighting || {
            fogDensity: 0.055,
            torchDistance: 22,
            torchDecay: 1.8,
            ambient: 0.6,
            directional: 0.6,
            torchIntensity: 13
        },
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

function generateLevel(def) {
    const cfg = def.generate;
    const rng = mulberry32(cfg.seed);
    const rows = cfg.cellsH * 2 + 1;
    const cols = cfg.cellsW * 2 + 1;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));

    // 1. Perfect maze generation (Recursive Backtracker)
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

    // 2. Exit = cell farthest from start (guarantees deep traversal)
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

    // 3. Doors on unique solution path
    const solution = pathBetween(grid, start, exit);
    const doors = [];
    const fractions = cfg.doors === 1 ? [0.55] : cfg.doors === 2 ? [0.36, 0.72] : [0.26, 0.52, 0.78];

    for (let i = 0; i < cfg.doors; i++) {
        const target = Math.floor((solution.length - 1) * fractions[i]);
        let chosen = null;

        for (let offset = 0; offset < solution.length && !chosen; offset++) {
            for (const idx of [target + offset, target - offset]) {
                const cell = solution[idx];
                if (!cell) continue;

                const isPassage = (cell.row % 2 === 0) !== (cell.col % 2 === 0);
                const farFromOthers = doors.every((d) => manhattan(d, cell) >= 4);
                const notEnds = manhattan(cell, start) > 3 && manhattan(cell, exit) > 3;

                if (isPassage && farFromOthers && notEnds) {
                    chosen = cell;
                    break;
                }
            }
        }

        if (!chosen) {
            for (let offset = 0; offset < solution.length && !chosen; offset++) {
                for (const idx of [target + offset, target - offset]) {
                    const cell = solution[idx];
                    if (!cell) continue;
                    const isPassage = (cell.row % 2 === 0) !== (cell.col % 2 === 0);
                    const notSame = doors.every((d) => d.row !== cell.row || d.col !== cell.col);
                    if (isPassage && notSame) {
                        chosen = cell;
                        break;
                    }
                }
            }
        }

        grid[chosen.row][chosen.col] = doorChar(i);
        doors.push({ id: i, row: chosen.row, col: chosen.col });
    }

    // 4. Keys: placed in sections reachable before corresponding door is unlocked
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

    // 5. Loops (braid maze connections) without bypassing doors
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

    // 6. Collectible orbs
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

    // 7. Sentinels with guaranteed placement
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
        let placed = false;
        for (const strict of [true, false]) {
            if (placed) break;
            for (let attempt = 0; attempt < 200; attempt++) {
                const a = nodeCells[Math.floor(rng() * nodeCells.length)];
                if (fromStartClosed[a.row][a.col] < (strict ? 6 : 4)) continue;

                const { dist } = bfs(grid, a, allDoors);
                const minReach = strict ? 5 : 3;
                const maxReach = strict ? 14 : 18;
                const ends = nodeCells.filter((b) => dist[b.row][b.col] >= minReach && dist[b.row][b.col] <= maxReach);
                if (!ends.length) continue;

                const b = ends[Math.floor(rng() * ends.length)];
                const path = pathBetween(grid, a, b, allDoors);
                if (!path || path.length < 2) continue;

                const safe = path.every(
                    (cell) =>
                        manhattan(cell, start) > (strict ? 4 : 2) &&
                        manhattan(cell, exit) > (strict ? 2 : 1) &&
                        keys.every((k) => manhattan(cell, k) > (strict ? 1 : 0)) &&
                        sentinels.every((o) => o.path.every((p) => manhattan(p, cell) > (strict ? 2 : 1)))
                );

                if (safe) {
                    sentinels.push({ path, speed: cfg.sentinelSpeed });
                    placed = true;
                    break;
                }
            }
        }
    }

    return {
        id: def.id,
        tier: def.tier,
        tierName: def.tierName,
        name: def.name,
        subtitle: def.subtitle,
        theme: def.theme || 'mossy',
        objective: def.objective,
        hint: def.hint,
        visibility: def.visibility || 'clear',
        lighting: def.lighting || {
            fogDensity: 0.055,
            torchDistance: 22,
            torchDecay: 1.8,
            ambient: 0.6,
            directional: 0.6,
            torchIntensity: 13
        },
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
// Par Time & Validation
// ----------------------------------------

function computePar(level) {
    const stops = [level.start, ...level.keys, level.exit];
    const open = level.grid.map((row) => row.map((ch) => (isDoorChar(ch) ? '.' : ch)));
    let cells = 0;

    for (let i = 0; i < stops.length - 1; i++) {
        cells += bfs(open, stops[i]).dist[stops[i + 1].row][stops[i + 1].col];
    }

    const tierSlackMultiplier = [0, 2.5, 2.7, 2.9, 3.1][level.tier || 1] || 2.6;
    const baseSlack = [0, 15, 18, 22, 28][level.tier || 1] || 15;
    const seconds = cells * (CELL_SIZE / PLAYER_SPEED) * tierSlackMultiplier + baseSlack;
    return Math.round(seconds / 5) * 5;
}

function finish(level) {
    level.par = computePar(level);
    level.metrics = computeMazeMetrics(level);
    return level;
}

export function validateLevel(level) {
    const problems = [];
    const { grid, start, exit } = level;

    if (!start) problems.push('missing start');
    if (!exit) problems.push('missing exit');
    if (problems.length) return problems;

    const held = new Set();
    let changed = true;

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
