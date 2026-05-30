import { camera } from '../renderer/scene.js';

const container = document.getElementById('nameplates');

export function makeNameplate(html) {
  const el = document.createElement('div');
  el.className = 'nameplate';
  el.innerHTML  = html;
  el.style.display = 'none';
  container?.appendChild(el);
  return el;
}

export function updateNameplate(el, worldPos, yOffset = 0) {
  if (!el) return;
  const pos = worldPos.clone();
  pos.y += yOffset;
  const sp = pos.project(camera);
  if (sp.z > 1 || pos.distanceTo(camera.position) > 55) {
    el.style.display = 'none';
    return;
  }
  el.style.display = 'block';
  el.style.left    = ((sp.x * 0.5 + 0.5) * innerWidth)  + 'px';
  el.style.top     = ((-sp.y * 0.5 + 0.5) * innerHeight) + 'px';
}

export function removeNameplate(el) {
  el?.remove();
}
