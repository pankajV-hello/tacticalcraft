# TacticalCraft — Build. Fortify. Destroy.

> **TacticalCraft Games Pty Ltd** · Melbourne, VIC, Australia  
> A post-collapse, faction-based voxel warfare game for the browser and beyond.

---

## Overview

TacticalCraft is a browser-first multiplayer voxel game set in a fractured future city (2157 CE). Players drop into **Fragment Zero** — the last intact shard of the megacity NEXUM — and battle across three rival factions using a combination of construction, combat, and strategy.

| Feature | Status |
|---|---|
| Cinematic intro sequence | ✅ |
| 6 playable classes with 3D preview | ✅ |
| FBM procedural terrain + biomes | ✅ |
| Ruins, watchtowers, bunkers | ✅ |
| Real-time multiplayer (Socket.io) | ✅ |
| Solo mode + AI bots | ✅ |
| Void Crawler enemy AI | ✅ |
| Block break/place (8 types) | ✅ |
| Live chat | ✅ |
| Minimap + HUD | ✅ |
| AI world event system | ✅ |
| First-person weapon bob | ✅ |

---

## Quick Start (Local)

### Requirements
- Node.js 18+
- npm

### Run

```bash
cd TacticalCraft
npm install
npm start
```

Open **http://localhost:3789/TacticalCraft_v3.html**

The server also exposes a static file server on the same port, so the game and server run together.

### Dev mode (auto-restart on file change)

```bash
npm run dev
```

---

## Files

```
Tachticarft/
├── TacticalCraft_v3.html   ← Full game client (single file, no build step)
├── server.js               ← Node.js + Socket.io multiplayer server
├── package.json
└── README.md
```

---

## Classes

| Class | Faction | HP | Special |
|---|---|---|---|
| Builder | The Architects | 100 | 2× block placement speed, extended reach |
| Soldier | The Wardens | 125 | Sprint boost, melee damage bonus |
| Engineer | The Architects | 100 | Block repair in combat, metal discount |
| Medic | The Wardens | 100 | Passive HP regen, revive teammates |
| Sniper | The Ghosts | 80 | +6 reach (14 total), extended minimap |
| Demolisher | The Ghosts | 100 | 3×3 area break, explosive blocks |

---

## Controls

| Key / Action | Effect |
|---|---|
| W / A / S / D | Move |
| Space | Jump |
| Shift | Sprint |
| Mouse | Look |
| Left click | Break block / Attack |
| Right click | Place block (build mode) |
| F | Toggle Build / Combat mode |
| T | Open chat |
| 1–8 | Select block type |
| Scroll | Cycle block type |
| Esc | Release mouse |

---

## Multiplayer Server API

`GET /api/status`

```json
{
  "game": "TacticalCraft",
  "version": "0.3.0",
  "studio": "TacticalCraft Games Pty Ltd",
  "online": 2,
  "totalEver": 47,
  "worldDeltas": 120,
  "uptime": 3600,
  "players": [
    { "name": "Pankaj", "cls": 0, "faction": 0, "placed": 14 }
  ]
}
```

---

## Deploy Online (for real multiplayer)

### Option A — Railway (recommended, free tier)

1. Push the `Tachticarft/` folder to a GitHub repo
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the repo → Railway auto-detects Node.js and runs `npm start`
4. Copy the provided URL (e.g. `https://tacticalcraft-production.up.railway.app`)
5. In the game, paste that URL in the **Server** field on the menu screen

### Option B — Render

1. Create account at [render.com](https://render.com)
2. New → Web Service → connect GitHub repo
3. Build command: `npm install`
4. Start command: `node server.js`
5. Set environment variable: `PORT=10000` (Render's default)

### Option C — Fly.io

```bash
npm install -g flyctl
fly launch        # follow prompts
fly deploy
```

### Setting the PORT

The server reads `process.env.PORT` automatically:

```js
const PORT = process.env.PORT || 3789;
```

All platforms inject `PORT` automatically — no code changes needed.

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3789` | Server port |

---

## Lore

> **2157. A quantum collapse detonated without warning.**  
> The megacity of NEXUM shattered into 40,000 fragments drifting in the void.  
> Three factions rose from the wreckage:
>
> - **The Architects** — builders who believe the city can be rebuilt, block by block
> - **The Wardens** — soldiers who hold the remaining fragments by force
> - **The Ghosts** — operatives who move unseen, trading information for survival
>
> One fragment remains intact: **Fragment Zero** — rumoured to hold the key to reversing the collapse.  
> Every faction wants it. None will share it.
>
> *Build. Fortify. Destroy.*

---

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js r128 |
| Multiplayer | Socket.io 4.7 + Node.js + Express |
| Terrain | Fractional Brownian Motion (FBM) |
| Fonts | Barlow Condensed, Inter, JetBrains Mono |
| Deployment | Any Node.js host (Railway, Render, Fly.io) |

---

## Roadmap

- [ ] Godot 4 desktop client
- [ ] Faction territory system
- [ ] Persistent world saves (Supabase/Postgres)
- [ ] Claude API — dynamic AI world events
- [ ] Mobile touch controls
- [ ] Leaderboard + match replay

---

**TacticalCraft Games Pty Ltd** — Melbourne, VIC, Australia  
Author: Pankaj Verma  
License: UNLICENSED — All rights reserved
