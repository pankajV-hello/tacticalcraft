import * as THREE from 'three';
import { camera, scene } from '../renderer/scene.js';
import { getBlock, getGroundY, addBlock, removeBlock, getAllBlockMeshes } from '../renderer/instanced.js';
import { CLS_DATA, BLOCKS } from '../core/constants.js';
import { spawnParticles } from './effects.js';
import { notify, updateHUD } from '../ui/hud.js';

export const player = {
  pos:      new THREE.Vector3(-6, 22, 6),
  vel:      new THREE.Vector3(),
  onGround: false,
  yaw:      -2.3,
  pitch:    -0.14,
  hp:       100,
  maxHp:    100,
  armor:    75,
};

export let selCls   = 0;
export let selBlock = 0;
export let buildMode = false;
export let placed = 0, broken = 0, kills = 0;

export function setClass(i) {
  selCls     = i;
  player.hp  = player.maxHp = CLS_DATA[i].hp;
  setupFPWeapon(i);
  updateHUD({ hp: player.hp, maxHp: player.maxHp });
}

export function setBlock(i)  { selBlock = i; }
export function toggleBuild() { buildMode = !buildMode; return buildMode; }

// ── First-person weapon ────────────────────────────────────────────────────
const fpGroup = new THREE.Group();
camera.add(fpGroup);
fpGroup.position.set(0.37, -0.44, -0.52);
scene.add(camera);

let fpSwing = 0, walkCycle = 0;

const WCOL  = [0xFFCC00, 0x303030, 0xE8890A, 0xffffff, 0x5a5a6a, 0xcc3300];
const WSHP  = [[0.24,0.12,0.12],[0.07,0.07,0.52],[0.14,0.08,0.36],[0.08,0.24,0.08],[0.06,0.06,0.68],[0.2,0.2,0.14]];

export function setupFPWeapon(i) {
  while (fpGroup.children.length) fpGroup.remove(fpGroup.children[0]);
  const arm = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.42, 0.12),
    new THREE.MeshLambertMaterial({ color: 0xe0b080 })
  );
  fpGroup.add(arm);
  const ws  = WSHP[i] || WSHP[0];
  const wep = new THREE.Mesh(
    new THREE.BoxGeometry(ws[0], ws[1], ws[2]),
    new THREE.MeshLambertMaterial({ color: WCOL[i] || 0x888888 })
  );
  wep.position.set(0.04, 0.28, -ws[2] / 2 - 0.04);
  fpGroup.add(wep);
}

// ── Physics ────────────────────────────────────────────────────────────────
const keys = {};
document.addEventListener('keydown', e => { keys[e.code] = true;  });
document.addEventListener('keyup',   e => { keys[e.code] = false; });

let locked = false;
document.addEventListener('pointerlockchange', () => { locked = !!document.pointerLockElement; });
document.addEventListener('mousemove', e => {
  if (!locked) return;
  player.yaw  -= e.movementX * 0.002;
  player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch - e.movementY * 0.002));
});

export function isLocked() { return locked; }

