/**
 * Level / threat-wave progression system.
 *
 * Phase 1 (this build): Levels 1–5, free.
 * Phase 2 (roadmap):     Levels 6–15, behind subscription (paywall gate below).
 *
 * FOUNDER CONTROLS (FOUNDER_CONFIG) are the commercial levers — pricing gate,
 * free-level cap, and difficulty tuning all live here so they can be changed
 * without touching engine code. See architecture.html for the business model.
 */
import { setThreat } from './enemies.js';
import { showAIEvent, notify } from '../ui/hud.js';

// ── FOUNDER CONTROLS ───────────────────────────────────────────────────────
export const FOUNDER_CONFIG = {
  freeLevels:      5,        // Phase 1: levels 1..5 are free
  shippedLevels:   5,        // highest level currently built
  paywallAfter:    5,        // subscription gate kicks in after this level
  subscriptionUrl: null,     // set to checkout URL when Phase 2 monetisation is live
  difficultyScale: 1.0,      // global multiplier — raise to make all levels harder
};

// ── LEVEL TABLE ────────────────────────────────────────────────────────────
// Each level: enemy count, speed, contact damage, kill quota to clear, time window (s).
export const LEVELS = [
  { n:1, name:'PERIMETER PROBE',      count:4,  speed:1.0, damage:6,  quota:5,  window:90  },
  { n:2, name:'VOID SURGE',           count:6,  speed:1.25, damage:7,  quota:12, window:90  },
  { n:3, name:'CRAWLER MUTATION',     count:8,  speed:1.45, damage:8,  quota:20, window:100 },
  { n:4, name:'VOID STORM',           count:10, speed:1.65, damage:9,  quota:30, window:110 },
  { n:5, name:'FRAGMENT ZERO TREMOR', count:13, speed:1.9, damage:11, quota:40, window:120 },
];

// ── STATE ──────────────────────────────────────────────────────────────────
let levelIdx    = 0;     // 0-based index into LEVELS
let levelKills  = 0;     // kills accrued in the current level
let totalKills  = 0;
let windowTimer = 0;
let active      = false;
let onVictoryCb = null;
let onLevelCb   = null;

export function getLevel()      { return LEVELS[levelIdx]; }
export function getLevelNumber(){ return LEVELS[levelIdx].n; }
export function getTotalKills() { return totalKills; }
export function getLevelKills() { return levelKills; }
export function getQuota()      { return LEVELS[levelIdx].quota; }

export function startLevels({ onLevel, onVictory } = {}) {
  levelIdx = 0; levelKills = 0; totalKills = 0; active = true;
  onLevelCb   = onLevel   || null;
  onVictoryCb = onVictory || null;
  applyLevel(0, true);
}

function applyLevel(idx, isFirst = false) {
  const lv = LEVELS[idx];
  windowTimer = lv.window;
  setThreat({
    count:  Math.round(lv.count * FOUNDER_CONFIG.difficultyScale),
    speed:  lv.speed,
    damage: lv.damage,
    respawn: Math.max(5, 15 - idx * 1.5),  // faster respawns at higher levels
  });
  onLevelCb?.(lv, idx);
  if (isFirst) {
    notify(`LEVEL ${lv.n} — ${lv.name}`);
  } else {
    showAIEvent(`LEVEL ${lv.n} — ${lv.name}`);
  }
}

/** Call when the player destroys a Crawler. Returns true if a level was cleared. */
export function recordKill() {
  if (!active) return false;
  levelKills++;
  totalKills++;

  const lv = LEVELS[levelIdx];
  if (levelKills >= lv.quota) {
    return advance();
  }
  return false;
}

function advance() {
  if (levelIdx >= LEVELS.length - 1) {
    // Cleared the final shipped level
    active = false;
    onVictoryCb?.({ totalKills, lastLevel: LEVELS[levelIdx].n });
    return true;
  }
  levelIdx++;
  levelKills = 0;
  applyLevel(levelIdx);
  return true;
}

/** Tick the level window timer (drives flavour pacing; survival is quota-based). */
export function updateLevels(dt) {
  if (!active) return;
  windowTimer -= dt;
  if (windowTimer <= 0) {
    // Window elapsed — keep pressure on; reset window and pulse a warning.
    windowTimer = LEVELS[levelIdx].window;
    showAIEvent('VOID PRESSURE RISING — HOLD THE FRAGMENT');
  }
}

/** Whether a given level number is unlocked under the current commercial config. */
export function isLevelUnlocked(levelNumber) {
  if (levelNumber <= FOUNDER_CONFIG.freeLevels) return true;
  return false; // Phase 2 gate — entitlement check goes here when monetised
}
