import { io } from 'socket.io-client';
import { player } from './player.js';
import { addBlock, removeBlock, applyServerDelta } from '../renderer/instanced.js';
import { createCharModel } from '../ui/charmodel.js';
import { makeNameplate, updateNameplate, removeNameplate } from '../ui/nameplates.js';
import { addChatMsg } from '../ui/chat.js';
import { notify, showAIEvent } from '../ui/hud.js';
import { scene } from '../renderer/scene.js';
import { CLS_DATA } from '../core/constants.js';

export let socket      = null;
export let multiOnline = false;
export let selfId      = null;

const otherPlayers = {};
let   moveThrottle = 0;

const playerListEl = document.getElementById('pl-items');
const playerHdrEl  = document.getElementById('pl-hdr');
const onlineBadge  = document.getElementById('online-badge');

export function connectToServer(url, playerData) {
  try {
    socket = io(url, { timeout: 6000, reconnection: true, reconnectionAttempts: 3 });

    socket.on('connect', () => {
      multiOnline = true;
      socket.emit('join', playerData);
      if (onlineBadge) { onlineBadge.textContent = 'ONLINE'; onlineBadge.style.background = 'rgba(0,201,122,.2)'; }
      notify('Connected to server!');
    });

    socket.on('welcome', d => { selfId = d.id; });

    socket.on('sync', d => {
      d.players.forEach(p => _addOtherPlayer(p));
      applyServerDelta(d.world || []);
    });

    socket.on('player:join',  d => { _addOtherPlayer(d); addChatMsg('SERVER', 0, `${d.name} entered Fragment Zero.`); });
    socket.on('player:move',  d => _moveOtherPlayer(d));
    socket.on('player:leave', d => { _removeOtherPlayer(d.id); });

    socket.on('block', b => {
      if (b.action === 'place') addBlock(b.x, b.y, b.z, b.id);
      else removeBlock(b.x, b.y, b.z);
    });

    socket.on('chat',      d => addChatMsg(d.name, d.cls, d.msg));
    socket.on('serverMsg', d => notify(d.text || d));
    socket.on('event',     d => showAIEvent(d.text));

    socket.on('connect_error', () => {
      multiOnline = false;
      if (onlineBadge) onlineBadge.textContent = 'OFFLINE';
    });
    socket.on('disconnect', () => {
      multiOnline = false;
      if (onlineBadge) onlineBadge.textContent = 'OFFLINE';
      notify('Disconnected from server');
    });
  } catch (e) {
    console.warn('[network] Socket.io failed:', e);
  }
}

export function emitMove() {
  if (!socket || !multiOnline) return;
  moveThrottle++;
  if (moveThrottle % 3 !== 0) return;
  socket.emit('move', { x: player.pos.x, y: player.pos.y, z: player.pos.z, yaw: player.yaw });
}

export function emitBlock(x, y, z, id, action) {
  if (!socket || !multiOnline) return;
  socket.emit('block', { x, y, z, id, action });
}

export function emitChat(msg) {
  if (!socket || !multiOnline) return;
  socket.emit('chat', msg);
}

// ── Other player management ────────────────────────────────────────────────
function _addOtherPlayer(data) {
  if (data.id === selfId || otherPlayers[data.id]) return;
  const mesh  = createCharModel(data.cls || 0);
  mesh.position.set(data.x || 0, data.y || 20, data.z || 0);
  scene.add(mesh);
  const cls    = CLS_DATA[data.cls || 0];
  const nameEl = makeNameplate(`<span style="color:${cls.color}">${cls.ico}</span> ${data.name}`);
  otherPlayers[data.id] = { mesh, nameEl, data };
  _updatePlayerList();
}

function _moveOtherPlayer(d) {
  const op = otherPlayers[d.id];
  if (!op) return;
  op.mesh.position.set(d.x, d.y - 1.2, d.z);
  op.mesh.rotation.y = d.yaw + Math.PI;
  Object.assign(op.data, d);
  updateNameplate(op.nameEl, op.mesh.position, 3.2);
}

function _removeOtherPlayer(id) {
  const op = otherPlayers[id];
  if (!op) return;
  scene.remove(op.mesh);
  removeNameplate(op.nameEl);
  delete otherPlayers[id];
  _updatePlayerList();
}

function _updatePlayerList() {
  if (!playerListEl) return;
  const players = Object.values(otherPlayers).map(op => op.data);
  if (playerHdrEl) playerHdrEl.style.display = players.length ? 'block' : 'none';
  playerListEl.innerHTML = players.map(d => `
    <div class="pl-item">
      <div class="pl-dot" style="background:${CLS_DATA[d.cls || 0].color}"></div>
      <span>${d.name}</span>
    </div>`).join('');
}

export function updateOtherPlayers() {
  for (const op of Object.values(otherPlayers)) {
    updateNameplate(op.nameEl, op.mesh.position, 3.2);
  }
}
