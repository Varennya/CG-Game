// ========================================
// PROCEDURAL STONE TEXTURES & MATERIALS
// Procedurally generated once on 256x256 2D canvases,
// providing high aesthetic quality and 0 image downloads.
//
// Themes per Difficulty Tier:
//   - 'sunstone' (Tier 1: Warm Golden Basalt & Sandstone)
//   - 'mossy'    (Tier 2: Overgrown Forest Temple Stone & Moss)
//   - 'slate'    (Tier 3: Ashen Subterranean Slate & Cold Minerals)
//   - 'obsidian' (Tier 4: Dark Obsidian & Runestone)
// ========================================

import * as THREE from 'three';

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

function makeCanvas(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
}

function toTexture(canvas) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;

    if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

function grain(ctx, rand, x, y, w, h, count) {
    for (let i = 0; i < count; i++) {
        ctx.fillStyle = rand() < 0.5 ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 240, 200, 0.08)';
        ctx.fillRect(x + rand() * w, y + rand() * h, 1 + rand() * 2, 1 + rand() * 2);
    }
}

function crack(ctx, rand, size, color = 'rgba(18, 12, 6, 0.45)') {
    let x = rand() * size;
    let y = rand() * size;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < 6; i++) {
        x += (rand() - 0.5) * 26;
        y += 6 + rand() * 14;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
}

const THEME_PALETTES = {
    // World 1: Ancient Ruins
    sunstone: {
        mortar: '#21180f',
        floorMortar: '#100b07',
        hueBase: 34,
        hueSpread: 10,
        satBase: 24,
        satSpread: 10,
        lightBase: 38,
        lightSpread: 8,
        accentColor: 'rgba(212, 163, 89, 0.4)',
        mossColor: 'rgba(86, 128, 74, 0.42)',
        floorHue: 30,
        floorLight: 20,
        hasRunes: true,
        runeColor: '#c89b3c'
    },
    // World 2: Frozen Caverns
    ice: {
        mortar: '#102232',
        floorMortar: '#0a1622',
        hueBase: 198,
        hueSpread: 16,
        satBase: 45,
        satSpread: 15,
        lightBase: 48,
        lightSpread: 12,
        accentColor: 'rgba(160, 230, 255, 0.55)',
        mossColor: 'rgba(120, 210, 240, 0.45)',
        floorHue: 202,
        floorLight: 34,
        hasRunes: true,
        runeColor: '#80e5ff'
    },
    // World 3: Lava Fortress
    lava: {
        mortar: '#1a0604',
        floorMortar: '#0f0302',
        hueBase: 12,
        hueSpread: 14,
        satBase: 50,
        satSpread: 15,
        lightBase: 20,
        lightSpread: 8,
        accentColor: 'rgba(255, 75, 20, 0.65)',
        mossColor: 'rgba(230, 80, 20, 0.5)',
        floorHue: 8,
        floorLight: 14,
        hasRunes: true,
        runeColor: '#ff5522'
    },
    // World 4 / Bonus: Enchanted Forest
    forest: {
        mortar: '#0e1810',
        floorMortar: '#08100a',
        hueBase: 142,
        hueSpread: 18,
        satBase: 35,
        satSpread: 12,
        lightBase: 26,
        lightSpread: 8,
        accentColor: 'rgba(70, 230, 160, 0.45)',
        mossColor: 'rgba(50, 190, 100, 0.6)',
        floorHue: 148,
        floorLight: 16,
        hasRunes: true,
        runeColor: '#34d399'
    },
    // World 5: Shadow Realm
    shadow: {
        mortar: '#080512',
        floorMortar: '#04020a',
        hueBase: 275,
        hueSpread: 20,
        satBase: 40,
        satSpread: 15,
        lightBase: 15,
        lightSpread: 6,
        accentColor: 'rgba(168, 85, 247, 0.55)',
        mossColor: 'rgba(139, 92, 246, 0.35)',
        floorHue: 270,
        floorLight: 10,
        hasRunes: true,
        runeColor: '#c084fc'
    },
    // Backward compatibility aliases
    mossy: {
        mortar: '#142012',
        floorMortar: '#0a1408',
        hueBase: 140,
        hueSpread: 15,
        satBase: 32,
        satSpread: 10,
        lightBase: 28,
        lightSpread: 8,
        accentColor: 'rgba(70, 220, 140, 0.45)',
        mossColor: 'rgba(54, 160, 80, 0.55)',
        floorHue: 145,
        floorLight: 16,
        hasRunes: true,
        runeColor: '#34d399'
    },
    slate: {
        mortar: '#10141a',
        floorMortar: '#080b0f',
        hueBase: 208,
        hueSpread: 14,
        satBase: 15,
        satSpread: 8,
        lightBase: 26,
        lightSpread: 8,
        accentColor: 'rgba(120, 160, 200, 0.35)',
        mossColor: 'rgba(70, 110, 140, 0.35)',
        floorHue: 212,
        floorLight: 15,
        hasRunes: false,
        runeColor: '#7090b0'
    },
    obsidian: {
        mortar: '#090710',
        floorMortar: '#05030a',
        hueBase: 280,
        hueSpread: 16,
        satBase: 25,
        satSpread: 10,
        lightBase: 14,
        lightSpread: 5,
        accentColor: 'rgba(192, 132, 252, 0.4)',
        mossColor: 'rgba(168, 85, 247, 0.30)',
        floorHue: 275,
        floorLight: 9,
        hasRunes: true,
        runeColor: '#a855f7'
    }
};

