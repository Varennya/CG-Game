// ========================================
// LEVELS & GRAPH ALGORITHMS
// MAZE EXPLORER 3D: 100-LEVEL MULTI-WORLD EXPANSION
//
// 5 Unique Worlds with exactly 20 playable levels per world (100 levels total):
//   World 1: Ancient Ruins (Levels 1–20) -> World Boss: Ancient Guardian
//   World 2: Frozen Caverns (Levels 21–40) -> World Boss: Frost Titan
//   World 3: Lava Fortress (Levels 41–60) -> World Boss: Inferno Warden
//   World 4: Enchanted Forest (Levels 61–80) -> World Boss: Forest Sentinel
//   World 5: Shadow Realm (Levels 81–100) -> World Boss: The Architect (Ultimate Finale)
//
// Difficulty progression per world:
//   Levels 1–5: Easy
//   Levels 6–10: Normal
//   Levels 11–15: Hard
//   Levels 16–19: Expert
//   Level 20: World-Final Boss Challenge
// ========================================

export const CELL_SIZE = 2;
export const PLAYER_SPEED = 4;

export const KEY_COLORS = [0xffb020, 0xd946ef, 0x34d399, 0x38bdf8];
export const KEY_NAMES = ['amber', 'magenta', 'green', 'cyan'];

export const WORLDS = [
    {
        id: 'ruins',
        name: 'Ancient Ruins',
        tier: 1,
        theme: 'sunstone',
        levels: Array.from({ length: 20 }, (_, i) => i + 1),
        icon: '🏛️',
        desc: 'Weathered stone temples, ancient pillars, warm torchlight & the colossal Stone Guardian.',
        ambientFog: 0.045,
        unlockCriteria: {
            tokens: 0,
            stars: 0,
            achievements: 0,
            desc: 'Starting World (Unlocked)'
        }
    },
    {
        id: 'ice',
        name: 'Frozen Caverns',
        tier: 2,
        theme: 'ice',
        levels: Array.from({ length: 20 }, (_, i) => i + 21),
        icon: '❄️',
        desc: 'Ice-covered walls, slippery passages, blue crystals & the legendary Frost Titan.',
        ambientFog: 0.075,
        unlockCriteria: {
            tokens: 250,
            stars: 12,
            achievements: 1,
            desc: 'Requires 250 Tokens, 12 Stars & 1 Achievement'
        }
    },
    {
        id: 'lava',
        name: 'Lava Fortress',
        tier: 3,
        theme: 'lava',
        levels: Array.from({ length: 20 }, (_, i) => i + 41),
        icon: '🌋',
        desc: 'Volcanic basalt, glowing magma veins, rising embers & the Inferno Warden.',
        ambientFog: 0.085,
        unlockCriteria: {
            tokens: 550,
            stars: 30,
            achievements: 3,
            desc: 'Requires 550 Tokens, 30 Stars & 3 Achievements'
        }
    },
    {
        id: 'shadow',
        name: 'Shadow Realm',
        tier: 4,
        theme: 'shadow',
        levels: Array.from({ length: 20 }, (_, i) => i + 61),
        icon: '🔮',
        desc: 'Dark floating architecture, violet runes, dimensional teleporters & The Architect.',
        ambientFog: 0.125,
        unlockCriteria: {
            tokens: 900,
            stars: 50,
            achievements: 5,
            desc: 'Requires 900 Tokens, 50 Stars & 5 Achievements'
        }
    }
];

export const TIERS = [
    { id: 1, name: 'Ancient Ruins', world: 'Ancient Ruins', subtitle: 'Ruins of Discovery', color: '#5fa896', badge: 'World 1', levels: Array.from({ length: 20 }, (_, i) => i + 1) },
    { id: 2, name: 'Frozen Caverns', world: 'Frozen Caverns', subtitle: 'The Glacial Descent', color: '#38bdf8', badge: 'World 2', levels: Array.from({ length: 20 }, (_, i) => i + 21) },
    { id: 3, name: 'Lava Fortress', world: 'Lava Fortress', subtitle: 'The Molten Citadel', color: '#f97316', badge: 'World 3', levels: Array.from({ length: 20 }, (_, i) => i + 41) },
    { id: 4, name: 'Shadow Realm', world: 'Shadow Realm', subtitle: 'The Void Gauntlet', color: '#a855f7', badge: 'World 4', levels: Array.from({ length: 20 }, (_, i) => i + 61) }
];


const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

export function isDoorChar(ch) {
    return ch >= 'A' && ch <= 'H';
}

export function doorChar(id) {
    return String.fromCharCode(65 + id);
}

export function doorId(ch) {
    return ch.charCodeAt(0) - 65;
}

// ----------------------------------------
// 100 Level Registry
// ----------------------------------------

