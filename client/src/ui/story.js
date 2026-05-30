/**
 * Story overlay — shows a narrative chapter card at each level transition.
 * Auto-dismisses, but the player can skip with click / any key.
 */
import { getStoryBeat } from '../game/story.js';

let dismissTimer = null;

function el(id) { return document.getElementById(id); }

export function showStoryBeat(levelNumber, { auto = true } = {}) {
  const beat = getStoryBeat(levelNumber);
  if (!beat) return;

  const overlay = el('story');
  if (!overlay) return;

  el('story-chapter').textContent = beat.chapter;
  el('story-title').textContent   = beat.title;
  el('story-body').textContent    = beat.body;

  overlay.style.display = 'flex';
  requestAnimationFrame(() => overlay.classList.add('show'));

  clearTimeout(dismissTimer);
  if (auto) dismissTimer = setTimeout(hideStoryBeat, 7000);
}

export function hideStoryBeat() {
  const overlay = el('story');
  if (!overlay) return;
  clearTimeout(dismissTimer);
  overlay.classList.remove('show');
  setTimeout(() => { overlay.style.display = 'none'; }, 450);
}

// Skip on interaction with the card
el('story')?.addEventListener('click', hideStoryBeat);
