// ========================================
// WORLD CONSTRUCTION & 3D ENVIRONMENT
// Builds the 3D scene for each level:
//   - Tier-specific procedural stone walls and floors
//   - InstancedMesh for optimal draw-call efficiency
//   - Start & Exit portal with towering radiant beacon
//   - Collectible orbs with harmonic floating/rotation
//   - Color-coded keys and glowing locked doors
//   - Patrolling ancient sentinels with energy halos
//   - Atmospheric drifting dust motes in torchlight
// ========================================

import * as THREE from 'three';
import { CELL_SIZE, KEY_COLORS } from './levels.js';
import { getStoneTextures } from './textures.js';

export const WALL_HEIGHT = 2.5;

const CEILING_TINTS = {
    sunstone: 0x9a8a72,
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
    // Fog of war for the minimap: cells charted by the player
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
    // Shadows: size the light's shadow camera to this maze
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
    // Floor and Ceiling (Procedural textures by theme)
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
    // Walls: InstancedMesh for high performance
    // ----------------------------------------
    let wallCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] === '#') wallCount++;
        }
    }

    const walls = new THREE.InstancedMesh(
        new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE),
        new THREE.MeshLambertMaterial({ map: textures.wall }),
        wallCount
    );
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.frustumCulled = false;

    const matrix = new THREE.Matrix4();
    let index = 0;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c] !== '#') continue;
            const p = toWorld(r, c);
            matrix.setPosition(p.x, WALL_HEIGHT / 2, p.z);
            walls.setMatrixAt(index++, matrix);
        }
    }

    walls.instanceMatrix.needsUpdate = true;
    group.add(walls);

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
    // Atmospheric Dust Motes in Torchlight
    // ----------------------------------------
    const DUST_COUNT = 75;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(DUST_COUNT * 3);
    const dustOffsets = [];

    for (let i = 0; i < DUST_COUNT; i++) {
        const ox = (Math.random() - 0.5) * 8;
        const oy = Math.random() * (WALL_HEIGHT - 0.4) + 0.2;
        const oz = (Math.random() - 0.5) * 8;
        dustPositions[i * 3 + 0] = ox;
        dustPositions[i * 3 + 1] = oy;
        dustPositions[i * 3 + 2] = oz;
        dustOffsets.push({ ox, oy, oz, speed: 0.5 + Math.random() * 0.8 });
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMat = new THREE.PointsMaterial({
        color: 0xffdeb0,
        size: 0.045,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const dustParticles = new THREE.Points(dustGeo, dustMat);
    group.add(dustParticles);

    // ----------------------------------------
    // Orbs
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
    // Keys
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
        const mesh = buildKeyMesh(KEY_COLORS[cell.id]);
        mesh.position.set(p.x, 1, p.z);
        group.add(mesh);
        return { ...cell, x: p.x, z: p.z, mesh, collected: false };
    });

    // ----------------------------------------
    // Doors
    // ----------------------------------------
    const doorGeometry = new THREE.BoxGeometry(CELL_SIZE * 0.94, WALL_HEIGHT, CELL_SIZE * 0.94);
    const doorEdges = new THREE.EdgesGeometry(doorGeometry);

    const doors = level.doors.map((cell) => {
        const p = toWorld(cell.row, cell.col);
        const color = KEY_COLORS[cell.id];

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

    // ----------------------------------------
    // Sentinels
    // ----------------------------------------
    const sentinelCoreGeometry = new THREE.SphereGeometry(0.3, 20, 16);
    const sentinelRingGeometry = new THREE.TorusGeometry(0.5, 0.035, 8, 28);
    const sentinelHaloGeometry = new THREE.CircleGeometry(0.9, 24);

    const sentinels = level.sentinels.map((def, i) => {
        const points = def.path.map((cell) => toWorld(cell.row, cell.col));

        const mesh = new THREE.Group();

        const core = new THREE.Mesh(
            sentinelCoreGeometry,
            new THREE.MeshStandardMaterial({
                color: 0xff5533,
                emissive: 0xff2200,
                emissiveIntensity: 2.2,
                roughness: 0.3
            })
        );
        mesh.add(core);

        const ring = new THREE.Mesh(
            sentinelRingGeometry,
            new THREE.MeshStandardMaterial({ color: 0xffaa88, emissive: 0xff6644, emissiveIntensity: 1.5 })
        );
        mesh.add(ring);

        const halo = new THREE.Mesh(
            sentinelHaloGeometry,
            new THREE.MeshBasicMaterial({
                color: 0xff3311,
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
    // Per-frame Animation
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

        // Exit beacon animations
        exitRing.rotation.z += delta * 1.5;
        beamOuter.rotation.y += delta * 0.5;
        beamInner.rotation.y -= delta * 0.8;
        beamRing1.rotation.z += delta * 1.6;
        beamRing2.rotation.z -= delta * 1.2;

        // Dust particles follow player space
        if (playerPos) {
            dustParticles.position.set(playerPos.x, 0, playerPos.z);
            const posAttr = dustGeo.attributes.position;
            const posArr = posAttr.array;

            for (let i = 0; i < DUST_COUNT; i++) {
                const off = dustOffsets[i];
                let y = off.oy + Math.sin(time * off.speed + i) * 0.25;
                posArr[i * 3 + 1] = y;
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

    function isBlocked(row, col) {
        const ch = grid[row]?.[col];
        return ch === undefined || ch === '#' || (ch >= 'A' && ch <= 'C');
    }

    return {
        level,
        grid,
        orbs,
        keys,
        doors,
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
        update,
        dispose,
        getMinSentinelDist
    };
}
