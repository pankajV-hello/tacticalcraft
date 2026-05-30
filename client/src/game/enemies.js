import * as THREE from 'three';
import { scene } from '../renderer/scene.js';
import { getGroundY } from '../renderer/instanced.js';
import { player, damagePlayer } from './player.js';
import { spawnParticles } from './effects.js';
import { notify } from '../ui/hud.js';
import { terrainH } from './world.js';

const CRAWLER_COUNT = 5;
export const crawlers = [];

function createCrawlerMesh() {
  const g    = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0x1a1020 }));
  body.castShadow = true;
  g.add(body);
  const eye  = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.12, 0.06), new THREE.MeshBasicMaterial({ color: 0xff2200 }));
  eye.position.set(0, 0.1, 0.46);
  g.add(eye);
  const eye2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: 0xff6600 }));
  eye2.position.set(0, 0.1, 0.47);
  g.add(eye2);
  g.userData = { type: 'crawler', speed: 1.4 };
  return g;
}

export function spawnCrawlers() {
  for (let i = 0; i < CRAWLER_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r     = 22 + Math.random() * 5;
    const cx    = Math.cos(angle) * r;
    const cz    = Math.sin(angle) * r;
    const cy    = terrainH(Math.round(cx), Math.round(cz)) + 1;
    const mesh  = createCrawlerMesh();
    mesh.position.set(cx, cy, cz);
    scene.add(mesh);
    crawlers.push({ mesh, hp: 3, active: true, respawnTimer: 0 });
  }
}

export function updateCrawlers(dt) {
  for (const cr of crawlers) {
    if (!cr.active) {
      cr.respawnTimer -= dt;
      if (cr.respawnTimer <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const r     = 22 + Math.random() * 5;
        const cx    = Math.cos(angle) * r;
        const cz    = Math.sin(angle) * r;
        cr.mesh.position.set(cx, terrainH(Math.round(cx), Math.round(cz)) + 1, cz);
        cr.hp = 3; cr.active = true; cr.mesh.visible = true;
        notify('⚠ Void Crawler spawned');
      }
      continue;
    }

    const dir  = player.pos.clone().sub(cr.mesh.position);
    dir.y = 0;
    const dist = dir.length();

    if (dist > 0.6) {
      dir.normalize().multiplyScalar(cr.mesh.userData.speed * dt);
      cr.mesh.position.add(dir);
      cr.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }

    const gy = getGroundY(cr.mesh.position.x, cr.mesh.position.z);
    cr.mesh.position.y = gy + 0.45 + Math.sin(Date.now() * 0.002 + cr.mesh.position.x) * 0.08;

    if (dist < 1.8) damagePlayer(8, dt);

    cr.mesh.children[0].rotation.y += dt * 2;
  }
}

export function damageCrawler(crMesh) {
  const cr = crawlers.find(c => c.mesh === crMesh || c.mesh === crMesh.parent);
  if (!cr || !cr.active) return;
  cr.hp--;
  spawnParticles(crMesh.position.x, crMesh.position.y, crMesh.position.z, 0xff2200);
  notify(`Crawler ${cr.hp > 0 ? cr.hp + ' HP left' : 'DESTROYED!'}`);
  if (cr.hp <= 0) {
    cr.active = false;
    cr.mesh.visible = false;
    cr.respawnTimer = 15;
    return true; // killed
  }
  return false;
}
