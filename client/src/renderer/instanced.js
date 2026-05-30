/**
 * InstancedMesh world renderer.
 * Groups every block type into a single InstancedMesh — reduces draw calls
 * from 57,000+ to ~9 (one per block type). Massive GPU performance win.
 */
import * as THREE from 'three';
import { scene } from './scene.js';
import { BLOCKS, WORLD_H } from '../core/constants.js';

// Per-block-type instanced meshes
const instancedMeshes = {};   // blockId → InstancedMesh
const instanceIndex   = {};   // blockKey → instanceIdx per type
const blockData       = {};   // blockKey → { x,y,z,id }
const MAX_INSTANCES   = 70_000;

const _mat = new THREE.Matrix4();
const _pos = new THREE.Vector3();

function getOrCreateMesh(id) {
  if (instancedMeshes[id]) return instancedMeshes[id];
  const bd  = BLOCKS[id];
  if (!bd) return null;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: bd.color });
  const mesh = new THREE.InstancedMesh(geo, mat, MAX_INSTANCES);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  mesh.count = 0;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);
  instancedMeshes[id] = mesh;
  instanceIndex[id]   = {};   // blockKey → slot
  return mesh;
}

export function addBlock(x, y, z, id) {
  const key = `${x},${y},${z}`;
  if (blockData[key]) return;
  blockData[key] = { x, y, z, id };

  const mesh = getOrCreateMesh(id);
  if (!mesh) return;

  const slot = mesh.count++;
  instanceIndex[id][key] = slot;

  _mat.setPosition(x + 0.5, y + 0.5, z + 0.5);
  mesh.setMatrixAt(slot, _mat);
  mesh.instanceMatrix.needsUpdate = true;
}

export function removeBlock(x, y, z) {
  const key = `${x},${y},${z}`;
  const entry = blockData[key];
  if (!entry) return;
  const { id } = entry;
  delete blockData[key];

  const mesh = instancedMeshes[id];
  if (!mesh) return;

  const slots = instanceIndex[id];
  const slot  = slots[key];
  if (slot === undefined) return;

  // Swap with last instance to fill gap
  const last = mesh.count - 1;
  if (slot !== last) {
    mesh.getMatrixAt(last, _mat);
    mesh.setMatrixAt(slot, _mat);

    // Fix slot index for the swapped block
    const lastKey = Object.keys(slots).find(k => slots[k] === last);
    if (lastKey) slots[lastKey] = slot;
  }

  mesh.count--;
  delete slots[key];
  mesh.instanceMatrix.needsUpdate = true;
}

export function getBlock(x, y, z) {
  return blockData[`${x},${y},${z}`]?.id || 0;
}

export function hasBlock(x, y, z) {
  return !!blockData[`${x},${y},${z}`];
}

export function getGroundY(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z);
  for (let y = WORLD_H; y >= 0; y--) {
    if (getBlock(ix, y, iz)) return y + 1;
  }
  return 0;
}

export function getAllBlockMeshes() {
  return Object.values(instancedMeshes);
}

export function applyServerDelta(deltas) {
  for (const d of deltas) {
    if (d.action === 'place') addBlock(d.x, d.y, d.z, d.id);
    else removeBlock(d.x, d.y, d.z);
  }
}
