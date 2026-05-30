/**
 * TacticalCraft v4 — Production entry point
 * Build. Fortify. Destroy. — TacticalCraft Games Pty Ltd
 */
import { scene, camera, render } from './renderer/scene.js';
import { addBlock, getBlock, getGroundY, getAllBlockMeshes, removeBlock } from './renderer/instanced.js';
import { generateWorld, terrainH } from './game/world.js';
import { updatePlayer, player, selCls, selBlock, buildMode, setClass, setBlock,
         toggleBuild, doRaycast, doBreakBlock, doPlaceBlock, setupFPWeapon,
         requestLock, isLocked, placed, broken, kills } from './game/player.js';
import { spawnCrawlers, updateCrawlers, crawlers, damageCrawler } from './game/enemies.js';
import { initBots, updateBots } from './game/bots.js';
import { updateParticles } from './game/effects.js';
import { connectToServer, emitMove, emitBlock, multiOnline, socket } from './game/network.js';
import { updateNameplate } from './ui/nameplates.js';
import { notify, updateHUD, updateClassHUD, setBuildMode, pickSlot,
         checkAIEvent, flashDamage, setOnlineBadge } from './ui/hud.js';
import { drawMinimap } from './ui/minimap.js';
import { addChatMsg, openChat, isChatOpen } from './ui/chat.js';
import { setPreviewClass, tickPreview, checkServerStatus, getSelectedClass } from './ui/menu.js';
import { updateCinematic, endCinematic, onCinematicDone } from './ui/cinematic.js';
import { startLevels, recordKill, updateLevels, getLevel, getLevelKills, getQuota, getTotalKills } from './game/levels.js';
import { updateLevelHUD, showVictory } from './ui/levelhud.js';
import { showStoryBeat } from './ui/story.js';
import { CLS_DATA } from './core/constants.js';

// ── Phase state ────────────────────────────────────────────────────────────
let phase      = 'loading';
let playerName = 'Wanderer';

// ── Loading screen progress ────────────────────────────────────────────────
function setLoadProgress(pct, msg) {
  const bar = document.getElementById('load-bar');
  const txt = document.getElementById('load-msg');
  if (bar) bar.style.width = pct + '%';
  if (txt && msg) txt.textContent = msg;
}

// ── World init (chunked to avoid freeze) ──────────────────────────────────
function initWorld(onDone) {
  setLoadProgress(5, 'GENERATING TERRAIN...');
  setTimeout(() => {
    generateWorld();
    setLoadProgress(20, 'BUILDING WORLD...');

    const entries = [];
    // Re-collect entries by querying instanced data — done inside instanced.js
    // We trigger a staged build by just letting the RAF loop tick
    let frames = 0;
    const FRAMES_TO_BUILD = 30;
    function buildFrame() {
      frames++;
      setLoadProgress(20 + Math.round((frames / FRAMES_TO_BUILD) * 70), `BUILDING WORLD... ${Math.round(frames / FRAMES_TO_BUILD * 100)}%`);
      if (frames < FRAMES_TO_BUILD) { requestAnimationFrame(buildFrame); }
      else {
        setLoadProgress(100, 'FRAGMENT ZERO READY');
        setTimeout(onDone, 400);
      }
    }
    requestAnimationFrame(buildFrame);
  }, 50);
}

// ── Input binding ──────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (phase !== 'game') return;
  if (isChatOpen()) return;
  if (e.code === 'KeyF') { const on = toggleBuild(); setBuildMode(on); notify(on ? 'Build mode' : 'Combat mode'); }
  if (e.code === 'KeyT') openChat(playerName, selCls);
  if (e.code === 'Escape') document.exitPointerLock?.();
  for (let i = 0; i < 8; i++) {
    if (e.code === 'Digit' + (i + 1)) { setBlock(i); pickSlot(i); }
  }
});

document.addEventListener('wheel', e => {
  if (phase !== 'game') return;
  let s = selBlock + (e.deltaY > 0 ? 1 : -1);
  s = ((s % 8) + 8) % 8;
  setBlock(s); pickSlot(s);
}, { passive: true });

