/**
 * Level HUD: the on-screen level badge + quota progress, and the
 * victory screen shown when the final shipped level is cleared.
 */
import { FOUNDER_CONFIG } from '../game/levels.js';
import { STORY_RESOLUTION } from '../game/story.js';

function el(id) { return document.getElementById(id); }

export function updateLevelHUD(level, kills, quota) {
  const badge = el('level-badge');
  const name  = el('level-name');
  const fill  = el('level-fill');
  const count = el('level-count');
  if (badge) badge.textContent = `LEVEL ${level.n}`;
  if (name)  name.textContent  = level.name;
  if (fill)  fill.style.width  = Math.min(100, (kills / quota) * 100) + '%';
  if (count) count.textContent = `${kills} / ${quota}`;
}

export function showVictory(result, playerName) {
  const overlay = el('victory');
  if (!overlay) return;

  el('vic-name').textContent  = (playerName || 'Operative').toUpperCase();
  el('vic-kills').textContent = result.totalKills;
  if (el('vic-level'))  el('vic-level').textContent  = result.lastLevel;
  if (el('vic-level2')) el('vic-level2').textContent = result.lastLevel;

  // Story resolution — closes Phase 1, seeds Phase 2.
  const story = el('vic-story');
  if (story) story.textContent = STORY_RESOLUTION.body;

  // Phase 2 teaser — the commercial hook after the free funnel.
  const teaser = el('vic-phase2');
  if (teaser) {
    if (FOUNDER_CONFIG.subscriptionUrl) {
      teaser.innerHTML = `${STORY_RESOLUTION.hook} &nbsp;<a href="${FOUNDER_CONFIG.subscriptionUrl}">Unlock →</a>`;
    } else {
      teaser.textContent = STORY_RESOLUTION.hook;
    }
  }

  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('show'));
}

export function hideVictory() {
  const overlay = el('victory');
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => { overlay.style.display = 'none'; }, 400);
}

// Replay button
document.addEventListener('DOMContentLoaded', () => {
  el('vic-replay')?.addEventListener('click', () => window.location.reload());
});
// Bind immediately too (module may load after DOMContentLoaded)
el('vic-replay')?.addEventListener('click', () => window.location.reload());
