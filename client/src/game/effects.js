import * as THREE from 'three';
import { scene } from '../renderer/scene.js';

const particles = [];

export function spawnParticles(x, y, z, color) {
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.15, 0.15),
      new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 1 })
    );
    m.position.set(x + 0.5 + (Math.random() - 0.5) * 0.4, y + 0.5, z + 0.5 + (Math.random() - 0.5) * 0.4);
    m.userData.v    = new THREE.Vector3((Math.random() - 0.5) * 5, Math.random() * 4 + 1, (Math.random() - 0.5) * 5);
    m.userData.life = 0.6;
    scene.add(m);
    particles.push(m);
  }
}

export function updateParticles(dt) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.userData.v.y -= 20 * dt;
    p.position.addScaledVector(p.userData.v, dt);
    p.userData.life -= dt;
    p.material.opacity = Math.max(0, p.userData.life / 0.6);
    if (p.userData.life <= 0) { scene.remove(p); particles.splice(i, 1); }
  }
}
