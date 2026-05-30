'use strict';

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const path       = require('path');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors:          { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout:   20000,
  pingInterval:  10000,
  maxHttpBufferSize: 1e5,  // 100KB max message
});

// ── Security middleware ────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use((_req, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });

const limiter = rateLimit({ windowMs: 60_000, max: 200, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

// ── Serve built client (Vite dist/) ───────────────────────────────────────
const DIST = path.join(__dirname, '../../dist');
app.use(express.static(DIST));
app.get('/', (_req, res) => res.redirect('/index.html'));

// ── Game state ─────────────────────────────────────────────────────────────
const players    = {};
const blockDeltas = [];
const MAX_DELTAS  = 1000;
let   totalConns  = 0;

function sanitise(str, max = 20) {
  return String(str || '').replace(/[<>]/g, '').trim().slice(0, max);
}

function mkPlayer(id, data) {
  return {
    id,
    name:    sanitise(data.name || `Ghost_${id.slice(0, 4)}`),
    cls:     Math.min(5, Math.max(0, Number(data.cls)     || 0)),
    faction: Math.min(2, Math.max(0, Number(data.faction) || 0)),
    x: 0, y: 20, z: 0, yaw: 0,
    hp:     Number(data.hp) || 100,
    placed: 0,
    kills:  0,
    joined: Date.now(),
  };
}

// ── Socket events ─────────────────────────────────────────────────────────
io.on('connection', (socket) => {
  totalConns++;

  // Enforce max players
  if (Object.keys(players).length >= 16) {
    socket.emit('serverMsg', { text: 'Server full — try again soon.' });
    socket.disconnect(true);
    return;
  }

  console.log(`[+] ${socket.id.slice(0, 8)}  (${Object.keys(players).length + 1} online)`);

  socket.emit('sync', {
    world:   blockDeltas.slice(-500),
    players: Object.values(players),
  });

  // ── Join ────────────────────────────────────────────────────────────────
  socket.on('join', (data) => {
    if (players[socket.id]) return; // already joined
    const p = mkPlayer(socket.id, data || {});
    players[socket.id] = p;
    socket.broadcast.emit('player:join', p);
    socket.emit('welcome', { id: socket.id, serverTime: Date.now() });
    io.emit('serverMsg', { text: `${p.name} entered Fragment Zero.`, cls: p.cls });
    console.log(`  [join] ${p.name}  cls=${p.cls}  faction=${p.faction}`);
  });

  // ── Move (rate-limited by throttle on client side) ────────────────────
  let moveCount = 0;
  socket.on('move', ({ x, y, z, yaw }) => {
    const p = players[socket.id];
    if (!p) return;
    moveCount++;
    if (moveCount > 25) { moveCount = 0; } // reset every ~1s at 20Hz — silently drop excess

    // Sanity clamp
    p.x = Math.max(-200, Math.min(200, Number(x) || 0));
    p.y = Math.max(-20,  Math.min(100, Number(y) || 0));
    p.z = Math.max(-200, Math.min(200, Number(z) || 0));
    p.yaw = Number(yaw) || 0;
    socket.broadcast.emit('player:move', { id: socket.id, x: p.x, y: p.y, z: p.z, yaw: p.yaw });
  });

  // ── Block ─────────────────────────────────────────────────────────────
  socket.on('block', (d) => {
    const p = players[socket.id];
    if (!p) return;
    const delta = {
      x:      Math.round(Number(d.x) || 0),
      y:      Math.round(Number(d.y) || 0),
      z:      Math.round(Number(d.z) || 0),
      id:     Math.min(9, Math.max(0, Number(d.id) || 0)),
      action: d.action === 'place' ? 'place' : 'break',
    };
    blockDeltas.push(delta);
    if (blockDeltas.length > MAX_DELTAS) blockDeltas.shift();
    socket.broadcast.emit('block', delta);
    if (delta.action === 'place') p.placed++;
  });

  // ── Chat ─────────────────────────────────────────────────────────────
  socket.on('chat', (raw) => {
    const p = players[socket.id];
    if (!p) return;
    const msg = sanitise(String(raw), 200);
    if (!msg) return;
    io.emit('chat', { id: socket.id, name: p.name, cls: p.cls, msg });
  });

  // ── Ping ──────────────────────────────────────────────────────────────
  socket.on('ping_tc', () => socket.emit('pong_tc', Date.now()));

  // ── Disconnect ────────────────────────────────────────────────────────
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

// ── REST API ──────────────────────────────────────────────────────────────
app.get('/api/status', (_req, res) => {
  res.json({
    game:        'TacticalCraft',
    version:     '4.0.0',
    studio:      'TacticalCraft Games Pty Ltd',
    online:      Object.keys(players).length,
    totalEver:   totalConns,
    worldDeltas: blockDeltas.length,
    uptime:      Math.floor(process.uptime()),
    players:     Object.values(players).map(p => ({
      name: p.name, cls: p.cls, faction: p.faction, placed: p.placed,
    })),
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3789;
server.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════╗`);
  console.log(`  ║   TacticalCraft Server  v4.0.0       ║`);
  console.log(`  ║   TacticalCraft Games Pty Ltd        ║`);
  console.log(`  ╚══════════════════════════════════════╝`);
  console.log(`\n  Game:  http://localhost:${PORT}/`);
  console.log(`  API:   http://localhost:${PORT}/api/status\n`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────
process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('SIGINT',  () => { server.close(() => process.exit(0)); });
