import { BLOCKS, AI_EVENTS } from '../core/constants.js';

let notifTimer;
let aiIdx = 0;
export let aiTimer = 6;

// ── Helpers ────────────────────────────────────────────────────────────────
function el(id) { return document.getElementById(id); }

export function notify(msg) {
  const e = el('notif');
  if (!e) return;
  e.textContent  = msg;
  e.style.opacity = '1';
  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => e.style.opacity = '0', 2000);
}

export function updateHUD({ hp, maxHp, placed, broken, kills, pos } = {}) {
  if (hp     !== undefined) { el('hfill').style.width = Math.max(0, hp / maxHp * 100) + '%'; el('hval').textContent = Math.round(hp); }
  if (placed !== undefined) el('s-placed').textContent = placed;
  if (broken !== undefined) el('s-broken').textContent = broken;
  if (kills  !== undefined) el('s-kills').textContent  = kills;
  if (pos)    el('s-pos').textContent = `${Math.floor(pos.x)},${Math.floor(pos.y)},${Math.floor(pos.z)}`;
}

export function updateClassHUD(selCls, cls) {
  el('cb-ico').textContent  = cls.ico;
  el('cb-name').textContent = cls.name;
  el('cb-bar').style.background = cls.color;
}

export function setBuildMode(on) {
  const mb = el('mbadge');
  if (!mb) return;
  mb.className = 'mb-' + (on ? 'build' : 'combat');
  mb.textContent = on ? '🔨 BUILD' : '⚔ COMBAT';
}

export function pickSlot(i) {
  document.querySelectorAll('.slot').forEach((s, idx) => s.classList.toggle('act', idx === i));
  const bn = el('bname');
  if (bn) bn.textContent = BLOCKS[i + 1]?.name || '?';
}

export function setBlockTarget(id, x, y, z) {
  const bt = el('btgt');
  if (!bt) return;
  bt.textContent = id ? `${BLOCKS[Math.min(id, BLOCKS.length - 1)]?.name}  [${x}, ${y}, ${z}]` : '';
}

export function flashDamage() {
  const e = el('dmg-flash');
  if (!e) return;
  e.style.background = 'rgba(192,64,32,.3)';
  setTimeout(() => e.style.background = 'rgba(192,64,32,0)', 120);
}

export function showAIEvent(text) {
  const container = el('ai-event');
  const txtEl     = el('aie-txt');
  if (!container || !txtEl) return;
  txtEl.textContent = text;
  container.style.display = 'block';
  setTimeout(() => container.classList.add('show'), 10);
  setTimeout(() => {
    container.classList.remove('show');
    setTimeout(() => container.style.display = 'none', 600);
  }, 5000);
}

export function checkAIEvent(dt) {
  aiTimer -= dt;
  if (aiTimer > 0) return;
  showAIEvent(AI_EVENTS[aiIdx % AI_EVENTS.length]);
  aiIdx++;
  aiTimer = 90;
}

export function setOnlineBadge(text, color) {
  const b = el('online-badge');
  if (!b) return;
  b.textContent = text;
  b.style.background = color || 'rgba(0,201,122,.1)';
}
