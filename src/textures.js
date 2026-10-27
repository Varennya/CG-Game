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
    sunstone: {
        mortar: '#21180f',
        floorMortar: '#100b07',
        hueBase: 31,
        hueSpread: 9,
        satBase: 17,
        satSpread: 9,
        lightBase: 36,
        lightSpread: 9,
        mossColor: 'rgba(86, 128, 74, 0.38)',
        floorHue: 28,
        floorLight: 19
    },
    mossy: {
        mortar: '#182014',
        floorMortar: '#0b1208',
        hueBase: 44,
        hueSpread: 12,
        satBase: 20,
        satSpread: 8,
        lightBase: 30,
        lightSpread: 8,
        mossColor: 'rgba(64, 138, 54, 0.55)',
        floorHue: 48,
        floorLight: 17
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
        mossColor: 'rgba(70, 110, 140, 0.35)',
        floorHue: 212,
        floorLight: 15
    },
    obsidian: {
        mortar: '#0a0808',
        floorMortar: '#060404',
        hueBase: 280,
        hueSpread: 16,
        satBase: 12,
        satSpread: 6,
        lightBase: 18,
        lightSpread: 6,
        mossColor: 'rgba(180, 50, 40, 0.30)',
        floorHue: 275,
        floorLight: 12
    }
};

function buildWall(theme = 'sunstone') {
    const pal = THEME_PALETTES[theme] || THEME_PALETTES.sunstone;
    const size = 256;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(11 + (theme === 'mossy' ? 100 : theme === 'slate' ? 200 : theme === 'obsidian' ? 300 : 0));

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
            }

            x += w;
        }
    }

    for (let i = 0; i < 4; i++) crack(ctx, rand, size);

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

    // Soot near top
    const soot = ctx.createLinearGradient(0, 0, 0, 70);
    soot.addColorStop(0, 'rgba(0, 0, 0, 0.35)');
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
    const rand = mulberry32(23 + (theme === 'mossy' ? 100 : theme === 'slate' ? 200 : theme === 'obsidian' ? 300 : 0));

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
            wear.addColorStop(0, 'rgba(255, 230, 180, 0.08)');
            wear.addColorStop(1, 'rgba(0, 0, 0, 0.20)');
            ctx.fillStyle = wear;
            ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

            grain(ctx, rand, x + 3, y + 3, tile - 6, tile - 6, 100);
        }
    }

    for (let i = 0; i < 3; i++) crack(ctx, rand, size);

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