function getThemeSeed(theme) {
    switch (theme) {
        case 'ice': return 150;
        case 'lava': return 250;
        case 'forest': return 350;
        case 'shadow': return 450;
        case 'slate': return 200;
        case 'obsidian': return 300;
        case 'mossy': return 100;
        case 'sunstone':
        default: return 50;
    }
}

function drawRuneGlyph(ctx, x, y, size, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y - size * 0.4);
    ctx.lineTo(x + size * 0.4, y + size * 0.4);
    ctx.moveTo(x + size * 0.4, y - size * 0.4);
    ctx.lineTo(x - size * 0.4, y + size * 0.4);
    ctx.moveTo(x, y - size * 0.5);
    ctx.lineTo(x, y + size * 0.5);
    ctx.stroke();
    ctx.restore();
}

function drawMagmaVein(ctx, rand, size) {
    ctx.save();
    let x = rand() * size;
    let y = rand() * size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 7; i++) {
        x += (rand() - 0.5) * 35;
        y += 4 + rand() * 16;
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255, 70, 10, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    ctx.stroke();

    ctx.strokeStyle = '#fffb88';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function buildWall(theme = 'sunstone') {
    const pal = THEME_PALETTES[theme] || THEME_PALETTES.sunstone;
    const size = 256;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(11 + getThemeSeed(theme));

    ctx.fillStyle = pal.mortar;
    ctx.fillRect(0, 0, size, size);

    const rows = 4;
    const rowHeight = size / rows;

    for (let r = 0; r < rows; r++) {
        const widths = [];
        let total = 0;

        while (total < size) {
            let w = [72, 88, 104, 120][Math.floor(rand() * 4)];
            if (size - total - w < 56) w = size - total;
            widths.push(w);
            total += w;
        }

        let x = (r % 2) * 48 + Math.floor(rand() * 24);
        const y = r * rowHeight;

        for (const w of widths) {
            for (const dx of [0, -size]) {
                const bx = x + dx;
                const hue = pal.hueBase + rand() * pal.hueSpread;
                const sat = pal.satBase + rand() * pal.satSpread;
                const light = pal.lightBase + rand() * pal.lightSpread;

                ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
                ctx.fillRect(bx + 2, y + 2, w - 4, rowHeight - 4);

                ctx.fillStyle = 'rgba(255, 236, 190, 0.10)';
                ctx.fillRect(bx + 2, y + 2, w - 4, 2);

                ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                ctx.fillRect(bx + 2, y + rowHeight - 5, w - 4, 3);

                grain(ctx, rand, bx + 2, y + 2, w - 4, rowHeight - 4, 55);

                // World-specific subtle stone inscriptions
                if (pal.hasRunes && rand() < 0.25 && w > 80) {
                    drawRuneGlyph(ctx, bx + w / 2, y + rowHeight / 2, 14, pal.runeColor);
                }
            }

            x += w;
        }
    }

    // Cracks & elemental veins
    for (let i = 0; i < 4; i++) crack(ctx, rand, size);

    if (theme === 'lava') {
        for (let i = 0; i < 3; i++) drawMagmaVein(ctx, rand, size);
    }

    // Weathering/moss or mineral accumulation
    for (let i = 0; i < 8; i++) {
        const mx = rand() * size;
        const my = size - rand() * 28;
        const radius = 18 + rand() * 24;
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius);

        gradient.addColorStop(0, pal.mossColor);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
    }

    // Soot or ambient rim near top
    const soot = ctx.createLinearGradient(0, 0, 0, 70);
    soot.addColorStop(0, theme === 'ice' ? 'rgba(180, 230, 255, 0.2)' : 'rgba(0, 0, 0, 0.35)');
    soot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = soot;
    ctx.fillRect(0, 0, size, 70);

    return toTexture(canvas);
}

function buildFloor(theme = 'sunstone') {
    const pal = THEME_PALETTES[theme] || THEME_PALETTES.sunstone;
    const size = 256;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(23 + getThemeSeed(theme));

    ctx.fillStyle = pal.floorMortar;
    ctx.fillRect(0, 0, size, size);

    const tile = size / 2;

    for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
            const x = tx * tile;
            const y = ty * tile;
            const hue = pal.floorHue + rand() * 8;
            const sat = pal.satBase + rand() * 6;
            const light = pal.floorLight + rand() * 6;

            ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
            ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

            const wear = ctx.createRadialGradient(x + tile / 2, y + tile / 2, 4, x + tile / 2, y + tile / 2, tile * 0.6);
            wear.addColorStop(0, theme === 'ice' ? 'rgba(210, 245, 255, 0.25)' : 'rgba(255, 230, 180, 0.08)');
            wear.addColorStop(1, 'rgba(0, 0, 0, 0.20)');
            ctx.fillStyle = wear;
            ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

            grain(ctx, rand, x + 3, y + 3, tile - 6, tile - 6, 100);

            if (theme === 'ice') {
                // Frost crystal gloss
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x + 10, y + 10);
                ctx.lineTo(x + tile - 10, y + tile - 10);
                ctx.stroke();
            }
        }
    }

    for (let i = 0; i < 3; i++) crack(ctx, rand, size);

    if (theme === 'lava') {
        for (let i = 0; i < 2; i++) drawMagmaVein(ctx, rand, size);
    }

    return toTexture(canvas);
}

const themeCaches = new Map();

export function getStoneTextures(theme = 'sunstone') {
    const key = THEME_PALETTES[theme] ? theme : 'sunstone';
    if (!themeCaches.has(key)) {
        themeCaches.set(key, { wall: buildWall(key), floor: buildFloor(key) });
    }
    return themeCaches.get(key);
}
