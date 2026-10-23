// ========================================
// PROCEDURAL STONE TEXTURES
// Drawn once with the 2D canvas, so the game needs no image files and
// the textures stay tiny (256x256 each) for low-end GPUs.
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
        ctx.fillStyle = rand() < 0.5 ? 'rgba(0, 0, 0, 0.11)' : 'rgba(255, 240, 200, 0.07)';
        ctx.fillRect(x + rand() * w, y + rand() * h, 1 + rand() * 2, 1 + rand() * 2);
    }
}

function crack(ctx, rand, size) {
    let x = rand() * size;
    let y = rand() * size;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let i = 0; i < 6; i++) {
        x += (rand() - 0.5) * 26;
        y += 6 + rand() * 14;
        ctx.lineTo(x, y);
    }

    ctx.strokeStyle = 'rgba(18, 12, 6, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

// Sandstone blocks laid in staggered courses, with cracks, moss and soot
function buildWall() {
    const size = 256;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(11);

    // Mortar shows through the gaps between blocks
    ctx.fillStyle = '#21180f';
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
            // Draw twice so the pattern wraps around when the texture repeats
            for (const dx of [0, -size]) {
                const bx = x + dx;
                const hue = 31 + rand() * 9;
                const sat = 17 + rand() * 9;
                const light = 36 + rand() * 9;

                ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
                ctx.fillRect(bx + 2, y + 2, w - 4, rowHeight - 4);

                ctx.fillStyle = 'rgba(255, 236, 190, 0.12)';
                ctx.fillRect(bx + 2, y + 2, w - 4, 2);

                ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
                ctx.fillRect(bx + 2, y + rowHeight - 5, w - 4, 3);

                grain(ctx, rand, bx + 2, y + 2, w - 4, rowHeight - 4, 60);
            }

            x += w;
        }
    }

    for (let i = 0; i < 4; i++) crack(ctx, rand, size);

    // Moss creeping up from the bottom edge
    for (let i = 0; i < 7; i++) {
        const mx = rand() * size;
        const my = size - rand() * 26;
        const radius = 18 + rand() * 24;
        const gradient = ctx.createRadialGradient(mx, my, 0, mx, my, radius);

        gradient.addColorStop(0, 'rgba(86, 128, 74, 0.38)');
        gradient.addColorStop(1, 'rgba(86, 128, 74, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(mx - radius, my - radius, radius * 2, radius * 2);
    }

    // Soot near the top, where torch smoke gathers
    const soot = ctx.createLinearGradient(0, 0, 0, 70);
    soot.addColorStop(0, 'rgba(0, 0, 0, 0.30)');
    soot.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = soot;
    ctx.fillRect(0, 0, size, 70);

    return toTexture(canvas);
}

// Worn flagstones, two by two per texture tile (one tile = one maze cell)
function buildFloor() {
    const size = 256;
    const canvas = makeCanvas(size);
    const ctx = canvas.getContext('2d');
    const rand = mulberry32(23);

    ctx.fillStyle = '#100b07';
    ctx.fillRect(0, 0, size, size);

    const tile = size / 2;

    for (let ty = 0; ty < 2; ty++) {
        for (let tx = 0; tx < 2; tx++) {
            const x = tx * tile;
            const y = ty * tile;
            const hue = 28 + rand() * 8;
            const sat = 14 + rand() * 8;
            const light = 19 + rand() * 6;

            ctx.fillStyle = `hsl(${hue} ${sat}% ${light}%)`;
            ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

            // Foot traffic wears the middle of each slab
            const wear = ctx.createRadialGradient(x + tile / 2, y + tile / 2, 4, x + tile / 2, y + tile / 2, tile * 0.6);
            wear.addColorStop(0, 'rgba(255, 230, 180, 0.07)');
            wear.addColorStop(1, 'rgba(0, 0, 0, 0.18)');
            ctx.fillStyle = wear;
            ctx.fillRect(x + 3, y + 3, tile - 6, tile - 6);

            grain(ctx, rand, x + 3, y + 3, tile - 6, tile - 6, 110);
        }
    }

    for (let i = 0; i < 3; i++) crack(ctx, rand, size);

    return toTexture(canvas);
}

let cached = null;

export function getStoneTextures() {
    if (!cached) {
        cached = { wall: buildWall(), floor: buildFloor() };
    }

    return cached;
}
