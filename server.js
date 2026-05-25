'use strict';

const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const path    = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 20000,
  pingInterval: 10000,
});

// ── CORS for REST API ────────────────────────────────────────────────────────
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

// ── STATIC FILES ────────────────────────────────────────────────────────────
app.use(express.static(__dirname));

// ── GAME STATE ───────────────────────────────────────────────────────────────
const players     = {};        // socketId -> PlayerState
const blockDeltas = [];        // world mutation log for sync on join
const MAX_DELTAS  = 1000;
let totalConnections = 0;

function mkPlayer(id, data) {
  return {
    id,
    name:    String(data.name    || `Ghost_${id.slice(0, 4)}`).slice(0, 20),
    cls:     Math.min(5, Math.max(0, Number(data.cls)     || 0)),
    faction: Math.min(2, Math.max(0, Number(data.faction) || 0)),
    x: 0, y: 20, z: 0, yaw: 0,
    hp:     Number(data.hp) || 100,
    placed: 0,
    kills:  0,
    joined: Date.now(),
  };
}

// ── SOCKET.IO ────────────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  totalConnections++;
  console.log(`[+] ${socket.id.slice(0, 8)}  (${Object.keys(players).length + 1} online)`);

  // Send current world delta + existing players to new joiner
  socket.emit('sync', {
    world:   blockDeltas.slice(-500),
    players: Object.values(players),
  });

  // ── JOIN ────────────────────────────────────────────────────────────────
  socket.on('join', (data) => {
    const p = mkPlayer(socket.id, data);
    players[socket.id] = p;
    socket.broadcast.emit('player:join', p);
    socket.emit('welcome', { id: socket.id, serverTime: Date.now() });
    io.emit('serverMsg', {
      text: `${p.name} entered Fragment Zero.`,
      cls: p.cls,
    });
    console.log(`  [join] ${p.name}  cls=${p.cls}  faction=${p.faction}`);
  });

  // ── POSITION UPDATE (high frequency, 20Hz) ──────────────────────────────
  socket.on('move', ({ x, y, z, yaw }) => {
    const p = players[socket.id];
    if (!p) return;
    p.x = x; p.y = y; p.z = z; p.yaw = yaw;
    socket.broadcast.emit('player:move', { id: socket.id, x, y, z, yaw });
  });

  // ── BLOCK CHANGE ─────────────────────────────────────────────────────────
  socket.on('block', (d) => {
    const delta = {
      x: Math.round(d.x),
      y: Math.round(d.y),
      z: Math.round(d.z),
      id: Number(d.id),
      action: d.action === 'place' ? 'place' : 'break',
    };
    blockDeltas.push(delta);
    if (blockDeltas.length > MAX_DELTAS) blockDeltas.shift();
    socket.broadcast.emit('block', delta);
    const p = players[socket.id];
    if (p && delta.action === 'place') p.placed++;
  });

  // ── CHAT ─────────────────────────────────────────────────────────────────
  socket.on('chat', (raw) => {
    const p = players[socket.id];
    if (!p) return;
    const msg = String(raw).replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 200);
    if (!msg.trim()) return;
    io.emit('chat', { id: socket.id, name: p.name, cls: p.cls, msg });
  });

  // ── PING ─────────────────────────────────────────────────────────────────
  socket.on('ping_tc', () => socket.emit('pong_tc', Date.now()));

  // ── DISCONNECT ───────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const p = players[socket.id];
    if (p) {
      io.emit('player:leave', { id: socket.id });
      io.emit('serverMsg', { text: `${p.name} left the fragment.`, cls: p.cls });
      console.log(`[-] ${p.name} disconnected`);
      delete players[socket.id];
    }
  });
});

// ── REST API ─────────────────────────────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  res.json({
    game:        'TacticalCraft',
    version:     '0.3.0',
    studio:      'TacticalCraft Games Pty Ltd',
    online:      Object.keys(players).length,
    totalEver:   totalConnections,
    worldDeltas: blockDeltas.length,
    uptime:      Math.floor(process.uptime()),
    players:     Object.values(players).map(p => ({
      name: p.name, cls: p.cls, faction: p.faction, placed: p.placed,
    })),
  });
});

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3789;
server.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   TacticalCraft Server  v0.3.0       ║`);
  console.log(`  ║   TacticalCraft Games Pty Ltd        ║`);
  console.log(`  ╚══════════════════════════════════════╝`);
  console.log(`\n  Game:  http://localhost:${PORT}/TacticalCraft_v3.html`);
  console.log(`  API:   http://localhost:${PORT}/api/status`);
  console.log(`  Ready for players.\n`);
});
