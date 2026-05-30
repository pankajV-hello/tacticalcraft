import { STORY_BEATS } from '../core/constants.js';

const canvas = document.getElementById('cin');
const ctx    = canvas?.getContext('2d');
let   cinTime = 0;
let   cinDone = false;
let   onDoneCb = null;

function resize() { if (canvas) { canvas.width = innerWidth; canvas.height = innerHeight; } }
resize();
window.addEventListener('resize', resize);

function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

export function updateCinematic(dt) {
  if (cinDone || !ctx) return;
  cinTime += dt;
  canvas.width = innerWidth; // force clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (const beat of STORY_BEATS) {
    const localT = cinTime - beat.t;
    if (localT < 0 || localT > beat.dur + 0.8) continue;
    if (beat.clear) continue;
    const opacity = Math.min(lerp(0, 1, localT / 0.4), lerp(1, 0, (localT - beat.dur + 0.4) / 0.4));
    ctx.globalAlpha = Math.max(0, opacity);
    ctx.fillStyle   = beat.col || '#fff';
    ctx.font        = (beat.bold ? '900 ' : '400 ') + beat.sz + 'px "Barlow Condensed",sans-serif';
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(beat.text, canvas.width / 2, canvas.height / 2);
  }
  ctx.globalAlpha = 1;

  const last = STORY_BEATS[STORY_BEATS.length - 1];
  if (cinTime > last.t + last.dur) endCinematic();
}

export function endCinematic() {
  if (cinDone || !canvas) return;
  cinDone = true;
  canvas.style.opacity    = '0';
  canvas.style.transition = 'opacity 0.8s';
  const skip = document.getElementById('skip');
  if (skip) skip.style.display = 'none';
  setTimeout(() => {
    canvas.style.display = 'none';
    onDoneCb?.();
  }, 800);
}

export function onCinematicDone(cb) {
  onDoneCb = cb;
  document.getElementById('skip')?.addEventListener('click', endCinematic, { once: true });
}
