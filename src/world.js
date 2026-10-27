// ========================================
// WORLD CONSTRUCTION & 3D ENVIRONMENT
// MAZE EXPLORER 3D: ADVANCED EXPANSION (PHASE 2)
//
// 3D Scene Architecture & Computer Graphics Demonstration:
//   - Procedural textured walls and tiled floors/ceilings per world
//   - InstancedMesh rendering for hundreds of maze walls in a single draw call
//   - Atmospheric dynamic particle systems (dust, frost flakes, embers, spores, void motes)
//   - Environmental puzzle mechanics:
//       * Pressure plates with physical depression & timed reset
//       * Mechanical switch levers & crystal obelisks
//       * Dimensional teleporter pads with concentric energy rings
//       * Hidden illusory walls that dissolve when approached
//       * Checkpoint beacons that ignite into radiant cyan pillars
//       * Ancient Relics & treasure chest collectibles
//   - 5 Unique Guardian / Boss encounters:
//       * Ancient Stone Guardian (Level 5)
//       * Frost Titan (Level 10)
//       * Flame Guardian (Level 15)
//       * The Shadow Architect (Level 20 Climax)
//   - Radiant Exit Beacon with dual-layer additive blending cylinders
// ========================================

import * as THREE from 'three';
import { CELL_SIZE, KEY_COLORS } from './levels.js';
import { getStoneTextures } from './textures.js';

export const WALL_HEIGHT = 2.5;

const CEILING_TINTS = {
    sunstone: 0x9a8a72,
    ice: 0x88ccee,
    lava: 0x441510,
    forest: 0x3d6e52,
    shadow: 0x22132a,
    mossy: 0x76876a,
    slate: 0x5a6a7a,
    obsidian: 0x362c33
};

