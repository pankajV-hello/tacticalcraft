import { getBlock } from '../renderer/instanced.js';
import { BLOCKS, WORLD_H } from '../core/constants.js';
import { player } from '../game/player.js';
import { crawlers } from '../game/enemies.js';

const canvas = document.getElementById('mmcv');
const ctx    = canvas?.getContext('2d');

export function drawMinimap() {
  if (!ctx) return;
  const sz  = 108, rng = 36;
  ctx.fillStyle = '#040410';
  ctx.fillRect(0, 0, sz, sz);

  const px = Math.floor(player.pos.x), pz = Math.floor(player.pos.z);
  for (let dx = -rng; dx < rng; dx++) {
    for (let dz = -rng; dz < rng; dz++) {
      const wx = px + dx, wz = pz + dz;
      for (let y = WORLD_H; y >= 0; y--) {
        const id = getBlock(wx, y, wz);
        if (id) {
          const bd = BLOCKS[Math.min(id, BLOCKS.length - 1)];
          const cx = Math.floor((dx + rng) / (rng * 2) * sz);
          const cz = Math.floor((dz + rng) / (rng * 2) * sz);
          const c  = bd.color;
          ctx.fillStyle = `rgb(${(c>>16)&255},${(c>>8)&255},${c&255})`;
          ctx.fillRect(cx, cz, 1, 1);
          break;
        }
      }
    }
  }

  // Crawlers (red)
  for (const cr of crawlers) {
    if (!cr.active) continue;
    const cx = Math.floor(((cr.mesh.position.x - px + rng) / (rng * 2)) * sz);
    const cz = Math.floor(((cr.mesh.position.z - pz + rng) / (rng * 2)) * sz);
    ctx.fillStyle = '#ff2200';
    ctx.fillRect(cx - 1, cz - 1, 3, 3);
  }

  // Player dot + direction
  ctx.fillStyle = '#00C97A';
  ctx.fillRect(sz / 2 - 2, sz / 2 - 2, 5, 5);
  const dl = 10;
  ctx.strokeStyle = 'rgba(255,255,255,.7)';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(sz / 2, sz / 2);
  ctx.lineTo(sz / 2 + Math.sin(player.yaw) * dl, sz / 2 - Math.cos(player.yaw) * dl);
  ctx.stroke();
}
