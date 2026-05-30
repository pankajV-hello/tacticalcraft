import { addBlock, getBlock } from '../renderer/instanced.js';
import { WORLD_R, SEA_Y, WORLD_H } from '../core/constants.js';

// ── FBM Terrain ────────────────────────────────────────────────────────────
function hash(x, z)   { return Math.abs(Math.sin(x * 127.1 + z * 311.7) * 43758.5453) % 1; }
function smoothN(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), fx = x - ix, fz = z - iz;
  const u  = fx * fx * (3 - 2 * fx), v = fz * fz * (3 - 2 * fz);
  return hash(ix,iz)+(hash(ix+1,iz)-hash(ix,iz))*u+(hash(ix,iz+1)-hash(ix,iz))*v+(hash(ix,iz)-hash(ix+1,iz)-hash(ix,iz+1)+hash(ix+1,iz+1))*u*v;
}
function fbm(x, z)     { return smoothN(x*.06,z*.06)*10 + smoothN(x*.13,z*.13)*4 + smoothN(x*.28,z*.28)*2; }
export function terrainH(x, z) { return Math.round(10 + fbm(x, z)); }

// ── World generation ───────────────────────────────────────────────────────
export function generateWorld() {
  for (let x = -WORLD_R; x < WORLD_R; x++) {
    for (let z = -WORLD_R; z < WORLD_R; z++) {
      const h    = terrainH(x, z);
      const dist = Math.sqrt(x * x + z * z);
      for (let y = 0; y <= h; y++) {
        let id;
        if      (y === 0)     id = 3; // stone base
        else if (y === h)     id = (h <= SEA_Y + 1) ? 4 : (dist > 20 && h > 18) ? 3 : 1; // sand / stone / grass
        else if (y > h - 4)  id = 2; // dirt
        else                 id = 3; // stone
        addBlock(x, y, z, id);
      }
    }
  }

  // Trees
  const seeds = [[8,12],[-8,15],[15,-5],[-14,-10],[5,-18],[-18,6],[11,-12],[-6,8],[18,10],[-15,14],[3,16],[-10,-17],[20,-8],[-20,-5],[7,20]];
  for (const [tx, tz] of seeds) {
    const ty = terrainH(tx, tz);
    if (ty < SEA_Y) continue;
    for (let h = 0; h < 3; h++) addBlock(tx, ty + 1 + h, tz, 5);
    for (let dy = 3; dy <= 4; dy++)
      for (let dx = -1; dx <= 1; dx++)
        for (let dz = -1; dz <= 1; dz++)
          if (!getBlock(tx + dx, ty + dy, tz + dz)) addBlock(tx + dx, ty + dy, tz + dz, 9);
  }

  buildTower(-12, 10);
  buildTower(14, -14);
  buildRuin(-6, -8);
  buildRuin(10, 6);
  buildBunker(-16, 4);
}

function buildTower(tx, tz) {
  const base = terrainH(tx, tz) + 1;
  [[0,0],[2,0],[0,2],[2,2]].forEach(([dx,dz]) => {
    for (let h = 0; h < 6; h++) addBlock(tx+dx, base+h, tz+dz, 6);
  });
  for (let dx = 0; dx <= 2; dx++) for (let dz = 0; dz <= 2; dz++) addBlock(tx+dx, base+6, tz+dz, 5);
  for (let dx = 0; dx <= 2; dx++) { addBlock(tx+dx, base+7, tz, 7); addBlock(tx+dx, base+7, tz+2, 7); }
  addBlock(tx, base+7, tz+1, 7); addBlock(tx+2, base+7, tz+1, 7);
}

function buildRuin(rx, rz) {
  const base = terrainH(rx, rz) + 1;
  for (let y = base; y < base + 4; y++) { addBlock(rx, y, rz, 8); addBlock(rx+4, y, rz, 8); }
  addBlock(rx+1, base+4, rz, 8); addBlock(rx+2, base+4, rz, 3); addBlock(rx+3, base+4, rz, 8);
  for (let dx = 0; dx <= 3; dx++) addBlock(rx+dx, base, rz+3, 3);
  for (let dx = 0; dx <= 2; dx++) addBlock(rx+dx, base+1, rz+3, 3);
  addBlock(rx, base+2, rz+3, 3);
}

function buildBunker(bx, bz) {
  const base = terrainH(bx, bz) + 1;
  for (let dx = 0; dx <= 4; dx++) for (let dy = 0; dy <= 2; dy++) for (let dz = 0; dz <= 3; dz++) {
    if (dx === 0 || dx === 4 || dz === 3 || dy === 2) addBlock(bx+dx, base+dy, bz+dz, 6);
  }
  addBlock(bx+2, base, bz, 0); addBlock(bx+2, base+1, bz, 0);
}