const LEVEL_DEFS = [
    {
        "id": 1,
        "worldId": "ruins",
        "worldLevelNumber": 1,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "easy",
        "name": "First Steps",
        "subtitle": "Learn movement and collect golden orbs",
        "theme": "sunstone",
        "objective": "Collect golden orbs and reach the exit portal.",
        "tokens": 15,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 1053,
            "doors": 0,
            "loops": 0.15,
            "orbs": 4,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 2,
        "worldId": "ruins",
        "worldLevelNumber": 2,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "easy",
        "name": "The Amber Gate",
        "subtitle": "A locked amber gate and patrolling sentinel",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 19,
        "generate": {
            "cellsW": 5,
            "cellsH": 4,
            "seed": 1106,
            "doors": 1,
            "loops": 0.15,
            "orbs": 5,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 3,
        "worldId": "ruins",
        "worldLevelNumber": 3,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "easy",
        "name": "Forgotten Courtyard",
        "subtitle": "Multiple paths through mossy stone",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 23,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 1159,
            "doors": 1,
            "loops": 0.15,
            "orbs": 6,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 4,
        "worldId": "ruins",
        "worldLevelNumber": 4,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "easy",
        "name": "The Broken Bridge",
        "subtitle": "Step on carved pressure plates",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 27,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 1212,
            "doors": 1,
            "loops": 0.15,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 5,
        "worldId": "ruins",
        "worldLevelNumber": 5,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "easy",
        "name": "Hall of Echoes",
        "subtitle": "Echoing corridors of ancient stone",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 31,
        "generate": {
            "cellsW": 4,
            "cellsH": 5,
            "seed": 1265,
            "doors": 1,
            "loops": 0.15,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 6,
        "worldId": "ruins",
        "worldLevelNumber": 6,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "normal",
        "name": "Stone Chamber",
        "subtitle": "A hidden switch unlocks the way forward",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 35,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 1318,
            "doors": 1,
            "loops": 0.2,
            "orbs": 6,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 7,
        "worldId": "ruins",
        "worldLevelNumber": 7,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "normal",
        "name": "Sundial Path",
        "subtitle": "Follow the shadows of ancient sundials",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 39,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 1371,
            "doors": 1,
            "loops": 0.2,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 8,
        "worldId": "ruins",
        "worldLevelNumber": 8,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "normal",
        "name": "Whispering Pillars",
        "subtitle": "Dual locked gates and labyrinthine branches",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 43,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 1424,
            "doors": 2,
            "loops": 0.2,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 9,
        "worldId": "ruins",
        "worldLevelNumber": 9,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "normal",
        "name": "The Sunken Alcove",
        "subtitle": "Subterranean alcoves hold secrets",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 47,
        "generate": {
            "cellsW": 5,
            "cellsH": 6,
            "seed": 1477,
            "doors": 2,
            "loops": 0.2,
            "orbs": 9,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 10,
        "worldId": "ruins",
        "worldLevelNumber": 10,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "normal",
        "name": "Pillar of the Ancients",
        "subtitle": "Towering monoliths guard the sacred path",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 51,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 1530,
            "doors": 2,
            "loops": 0.2,
            "orbs": 10,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 1,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 11,
        "worldId": "ruins",
        "worldLevelNumber": 11,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "hard",
        "name": "The Gilded Vault",
        "subtitle": "Golden treasures hidden deep in the ruins",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 55,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 1583,
            "doors": 2,
            "loops": 0.25,
            "orbs": 8,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 12,
        "worldId": "ruins",
        "worldLevelNumber": 12,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "hard",
        "name": "Crypt of Sand",
        "subtitle": "Ancient crypt with shifting sands",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 59,
        "generate": {
            "cellsW": 7,
            "cellsH": 6,
            "seed": 1636,
            "doors": 2,
            "loops": 0.25,
            "orbs": 9,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 13,
        "worldId": "ruins",
        "worldLevelNumber": 13,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "hard",
        "name": "Relic Way",
        "subtitle": "Sacred route containing a lost relic",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 63,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 1689,
            "doors": 2,
            "loops": 0.25,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 14,
        "worldId": "ruins",
        "worldLevelNumber": 14,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "hard",
        "name": "Temple Cistern",
        "subtitle": "Flooded cistern puzzle requiring route mastery",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 67,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 1742,
            "doors": 3,
            "loops": 0.25,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 15,
        "worldId": "ruins",
        "worldLevelNumber": 15,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "hard",
        "name": "Terrace of the Sun",
        "subtitle": "Sun-drenched terraces with alert sentinels",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 71,
        "generate": {
            "cellsW": 6,
            "cellsH": 7,
            "seed": 1795,
            "doors": 3,
            "loops": 0.25,
            "orbs": 12,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 16,
        "worldId": "ruins",
        "worldLevelNumber": 16,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "expert",
        "name": "Colonnade of Trials",
        "subtitle": "Complex triple-gate puzzle sequence",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 75,
        "generate": {
            "cellsW": 8,
            "cellsH": 7,
            "seed": 1848,
            "doors": 3,
            "loops": 0.3,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 17,
        "worldId": "ruins",
        "worldLevelNumber": 17,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "expert",
        "name": "Labyrinth of the Pharaohs",
        "subtitle": "Deep Pharaoh labyrinth with branching routes",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 79,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 1901,
            "doors": 3,
            "loops": 0.3,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 18,
        "worldId": "ruins",
        "worldLevelNumber": 18,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "expert",
        "name": "Chamber of Seals",
        "subtitle": "Multiple seals require coordinated switches",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 83,
        "generate": {
            "cellsW": 8,
            "cellsH": 8,
            "seed": 1954,
            "doors": 3,
            "loops": 0.3,
            "orbs": 12,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 19,
        "worldId": "ruins",
        "worldLevelNumber": 19,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "expert",
        "name": "Sentinel's Watch",
        "subtitle": "High-alert sentinels guard the inner sanctum",
        "theme": "sunstone",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 87,
        "generate": {
            "cellsW": 7,
            "cellsH": 8,
            "seed": 2007,
            "doors": 3,
            "loops": 0.3,
            "orbs": 13,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 20,
        "worldId": "ruins",
        "worldLevelNumber": 20,
        "tier": 1,
        "tierName": "Ancient Ruins",
        "difficulty": "boss",
        "name": "Guardian of the Ruins",
        "subtitle": "Trial of the Colossus: deactivate rune pylons!",
        "theme": "sunstone",
        "objective": "Deactivate 2 Ancient Ruins power pylons to bring down the guardian barrier and escape!",
        "tokens": 100,
        "arenaBoss": {
            "type": "stone",
            "name": "Ancient Stone Guardian",
            "switchesCount": 2,
            "theme": "sunstone"
        }
    },
    {
        "id": 21,
        "worldId": "ice",
        "worldLevelNumber": 1,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "easy",
        "name": "Frozen Entrance",
        "subtitle": "Cross the icy threshold into frozen depths",
        "theme": "ice",
        "objective": "Collect golden orbs and reach the exit portal.",
        "tokens": 15,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 2130,
            "doors": 0,
            "loops": 0.15,
            "orbs": 4,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 22,
        "worldId": "ice",
        "worldLevelNumber": 2,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "easy",
        "name": "Crystal Passage",
        "subtitle": "Glowing blue crystals light the frozen corridors",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 19,
        "generate": {
            "cellsW": 5,
            "cellsH": 4,
            "seed": 2183,
            "doors": 1,
            "loops": 0.15,
            "orbs": 5,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 23,
        "worldId": "ice",
        "worldLevelNumber": 3,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "easy",
        "name": "Glacial Pathway",
        "subtitle": "Slippery ice passages reduce your friction",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 23,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 2236,
            "doors": 1,
            "loops": 0.15,
            "orbs": 6,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 24,
        "worldId": "ice",
        "worldLevelNumber": 4,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "easy",
        "name": "Frostbite Tunnel",
        "subtitle": "Frostbite winds and quick turns",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 27,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 2289,
            "doors": 1,
            "loops": 0.15,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 25,
        "worldId": "ice",
        "worldLevelNumber": 5,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "easy",
        "name": "Whispering Frost",
        "subtitle": "Chilling echoes resonate through the cavern",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 31,
        "generate": {
            "cellsW": 4,
            "cellsH": 5,
            "seed": 2342,
            "doors": 1,
            "loops": 0.15,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 26,
        "worldId": "ice",
        "worldLevelNumber": 6,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "normal",
        "name": "The Ice Maze",
        "subtitle": "Intricate ice branches with low-friction glide",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 35,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 2395,
            "doors": 1,
            "loops": 0.2,
            "orbs": 6,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 27,
        "worldId": "ice",
        "worldLevelNumber": 7,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "normal",
        "name": "Shimmering Arch",
        "subtitle": "A shimmering frozen archway blocks the exit",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 39,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 2448,
            "doors": 1,
            "loops": 0.2,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 28,
        "worldId": "ice",
        "worldLevelNumber": 8,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "normal",
        "name": "Cavern of Stalactites",
        "subtitle": "Hanging stalactites above winding corridors",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 43,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 2501,
            "doors": 2,
            "loops": 0.2,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 29,
        "worldId": "ice",
        "worldLevelNumber": 9,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "normal",
        "name": "Frozen Mechanism",
        "subtitle": "Cryo-switch activates frozen mechanisms",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 47,
        "generate": {
            "cellsW": 5,
            "cellsH": 6,
            "seed": 2554,
            "doors": 2,
            "loops": 0.2,
            "orbs": 9,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 30,
        "worldId": "ice",
        "worldLevelNumber": 10,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "normal",
        "name": "Slippery Depths",
        "subtitle": "Deepest frost caverns with slippery momentum",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 51,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 2607,
            "doors": 2,
            "loops": 0.2,
            "orbs": 10,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 1,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 31,
        "worldId": "ice",
        "worldLevelNumber": 11,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "hard",
        "name": "Permafrost Hollow",
        "subtitle": "Subzero hollow concealing a frozen relic",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 55,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 2660,
            "doors": 2,
            "loops": 0.25,
            "orbs": 8,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 32,
        "worldId": "ice",
        "worldLevelNumber": 12,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "hard",
        "name": "The Sapphire Gate",
        "subtitle": "Sapphire key unlocks the great ice gate",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 59,
        "generate": {
            "cellsW": 7,
            "cellsH": 6,
            "seed": 2713,
            "doors": 2,
            "loops": 0.25,
            "orbs": 9,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 33,
        "worldId": "ice",
        "worldLevelNumber": 13,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "hard",
        "name": "Glacial Chasm",
        "subtitle": "A checkpoint safe haven before the chasm",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 63,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 2766,
            "doors": 2,
            "loops": 0.25,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 34,
        "worldId": "ice",
        "worldLevelNumber": 14,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "hard",
        "name": "Cryo Vault",
        "subtitle": "Triple-gate security vault sealed in permafrost",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 67,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 2819,
            "doors": 3,
            "loops": 0.25,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 35,
        "worldId": "ice",
        "worldLevelNumber": 15,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "hard",
        "name": "Icebound Sanctuary",
        "subtitle": "Ancient frozen sanctuary with patrolling sentinels",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 71,
        "generate": {
            "cellsW": 6,
            "cellsH": 7,
            "seed": 2872,
            "doors": 3,
            "loops": 0.25,
            "orbs": 12,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 36,
        "worldId": "ice",
        "worldLevelNumber": 16,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "expert",
        "name": "Blizzard Corridor",
        "subtitle": "Howling blizzard winds in high-difficulty paths",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 75,
        "generate": {
            "cellsW": 8,
            "cellsH": 7,
            "seed": 2925,
            "doors": 3,
            "loops": 0.3,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 37,
        "worldId": "ice",
        "worldLevelNumber": 17,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "expert",
        "name": "The Rime Labyrinth",
        "subtitle": "Labyrinth of mirrors and crystalline turns",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 79,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 2978,
            "doors": 3,
            "loops": 0.3,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 38,
        "worldId": "ice",
        "worldLevelNumber": 18,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "expert",
        "name": "Fissure of Mirrors",
        "subtitle": "Reflective ice walls confuse the senses",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 83,
        "generate": {
            "cellsW": 8,
            "cellsH": 8,
            "seed": 3031,
            "doors": 3,
            "loops": 0.3,
            "orbs": 12,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": true,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 39,
        "worldId": "ice",
        "worldLevelNumber": 19,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "expert",
        "name": "Hall of the North Wind",
        "subtitle": "Expert sentinel gauntlet before the inner sanctum",
        "theme": "ice",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 87,
        "generate": {
            "cellsW": 7,
            "cellsH": 8,
            "seed": 3084,
            "doors": 3,
            "loops": 0.3,
            "orbs": 13,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": true,
            "hazards": false
        }
    },
    {
        "id": 40,
        "worldId": "ice",
        "worldLevelNumber": 20,
        "tier": 2,
        "tierName": "Frozen Caverns",
        "difficulty": "boss",
        "name": "Guardian of Ice",
        "subtitle": "Conquer the Frost Titan by activating cryo-switches!",
        "theme": "ice",
        "objective": "Deactivate 3 Frozen Caverns power pylons to bring down the guardian barrier and escape!",
        "tokens": 100,
        "arenaBoss": {
            "type": "ice",
            "name": "Frost Titan",
            "switchesCount": 3,
            "theme": "ice"
        }
    },
    {
        "id": 41,
        "worldId": "lava",
        "worldLevelNumber": 1,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "easy",
        "name": "Ashen Corridor",
        "subtitle": "Volcanic basalt and rising magma embers",
        "theme": "lava",
        "objective": "Collect golden orbs and reach the exit portal.",
        "tokens": 15,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 3207,
            "doors": 0,
            "loops": 0.15,
            "orbs": 4,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 42,
        "worldId": "lava",
        "worldLevelNumber": 2,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "easy",
        "name": "Basalt Threshold",
        "subtitle": "Step carefully around smoldering stone",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 19,
        "generate": {
            "cellsW": 5,
            "cellsH": 4,
            "seed": 3260,
            "doors": 1,
            "loops": 0.15,
            "orbs": 5,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 43,
        "worldId": "lava",
        "worldLevelNumber": 3,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "easy",
        "name": "Ember Walk",
        "subtitle": "Glowing ember paths through the fiery keep",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 23,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 3313,
            "doors": 1,
            "loops": 0.15,
            "orbs": 6,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 44,
        "worldId": "lava",
        "worldLevelNumber": 4,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "easy",
        "name": "Smoldering Vault",
        "subtitle": "A smoldering vault guarded by flame sentinels",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 27,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 3366,
            "doors": 1,
            "loops": 0.15,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 45,
        "worldId": "lava",
        "worldLevelNumber": 5,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "easy",
        "name": "Cinder Way",
        "subtitle": "Scattered cinders illuminate the dark stone",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 31,
        "generate": {
            "cellsW": 4,
            "cellsH": 5,
            "seed": 3419,
            "doors": 1,
            "loops": 0.15,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 46,
        "worldId": "lava",
        "worldLevelNumber": 6,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "normal",
        "name": "Molten Crossroads",
        "subtitle": "A molten junction with multiple routes",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 35,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 3472,
            "doors": 1,
            "loops": 0.2,
            "orbs": 6,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 47,
        "worldId": "lava",
        "worldLevelNumber": 7,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "normal",
        "name": "The Infernal Gate",
        "subtitle": "Infernal lock mechanism requires the Ruby Key",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 39,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 3525,
            "doors": 1,
            "loops": 0.2,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 48,
        "worldId": "lava",
        "worldLevelNumber": 8,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "normal",
        "name": "Fortress of Embers",
        "subtitle": "Fortress ramparts surrounded by molten rivers",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 43,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 3578,
            "doors": 2,
            "loops": 0.2,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 49,
        "worldId": "lava",
        "worldLevelNumber": 9,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "normal",
        "name": "Magma Reservoir",
        "subtitle": "A massive magma pool blocks the central corridor",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 47,
        "generate": {
            "cellsW": 5,
            "cellsH": 6,
            "seed": 3631,
            "doors": 2,
            "loops": 0.2,
            "orbs": 9,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 50,
        "worldId": "lava",
        "worldLevelNumber": 10,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "normal",
        "name": "Obsidian Rampart",
        "subtitle": "Black obsidian fortifications and tight turns",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 51,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 3684,
            "doors": 2,
            "loops": 0.2,
            "orbs": 10,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 1,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 51,
        "worldId": "lava",
        "worldLevelNumber": 11,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "hard",
        "name": "Crucible of Flame",
        "subtitle": "The blazing crucible where ancient relics rest",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 55,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 3737,
            "doors": 2,
            "loops": 0.25,
            "orbs": 8,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 52,
        "worldId": "lava",
        "worldLevelNumber": 12,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "hard",
        "name": "Firestorm Passage",
        "subtitle": "Fierce heat and patrolling flame sentinels",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 59,
        "generate": {
            "cellsW": 7,
            "cellsH": 6,
            "seed": 3790,
            "doors": 2,
            "loops": 0.25,
            "orbs": 9,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 53,
        "worldId": "lava",
        "worldLevelNumber": 13,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "hard",
        "name": "The Pyre Gate",
        "subtitle": "Pyre gates sealed by dual thermal locks",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 63,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 3843,
            "doors": 2,
            "loops": 0.25,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 54,
        "worldId": "lava",
        "worldLevelNumber": 14,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "hard",
        "name": "Boiling Aqueduct",
        "subtitle": "Boiling channels require switch manipulation",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 67,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 3896,
            "doors": 3,
            "loops": 0.25,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 55,
        "worldId": "lava",
        "worldLevelNumber": 15,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "hard",
        "name": "Brimstone Chasm",
        "subtitle": "Cross the brimstone chasm to the checkpoint",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 71,
        "generate": {
            "cellsW": 6,
            "cellsH": 7,
            "seed": 3949,
            "doors": 3,
            "loops": 0.25,
            "orbs": 12,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 56,
        "worldId": "lava",
        "worldLevelNumber": 16,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "expert",
        "name": "Caldron of Wrath",
        "subtitle": "Intense thermal maze with timed mechanisms",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 75,
        "generate": {
            "cellsW": 8,
            "cellsH": 7,
            "seed": 4002,
            "doors": 3,
            "loops": 0.3,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 57,
        "worldId": "lava",
        "worldLevelNumber": 17,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "expert",
        "name": "Slag Labyrinth",
        "subtitle": "Slag corridors test your spatial awareness",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 79,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 4055,
            "doors": 3,
            "loops": 0.3,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 58,
        "worldId": "lava",
        "worldLevelNumber": 18,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "expert",
        "name": "Scorch Gauntlet",
        "subtitle": "High-speed sentinel gauntlet through the embers",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 83,
        "generate": {
            "cellsW": 8,
            "cellsH": 8,
            "seed": 4108,
            "doors": 3,
            "loops": 0.3,
            "orbs": 12,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": true,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 59,
        "worldId": "lava",
        "worldLevelNumber": 19,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "expert",
        "name": "Core of Volcanus",
        "subtitle": "The deepest core before the Inferno Warden",
        "theme": "lava",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 87,
        "generate": {
            "cellsW": 7,
            "cellsH": 8,
            "seed": 4161,
            "doors": 3,
            "loops": 0.3,
            "orbs": 13,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": true
        }
    },
    {
        "id": 60,
        "worldId": "lava",
        "worldLevelNumber": 20,
        "tier": 3,
        "tierName": "Lava Fortress",
        "difficulty": "boss",
        "name": "Guardian of Flame",
        "subtitle": "Disable thermal vents to bring down the infernal firewall!",
        "theme": "lava",
        "objective": "Deactivate 3 Lava Fortress power pylons to bring down the guardian barrier and escape!",
        "tokens": 100,
        "arenaBoss": {
            "type": "flame",
            "name": "Inferno Warden",
            "switchesCount": 3,
            "theme": "lava"
        }
    },
    {
        "id": 61,
        "worldId": "shadow",
        "worldLevelNumber": 1,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "easy",
        "name": "Twilight Labyrinth",
        "subtitle": "Dark obsidian brick and purple runes",
        "theme": "shadow",
        "objective": "Collect golden orbs and reach the exit portal.",
        "tokens": 15,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 5361,
            "doors": 0,
            "loops": 0.15,
            "orbs": 4,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 62,
        "worldId": "shadow",
        "worldLevelNumber": 2,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "easy",
        "name": "Void Gate",
        "subtitle": "Void gate seals the entrance to the abyss",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 19,
        "generate": {
            "cellsW": 5,
            "cellsH": 4,
            "seed": 5414,
            "doors": 1,
            "loops": 0.15,
            "orbs": 5,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 63,
        "worldId": "shadow",
        "worldLevelNumber": 3,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "easy",
        "name": "Shifting Corridor",
        "subtitle": "Shifting shadow geometry and narrow turns",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 23,
        "generate": {
            "cellsW": 4,
            "cellsH": 4,
            "seed": 5467,
            "doors": 1,
            "loops": 0.15,
            "orbs": 6,
            "sentinels": 0,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 64,
        "worldId": "shadow",
        "worldLevelNumber": 4,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "easy",
        "name": "Abyssal Threshold",
        "subtitle": "The edge of the infinite void",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 27,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 5520,
            "doors": 1,
            "loops": 0.15,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 65,
        "worldId": "shadow",
        "worldLevelNumber": 5,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "easy",
        "name": "Nebula Walk",
        "subtitle": "Nebula dust motes drift across dark corridors",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 31,
        "generate": {
            "cellsW": 4,
            "cellsH": 5,
            "seed": 5573,
            "doors": 1,
            "loops": 0.15,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 66,
        "worldId": "shadow",
        "worldLevelNumber": 6,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "normal",
        "name": "The Shattered Maze",
        "subtitle": "Fragmented paths separated by the abyss",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 35,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 5626,
            "doors": 1,
            "loops": 0.2,
            "orbs": 6,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 67,
        "worldId": "shadow",
        "worldLevelNumber": 7,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "normal",
        "name": "Dimensional Rift",
        "subtitle": "Dimensional rift teleports you across chasms",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the door to reach the exit!",
        "tokens": 39,
        "generate": {
            "cellsW": 5,
            "cellsH": 5,
            "seed": 5679,
            "doors": 1,
            "loops": 0.2,
            "orbs": 7,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 68,
        "worldId": "shadow",
        "worldLevelNumber": 8,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "normal",
        "name": "Astral Alcove",
        "subtitle": "Quiet astral alcoves hold glowing orbs",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 43,
        "generate": {
            "cellsW": 6,
            "cellsH": 5,
            "seed": 5732,
            "doors": 2,
            "loops": 0.2,
            "orbs": 8,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 69,
        "worldId": "shadow",
        "worldLevelNumber": 9,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "normal",
        "name": "Vault of Echoes",
        "subtitle": "Echoes of the Architect whisper through the dark",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 47,
        "generate": {
            "cellsW": 5,
            "cellsH": 6,
            "seed": 5785,
            "doors": 2,
            "loops": 0.2,
            "orbs": 9,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 1,
            "plates": 0,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 70,
        "worldId": "shadow",
        "worldLevelNumber": 10,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "normal",
        "name": "Eclipse Passage",
        "subtitle": "An eclipse of darkness limits your sight",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 51,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 5838,
            "doors": 2,
            "loops": 0.2,
            "orbs": 10,
            "sentinels": 1,
            "sentinelSpeed": 3,
            "switches": 0,
            "plates": 1,
            "checkpoints": 0,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 71,
        "worldId": "shadow",
        "worldLevelNumber": 11,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "hard",
        "name": "Architect's Gauntlet",
        "subtitle": "Complex triple-lock puzzle in the void",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 55,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 5891,
            "doors": 2,
            "loops": 0.25,
            "orbs": 8,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 72,
        "worldId": "shadow",
        "worldLevelNumber": 12,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "hard",
        "name": "The Void Spire",
        "subtitle": "Towering void spires reach into the darkness",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 59,
        "generate": {
            "cellsW": 7,
            "cellsH": 6,
            "seed": 5944,
            "doors": 2,
            "loops": 0.25,
            "orbs": 9,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 73,
        "worldId": "shadow",
        "worldLevelNumber": 13,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "hard",
        "name": "Singularity Way",
        "subtitle": "Gravitational singularity twists corridor paths",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 2 doors to reach the exit!",
        "tokens": 63,
        "generate": {
            "cellsW": 6,
            "cellsH": 6,
            "seed": 5997,
            "doors": 2,
            "loops": 0.25,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 74,
        "worldId": "shadow",
        "worldLevelNumber": 14,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "hard",
        "name": "Event Horizon",
        "subtitle": "The point of no return: checkpoint secured",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 67,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 6050,
            "doors": 3,
            "loops": 0.25,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 75,
        "worldId": "shadow",
        "worldLevelNumber": 15,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "hard",
        "name": "Paradox Chamber",
        "subtitle": "A mind-bending paradox of switches and gates",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 71,
        "generate": {
            "cellsW": 6,
            "cellsH": 7,
            "seed": 6103,
            "doors": 3,
            "loops": 0.25,
            "orbs": 12,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": false,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 76,
        "worldId": "shadow",
        "worldLevelNumber": 16,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "expert",
        "name": "Realm of Fractures",
        "subtitle": "Fractured reality with multiple teleporter nodes",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 75,
        "generate": {
            "cellsW": 8,
            "cellsH": 7,
            "seed": 6156,
            "doors": 3,
            "loops": 0.3,
            "orbs": 10,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 77,
        "worldId": "shadow",
        "worldLevelNumber": 17,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "expert",
        "name": "Obsidian Infinity",
        "subtitle": "Infinite obsidian walls test true maze mastery",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 79,
        "generate": {
            "cellsW": 7,
            "cellsH": 7,
            "seed": 6209,
            "doors": 3,
            "loops": 0.3,
            "orbs": 11,
            "sentinels": 2,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 78,
        "worldId": "shadow",
        "worldLevelNumber": 18,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "expert",
        "name": "Cosmic Crossroads",
        "subtitle": "High-alert void sentinels patrol the crossways",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 83,
        "generate": {
            "cellsW": 8,
            "cellsH": 8,
            "seed": 6262,
            "doors": 3,
            "loops": 0.3,
            "orbs": 12,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 0,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 2,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 79,
        "worldId": "shadow",
        "worldLevelNumber": 19,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "expert",
        "name": "Final Threshold",
        "subtitle": "The final threshold before the Architect's throne",
        "theme": "shadow",
        "objective": "Collect the required keys and unlock the 3 doors to reach the exit!",
        "tokens": 87,
        "generate": {
            "cellsW": 7,
            "cellsH": 8,
            "seed": 6315,
            "doors": 3,
            "loops": 0.3,
            "orbs": 13,
            "sentinels": 3,
            "sentinelSpeed": 3.4,
            "switches": 1,
            "plates": 0,
            "checkpoints": 1,
            "teleporters": 0,
            "relic": true,
            "slippery": false,
            "hazards": false
        }
    },
    {
        "id": 80,
        "worldId": "shadow",
        "worldLevelNumber": 20,
        "tier": 4,
        "tierName": "Shadow Realm",
        "difficulty": "boss",
        "name": "The Final Trial: The Architect",
        "subtitle": "The Ultimate Campaign Climax: solve the master trial!",
        "theme": "shadow",
        "objective": "Deactivate 3 Shadow Realm power pylons to bring down the guardian barrier and escape!",
        "tokens": 100,
        "arenaBoss": {
            "type": "shadow",
            "name": "The Architect",
            "switchesCount": 3,
            "theme": "shadow"
        }
    }
];

export const LEVEL_COUNT = LEVEL_DEFS.length;

// ----------------------------------------
// Deterministic Random (Mulberry32)
// ----------------------------------------

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

export function manhattan(a, b) {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function passable(grid, r, c, blocked = new Set()) {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return false;
    const ch = grid[r][c];
    if (ch === '#') return false;
    if (blocked.has(ch)) return false;
    return true;
}

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
    let curr = target;
    while (curr) {
        path.push(curr);
        curr = prev[curr.row][curr.col];
    }
    path.reverse();
    return { path, visitedOrder };
}

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
    let cur = b;
    while (cur) {
        path.push(cur);
        cur = prev[cur.row][cur.col];
    }
    path.reverse();
    return path;
}

function openNeighbours(grid, r, c) {
    let count = 0;
    for (const [dr, dc] of DIRS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length && grid[nr][nc] !== '#') {
            count++;
        }
    }
    return count;
}

export function computeMazeMetrics(level) {
    const { grid, start, exit } = level;
    let deadEnds = 0;
    let junctions = 0;
    let corridors = 0;

    for (let r = 1; r < level.rows - 1; r++) {
        for (let c = 1; c < level.cols - 1; c++) {
            if (grid[r][c] !== '#') {
                const n = openNeighbours(grid, r, c);
                if (n === 1) deadEnds++;
                else if (n > 2) junctions++;
                else if (n === 2) corridors++;
            }
        }
    }

    const sol = pathBetween(grid, start, exit);
    return {
        deadEnds,
        junctions,
        corridors,
        solutionLength: sol ? sol.length : 0,
        totalCells: level.rows * level.cols
    };
}

function makeBossArena(def) {
    const { arenaBoss, id, tier, tierName, worldId, name, subtitle, theme, objective, tokens } = def;
    const { type: bossType, name: bossName, switchesCount } = arenaBoss;
    const rows = 21;
    const cols = 21;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));

    // Perimeter loop corridors
    for (let c = 1; c < 20; c++) {
        grid[1][c] = '.';
        grid[19][c] = '.';
    }
    for (let r = 1; r < 20; r++) {
        grid[r][1] = '.';
        grid[r][19] = '.';
    }

    // Cross corridors
    for (let c = 1; c < 20; c++) grid[10][c] = '.';
    for (let r = 1; r < 20; r++) grid[r][10] = '.';

    // Central chamber
    for (let r = 7; r <= 13; r++) {
        for (let c = 7; c <= 13; c++) {
            grid[r][c] = '.';
        }
    }

    // Switch alcoves
    grid[4][4] = '.'; grid[4][5] = '.'; grid[5][4] = '.'; grid[5][5] = '.';
    grid[16][4] = '.'; grid[16][5] = '.'; grid[15][4] = '.'; grid[15][5] = '.';
    grid[4][16] = '.'; grid[4][15] = '.'; grid[5][16] = '.'; grid[5][15] = '.';
    grid[16][16] = '.'; grid[16][15] = '.'; grid[15][16] = '.'; grid[15][15] = '.';

    for (let r = 1; r <= 4; r++) { grid[r][5] = '.'; grid[r][15] = '.'; }
    for (let r = 16; r <= 19; r++) { grid[r][5] = '.'; grid[r][15] = '.'; }

    // Exit portal at (19, 19), Door A at (18, 19)
    grid[18][19] = 'A';

    const start = { row: 1, col: 1 };
    const exit = { row: 19, col: 19 };

    const switches = [];
    if (switchesCount >= 1) switches.push({ id: 0, targetDoorId: 0, row: 5, col: 5 });
    if (switchesCount >= 2) switches.push({ id: 1, targetDoorId: 0, row: 15, col: 15 });
    if (switchesCount >= 3) switches.push({ id: 2, targetDoorId: 0, row: 5, col: 15 });

    const sentinels = [
        {
            path: [
                { row: 1, col: 3 }, { row: 1, col: 7 }, { row: 1, col: 10 },
                { row: 1, col: 13 }, { row: 1, col: 17 }
            ],
            speed: 3.2
        },
        {
            path: [
                { row: 19, col: 3 }, { row: 19, col: 7 }, { row: 19, col: 10 },
                { row: 19, col: 13 }, { row: 19, col: 17 }
            ],
            speed: 3.2
        }
    ];

    const orbs = [
        { row: 1, col: 5 }, { row: 1, col: 15 },
        { row: 19, col: 5 }, { row: 19, col: 15 },
        { row: 10, col: 4 }, { row: 10, col: 16 },
        { row: 7, col: 7 }, { row: 7, col: 13 },
        { row: 13, col: 7 }, { row: 13, col: 13 }
    ];

    return {
        id,
        tier,
        tierName,
        worldId,
        name,
        subtitle,
        theme,
        objective,
        tokens,
        difficulty: 'boss',
        hint: 'Locate and activate all perimeter power switches to shatter the barrier guarding the exit!',
        visibility: 'clear',
        lighting: {
            fogDensity: worldId === 'shadow' ? 0.08 : 0.05,
            torchDistance: 24,
            torchDecay: 1.8,
            ambient: 0.6,
            directional: 0.6,
            torchIntensity: 14
        },
        rows,
        cols,
        grid,
        start,
        exit,
        doors: [{ id: 0, row: 18, col: 19 }],
        keys: [],
        switches,
        plates: [],
        checkpoints: [{ id: 0, row: 10, col: 1 }],
        teleporters: bossType === 'shadow' ? [
            { id: 0, row: 4, col: 10, targetRow: 16, targetCol: 10 },
            { id: 1, row: 16, col: 10, targetRow: 4, targetCol: 10 }
        ] : [],
        relics: [{ id: 0, row: 10, col: 10, name: `${bossName} Core Relic` }],
        sentinels,
        orbs,
        boss: {
            type: bossType,
            name: bossName,
            row: 10,
            col: 10,
            requiredSwitches: switchesCount
        }
    };
}

function generateLevel(def) {
    if (def.arenaBoss) {
        return makeBossArena(def);
    }

    const cfg = def.generate;
    const rng = mulberry32(cfg.seed);
    const rows = cfg.cellsH * 2 + 1;
    const cols = cfg.cellsW * 2 + 1;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('#'));

    // 1. Recursive Backtracker
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

    // 2. Farthest exit
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
    const numDoors = cfg.doors || 0;
    const fractions = numDoors === 1 ? [0.55] : numDoors === 2 ? [0.36, 0.72] : [0.26, 0.52, 0.78];

    for (let i = 0; i < numDoors; i++) {
        const target = Math.floor((solution.length - 1) * fractions[i]);
        let chosen = null;

        for (let offset = 0; offset < solution.length && !chosen; offset++) {
            for (const idx of [target + offset, target - offset]) {
                const cell = solution[idx];
                if (!cell) continue;

                const isPassage = (cell.row % 2 === 0) !== (cell.col % 2 === 0);
                const farFromOthers = doors.every((d) => manhattan(d, cell) >= 4);
                const notEnds = manhattan(cell, start) > 2 && manhattan(cell, exit) > 2;

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

        if (chosen) {
            grid[chosen.row][chosen.col] = doorChar(i);
            doors.push({ id: i, row: chosen.row, col: chosen.col });
        }
    }

    // 4. Keys in dead-end branches before the doors
    const keys = [];
    let previousDist = null;

    for (let i = 0; i < doors.length; i++) {
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
        const pick = candidates[Math.floor(rng() * Math.min(3, Math.max(1, candidates.length)))];

        if (pick) {
            keys.push({ id: i, row: pick.row, col: pick.col });
        }
        previousDist = dist;
    }

    // 5. Loops (braid maze connections)
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

    const loopTarget = Math.round((cfg.loops || 0.15) * cfg.cellsW * cfg.cellsH);
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
    for (const spacing of [8, 4, 2, 0]) {
        for (const cell of orbCells) {
            if (orbs.length >= cfg.orbs) break;
            if (orbs.includes(cell)) continue;

            const farEnough = [...orbs, ...keys, start].every((o) => manhattan(o, cell) >= spacing);
            if (farEnough) orbs.push(cell);
        }
    }

    // 7. Checkpoints
    const checkpoints = [];
    if (cfg.checkpoints && solution && solution.length > 14) {
        const cpCell = solution[Math.floor(solution.length * 0.45)];
        if (cpCell && !used.some((u) => u.row === cpCell.row && u.col === cpCell.col)) {
            checkpoints.push({ id: 0, row: cpCell.row, col: cpCell.col });
        }
    }

    // 8. Relics
    const relics = [];
    if (cfg.relic) {
        const relicCandidates = orbCells.filter(c => openNeighbours(grid, c.row, c.col) === 1 && !keys.some(k => k.row === c.row && k.col === c.col));
        if (relicCandidates.length > 0) {
            const relCell = relicCandidates[relicCandidates.length - 1];
            relics.push({ id: 0, row: relCell.row, col: relCell.col, name: `${def.name} Relic` });
        }
    }

    // 9. Sentinels
    const allDoors = new Set(doorChars);
    const fromStartClosed = bfs(grid, start, allDoors).dist;
    const sentinels = [];
    const nodeCells = [];

    for (let r = 1; r < rows - 1; r += 2) {
        for (let c = 1; c < cols - 1; c += 2) {
            if (grid[r][c] === '.') nodeCells.push({ row: r, col: c });
        }
    }

    for (let s = 0; s < (cfg.sentinels || 0); s++) {
        let placed = false;
        for (const strict of [true, false]) {
            if (placed) break;
            for (let attempt = 0; attempt < 100; attempt++) {
                const a = nodeCells[Math.floor(rng() * nodeCells.length)];
                if (!a) continue;
                if (fromStartClosed[a.row][a.col] < (strict ? 5 : 2)) continue;

                const { dist } = bfs(grid, a, allDoors);
                const minReach = strict ? 4 : 2;
                const maxReach = strict ? 12 : 16;
                const ends = nodeCells.filter((b) => dist[b.row][b.col] >= minReach && dist[b.row][b.col] <= maxReach);
                if (!ends.length) continue;

                const b = ends[Math.floor(rng() * ends.length)];
                const path = pathBetween(grid, a, b, allDoors);
                if (!path || path.length < 2) continue;

                const safe = path.every(
                    (cell) =>
                        manhattan(cell, start) > (strict ? 3 : 1) &&
                        manhattan(cell, exit) > 1 &&
                        keys.every((k) => manhattan(cell, k) > (strict ? 1 : 0)) &&
                        sentinels.every((o) => o.path.every((p) => manhattan(p, cell) > 1))
                );

                if (safe) {
                    sentinels.push({ path, speed: cfg.sentinelSpeed || 3.0 });
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
        worldId: def.worldId,
        name: def.name,
        subtitle: def.subtitle,
        theme: def.theme || 'sunstone',
        objective: def.objective,
        tokens: def.tokens || 25,
        difficulty: def.difficulty,
        hint: def.hint || 'Explore corridors carefully, gather golden orbs, and locate keys to unlock gates.',
        visibility: def.visibility || 'clear',
        lighting: {
            fogDensity: def.worldId === 'shadow' ? 0.08 : 0.05,
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
        plates: [],
        switches: [],
        teleporters: [],
        checkpoints,
        relics,
        sentinels
    };
}

function parseLevel(def) {
    if (def.generate || def.arenaBoss) return generateLevel(def);

    const rows = def.grid.length;
    const cols = def.grid[0].length;
    const grid = def.grid.map((r) => r.split(''));
    let start = null;
    let exit = null;
    const keys = [];
    const doors = [];
    const orbs = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const ch = grid[r][c];
            if (ch === 'S') {
                start = { row: r, col: c };
                grid[r][c] = '.';
            } else if (ch === 'E') {
                exit = { row: r, col: c };
                grid[r][c] = '.';
            } else if (ch >= 'a' && ch <= 'd') {
                keys.push({ id: ch.charCodeAt(0) - 97, row: r, col: c });
                grid[r][c] = '.';
            } else if (isDoorChar(ch)) {
                doors.push({ id: doorId(ch), row: r, col: c });
            } else if (ch === 'o') {
                orbs.push({ row: r, col: c });
                grid[r][c] = '.';
            }
        }
    }

    return {
        id: def.id,
        tier: def.tier,
        tierName: def.tierName,
        worldId: def.worldId,
        name: def.name,
        subtitle: def.subtitle,
        theme: def.theme,
        objective: def.objective,
        tokens: def.tokens || 30,
        difficulty: def.difficulty,
        hint: def.hint,
        visibility: def.visibility || 'clear',
        lighting: def.lighting,
        rows,
        cols,
        grid,
        start,
        exit,
        orbs,
        keys,
        doors,
        plates: def.plates || [],
        switches: def.switches || [],
        teleporters: def.teleporters || [],
        checkpoints: def.checkpoints || [],
        relics: def.relics || [],
        sentinels: def.sentinels || [],
        boss: def.boss || null
    };
}

function computePar(level) {
    const stops = [level.start, ...level.keys, level.exit];
    const open = level.grid.map((row) => row.map((ch) => (isDoorChar(ch) ? '.' : ch)));
    let cells = 0;

    for (let i = 0; i < stops.length - 1; i++) {
        cells += bfs(open, stops[i]).dist[stops[i + 1].row][stops[i + 1].col];
    }

    const tierSlackMultiplier = [0, 2.4, 2.6, 2.8, 3.0, 3.2][level.tier || 1] || 2.5;
    const baseSlack = [0, 15, 18, 22, 26, 30][level.tier || 1] || 15;
    const seconds = cells * (CELL_SIZE / PLAYER_SPEED) * tierSlackMultiplier + baseSlack;
    return Math.max(30, Math.round(seconds / 5) * 5);
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
    if (problems.length) {
        return { valid: false, error: problems.join(', '), problems };
    }

    // Simulate player unlocking doors with keys or switches
    const heldKeys = new Set();
    const activatedSwitches = new Set();
    let changed = true;

    while (changed) {
        changed = false;
        const blockedDoors = new Set(
            level.doors.filter((d) => !heldKeys.has(d.id) && !activatedSwitches.has(d.id)).map((d) => doorChar(d.id))
        );
        const { dist } = bfs(grid, start, blockedDoors);

        for (const key of level.keys) {
            if (!heldKeys.has(key.id) && dist[key.row][key.col] >= 0) {
                heldKeys.add(key.id);
                changed = true;
            }
        }

        for (const sw of (level.switches || [])) {
            if (!activatedSwitches.has(sw.targetDoorId) && dist[sw.row][sw.col] >= 0) {
                activatedSwitches.add(sw.targetDoorId);
                changed = true;
            }
        }

        for (const pl of (level.plates || [])) {
            if (!activatedSwitches.has(pl.targetDoorId) && dist[pl.row][pl.col] >= 0) {
                activatedSwitches.add(pl.targetDoorId);
                changed = true;
            }
        }
    }

    const finalBlocked = new Set(
        level.doors.filter((d) => !heldKeys.has(d.id) && !activatedSwitches.has(d.id)).map((d) => doorChar(d.id))
    );
    const final = bfs(grid, start, finalBlocked).dist;

    if (final[exit.row][exit.col] < 0) problems.push('exit is not reachable');

    level.keys.forEach((k) => {
        if (!heldKeys.has(k.id)) problems.push(`key ${k.id} is not reachable`);
    });

    level.doors.forEach((d) => {
        const hasKey = level.keys.some((k) => k.id === d.id);
        const hasSwitch = (level.switches || []).some((s) => s.targetDoorId === d.id);
        const hasPlate = (level.plates || []).some((p) => p.targetDoorId === d.id);
        if (!hasKey && !hasSwitch && !hasPlate) problems.push(`door ${d.id} has no unlocking mechanism`);
    });

    level.sentinels.forEach((s, i) => {
        if (!s.path || s.path.length < 2) problems.push(`sentinel ${i} has no route`);
    });

    return {
        valid: problems.length === 0,
        error: problems.join(', '),
        problems
    };
}

// ----------------------------------------
// Public API
// ----------------------------------------

const cache = new Map();

export function getLevel(index) {
    if (!cache.has(index)) {
        const def = LEVEL_DEFS[index];
        if (!def) throw new Error(`Level index ${index} out of range (total: ${LEVEL_DEFS.length})`);
        const level = def.generate || def.arenaBoss ? generateLevel(def) : parseLevel(def);
        cache.set(index, finish(level));
    }

    return cache.get(index);
}
