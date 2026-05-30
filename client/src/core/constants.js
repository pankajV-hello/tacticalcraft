// ── Shared game constants ──────────────────────────────────────────────────
export const WORLD_R   = 28;   // half-width of world in blocks
export const WORLD_H   = 48;   // max world height
export const SEA_Y     = 14;   // water/base level

export const TICK_RATE = 20;   // server authoritative ticks/sec
export const MOVE_HZ   = 20;   // client position sends/sec

export const MAX_PLAYERS   = 16;
export const MAX_DELTA_LOG = 1000;

export const FACTION_NAMES  = ['The Architects', 'The Wardens', 'The Ghosts'];
export const FACTION_COLORS = ['#0F6E56', '#3C3489', '#8B3020'];

export const CLS_DATA = [
  { name:'Builder',    ico:'⚒',  color:'#00C97A', hp:100, reach:8,  sprint:9,  faction:0 },
  { name:'Soldier',    ico:'⚔',  color:'#5A50C0', hp:125, reach:8,  sprint:11, faction:1 },
  { name:'Engineer',   ico:'⚙',  color:'#E8890A', hp:100, reach:8,  sprint:9,  faction:0 },
  { name:'Medic',      ico:'✚',  color:'#00a87a', hp:100, reach:8,  sprint:9,  faction:1 },
  { name:'Sniper',     ico:'⊕',  color:'#8090a0', hp:80,  reach:14, sprint:9,  faction:2 },
  { name:'Demolisher', ico:'💥', color:'#c04020', hp:100, reach:8,  sprint:9,  faction:2 },
];

export const CLS_DETAIL = [
  { lore:'"Every block placed is a promise kept."<br>Masters of rapid construction. First to fortify, last to fall.',    bonus:'⚡ 2× placement speed<br>🔨 Extended build reach<br>🏗 Sandbag walls: zero delay' },
  { lore:'"We stand between the Crawlers and what remains."<br>Front-line fighters, heavy armour, relentless sprint.',    bonus:'⚡ +25 max HP<br>💨 Sprint speed +2<br>⚔ Melee damage bonus' },
  { lore:'"Given enough time, I can build anything."<br>Structural specialists who reinforce and repair in combat.',      bonus:'⚡ Repair blocks in combat<br>🔧 Complex structures faster<br>⚙ Metal blocks: half cost' },
  { lore:'"Hold still. This will help."<br>Field medics who keep the squad alive under fire.',                            bonus:'⚡ Passive HP regen<br>✚ Revive teammates (MP)<br>💉 AoE heal pulse (F2)' },
  { lore:'"I was never here."<br>Long-range operatives who see everything from elevation.',                                bonus:'⚡ +6 block reach (14 total)<br>🔭 Extended minimap range<br>👁 Enemy detection radius' },
  { lore:'"Three. Two. One."<br>Explosive specialists who reshape the battlefield in seconds.',                            bonus:'⚡ 3×3 area break<br>💥 Blast radius +1<br>🧨 Explosive block type unlocked' },
];

export const BLOCKS = [
  null,
  { name:'Grass',   color:0x5a9e4a },
  { name:'Dirt',    color:0x8b6540 },
  { name:'Stone',   color:0x7a7a7a },
  { name:'Sand',    color:0xd4b870 },
  { name:'Wood',    color:0x8b6530 },
  { name:'Metal',   color:0x607080 },
  { name:'Sandbag', color:0xc8a870 },
  { name:'Brick',   color:0xa05040 },
  { name:'Leaves',  color:0x3a7a30 },
];

export const AI_EVENTS = [
  'VOID SURGE INCOMING — FRAGMENT EAST PERIMETER',
  'HEXANITE DEPOSIT DETECTED — SECTOR NORTH-7',
  'ARCHITECT FACTION FORTIFYING — EASTERN RIDGE',
  'CRAWLER MUTATION DETECTED — HOSTILE ESCALATION',
  'VOID STORM — SECTOR VISIBILITY REDUCED 40%',
  'FRAGMENT ZERO TREMOR — STRUCTURAL INSTABILITY',
];

export const BOT_NAMES   = ['Wraith_Alpha', 'Zeta_Prime', 'Echo_7'];
export const BOT_CLASSES = [1, 3, 5];
export const BOT_CHATS   = {
  1: ['Contact northwest.','Holding position.','Squad up.','Fragment secure.','Anyone need backup?'],
  3: ['All good here.','Regen active.','Stay close to me.','Patch incoming.'],
  5: ['3x3 engage.','INCOMING!','Fragment seized.','Clear the path.','...'],
};

export const STORY_BEATS = [
  { t:0.4,  dur:1.6, text:'TACTICALCRAFT GAMES PTY LTD',              sz:14, col:'#3C3489', bold:false },
  { t:2.3,  dur:2.2, text:'TACTICALCRAFT',                             sz:72, col:'#F5F4EF', bold:true  },
  { t:5.0,  dur:0.8, text:'',                                          sz:0,  clear:true                },
  { t:6.2,  dur:1.8, text:'2 1 5 7',                                   sz:82, col:'#F5F4EF', bold:true  },
  { t:8.5,  dur:2.2, text:'A quantum collapse detonated without warning.',          sz:21, col:'#7a7a9a' },
  { t:11.2, dur:2.2, text:'The megacity of NEXUM shattered into 40,000 fragments.', sz:21, col:'#7a7a9a' },
  { t:14.0, dur:2.0, text:'Three factions rose from the wreckage.',                 sz:26, col:'#aaaacc' },
  { t:16.5, dur:1.5, text:'One fragment remains intact. The key to reversing it all.', sz:21, col:'#7a7a9a' },
  { t:18.5, dur:2.5, text:'BUILD.  FORTIFY.  DESTROY.',                sz:48, col:'#00C97A', bold:true  },
  { t:21.5, dur:1.0, text:'',                                          sz:0,  clear:true, done:true     },
];
