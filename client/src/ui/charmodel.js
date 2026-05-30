import * as THREE from 'three';
import { CLS_DATA } from '../core/constants.js';

export function createCharModel(clsIdx) {
  const g    = new THREE.Group();
  const c    = CLS_DATA[clsIdx];
  const SKIN = 0xe0b080;
  const DARK = 0x1a1a2a;
  const BCOL = parseInt(c.color.replace('#', ''), 16);

  function box(w, h, d, col, x, y, z) {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshLambertMaterial({ color: col })
    );
    m.position.set(x, y, z);
    m.castShadow = true;
    g.add(m);
    return m;
  }

  box(0.85, 0.9,  0.5,  SKIN,    0,   2.2,  0);   // head
  box(0.9,  1.0,  0.5,  BCOL,    0,   1.5,  0);   // torso
  box(0.3,  0.95, 0.3,  BCOL, -0.6,   1.5,  0);   // left arm
  box(0.3,  0.95, 0.3,  BCOL,  0.6,   1.5,  0);   // right arm
  box(0.38, 1.0,  0.38, DARK, -0.24,  0.5,  0);   // left leg
  box(0.38, 1.0,  0.38, DARK,  0.24,  0.5,  0);   // right leg
  box(0.18, 0.1,  0.05, 0x111130, -0.2, 2.26, 0.44); // eye L
  box(0.18, 0.1,  0.05, 0x111130,  0.2, 2.26, 0.44); // eye R

  switch (clsIdx) {
    case 0: // Builder — yellow hard hat + tool
      box(1.0,  0.18, 1.0,  0xFFCC00,  0,    2.77, 0);
      box(0.06, 0.38, 0.06, 0x8b6530,  0.62, 1.3, -0.02);
      box(0.22, 0.13, 0.12, 0x606060,  0.62, 1.5, -0.02);
      break;
    case 1: // Soldier — dark helmet + visor + rifle
      box(0.92, 0.22, 0.92, 0x2a2a3a,  0,    2.77, 0);
      box(0.78, 0.1,  0.08, 0x7799bb,  0,    2.56, 0.47);
      box(0.07, 0.07, 0.55, 0x303030,  0.65, 1.5,  0.08);
      box(0.1,  0.14, 0.28, 0x3a3a3a,  0.65, 1.44, 0.3);
      break;
    case 2: // Engineer — goggles + backpack + wrench
      box(0.72, 0.16, 0.1,  0xE8890A,  0,    2.36, 0.45);
      box(0.45, 0.72, 0.22, 0x282828,  0,    1.52,-0.38);
      box(0.08, 0.36, 0.08, 0xc0c0c0,  0.65, 1.35, 0.02);
      box(0.24, 0.08, 0.08, 0xc0c0c0,  0.65, 1.52, 0.02);
      break;
    case 3: // Medic — cross + white trim + bag
      box(0.16, 0.55, 0.06, 0xffffff,  0,    1.55, 0.28);
      box(0.48, 0.16, 0.06, 0xffffff,  0,    1.65, 0.28);
      box(0.34, 0.1,  0.1,  0xff4444, -0.64, 1.75, 0);
      box(0.28, 0.35, 0.2,  0xe0e0e0,  0.66, 1.3,  0.02);
      break;
    case 4: // Sniper — dark hood + scope + long rifle
      box(0.9,  0.42, 0.9,  0x222232,  0,    2.6,  0);
      box(0.06, 0.06, 0.7,  0x5a5a6a,  0.65, 1.55, 0);
      box(0.12, 0.08, 0.14, 0x4a4a5a,  0.65, 1.59, 0.08);
      break;
    case 5: // Demolisher — blast mask + charges + detonator
      box(0.88, 0.48, 0.88, 0x804030,  0,    2.54, 0);
      box(0.22, 0.44, 0.22, 0xcc3300, -0.54, 1.5, -0.06);
      box(0.22, 0.44, 0.22, 0xdd2200,  0.54, 1.5, -0.06);
      box(0.2,  0.2,  0.1,  0xffcc00,  0.64, 1.2,  0.12);
      break;
  }
  return g;
}
