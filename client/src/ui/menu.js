import * as THREE from 'three';
import { createCharModel } from './charmodel.js';
import { CLS_DATA, CLS_DETAIL, FACTION_NAMES, FACTION_COLORS } from '../core/constants.js';

// ── Preview renderer ───────────────────────────────────────────────────────
const previewWrap = document.getElementById('preview-wrap');
const previewRen  = new THREE.WebGLRenderer({ antialias: true, alpha: true });
previewRen.setSize(180, 240);
previewRen.setPixelRatio(devicePixelRatio);
previewRen.setClearColor(0x000000, 0);
previewWrap?.appendChild(previewRen.domElement);

const previewScn = new THREE.Scene();
const previewCam = new THREE.PerspectiveCamera(42, 180 / 240, 0.1, 20);
previewCam.position.set(0, 2.2, 5.8);
previewCam.lookAt(0, 1.6, 0);
previewScn.add(new THREE.AmbientLight(0x9080c0, 0.8));
const pSun = new THREE.DirectionalLight(0xfff0d0, 1.5);
pSun.position.set(3, 8, 5);
previewScn.add(pSun);
const pRim = new THREE.DirectionalLight(0x3C3489, 0.8);
pRim.position.set(-4, 2, -3);
previewScn.add(pRim);
const platMesh = new THREE.Mesh(
  new THREE.CylinderGeometry(1.6, 1.6, 0.1, 20),
  new THREE.MeshLambertMaterial({ color: 0x3C3489, transparent: true, opacity: 0.45 })
);
platMesh.position.y = 0;
previewScn.add(platMesh);

let previewChar = null;
let previewRot  = 0;

export function setPreviewClass(i) {
  if (previewChar) previewScn.remove(previewChar);
  previewChar = createCharModel(i);
  previewScn.add(previewChar);
}

export function tickPreview(dt) {
  previewRot += dt * 0.9;
  if (previewChar) {
    previewChar.rotation.y = previewRot;
    previewChar.position.y = Math.sin(previewRot * 1.2) * 0.06;
  }
  previewRen.render(previewScn, previewCam);
}

// ── Class selection ────────────────────────────────────────────────────────
let selectedClass = 0;
export function getSelectedClass() { return selectedClass; }

document.querySelectorAll('.cc').forEach(el => {
  el.addEventListener('click', () => {
    document.querySelectorAll('.cc').forEach(c => c.classList.remove('sel'));
    el.classList.add('sel');
    selectedClass = +el.dataset.cls;
    setPreviewClass(selectedClass);

    const cls = CLS_DATA[selectedClass];
    const det = CLS_DETAIL[selectedClass];
    const cdName    = document.getElementById('cd-name');
    const cdFaction = document.getElementById('cd-faction');
    const cdDesc    = document.getElementById('cd-desc');
    const cdBonus   = document.getElementById('cd-bonus');
    if (cdName)    { cdName.textContent    = cls.name;                          cdName.style.color    = cls.color; }
    if (cdFaction) { cdFaction.textContent = FACTION_NAMES[cls.faction];        cdFaction.style.color = FACTION_COLORS[cls.faction]; }
    if (cdDesc)    cdDesc.innerHTML  = det.lore;
    if (cdBonus)   cdBonus.innerHTML = det.bonus.replace(/\n/g, '<br>');
  });
});

// ── Server status check ────────────────────────────────────────────────────
export async function checkServerStatus(url) {
  const el = document.getElementById('srv-status');
  if (!el) return;
  el.className = 'sts-chk'; el.textContent = 'Checking server...';
  try {
    const res  = await fetch(url + '/api/status', { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    el.className = 'sts-ok';
    el.textContent = `✓ Server online — ${data.online} player${data.online !== 1 ? 's' : ''} in fragment`;
  } catch {
    el.className = 'sts-err';
    el.textContent = '✗ Server offline — use Solo Mode or start server';
  }
}