export function updatePlayer(dt) {
  const cls = CLS_DATA[selCls];
  const spd = keys['ShiftLeft'] ? cls.sprint : 5;
  const dir = new THREE.Vector3(
    (keys['KeyD'] ? 1 : 0) - (keys['KeyA'] ? 1 : 0),
    0,
    (keys['KeyS'] ? 1 : 0) - (keys['KeyW'] ? 1 : 0)
  ).normalize().multiplyScalar(spd);
  dir.applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, player.yaw, 0)));
  player.vel.x = dir.x;
  player.vel.z = dir.z;

  const isMoving = dir.length() > 0.1;
  walkCycle += isMoving ? dt * 7 : dt * 0.5;

  const gy = getGroundY(player.pos.x, player.pos.z);
  player.onGround = player.pos.y <= gy + 0.1;
  if (player.onGround) { player.pos.y = gy; player.vel.y = keys['Space'] ? 8 : 0; }
  else player.vel.y += -20 * dt;

  player.pos.addScaledVector(player.vel, dt);
  if (player.pos.y < -10) { player.pos.set(-6, 22, 6); player.vel.set(0, 0, 0); }

  camera.position.copy(player.pos).add(new THREE.Vector3(0, 1.6, 0));
  camera.rotation.order = 'YXZ';
  camera.rotation.y = player.yaw;
  camera.rotation.x = player.pitch;

  fpGroup.position.y = -0.44 + Math.sin(walkCycle) * (isMoving ? 0.035 : 0.005);
  fpGroup.position.x = 0.37  + Math.cos(walkCycle * 0.5) * (isMoving ? 0.01 : 0);
  if (fpSwing > 0) { fpGroup.rotation.x = -fpSwing * 0.4; fpSwing = Math.max(0, fpSwing - dt * 6); }
  else fpGroup.rotation.x = 0;

  if (cls.name === 'Medic') {
    player.hp = Math.min(player.maxHp, player.hp + dt * 0.5);
  }

  updateHUD({
    hp:     player.hp,
    maxHp:  player.maxHp,
    placed, broken, kills,
    pos:    player.pos,
  });
}

// ── Raycaster / Block interaction ──────────────────────────────────────────
const rc = new THREE.Raycaster();

export function doRaycast(onHit, button) {
  const cls = CLS_DATA[selCls];
  rc.far = cls.reach;
  rc.setFromCamera({ x: 0, y: 0 }, camera);
  const hits = rc.intersectObjects(getAllBlockMeshes(), false);
  if (!hits.length) return;
  fpSwing = button === 0 ? 1 : 0.6;
  onHit(hits[0], button);
}

export function doBreakBlock(hit) {
  // InstancedMesh hit — find actual block coords via sphere-intersection test
  const pt = hit.point.clone().sub(hit.face.normal.clone().multiplyScalar(0.5));
  const x = Math.floor(pt.x), y = Math.floor(pt.y), z = Math.floor(pt.z);
  if (y === 0) return;
  const id = getBlock(x, y, z) || getBlock(x, y + 1, z);
  if (!id) return;
  const color = BLOCKS[Math.min(id, BLOCKS.length - 1)]?.color || 0x888888;
  spawnParticles(x, y, z, color);

  const cls = CLS_DATA[selCls];
  if (cls.name === 'Demolisher') {
    for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) {
      if (getBlock(x+dx, y, z+dz) && y > 0) removeBlock(x+dx, y, z+dz);
    }
    notify('💥 DEMOLISH — 3×3');
    broken += 9;
  } else {
    removeBlock(x, y, z);
    broken++;
    notify(`${BLOCKS[Math.min(id, BLOCKS.length - 1)]?.name || '?'} broken`);
  }
}

export function doPlaceBlock(hit) {
  const n  = hit.face.normal;
  const pt = hit.point.clone().sub(n.clone().multiplyScalar(0.5));
  const x  = Math.floor(pt.x) + Math.round(n.x);
  const y  = Math.floor(pt.y) + Math.round(n.y);
  const z  = Math.floor(pt.z) + Math.round(n.z);
  const pp = player.pos;
  if (Math.abs(x-Math.floor(pp.x))<1 && y>=Math.floor(pp.y)-1 && y<=Math.floor(pp.y)+1 && Math.abs(z-Math.floor(pp.z))<1) return;
  const id = selBlock + 1;
  addBlock(x, y, z, id);
  placed++;
  notify(`${BLOCKS[id]?.name} placed`);
  return { x, y, z, id };
}

export function damagePlayer(amount, dt) {
  player.hp = Math.max(0, player.hp - amount * dt);
  updateHUD({ hp: player.hp, maxHp: player.maxHp });
}

export function requestLock() {
  document.querySelector('canvas')?.requestPointerLock();
}
