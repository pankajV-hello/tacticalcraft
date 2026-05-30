import * as THREE from 'three';
import { scene } from '../renderer/scene.js';
import { getGroundY } from '../renderer/instanced.js';
import { createCharModel } from '../ui/charmodel.js';
import { addChatMsg } from '../ui/chat.js';
import { updateNameplate, makeNameplate } from '../ui/nameplates.js';
import { CLS_DATA, BOT_NAMES, BOT_CLASSES, BOT_CHATS } from '../core/constants.js';
import { terrainH } from './world.js';

export const bots = [];

export function initBots() {
  for (let i = 0; i < BOT_NAMES.length; i++) {
    const name = BOT_NAMES[i];
    const cls  = BOT_CLASSES[i];
    const mesh = createCharModel(cls);
    const cx   = (Math.random() - 0.5) * 20;
    const cz   = (Math.random() - 0.5) * 20;
    mesh.position.set(cx, terrainH(Math.round(cx), Math.round(cz)), cz);
    scene.add(mesh);
    const nameEl = makeNameplate(`<span style="color:${CLS_DATA[cls].color}">${CLS_DATA[cls].ico}</span> ${name}`);
    bots.push({
      mesh, nameEl, name, cls,
      target:    new THREE.Vector3(),
      moveTimer: 0,
      chatTimer: 15 + Math.random() * 20,
    });
  }
}

export function updateBots(dt) {
  for (const bot of bots) {
    bot.moveTimer -= dt;
    if (bot.moveTimer <= 0) {
      bot.target.set((Math.random() - 0.5) * 36, 0, (Math.random() - 0.5) * 36);
      bot.moveTimer = 4 + Math.random() * 8;
    }

    const dir = bot.target.clone().sub(bot.mesh.position);
    dir.y = 0;
    if (dir.length() > 0.8) {
      dir.normalize().multiplyScalar(1.8 * dt);
      bot.mesh.position.add(dir);
      bot.mesh.rotation.y = Math.atan2(dir.x, dir.z);
    }
    bot.mesh.position.y = getGroundY(bot.mesh.position.x, bot.mesh.position.z);

    updateNameplate(bot.nameEl, bot.mesh.position, 3.2);

    bot.chatTimer -= dt;
    if (bot.chatTimer <= 0) {
      const msgs = BOT_CHATS[bot.cls] || ['...'];
      addChatMsg(bot.name, bot.cls, msgs[Math.floor(Math.random() * msgs.length)]);
      bot.chatTimer = 20 + Math.random() * 30;
    }
  }
}