export function createWorld(scene, light, level) {
    const { rows, cols } = level;
    const group = new THREE.Group();
    scene.add(group);

    // Private copy of the maze grid: doors become '.' when unlocked
    const grid = level.grid.map((row) => row.slice());

    const mazeWidth = cols * CELL_SIZE;
    const mazeDepth = rows * CELL_SIZE;

    function toWorld(row, col) {
        return {
            x: (col - (cols - 1) / 2) * CELL_SIZE,
            z: (row - (rows - 1) / 2) * CELL_SIZE
        };
    }

    function toCell(x, z) {
        return {
            col: Math.floor(x / CELL_SIZE + cols / 2),
            row: Math.floor(z / CELL_SIZE + rows / 2)
        };
    }

    // ----------------------------------------
    // Minimap Exploration & Fog of War
    // ----------------------------------------
    const explored = Array.from({ length: rows }, () => Array(cols).fill(false));
    let mapVersion = 0;
    let lastRevealed = -1;
    const REVEAL_STEPS = 2;

    function reveal(row, col) {
        if (row < 0 || col < 0 || row >= rows || col >= cols) return;

        const id = row * cols + col;
        if (id === lastRevealed) return;
        lastRevealed = id;

        let changed = false;
        const steps = new Map([[id, 0]]);
        const queue = [[row, col]];

        for (let head = 0; head < queue.length; head++) {
            const [r, c] = queue[head];

            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr;
                    const nc = c + dc;

                    if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !explored[nr][nc]) {
                        explored[nr][nc] = true;
                        changed = true;
                    }
                }
            }

            const taken = steps.get(r * cols + c);
            if (taken >= REVEAL_STEPS) continue;

            for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                const nr = r + dr;
                const nc = c + dc;
                const key = nr * cols + nc;

                if (!isBlocked(nr, nc) && !steps.has(key)) {
                    steps.set(key, taken + 1);
                    queue.push([nr, nc]);
                }
            }
        }

        if (changed) mapVersion++;
    }

    // ----------------------------------------
    // Shadows: size light frustum to the maze
    // ----------------------------------------
    const half = Math.hypot(mazeWidth, mazeDepth) / 2 + 2;
    light.shadow.camera.left = -half;
    light.shadow.camera.right = half;
    light.shadow.camera.top = half;
    light.shadow.camera.bottom = -half;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 80 + half;
    light.shadow.camera.updateProjectionMatrix();

    // ----------------------------------------
    // Floor and Ceiling (Procedural Textures)
    // ----------------------------------------
    const textures = getStoneTextures(level.theme || 'sunstone');

    function tiledPlane(material, flip) {
        const geometry = new THREE.PlaneGeometry(mazeWidth, mazeDepth);
        const uv = geometry.attributes.uv;

        for (let i = 0; i < uv.count; i++) {
            uv.setXY(i, uv.getX(i) * cols, uv.getY(i) * rows);
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = flip ? Math.PI / 2 : -Math.PI / 2;
        return mesh;
    }

    const floor = tiledPlane(new THREE.MeshLambertMaterial({ map: textures.floor }), false);
    floor.receiveShadow = true;
    group.add(floor);

    const ceilingTint = CEILING_TINTS[level.theme] || CEILING_TINTS.sunstone;
    const ceiling = tiledPlane(
        new THREE.MeshLambertMaterial({ map: textures.floor, color: ceilingTint }),
        true
    );
    ceiling.position.y = WALL_HEIGHT;
    group.add(ceiling);

    // ----------------------------------------
    // Walls: InstancedMesh for High Performance
    // ----------------------------------------
    const hiddenSet = new Set((level.hiddenWalls || []).map(h => `${h.row},${h.col}`));
    let wallCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '#' && !hiddenSet.has(`${r},${c}`)) wallCount++;
        }
    }

    const wallGeometry = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
    const wallMaterial = new THREE.MeshLambertMaterial({ map: textures.wall });
    const walls = new THREE.InstancedMesh(wallGeometry, wallMaterial, Math.max(1, wallCount));
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.frustumCulled = false;

    const matrix = new THREE.Matrix4();
    let index = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== '#' || hiddenSet.has(`${r},${c}`)) continue;
            const p = toWorld(r, c);
            matrix.setPosition(p.x, WALL_HEIGHT / 2, p.z);
            walls.setMatrixAt(index++, matrix);
        }
    }

    walls.instanceMatrix.needsUpdate = true;
    group.add(walls);

    // ----------------------------------------
    // Hidden Walls (Secret Passages)
    // ----------------------------------------
    const hiddenWalls = (level.hiddenWalls || []).map(h => {
        const p = toWorld(h.row, h.col);
        const mesh = new THREE.Mesh(
            wallGeometry,
            new THREE.MeshStandardMaterial({
                map: textures.wall,
                roughness: 0.5,
                metalness: 0.2,
                transparent: true,
                opacity: 1
            })
        );
        mesh.position.set(p.x, WALL_HEIGHT / 2, p.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        return { ...h, x: p.x, z: p.z, mesh, revealed: false, progress: 0 };
    });

    // ----------------------------------------
    // Start and Exit Markers + Radiant Exit Beacon
    // ----------------------------------------
    function addMarker(cell, color, intensity) {
        const p = toWorld(cell.row, cell.col);
        const marker = new THREE.Mesh(
            new THREE.BoxGeometry(CELL_SIZE * 0.65, 0.12, CELL_SIZE * 0.65),
            new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: intensity,
                roughness: 0.3,
                metalness: 0.2
            })
        );
        marker.position.set(p.x, 0.08, p.z);
        group.add(marker);
        return p;
    }

    addMarker(level.start, 0x5fa896, 0.5);
    const exitPosition = addMarker(level.exit, 0xf0a63a, 2.2);

    const exitRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.65, 0.06, 8, 32),
        new THREE.MeshStandardMaterial({ color: 0xffc04d, emissive: 0xffa21f, emissiveIntensity: 2.5 })
    );
    exitRing.rotation.x = Math.PI / 2;
    exitRing.position.set(exitPosition.x, 0.2, exitPosition.z);
    group.add(exitRing);

    // Glowing exit beacon visible from distance through corridors
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(exitPosition.x, WALL_HEIGHT / 2, exitPosition.z);

    const beamOuter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, WALL_HEIGHT, 16, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xf0a63a,
            transparent: true,
            opacity: 0.32,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    beaconGroup.add(beamOuter);

    const beamInner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.16, WALL_HEIGHT, 12, 1, true),
        new THREE.MeshBasicMaterial({
            color: 0xffefb8,
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    );
    beaconGroup.add(beamInner);

    const beamRing1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffcc55, blending: THREE.AdditiveBlending })
    );
    beamRing1.rotation.x = Math.PI / 2;
    beamRing1.position.y = -0.3;
    beaconGroup.add(beamRing1);

    const beamRing2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.38, 0.03, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xffcc55, blending: THREE.AdditiveBlending })
    );
    beamRing2.rotation.x = Math.PI / 2;
    beamRing2.position.y = 0.5;
    beaconGroup.add(beamRing2);

    group.add(beaconGroup);

    // ----------------------------------------
    // World Theme Atmospheric Particles
    // ----------------------------------------
    const PARTICLE_COUNT = 90;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleOffsets = [];

    const themeColors = {
        sunstone: 0xffdeb0,
        ice: 0x99e5ff,
        lava: 0xff5511,
        forest: 0x55ffaa,
        shadow: 0xcc88ff,
        mossy: 0x77eeaa,
        slate: 0xaaccff,
        obsidian: 0xdd77ff
    };
    const pColor = themeColors[level.theme] || 0xffdeb0;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ox = (Math.random() - 0.5) * 10;
        const oy = Math.random() * (WALL_HEIGHT - 0.3) + 0.15;
        const oz = (Math.random() - 0.5) * 10;
        particlePositions[i * 3 + 0] = ox;
        particlePositions[i * 3 + 1] = oy;
        particlePositions[i * 3 + 2] = oz;
        particleOffsets.push({ ox, oy, oz, speed: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMat = new THREE.PointsMaterial({
        color: pColor,
        size: level.theme === 'lava' || level.theme === 'ice' ? 0.06 : 0.045,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // ----------------------------------------
    // Collectible Orbs
    // ----------------------------------------
    const orbGeometry = new THREE.IcosahedronGeometry(0.2, 1);
    const orbMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd23f,
        emissive: 0xffb800,
        emissiveIntensity: 1.6,
        roughness: 0.25,
        metalness: 0.3
    });

    const orbs = level.orbs.map((cell, i) => {
        const p = toWorld(cell.row, cell.col);
        const mesh = new THREE.Mesh(orbGeometry, orbMaterial);
        mesh.position.set(p.x, 1, p.z);
        mesh.castShadow = true;
        group.add(mesh);
        return { ...cell, x: p.x, z: p.z, mesh, collected: false, phase: i * 1.7 };
    });

    // ----------------------------------------
    // Color-Coded Keys
    // ----------------------------------------
    function buildKeyMesh(color) {
        const material = new THREE.MeshStandardMaterial({
            color,
            emissive: color,
            emissiveIntensity: 0.9,
            roughness: 0.3,
            metalness: 0.6
        });

        const key = new THREE.Group();
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.045, 8, 20), material);
        ring.position.y = 0.3;
        key.add(ring);

        const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), material);
        shaft.position.y = 0;
        key.add(shaft);

        [-0.16, -0.06].forEach((y) => {
            const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.07, 0.05), material);
            tooth.position.set(0.1, y, 0);
            key.add(tooth);
        });

        key.scale.setScalar(1.25);
        return key;
    }

    const keys = level.keys.map((cell) => {
        const p = toWorld(cell.row, cell.col);
        const mesh = buildKeyMesh(KEY_COLORS[cell.id] || 0xffb020);
        mesh.position.set(p.x, 1, p.z);
        group.add(mesh);
        return { ...cell, x: p.x, z: p.z, mesh, collected: false };
    });

    // ----------------------------------------
    // Locked Doors
    // ----------------------------------------
    const doorGeometry = new THREE.BoxGeometry(CELL_SIZE * 0.94, WALL_HEIGHT, CELL_SIZE * 0.94);
    const doorEdges = new THREE.EdgesGeometry(doorGeometry);

    const doors = level.doors.map((cell) => {
        const p = toWorld(cell.row, cell.col);
        const color = KEY_COLORS[cell.id] || 0xffb020;

        const mesh = new THREE.Mesh(
            doorGeometry,
            new THREE.MeshStandardMaterial({
                color,
                emissive: color,
                emissiveIntensity: 0.55,
                roughness: 0.4,
                metalness: 0.5,
                transparent: true,
                opacity: 0.82
            })
        );
        mesh.position.set(p.x, WALL_HEIGHT / 2, p.z);
        mesh.castShadow = true;
        mesh.add(new THREE.LineSegments(doorEdges, new THREE.LineBasicMaterial({ color: 0xffffff })));
        group.add(mesh);

        return { ...cell, x: p.x, z: p.z, mesh, open: false, progress: 0 };
    });

    function openDoor(door) {
        if (door.open) return;
        door.open = true;
        grid[door.row][door.col] = '.';
        mapVersion++;
        lastRevealed = -1;
    }

    function closeDoor(door) {
        if (!door.open) return;
        door.open = false;
        door.progress = 0;
        door.mesh.visible = true;
        door.mesh.position.y = WALL_HEIGHT / 2;
        door.mesh.material.opacity = 0.82;
        grid[door.row][door.col] = String.fromCharCode(65 + door.id);
        mapVersion++;
        lastRevealed = -1;
    }

    // ----------------------------------------
    // Pressure Plates
    // ----------------------------------------
    const plates = (level.plates || []).map((p) => {
        const pos = toWorld(p.row, p.col);
        const plateGroup = new THREE.Group();
        plateGroup.position.set(pos.x, 0.05, pos.z);

        const baseMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.7, 0.06, 24),
            new THREE.MeshStandardMaterial({ color: 0x4a3d2a, roughness: 0.6 })
        );
        plateGroup.add(baseMesh);

        const padMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.08, 24),
            new THREE.MeshStandardMaterial({
                color: 0xf0a63a,
                emissive: 0xd97706,
                emissiveIntensity: 0.8,
                roughness: 0.3
            })
        );
        padMesh.position.y = 0.04;
        plateGroup.add(padMesh);

        group.add(plateGroup);

        return {
            ...p,
            x: pos.x,
            z: pos.z,
            group: plateGroup,
            padMesh,
            stepped: false,
            active: false,
            timeLeft: 0
        };
    });

    // ----------------------------------------
    // Switches / Mechanisms
    // ----------------------------------------
    const switches = (level.switches || []).map((s) => {
        const pos = toWorld(s.row, s.col);
        const switchGroup = new THREE.Group();
        switchGroup.position.set(pos.x, 0, pos.z);

        const pedestal = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.8, 0.4),
            new THREE.MeshStandardMaterial({ color: 0x3a3024, roughness: 0.7 })
        );
        pedestal.position.y = 0.4;
        switchGroup.add(pedestal);

        const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.22),
            new THREE.MeshStandardMaterial({
                color: 0x38bdf8,
                emissive: 0x0284c7,
                emissiveIntensity: 1.2,
                roughness: 0.2
            })
        );
        crystal.position.y = 0.95;
        switchGroup.add(crystal);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.3, 0.02, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0x7dd3fc })
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0.95;
        switchGroup.add(ring);

        group.add(switchGroup);

        return {
            ...s,
            x: pos.x,
            z: pos.z,
            group: switchGroup,
            crystal,
            ring,
            active: false
        };
    });

    // ----------------------------------------
    // Teleporters
    // ----------------------------------------
    const teleporters = (level.teleporters || []).map((t) => {
        const pos = toWorld(t.row, t.col);
        const teleGroup = new THREE.Group();
        teleGroup.position.set(pos.x, 0.04, pos.z);

        const pad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.7, 0.75, 0.06, 24),
            new THREE.MeshStandardMaterial({
                color: 0x7c3aed,
                emissive: 0x6d28d9,
                emissiveIntensity: 1.0,
                roughness: 0.4
            })
        );
        teleGroup.add(pad);

        const ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(0.55, 0.03, 8, 24),
            new THREE.MeshBasicMaterial({ color: 0xc084fc, blending: THREE.AdditiveBlending })
        );
        ring1.rotation.x = Math.PI / 2;
        ring1.position.y = 0.08;
        teleGroup.add(ring1);

        const ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(0.35, 0.025, 8, 20),
            new THREE.MeshBasicMaterial({ color: 0xa855f7, blending: THREE.AdditiveBlending })
        );
        ring2.rotation.x = Math.PI / 2;
        ring2.position.y = 0.12;
        teleGroup.add(ring2);

        group.add(teleGroup);

        return {
            ...t,
            x: pos.x,
            z: pos.z,
            group: teleGroup,
            ring1,
            ring2,
            targetWorld: toWorld(t.targetRow, t.targetCol)
        };
    });

    // ----------------------------------------
    // Checkpoints
    // ----------------------------------------
    const checkpoints = (level.checkpoints || []).map((c) => {
        const pos = toWorld(c.row, c.col);
        const cpGroup = new THREE.Group();
        cpGroup.position.set(pos.x, 0, pos.z);

        const base = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.2, 0.5),
            new THREE.MeshStandardMaterial({ color: 0x4a4030, roughness: 0.6 })
        );
        base.position.y = 0.1;
        cpGroup.add(base);

        const crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.24),
            new THREE.MeshStandardMaterial({
                color: 0x2dd4bf,
                emissive: 0x0f766e,
                emissiveIntensity: 0.6,
                roughness: 0.3
            })
        );
        crystal.position.y = 0.8;
        cpGroup.add(crystal);

        const aura = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.25, 2.0, 16, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0x2dd4bf,
                transparent: true,
                opacity: 0,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        aura.position.y = 1.0;
        cpGroup.add(aura);

        group.add(cpGroup);

        return {
            ...c,
            x: pos.x,
            z: pos.z,
            group: cpGroup,
            crystal,
            aura,
            activated: false
        };
    });

    // ----------------------------------------
    // Ancient Relics / Treasure Chests
    // ----------------------------------------
    const relics = (level.relics || []).map((r) => {
        const pos = toWorld(r.row, r.col);
        const relicGroup = new THREE.Group();
        relicGroup.position.set(pos.x, 0.9, pos.z);

        const core = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.25),
            new THREE.MeshStandardMaterial({
                color: 0xffd700,
                emissive: 0xf59e0b,
                emissiveIntensity: 1.8,
                roughness: 0.2,
                metalness: 0.8
            })
        );
        relicGroup.add(core);

        const orbitRing = new THREE.Mesh(
            new THREE.TorusGeometry(0.38, 0.025, 8, 24),
            new THREE.MeshStandardMaterial({
                color: 0xfde047,
                emissive: 0xeab308,
                emissiveIntensity: 1.2
            })
        );
        relicGroup.add(orbitRing);

        group.add(relicGroup);

        return {
            ...r,
            x: pos.x,
            z: pos.z,
            group: relicGroup,
            core,
            orbitRing,
            collected: false
        };
    });

    // ----------------------------------------
    // Boss / Guardian 3D Entity
    // ----------------------------------------
    let bossEntity = null;
    if (level.boss) {
        const pos = toWorld(level.boss.row, level.boss.col);
        const bossGroup = new THREE.Group();
        bossGroup.position.set(pos.x, 1.4, pos.z);

        const bossType = level.boss.type || 'stone';
        let coreMesh, shieldGroup;

        if (bossType === 'stone') {
            // Ancient Stone Guardian
            coreMesh = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 1.8, 1.2),
                new THREE.MeshStandardMaterial({
                    color: 0x9a8a72,
                    roughness: 0.6,
                    metalness: 0.3
                })
            );
            bossGroup.add(coreMesh);

            shieldGroup = new THREE.Group();
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const plate = new THREE.Mesh(
                    new THREE.BoxGeometry(0.8, 1.2, 0.15),
                    new THREE.MeshStandardMaterial({
                        color: 0xf0a63a,
                        emissive: 0xd97706,
                        emissiveIntensity: 1.2,
                        roughness: 0.4
                    })
                );
                plate.position.set(Math.cos(angle) * 1.3, 0, Math.sin(angle) * 1.3);
                plate.rotation.y = angle;
                shieldGroup.add(plate);
            }
            bossGroup.add(shieldGroup);
        } else if (bossType === 'ice') {
            // Frost Titan
            coreMesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(0.9, 1),
                new THREE.MeshStandardMaterial({
                    color: 0xa5f3fc,
                    emissive: 0x06b6d4,
                    emissiveIntensity: 1.8,
                    roughness: 0.1,
                    metalness: 0.3,
                    transparent: true,
                    opacity: 0.9
                })
            );
            bossGroup.add(coreMesh);

            shieldGroup = new THREE.Group();
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const spike = new THREE.Mesh(
                    new THREE.ConeGeometry(0.2, 1.0, 6),
                    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.2 })
                );
                spike.position.set(Math.cos(angle) * 1.4, 0, Math.sin(angle) * 1.4);
                spike.rotation.z = -Math.PI / 2;
                spike.rotation.y = angle;
                shieldGroup.add(spike);
            }
            bossGroup.add(shieldGroup);
        } else if (bossType === 'flame') {
            // Flame Guardian
            coreMesh = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.9),
                new THREE.MeshStandardMaterial({
                    color: 0x1a0604,
                    emissive: 0xff3b00,
                    emissiveIntensity: 2.2,
                    roughness: 0.5
                })
            );
            bossGroup.add(coreMesh);

            shieldGroup = new THREE.Group();
            for (let i = 0; i < 3; i++) {
                const ring = new THREE.Mesh(
                    new THREE.TorusGeometry(1.3 + i * 0.2, 0.04, 8, 28),
                    new THREE.MeshBasicMaterial({ color: 0xff6600, blending: THREE.AdditiveBlending })
                );
                ring.rotation.x = Math.PI / 3 * i;
                shieldGroup.add(ring);
            }
            bossGroup.add(shieldGroup);
        } else {
            // The Shadow Architect (Level 20)
            coreMesh = new THREE.Mesh(
                new THREE.IcosahedronGeometry(1.0, 1),
                new THREE.MeshStandardMaterial({
                    color: 0x1e102e,
                    emissive: 0x9333ea,
                    emissiveIntensity: 2.5,
                    roughness: 0.2,
                    metalness: 0.8
                })
            );
            bossGroup.add(coreMesh);

            shieldGroup = new THREE.Group();
            const ring1 = new THREE.Mesh(
                new THREE.TorusGeometry(1.5, 0.05, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0xc084fc, blending: THREE.AdditiveBlending })
            );
            const ring2 = new THREE.Mesh(
                new THREE.TorusGeometry(1.8, 0.04, 8, 32),
                new THREE.MeshBasicMaterial({ color: 0xa855f7, blending: THREE.AdditiveBlending })
            );
            ring2.rotation.x = Math.PI / 2;
            shieldGroup.add(ring1);
            shieldGroup.add(ring2);
            bossGroup.add(shieldGroup);
        }

        group.add(bossGroup);

        bossEntity = {
            ...level.boss,
            x: pos.x,
            z: pos.z,
            group: bossGroup,
            coreMesh,
            shieldGroup,
            activeSwitches: 0,
            defeated: false
        };
    }

    // ----------------------------------------
    // Patrolling Ancient Sentinels
    // ----------------------------------------
    const sentinelCoreGeometry = new THREE.SphereGeometry(0.3, 20, 16);
    const sentinelRingGeometry = new THREE.TorusGeometry(0.5, 0.035, 8, 28);
    const sentinelHaloGeometry = new THREE.CircleGeometry(0.9, 24);

    const sentinels = level.sentinels.map((def, i) => {
        const points = def.path.map((cell) => toWorld(cell.row, cell.col));
        const mesh = new THREE.Group();

        const sColor = level.theme === 'ice' ? 0x00f0ff : level.theme === 'shadow' ? 0xb030ff : 0xff5533;
        const eColor = level.theme === 'ice' ? 0x0088cc : level.theme === 'shadow' ? 0x6600aa : 0xff2200;

        const core = new THREE.Mesh(
            sentinelCoreGeometry,
            new THREE.MeshStandardMaterial({
                color: sColor,
                emissive: eColor,
                emissiveIntensity: 2.2,
                roughness: 0.3
            })
        );
        mesh.add(core);

        const ring = new THREE.Mesh(
            sentinelRingGeometry,
            new THREE.MeshStandardMaterial({ color: sColor, emissive: eColor, emissiveIntensity: 1.5 })
        );
        mesh.add(ring);

        const halo = new THREE.Mesh(
            sentinelHaloGeometry,
            new THREE.MeshBasicMaterial({
                color: sColor,
                transparent: true,
                opacity: 0.28,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            })
        );
        halo.rotation.x = -Math.PI / 2;
        halo.position.y = -0.95;
        mesh.add(halo);

        group.add(mesh);

        return {
            points,
            speed: def.speed,
            distance: 0,
            direction: 1,
            pause: 1 + i * 0.7,
            total: (points.length - 1) * CELL_SIZE,
            position: { x: points[0].x, z: points[0].z },
            mesh,
            ring,
            phase: i * 2.1
        };
    });

    function updateSentinelPosition(sentinel) {
        const t = sentinel.distance / CELL_SIZE;
        const i = Math.min(Math.floor(t), sentinel.points.length - 2);
        const frac = t - i;
        const a = sentinel.points[i];
        const b = sentinel.points[i + 1];

        sentinel.position.x = a.x + (b.x - a.x) * frac;
        sentinel.position.z = a.z + (b.z - a.z) * frac;
    }

    function getMinSentinelDist(px, pz) {
        if (!sentinels.length) return Infinity;
        let minDist = Infinity;
        for (const s of sentinels) {
            const d = Math.hypot(px - s.position.x, pz - s.position.z);
            if (d < minDist) minDist = d;
        }
        return minDist;
    }

    // ----------------------------------------
    // Collision Query
    // ----------------------------------------
    function isBlocked(row, col) {
        const ch = grid[row]?.[col];
        if (ch === undefined || ch === '#') return true;
        if (ch >= 'A' && ch <= 'D') return true;
        return false;
    }

    // ----------------------------------------
    // Environmental Mechanics Handlers
    // ----------------------------------------
    function activateSwitch(sw) {
        if (sw.active) return;
        sw.active = true;
        sw.crystal.material.emissive.setHex(0x22c55e);
        sw.ring.material.color.setHex(0x86efac);

        if (bossEntity) {
            bossEntity.activeSwitches++;
            if (bossEntity.activeSwitches >= bossEntity.requiredSwitches) {
                bossEntity.defeated = true;
                const targetDoor = doors.find(d => d.id === sw.targetDoorId);
                if (targetDoor) openDoor(targetDoor);
            }
        } else {
            const targetDoor = doors.find(d => d.id === sw.targetDoorId);
            if (targetDoor) openDoor(targetDoor);
        }
    }

    function activatePlate(pl) {
        pl.active = true;
        pl.padMesh.position.y = 0.01;
        const targetDoor = doors.find(d => d.id === pl.targetDoorId);
        if (targetDoor) openDoor(targetDoor);
    }

    function deactivatePlate(pl) {
        pl.active = false;
        pl.padMesh.position.y = 0.04;
        const targetDoor = doors.find(d => d.id === pl.targetDoorId);
        if (targetDoor) closeDoor(targetDoor);
    }

    function activateCheckpoint(cp) {
        if (cp.activated) return;
        cp.activated = true;
        cp.crystal.material.emissive.setHex(0x38bdf8);
        cp.crystal.material.emissiveIntensity = 2.0;
        cp.aura.material.opacity = 0.55;
    }

    function collectRelic(rl) {
        if (rl.collected) return;
        rl.collected = true;
        rl.group.visible = false;
    }

    // ----------------------------------------
    // Per-frame Animation Loop Update
    // ----------------------------------------
    function update(time, delta, moving, playerPos) {
        // Collectibles animation
        orbs.forEach((orb) => {
            if (orb.collected) return;
            orb.mesh.rotation.y += delta * 2;
            orb.mesh.position.y = 1 + Math.sin(time * 2 + orb.phase) * 0.12;
        });

        keys.forEach((key) => {
            if (key.collected) return;
            key.mesh.rotation.y += delta * 1.6;
            key.mesh.position.y = 1 + Math.sin(time * 2.2) * 0.1;
        });

        relics.forEach((r) => {
            if (r.collected) return;
            r.group.rotation.y += delta * 1.2;
            r.orbitRing.rotation.x = Math.sin(time * 2) * 0.4;
            r.group.position.y = 0.9 + Math.sin(time * 2.5) * 0.1;
        });

        // Switches and teleporters
        switches.forEach((s) => {
            s.crystal.rotation.y += delta * (s.active ? 0.5 : 1.5);
            s.ring.rotation.z += delta * 1.0;
        });

        teleporters.forEach((t) => {
            t.ring1.rotation.z += delta * 1.8;
            t.ring2.rotation.z -= delta * 2.2;
        });

        checkpoints.forEach((cp) => {
            cp.crystal.rotation.y += delta * (cp.activated ? 2.5 : 0.8);
            if (cp.activated) {
                cp.aura.rotation.y += delta * 1.2;
                cp.aura.material.opacity = 0.4 + Math.sin(time * 3) * 0.15;
            }
        });

        // Hidden walls dissolving
        if (playerPos) {
            hiddenWalls.forEach((h) => {
                const dist = Math.hypot(playerPos.x - h.x, playerPos.z - h.z);
                if (dist < 2.2 && !h.revealed) {
                    h.revealed = true;
                    grid[h.row][h.col] = '.';
                    mapVersion++;
                    lastRevealed = -1;
                }
                if (h.revealed && h.progress < 1) {
                    h.progress = Math.min(1, h.progress + delta / 0.8);
                    h.mesh.position.y = (WALL_HEIGHT / 2) - h.progress * WALL_HEIGHT;
                    h.mesh.material.opacity = 1 - h.progress;
                    if (h.progress >= 1) h.mesh.visible = false;
                }
            });
        }

        // Boss animation
        if (bossEntity) {
            bossEntity.group.rotation.y += delta * 0.6;
            bossEntity.coreMesh.position.y = Math.sin(time * 1.8) * 0.15;
            if (bossEntity.shieldGroup) {
                bossEntity.shieldGroup.rotation.y -= delta * (bossEntity.defeated ? 2.5 : 1.0);
                if (bossEntity.defeated) {
                    bossEntity.shieldGroup.scale.multiplyScalar(Math.max(0.98, 1 - delta * 0.5));
                }
            }
        }

        // Exit beacon animations
        exitRing.rotation.z += delta * 1.5;
        beamOuter.rotation.y += delta * 0.5;
        beamInner.rotation.y -= delta * 0.8;
        beamRing1.rotation.z += delta * 1.6;
        beamRing2.rotation.z -= delta * 1.2;

        // Dust/frost/ember particles follow player space
        if (playerPos) {
            particles.position.set(playerPos.x, 0, playerPos.z);
            const posAttr = particleGeo.attributes.position;
            const posArr = posAttr.array;

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const off = particleOffsets[i];
                if (level.theme === 'lava') {
                    // Rising ember sparks
                    let y = ((off.oy + time * off.speed * 0.6) % WALL_HEIGHT);
                    posArr[i * 3 + 1] = y;
                } else if (level.theme === 'ice') {
                    // Falling snow/frost flakes
                    let y = (WALL_HEIGHT - ((off.oy + time * off.speed * 0.4) % WALL_HEIGHT));
                    posArr[i * 3 + 1] = y;
                } else {
                    let y = off.oy + Math.sin(time * off.speed + off.phase) * 0.25;
                    posArr[i * 3 + 1] = y;
                }
            }
            posAttr.needsUpdate = true;
        }

        // Doors opening
        doors.forEach((door) => {
            if (!door.open || door.progress >= 1) return;

            door.progress = Math.min(1, door.progress + delta / 0.7);
            door.mesh.position.y = WALL_HEIGHT / 2 - door.progress * WALL_HEIGHT;
            door.mesh.material.opacity = 0.82 * (1 - door.progress);

            if (door.progress >= 1) door.mesh.visible = false;
        });

        // Sentinels movement & animation
        sentinels.forEach((sentinel) => {
            if (moving) {
                if (sentinel.pause > 0) {
                    sentinel.pause -= delta;
                } else {
                    sentinel.distance += sentinel.direction * sentinel.speed * delta;

                    if (sentinel.distance >= sentinel.total) {
                        sentinel.distance = sentinel.total;
                        sentinel.direction = -1;
                        sentinel.pause = 1;
                    } else if (sentinel.distance <= 0) {
                        sentinel.distance = 0;
                        sentinel.direction = 1;
                        sentinel.pause = 1;
                    }
                }

                updateSentinelPosition(sentinel);
            }

            sentinel.mesh.position.set(
                sentinel.position.x,
                1 + Math.sin(time * 2.5 + sentinel.phase) * 0.08,
                sentinel.position.z
            );
            sentinel.ring.rotation.x = Math.PI / 2 + Math.sin(time * 1.5 + sentinel.phase) * 0.5;
            sentinel.ring.rotation.z += delta * 2.5;
        });
    }

    function dispose() {
        scene.remove(group);

        group.traverse((object) => {
            if (object.geometry) object.geometry.dispose();

            if (object.material) {
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach((m) => m.dispose());
            }

            if (object.isInstancedMesh) object.dispose();
        });
    }

    return {
        level,
        grid,
        orbs,
        keys,
        doors,
        plates,
        switches,
        teleporters,
        checkpoints,
        relics,
        hiddenWalls,
        bossEntity,
        sentinels,
        explored,
        reveal,
        get mapVersion() {
            return mapVersion;
        },
        toWorld,
        toCell,
        isBlocked,
        openDoor,
        closeDoor,
        activateSwitch,
        activatePlate,
        deactivatePlate,
        activateCheckpoint,
        collectRelic,
        update,
        dispose,
        getMinSentinelDist
    };
}
