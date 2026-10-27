# 🏛️ Maze Explorer 3D — Advanced WebGL 3D Adventure

[![Three.js](https://img.shields.io/badge/Three.js-r186-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![WebGL](https://img.shields.io/badge/WebGL-2.0-990000?style=for-the-badge&logo=webgl)](https://www.khronos.org/webgl/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> An immersive, feature-packed first-person 3D dungeon exploration game built with **Three.js** and vanilla WebGL technologies. Features **80 handcrafted chambers** across **4 themed realms**, procedural canvas shader materials, GPU instanced rendering, interactive environmental puzzles, guardian trials, procedural Web Audio sound synthesis, and real-time lighting with PCF soft shadows.

---

## 🎮 Play & Controls

| Input | Action |
| :--- | :--- |
| <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>↑</kbd> <kbd>←</kbd> <kbd>↓</kbd> <kbd>→</kbd> | Walk / Strafe |
| **Mouse Look** | Smooth 360° First-Person camera rotation |
| <kbd>P</kbd> or <kbd>Esc</kbd> | Toggle Pause Menu / Release Mouse Lock |
| **Left Click** | Lock Pointer / Interact with Game Elements |

---

## 🌟 Key Features

### 🏛️ 4 Distinct Themed Worlds (80 Total Chambers)
Each world introduces unique lighting models, procedural architectural textures, ambient atmospheric particles, physics interactions, and a climatic **Chamber 20 Guardian Trial**:

1. **Ancient Ruins** *(Tier I — Sunstone)* — Levels 1–20
   - Weathered stone temples, ancient pillar collonades, warm flickering torchlight, and switch pedestals.
   - **World Boss**: *Colossal Stone Guardian* (Chamber XX).
2. **Frozen Caverns** *(Tier II — Glacial)* — Levels 21–40
   - Ice-covered walls, crystalline blue pillars, cold atmospheric fog, and low-friction slippery glide physics.
   - **World Boss**: *Legendary Frost Titan* (Chamber XL).
3. **Lava Fortress** *(Tier III — Magma)* — Levels 41–60
   - Volcanic obsidian architecture, glowing magma veins, rising molten embers, and perilous heat hazard tiles that inflict damage and knockback.
   - **World Boss**: *Inferno Warden* (Chamber LX).
4. **Shadow Realm** *(Tier IV — Void)* — Levels 61–80
   - Dark floating cosmic structures, violet celestial runes, dimensional warp teleporters, and ethereal void motes.
   - **World Boss**: *The Architect* (Grand Campaign Finale - Chamber LXXX).

---

### 🧩 Environmental Puzzle & Survival Mechanics
- **4-Tier Key & Gate System**: Collect color-coded keys (<span style="color:#f59e0b;">Amber</span>, <span style="color:#d946ef;">Magenta</span>, <span style="color:#10b981;">Green</span>, <span style="color:#06b6d4;">Cyan</span>) to unlock ancient stone barricades.
- **Switch Pedestals & Levers**: Interact with carved pedestals to rotate stone levers and open barricaded paths.
- **Pressure Plates & Timed Doors**: Step on carved pressure plates to depress floor mechanisms and trigger ticking countdown gates.
- **Dimensional Teleporters**: Warp instantaneously across bottomless impassable chasms.
- **Respawn Checkpoint Obelisks**: Ignite ancient obelisks to store safe respawn coordinates in case of hazard damage.
- **Patrolling Sentinels**: Dodge patrolling corridor sentinels with alert vision cones, speed penalties, and audio hums.
- **Ancient Relics**: Search for secret hidden alcoves containing mythical artifacts that award massive token bounties.

---

### 🏆 Campaign Progression, Economy & Customization
- **3-Star Rating System**:
  - ⭐ Escape the maze alive
  - ⭐ Collect every hidden golden orb
  - ⭐ Beat the chamber under the target speedrun par time
- **Adventure Token Economy**: Earn tokens through chamber victories and achievements to buy and unlock successive world realms.
- **11 Campaign Achievements**: Unlockable trophies for exploration, speedrunning, guardian encounters, and flawless escapes.
- **Cosmetic Player Trails**: Equip particle trail effects (*Standard Aura*, *Golden Sparks*, *Frost Shimmer*, *Volcanic Embers*, *Void Mist*) unlocked by earning campaign stars.

---

## 🔬 Computer Graphics & WebGL Techniques

Built as a Computer Graphics college demonstration, this project integrates advanced real-time rendering algorithms directly into gameplay:

1. **GPU InstancedMesh Wall Batching**:
   - Compresses hundreds of maze wall cubes and stone pillars into a single GPU draw call using `THREE.InstancedMesh` with 4×4 transform matrices. Maintains **60+ FPS** even on low-power integrated GPUs.
2. **Procedural Mathematical Canvas Shaders**:
   - Generates 5 unique, high-resolution procedural materials dynamically in memory using trigonometric noise functions and HTML5 Canvas (zero external image downloads required!).
3. **Percentage-Closer Filtered (PCF) Soft Shadows**:
   - Directional light frustum fitted tightly to maze bounding boxes with `THREE.PCFSoftShadowMap` for smooth architectural penumbras and soft ground contact shadows.
4. **Atmospheric GPU Particle Systems**:
   - Specialized particle emitters per realm simulating ambient dust motes, falling crystalline snowflakes, rising molten embers, and swirling void motes.
5. **Procedural Web Audio API Synthesis**:
   - 100% procedural multi-oscillator audio synthesis for footstep clicks, key chimes, sliding stone doors, ticking countdown timers, and guardian fanfare fanfares without third-party audio files.
6. **Graph Theory & Solvability Verification**:
   - Breadth-First Search (BFS) graph reachability solvers ensure every chamber is mathematically 100% solvable before gameplay begins.

---

## 📁 Project Structure

```text
CG-GAME-git/
├── index.html              # Main HTML5 game layout & SVG sprite definitions
├── package.json            # Project manifest, Vite dev scripts, and Three.js dependency
├── src/
│   ├── main.js             # Game loop, state machine, inputs, collision & camera
│   ├── world.js            # 3D world builder, InstancedMesh batching, lighting, particles
│   ├── levels.js           # 80 chamber definitions, 4 world parameters, graph BFS solver
│   ├── textures.js         # Procedural canvas mathematical shader material generator
│   ├── audio.js            # Procedural Web Audio API sound synthesizers
│   ├── storage.js          # LocalStorage persistence, achievements & cosmetic trails
│   ├── ui.js               # HUD, World & Chamber Select, Settings, Field Guide, Modals
│   ├── minimap.js          # Real-time 2D radar canvas with discovery fog of war
│   └── style.css           # Vanilla CSS design system, typography & animations
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.0 or newer recommended)
- Modern web browser with WebGL 2.0 support (Chrome, Edge, Firefox, Brave, Safari)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/CG-Game.git
   cd CG-Game
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Build for production**:
   ```bash
   npm run build
   ```
   Generates optimized, minified production bundles in the `dist/` directory.

5. **Preview production build locally**:
   ```bash
   npm run preview
   ```

---

## ⚙️ Settings & Performance Tuning

Access the in-game **Settings** modal (<kbd>P</kbd> or click Settings on the title screen) to tune:
- **Audio Channels**: Individual Master and SFX volume sliders with instant mute toggle.
- **Controls & Immersion**: Mouse look sensitivity (`0.4×` to `2.5×`), walking camera bob toggle, and screen shake impulse toggle.
- **Graphics Quality**:
  - **Smooth**: Native performance optimization for integrated graphics chips.
  - **Detailed**: Enables dynamic PCF soft shadow maps and native resolution rendering.
- **Cosmetics**: Equip unlocked particle trails trailing your adventurer's footsteps.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE) — free for educational, academic demonstration, and personal use.