document.addEventListener('mousedown', e => {
  if (phase !== 'game' || !isLocked() || isChatOpen()) return;
  doRaycast((hit, btn) => {
    if (btn === 0) {
      // Check crawler hit
      const parent = hit.object.parent;
      if (parent?.userData?.type === 'crawler') {
        const killed = damageCrawler(hit.object);
        if (killed) {
          recordKill();
          updateHUD({ kills: getTotalKills() });
          updateLevelHUD(getLevel(), getLevelKills(), getQuota());
        }
        return;
      }
      doBreakBlock(hit);
    }
    if (btn === 2 && buildMode) {
      const result = doPlaceBlock(hit);
      if (result) emitBlock(result.x, result.y, result.z, result.id, 'place');
    }
  }, e.button);
});

document.addEventListener('contextmenu', e => e.preventDefault());

document.querySelector('#btn-online')?.addEventListener('click', () => startGame(true));
document.querySelector('#btn-solo')?.addEventListener('click',   () => startGame(false));

document.querySelector('#srv-in')?.addEventListener('change', e => checkServerStatus(e.target.value));
document.querySelector('#srv-in')?.addEventListener('blur',   e => checkServerStatus(e.target.value));

// ── Menu → Game ────────────────────────────────────────────────────────────
function showMenu() {
  phase = 'menu';
  document.getElementById('menu').style.display = 'flex';
  setPreviewClass(0);
  const srvUrl = document.getElementById('srv-in')?.value || 'https://tacticalcraft.onrender.com';
  checkServerStatus(srvUrl);
}

function startGame(online) {
  playerName = (document.getElementById('name-in')?.value.trim() || 'Wanderer').slice(0, 20);
  const cls  = getSelectedClass();
  document.getElementById('menu').style.display = 'none';
  document.getElementById('hud').style.display  = 'block';
  phase = 'game';

  setClass(cls);
  pickSlot(0);
  initBots();

  // Start the threat-level progression (Phase 1: Levels 1–5)
  startLevels({
    onLevel: (lv) => {
      updateLevelHUD(lv, 0, lv.quota);
      showStoryBeat(lv.n);   // narrative chapter at each level transition
    },
    onVictory: (result) => {
      document.exitPointerLock?.();
      showVictory(result, playerName);
    },
  });
  spawnCrawlers();
  drawMinimap();

  if (online) {
    const url = document.getElementById('srv-in')?.value.trim() || 'https://tacticalcraft.onrender.com';
    connectToServer(url, { name: playerName, cls, faction: CLS_DATA[cls].faction, hp: player.maxHp });
  } else {
    addChatMsg('SYSTEM', 0, 'Solo mode — 3 bots active. Defend Fragment Zero.');
    notify('Solo mode — press T to chat, F to toggle build');
    setOnlineBadge('SOLO');
  }

  requestLock();
}

// ── Game loop ──────────────────────────────────────────────────────────────
let last     = performance.now();
let mmTimer  = 0;

function loop() {
  requestAnimationFrame(loop);
  const now = performance.now();
  const dt  = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (phase === 'loading') { render(); return; }

  if (phase === 'cinematic') {
    updateCinematic(dt);
    render();
    return;
  }

  if (phase === 'menu') {
    tickPreview(dt);
    render();
    return;
  }

  // Game
  if (isLocked()) {
    updatePlayer(dt);
  }
  updateCrawlers(dt);
  updateLevels(dt);
  updateBots(dt);
  updateParticles(dt);
  checkAIEvent(dt);
  if (multiOnline) emitMove();

  mmTimer += dt;
  if (mmTimer > 1.5) { drawMinimap(); mmTimer = 0; }

  render();
}

// ── Boot sequence ──────────────────────────────────────────────────────────
initWorld(() => {
  document.getElementById('loader').style.display = 'none';
  phase = 'cinematic';
  onCinematicDone(showMenu);
  loop();
});

// Render during loading too
loop();
