import { CLS_DATA } from '../core/constants.js';
import { emitChat } from '../game/network.js';

const msgsEl  = document.getElementById('chat-msgs');
const rowEl   = document.getElementById('chat-in-row');
const inputEl = document.getElementById('chat-in');

let chatOpen = false;

export function isChatOpen() { return chatOpen; }

export function addChatMsg(name, cls, msg) {
  if (!msgsEl) return;
  const color = CLS_DATA[cls || 0]?.color || '#888';
  const div   = document.createElement('div');
  div.className = 'cline';
  div.innerHTML = `<span class="cn" style="color:${color}">${name}</span> ${msg}`;
  msgsEl.appendChild(div);
  if (msgsEl.children.length > 10) msgsEl.removeChild(msgsEl.firstChild);
}

export function openChat(playerName, selCls) {
  chatOpen = true;
  if (rowEl)   rowEl.style.display = 'flex';
  if (inputEl) { inputEl.value = ''; inputEl.focus(); }
  document.exitPointerLock?.();

  const handler = (e) => {
    if (e.code === 'Enter') {
      const msg = inputEl?.value.trim();
      if (msg) { addChatMsg(playerName, selCls, msg); emitChat(msg); }
      closeChat(handler);
    }
    if (e.code === 'Escape') closeChat(handler);
  };
  inputEl?.addEventListener('keydown', handler);
}

function closeChat(handler) {
  chatOpen = false;
  if (rowEl)   rowEl.style.display = 'none';
  inputEl?.removeEventListener('keydown', handler);
  document.querySelector('canvas')?.requestPointerLock();
}
