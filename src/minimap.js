// ========================================
// MINIMAP
// An etched map of the ruins, charted as you explore. Cells you have not
// been near stay dark, and exits, doors, keys and orbs only appear once
// you have seen their cell. Sentinels show only when close.
//
// The charted walls and floor are drawn once into a hidden canvas and only
// redrawn when the chart changes, so each frame paints just the few moving
// things (player, sentinels, pickups).
// ========================================

import * as THREE from 'three';
import { CELL_SIZE, KEY_COLORS, isDoorChar } from './levels.js';

const canvas = document.getElementById('minimap');
const context = canvas.getContext('2d');
const direction = new THREE.Vector3();

// A sentinel is shown while it is within this many world units of you
const SENTINEL_SENSE = 8;

const COLORS = {
    background: '#0f0b08',
    wall: '#7a6644',
    floor: '#261d14',
    exit: '#f0a63a',
    orb: '#ffd23f',
    sentinel: '#ff4a3a',
    player: '#f6e8c6'
};

const staticLayer = document.createElement('canvas');
staticLayer.width = canvas.width;
staticLayer.height = canvas.height;
const staticContext = staticLayer.getContext('2d');

let cache = { world: null, version: -1, cell: 1, offsetX: 0, offsetY: 0 };

function hex(color) {
    return '#' + color.toString(16).padStart(6, '0');
}

function renderStaticLayer(world) {
    const { level, grid, explored } = world;
    const width = staticLayer.width;
    const height = staticLayer.height;

    // Uniform cell size, so non-square mazes are not stretched
    const cell = Math.min(width / level.cols, height / level.rows);
    const offsetX = (width - cell * level.cols) / 2;
    const offsetY = (height - cell * level.rows) / 2;

    staticContext.fillStyle = COLORS.background;
    staticContext.fillRect(0, 0, width, height);

    for (let row = 0; row < level.rows; row++) {
        for (let col = 0; col < level.cols; col++) {
            if (!explored[row][col]) continue;

            const ch = grid[row][col];

            if (ch === '#') staticContext.fillStyle = COLORS.wall;
            else if (isDoorChar(ch)) staticContext.fillStyle = hex(KEY_COLORS[ch.charCodeAt(0) - 65]);
            else staticContext.fillStyle = COLORS.floor;

            staticContext.fillRect(offsetX + col * cell, offsetY + row * cell, cell - 0.5, cell - 0.5);
        }
    }

    // The exit, once you have seen it
    if (explored[level.exit.row][level.exit.col]) {
        staticContext.fillStyle = COLORS.exit;
        staticContext.fillRect(
            offsetX + level.exit.col * cell,
            offsetY + level.exit.row * cell,
            cell - 0.5,
            cell - 0.5
        );
    }

    cache = { world, version: world.mapVersion, cell, offsetX, offsetY };
}

export function drawMinimap(world, camera) {
    const { level, explored } = world;

    if (cache.world !== world || cache.version !== world.mapVersion) {
        renderStaticLayer(world);
    }

    const { cell, offsetX, offsetY } = cache;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(staticLayer, 0, 0);

    const toMap = (row, col) => ({
        x: offsetX + (col + 0.5) * cell,
        y: offsetY + (row + 0.5) * cell
    });

    // Orbs
    context.fillStyle = COLORS.orb;
    world.orbs.forEach((orb) => {
        if (orb.collected || !explored[orb.row][orb.col]) return;
        const p = toMap(orb.row, orb.col);
        context.beginPath();
        context.arc(p.x, p.y, Math.max(1.5, cell * 0.22), 0, Math.PI * 2);
        context.fill();
    });

    // Keys
    world.keys.forEach((key) => {
        if (key.collected || !explored[key.row][key.col]) return;
        const p = toMap(key.row, key.col);
        context.fillStyle = hex(KEY_COLORS[key.id]);
        context.fillRect(p.x - cell * 0.3, p.y - cell * 0.3, cell * 0.6, cell * 0.6);
    });

    // Checkpoints
    (world.checkpoints || []).forEach((cp) => {
        if (!explored[cp.row][cp.col]) return;
        const p = toMap(cp.row, cp.col);
        context.fillStyle = cp.activated ? '#38bdf8' : '#64748b';
        context.beginPath();
        context.moveTo(p.x, p.y - cell * 0.4);
        context.lineTo(p.x + cell * 0.35, p.y);
        context.lineTo(p.x, p.y + cell * 0.4);
        context.lineTo(p.x - cell * 0.35, p.y);
        context.closePath();
        context.fill();
    });

    // Switches & Plates
    (world.switches || []).forEach((sw) => {
        if (!explored[sw.row][sw.col]) return;
        const p = toMap(sw.row, sw.col);
        context.fillStyle = sw.active ? '#4ade80' : '#38bdf8';
        context.fillRect(p.x - cell * 0.25, p.y - cell * 0.25, cell * 0.5, cell * 0.5);
    });

    (world.plates || []).forEach((pl) => {
        if (!explored[pl.row][pl.col]) return;
        const p = toMap(pl.row, pl.col);
        context.fillStyle = pl.active ? '#fbbf24' : '#a16207';
        context.beginPath();
        context.arc(p.x, p.y, cell * 0.3, 0, Math.PI * 2);
        context.fill();
    });

    // Teleporters
    (world.teleporters || []).forEach((tel) => {
        if (!explored[tel.row][tel.col]) return;
        const p = toMap(tel.row, tel.col);
        context.strokeStyle = '#c084fc';
        context.lineWidth = 1.5;
        context.beginPath();
        context.arc(p.x, p.y, cell * 0.35, 0, Math.PI * 2);
        context.stroke();
    });

    // Relics
    (world.relics || []).forEach((rel) => {
        if (rel.collected || !explored[rel.row][rel.col]) return;
        const p = toMap(rel.row, rel.col);
        context.fillStyle = '#fde047';
        context.beginPath();
        context.arc(p.x, p.y, cell * 0.3, 0, Math.PI * 2);
        context.fill();
    });

    // Sentinels: only while they are close
    context.fillStyle = COLORS.sentinel;
    world.sentinels.forEach((sentinel) => {
        const dx = sentinel.position.x - camera.position.x;
        const dz = sentinel.position.z - camera.position.z;
        if (Math.hypot(dx, dz) > SENTINEL_SENSE) return;

        const px = offsetX + (sentinel.position.x / CELL_SIZE + level.cols / 2) * cell;
        const py = offsetY + (sentinel.position.z / CELL_SIZE + level.rows / 2) * cell;
        context.beginPath();
        context.arc(px, py, Math.max(2, cell * 0.35), 0, Math.PI * 2);
        context.fill();
    });

    // Player: smooth position + an arrow that points where the camera looks.
    // The arrow is drawn pointing up (-Z), so the angle is atan2(x, -z).
    const playerX = offsetX + (camera.position.x / CELL_SIZE + level.cols / 2) * cell;
    const playerY = offsetY + (camera.position.z / CELL_SIZE + level.rows / 2) * cell;

    camera.getWorldDirection(direction);
    const angle = Math.atan2(direction.x, -direction.z);

    context.save();
    context.translate(playerX, playerY);
    context.rotate(angle);

    context.beginPath();
    context.moveTo(0, -cell * 0.6);
    context.lineTo(-cell * 0.42, cell * 0.42);
    context.lineTo(0, cell * 0.2);
    context.lineTo(cell * 0.42, cell * 0.42);
    context.closePath();

    context.fillStyle = COLORS.player;
    context.shadowColor = '#f0a63a';
    context.shadowBlur = 6;
    context.fill();

    context.restore();
}
