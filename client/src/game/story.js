/**
 * TacticalCraft narrative — the story arc threaded through the 5 levels.
 *
 * Structure: the intro cinematic sets the world; each level delivers one
 * story beat (a chapter); the victory screen resolves Phase 1 and seeds
 * Phase 2 ("The Deep Fragment", Levels 6–15).
 *
 * This is core IP — see architecture.html (Narrative as an asset).
 */

export const STORY_ARC = [
  {
    level: 1,
    chapter: 'CHAPTER I',
    title: 'ARRIVAL',
    body: 'You drop onto Fragment Zero — the last shard of NEXUM still holding its shape. The dust hasn\'t settled in thirty years. Your scanners flicker: movement at the perimeter. The Void is testing the edges. Build while you still can.',
  },
  {
    level: 2,
    chapter: 'CHAPTER II',
    title: 'THE SIGNAL',
    body: 'The Crawlers come in numbers now — drawn to something beneath your feet. Deep in the fragment, a signal pulses, old and patient. It was here before you. It is calling them. Whatever NEXUM was hiding, you\'re standing on top of it.',
  },
  {
    level: 3,
    chapter: 'CHAPTER III',
    title: 'ADAPTATION',
    body: 'They\'re learning. Each wave moves smarter than the last, flanking your cover, probing your gaps. A faction transmission cuts through the static: "Operative — the fragment\'s core is destabilising. You are not defending rubble. You are defending the wound." The line dies.',
  },
  {
    level: 4,
    chapter: 'CHAPTER IV',
    title: 'THE TRUTH',
    body: 'The Void Storm hits and the sky goes black. In the dark, the truth arrives: Fragment Zero is not debris — it is the seed of the Collapse, the single point where reality first tore. Hold it, and the Collapse can be reversed. Lose it, and NEXUM is gone forever. All three factions are converging. So is the Void.',
  },
  {
    level: 5,
    chapter: 'CHAPTER V',
    title: 'TREMOR',
    body: 'The fragment itself begins to fight — the ground bucks, reality frays at the edges of your vision. This is the proving ground. Hold the core as the Tremor peaks. Everything NEXUM was, and everything it could be again, comes down to the next sixty seconds. Build. Fortify. Destroy.',
  },
];

// Resolution shown on victory, with the Phase 2 hook.
export const STORY_RESOLUTION = {
  title: 'FRAGMENT ZERO — STABILISED',
  body: 'The Tremor subsides. For the first time in thirty years, Fragment Zero is still. You held the wound closed. But as the readings settle, a new echo surfaces from far below the core — deeper, older, and awake. NEXUM had a basement. And something down there just noticed you.',
  hook: 'THE DEEP FRAGMENT — LEVELS 6–15 — COMING IN PHASE 2',
};

export function getStoryBeat(levelNumber) {
  return STORY_ARC.find(s => s.level === levelNumber) || null;
}
