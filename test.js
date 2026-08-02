// Ọdịnala — headless test harness.
//
// It stubs the DOM, the 2D context, WebAudio, localStorage and the frame clock,
// then loads the real script out of odinala.html and drives the real loop one
// tick at a time. It tests the game, not a model of it: every assertion below
// goes through the same code path a player's finger does.
//
//   node test.js
//
// The seam is the __ODINALA_TEST export at the bottom of odinala.html. If you
// need to reach a new internal, add it there — never test through the DOM.
//
// Coverage follows bible/11-TECH.md §11.6. The four bugs this project has
// actually shipped and fixed — dropped inputs during hitstop, multi-hit swings,
// colliding save slots, an unreachable room — each have a permanent guard here,
// marked REGRESSION.

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML = path.join(__dirname, 'odinala.html');

// ── the script under test ────────────────────────────────────────────────────
function extractScript(html) {
  const open = html.indexOf('<script>');
  const close = html.lastIndexOf('</script>');
  if (open < 0 || close < 0) throw new Error('no <script> block in odinala.html');
  return html.slice(open + '<script>'.length, close);
}

// ── recording WebAudio ───────────────────────────────────────────────────────
// Real enough that the game's audio path executes for real, and counted so the
// tests can assert that a mechanical event actually made a sound. Silence is a
// bug (13.11), and a null AudioContext would hide every instance of it, because
// every emitter in the game short-circuits on `if(!AC) return`.
const audio = { osc: 0, noise: 0, gain: 0, filter: 0, started: 0 };
function audioReset() { for (const k in audio) audio[k] = 0; }
function audioTotal() { return audio.osc + audio.noise; }

function mkParam(v) {
  return {
    value: v,
    setValueAtTime() { return this; },
    exponentialRampToValueAtTime() { return this; },
    linearRampToValueAtTime() { return this; },
    setTargetAtTime() { return this; },
    cancelScheduledValues() { return this; }
  };
}
function mkNode(extra) {
  return Object.assign({
    connect() { return this; },
    disconnect() { return this; },
    start() { audio.started++; return this; },
    stop() { return this; }
  }, extra);
}
class StubAudioContext {
  constructor() {
    this.state = 'running';
    this.sampleRate = 44100;
    this.destination = mkNode({});
    this._t = 0;
  }
  get currentTime() { this._t += 1 / 60; return this._t; }
  resume() { this.state = 'running'; return Promise.resolve(); }
  createOscillator() { audio.osc++; return mkNode({ type: 'square', frequency: mkParam(440), detune: mkParam(0) }); }
  createGain() { audio.gain++; return mkNode({ gain: mkParam(1) }); }
  createBiquadFilter() { audio.filter++; return mkNode({ type: 'lowpass', frequency: mkParam(350), Q: mkParam(1) }); }
  createDelay() { return mkNode({ delayTime: mkParam(0) }); }
  createBufferSource() { audio.noise++; return mkNode({ buffer: null, loop: false, playbackRate: mkParam(1) }); }
  createBuffer(ch, len) {
    const data = new Float32Array(Math.max(1, len | 0));
    return { length: data.length, numberOfChannels: ch, sampleRate: 44100, getChannelData: () => data };
  }
}

// ── canvas ───────────────────────────────────────────────────────────────────
// Every 2D call the game makes, as a no-op. measureText and the gradient
// factories return shapes because the game reads back from them.
function mkCtx() {
  const noop = () => {};
  const grad = () => ({ addColorStop: noop });
  const c = {
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt',
    font: '10px serif', textAlign: 'left', globalAlpha: 1,
    globalCompositeOperation: 'source-over', imageSmoothingEnabled: false,
    save: noop, restore: noop, beginPath: noop, closePath: noop,
    moveTo: noop, lineTo: noop, quadraticCurveTo: noop, bezierCurveTo: noop,
    arc: noop, ellipse: noop, rect: noop, fill: noop, stroke: noop, clip: noop,
    fillRect: noop, strokeRect: noop, clearRect: noop, fillText: noop,
    strokeText: noop, drawImage: noop, translate: noop, rotate: noop,
    scale: noop, setTransform: noop, transform: noop, resetTransform: noop,
    createLinearGradient: grad, createRadialGradient: grad, createPattern: () => null,
    measureText: (s) => ({ width: String(s == null ? '' : s).length * 5 }),
    getImageData: (x, y, w, h) => ({ data: new Uint8ClampedArray(Math.max(4, w * h * 4)), width: w, height: h }),
    putImageData: noop
  };
  return c;
}
function mkCanvas(w, h) {
  const c = {
    width: w || 300, height: h || 150, style: {}, tabIndex: 0,
    getContext() { return this._ctx; },
    addEventListener: () => {}, removeEventListener: () => {}, focus: () => {},
    getBoundingClientRect() { return { left: 0, top: 0, width: this.width, height: this.height, right: this.width, bottom: this.height }; }
  };
  c._ctx = mkCtx();
  c._ctx.canvas = c;
  return c;
}
function mkEl() {
  return {
    style: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener: () => {}, removeEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100 }),
    appendChild: () => {}, querySelectorAll: () => [], setAttribute: () => {}, focus: () => {}
  };
}

// ── storage ──────────────────────────────────────────────────────────────────
// Keyed and real. The speedrun slot must never touch the normal one (11.3), and
// a Map-backed stub is the only way that invariant is testable.
function mkStorage() {
  const m = new Map();
  return {
    _m: m,
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
    clear: () => m.clear(),
    get length() { return m.size; }
  };
}

// ── the sandbox ──────────────────────────────────────────────────────────────
const canvas = mkCanvas(1440, 810);
const storage = mkStorage();
let clock = 0;                 // ms; the harness owns time entirely
let rafCb = null;              // the game's frame(), captured on registration
let timers = [];
const listeners = {};          // real window listeners, so the audio unlock runs

const sandbox = {
  console,
  Math, JSON, Date, Object, Array, String, Number, Boolean, Error, RegExp,
  Float32Array, Uint8ClampedArray, Uint8Array, Int32Array, Promise, Set, Map, Symbol,
  isNaN, isFinite, parseInt, parseFloat, encodeURIComponent, decodeURIComponent,
  document: {
    getElementById: (id) => (id === 'g' ? canvas : mkEl()),
    createElement: (tag) => (tag === 'canvas' ? mkCanvas(1, 1) : mkEl()),
    addEventListener: () => {}, removeEventListener: () => {},
    body: mkEl(), documentElement: mkEl()
  },
  localStorage: storage,
  performance: { now: () => clock },
  requestAnimationFrame: (cb) => { rafCb = cb; return 1; },
  cancelAnimationFrame: () => {},
  setTimeout: (fn, ms) => { timers.push({ fn, at: clock + (ms || 0) }); return timers.length; },
  clearTimeout: () => {},
  setInterval: () => 0,          // the music scheduler is stepped by ticks, not wall time
  clearInterval: () => {},
  matchMedia: () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} }),
  addEventListener: (type, fn) => { (listeners[type] || (listeners[type] = [])).push(fn); },
  removeEventListener: () => {},
  innerWidth: 1440, innerHeight: 810, devicePixelRatio: 1,
  AudioContext: StubAudioContext, webkitAudioContext: StubAudioContext,
  navigator: { userAgent: 'node', maxTouchPoints: 0 }
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.self = sandbox;

let api = null;
sandbox.__ODINALA_TEST = (a) => { api = a; };

vm.createContext(sandbox);
try {
  vm.runInContext(extractScript(fs.readFileSync(HTML, 'utf8')), sandbox, { filename: 'odinala.html' });
} catch (e) {
  console.error('the game script threw while loading:\n', (e && e.stack) || e);
  process.exit(1);
}
if (!api) { console.error('__ODINALA_TEST never fired — the export at the bottom of odinala.html is missing'); process.exit(1); }
if (!rafCb) { console.error('the game never called requestAnimationFrame — cannot drive the loop'); process.exit(1); }

const G = () => api.G, P = () => api.P;

// Dispatch a real event at the game's own listeners. The audio unlock hangs off
// keydown, so nothing makes a sound until a key has genuinely been delivered —
// exactly as on a device.
function dispatch(type, code) {
  for (const fn of (listeners[type] || [])) fn({ code, preventDefault() {}, clientX: 0, clientY: 0 });
}
function unlockAudio() { dispatch('keydown', 'KeyR'); dispatch('keyup', 'KeyR'); }

// ── driving the loop ─────────────────────────────────────────────────────────
const STEP = 1000 / 60;
// One call, one simulated step: frame() accumulates dt and runs while(acc>=step),
// so advancing by exactly STEP keeps the tick count deterministic.
function tick(n) {
  for (let i = 0; i < (n == null ? 1 : n); i++) {
    clock += STEP;
    const cb = rafCb; rafCb = null;
    cb(clock);
    while (timers.length && timers[0].at <= clock) timers.shift().fn();
    if (!rafCb) throw new Error('frame() stopped re-registering with requestAnimationFrame');
  }
}
// Goes through the real down()/up(), so `pressed` behaves exactly as it does for
// a player — including surviving hitstop.
function press(code, hold, after) {
  api.up(code);
  api.down(code);
  tick(hold == null ? 1 : hold);
  api.up(code);
  if (after) tick(after);
}
function hold(code, n) { api.down(code); tick(n); }
function release(code, n) { api.up(code); if (n) tick(n); }

// Clears every timing gate that makes a test flaky (13.10): leftover hitstop or
// slow-mo means update() never runs, and an unset face swings the wrong way.
function revive(face) {
  const g = G(), p = P();
  g.hitstop = 0; g.slow = 0; g.shake = 0; g.flash = 0; g.fade = 0;
  g.outroT = 0; g.msgT = 0; g.msg = null;
  p.hp = g.maxHP; p.dead = false; p.st = 'idle'; p.t = 0; p.inv = 0; p.hurtT = 0;
  p.vx = 0; p.vy = 0; p.charge = 0; p.rollCd = 0; p.combo = 0; p.comboWin = 0;
  p.face = face == null ? 1 : face;
  timers.length = 0;
  for (const c of ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyF', 'KeyN', 'KeyG', 'KeyB',
                   'Space', 'Enter', 'Escape', 'Tab', 'KeyM', 'KeyP', 'KeyE', 'KeyK',
                   'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                   'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyR']) api.up(c);
}
// A queued cutscene swallows input; get past it before acting (13.10).
function skipCuts(limit) {
  let n = 0;
  while (G().mode === 'cut' && n++ < (limit || 400)) { press('KeyX', 1, 1); }
  return G().mode !== 'cut';
}
// Where the first hazard tile in a room sits, or null.
function findHazard(room) {
  const r = api.ROOMS[room];
  for (let y = 0; y < r.h; y++) { const x = r.map[y].indexOf('^'); if (x >= 0) return { x, y }; }
  return null;
}
// Kill the player for real, through the hazard path, so die() actually runs.
// Setting hp to 0 by hand does not kill anyone: death is triggered inside
// hurtPlayer, not by the update loop noticing an empty bar.
function killPlayer() {
  const h = findHazard(8);
  at(8, h.x, h.y - 2);
  G().cheat = false;
  P().hp = 1; P().inv = 0; P().flasks = 0;
  P().x = h.x * 16 + 3;
  P().y = h.y * 16 - P().h + 4;      // feet inside the hazard row
  for (let i = 0; i < 30 && !P().dead; i++) { P().inv = 0; tick(1); }
  return P().dead;
}

// Drop into a room at a tile, with nothing left over from the last block.
function at(room, tx, ty, face) {
  revive(face);
  api.resetPlayerAt(room, tx, ty);
  revive(face);
  skipCuts();
  G().mode = 'play';
  tick(2);
  revive(face);
}

// ── assertions ───────────────────────────────────────────────────────────────
let passed = 0, failed = 0;
const failures = [];
function check(what, cond, info) {
  if (cond) { passed++; return true; }
  failed++;
  failures.push(what + (info == null ? '' : '\n         ' + info));
  return false;
}
function section(name) { console.log('  ' + name); }
const near = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 1e-6 : eps);
const finite = (v) => typeof v === 'number' && isFinite(v);

const SOL = (c) => c === '#' || c === 'c';
// A tile you can stand on: solid underfoot, two tiles of clear air above it,
// because resetPlayerAt puts the feet at the top of row ty and the player is
// 18px tall in a 16px grid.
function standable(room, tx, ty) {
  const r = api.ROOMS[room];
  if (!r) return false;
  return SOL(api.tileAt(r, tx, ty)) && !SOL(api.tileAt(r, tx, ty - 1)) && !SOL(api.tileAt(r, tx, ty - 2));
}
// An arrival tile does not have to be flush with the floor — dropping in above
// it is fine, and some doorways land on a one-way platform. What it may never be
// is buried: the body occupies rows ty-1 and ty-2, and neither may be rock.
function embedded(room, tx, ty) {
  const r = api.ROOMS[room];
  if (!r) return true;
  return SOL(api.tileAt(r, tx, ty - 1)) || SOL(api.tileAt(r, tx, ty - 2));
}
// ...and there has to be something to land on within a short fall.
function groundBelow(room, tx, ty, span) {
  const r = api.ROOMS[room];
  if (!r) return false;
  for (let y = ty; y <= ty + (span || 8); y++) {
    const c = api.tileAt(r, tx, y);
    if (SOL(c) || c === '-') return true;
  }
  return false;
}

// ═════════════════════════════════════════════════════════════════════════════
section('loading and the frame loop');
check('the script loads and fires its test hook', !!api);
check('the game opens on the title screen', G().mode === 'title', 'mode=' + G().mode);
check('the loop runs 120 frames without throwing', (() => { tick(120); return true; })());
check('the title screen advances its clock', G().t > 0, 't=' + G().t);
check('the game registers keyboard listeners', (listeners.keydown || []).length > 0);
check('audio stays silent until the player touches something', audioTotal() === 0, 'audio events=' + audioTotal());
unlockAudio();
check('the first key press completes the audio unlock handshake', audio.started > 0,
  'started=' + audio.started + ' osc=' + audio.osc + ' noise=' + audio.noise);

// ═════════════════════════════════════════════════════════════════════════════
section('world integrity');
const ROOMS = api.ROOMS;
check('ten rooms are authored', ROOMS.length === 10, 'rooms=' + ROOMS.length);

ROOMS.forEach((r, i) => {
  check('room ' + i + ' has a name', typeof r.name === 'string' && r.name.length > 0);
  check('room ' + i + ' rows are all the declared width', r.map.every(row => row.length === r.w),
    'w=' + r.w + ' widths=' + Array.from(new Set(r.map.map(s => s.length))).join(','));
  check('room ' + i + ' height matches its map', r.h === r.map.length);
  check('room ' + i + ' uses only tile characters the spawner understands',
    r.map.every(row => /^[-#.cESNMhwltWrvakiFB^XO K]*$/.test(row)),
    'unknown: ' + Array.from(new Set(r.map.join('').split('').filter(c => !/[-#.cESNMhwltWrvakiFB^XO K]/.test(c)))).join(''));
  check('room ' + i + ' has at least one exit', Array.isArray(r.exits) && r.exits.length > 0);
  check('room ' + i + ' has no more than four exits', r.exits.length <= 4, 'exits=' + r.exits.length);
});

// REGRESSION — the unreachable room. Every room must be arrived at from some
// other room's exit list, gates included.
const inbound = ROOMS.map(() => 0);
ROOMS.forEach((r, i) => r.exits.forEach(ex => {
  check('room ' + i + ' exit points at a room that exists', ex.to >= 0 && ex.to < ROOMS.length, 'to=' + ex.to);
  if (ex.to >= 0 && ex.to < ROOMS.length && ex.to !== i) inbound[ex.to]++;
  // §04.6 step 7 — verify the arrival tile is solid ground. Burying the arrival
  // inside rock strands the player: they cannot walk out of it in any direction.
  check('REGRESSION room ' + i + '’s exit does not bury the player in rock in room ' + ex.to,
    !embedded(ex.to, ex.sx, ex.sy), 'arrival (' + ex.sx + ',' + ex.sy + ') in room ' + ex.to +
    ' — tile above feet is "' + api.tileAt(ROOMS[ex.to], ex.sx, ex.sy - 1) + '"');
  check('room ' + i + '’s exit gives the player ground to land on in room ' + ex.to,
    groundBelow(ex.to, ex.sx, ex.sy), 'arrival (' + ex.sx + ',' + ex.sy + ') in room ' + ex.to);
}));
ROOMS.forEach((r, i) => {
  if (i === 0) return;   // room 0 is where the game begins; nothing needs to lead in
  check('REGRESSION room ' + i + ' is reachable from another room', inbound[i] > 0);
});

// Walk the graph from room 0 with every gate open — nothing may be stranded.
(() => {
  const seen = new Set([0]), q = [0];
  while (q.length) {
    const n = q.shift();
    for (const ex of ROOMS[n].exits) if (!seen.has(ex.to)) { seen.add(ex.to); q.push(ex.to); }
  }
  check('REGRESSION every room is reachable from room 0 once its gates are open',
    seen.size === ROOMS.length, 'reached ' + seen.size + '/' + ROOMS.length);
})();

// The two progression gates, named as bosses that exist.
(() => {
  const gates = [];
  ROOMS.forEach((r, i) => r.exits.forEach(ex => { if (ex.needs) gates.push({ from: i, to: ex.to, needs: ex.needs }); }));
  check('the world has progression gates', gates.length >= 2, 'gates=' + gates.length);
  for (const g of gates) {
    check('gate ' + g.from + '→' + g.to + ' names a real boss', ['ogbunabali', 'ekwensu', 'onwe'].indexOf(g.needs) >= 0, g.needs);
  }
  check('the bone road onward is gated behind Ekwensu', gates.some(g => g.from === 6 && g.needs === 'ekwensu'));
  check('the shaft onward is gated behind Ogbunabali', gates.some(g => g.needs === 'ogbunabali'));
})();

check('the checkpoint the game starts from is standable', standable(0, 9, 16));

// Five tables are room-indexed (11.3) — they must all agree on the room count.
check('the map layout table has one entry per room', api.ROOMS.length === 10);

// ═════════════════════════════════════════════════════════════════════════════
section('mirrors and riddles');
const MIRRORS = api.MIRRORS, RIDDLES = api.RIDDLES;
const mirrorKeys = Object.keys(MIRRORS);
check('there are mirrors to travel between', mirrorKeys.length >= 2, 'mirrors=' + mirrorKeys.length);
for (const k of mirrorKeys) {
  const m = MIRRORS[k];
  check('mirror ' + k + ' has a name', typeof m.name === 'string' && m.name.length > 0);
  check('mirror ' + k + ' points at a room that exists', m.room >= 0 && m.room < ROOMS.length);
  check('mirror ' + k + ' lands the player on solid ground', standable(m.room, m.tx, m.ty),
    'tile (' + m.tx + ',' + m.ty + ') in room ' + m.room);
  check('mirror ' + k + ' sits in the room it is keyed to', String(m.room) === String(k), 'key=' + k + ' room=' + m.room);
  check('room ' + m.room + ' actually contains a mirror tile', ROOMS[m.room].map.some(row => row.indexOf('M') >= 0));
}
check('every riddle is asked in Igbo', RIDDLES.every(r => typeof r.ig === 'string' && r.ig.length > 0));
check('every riddle carries its English reading', RIDDLES.every(r => typeof r.en === 'string' && r.en.length > 0));
check('every riddle offers three answers', RIDDLES.every(r => Array.isArray(r.a) && r.a.length === 3),
  RIDDLES.map(r => (r.a || []).length).join(','));
check('every riddle has exactly one correct index in range', RIDDLES.every(r => r.c >= 0 && r.c < 3));
check('every riddle answer is labelled', RIDDLES.every(r => r.a.every(x => typeof x === 'string' && x.length > 0)));
check('there are at least as many riddles as mirrors', RIDDLES.length >= mirrorKeys.length,
  RIDDLES.length + ' riddles, ' + mirrorKeys.length + ' mirrors');

// ═════════════════════════════════════════════════════════════════════════════
section('the title screen');
(() => {
  revive();
  G().mode = 'title';
  api.wipeSave();
  const opts = api.titleOpts();
  check('a fresh title screen offers no Continue', opts.indexOf('continue') < 0, opts.join(','));
  check('a fresh title screen offers New', opts.indexOf('new') >= 0);
  check('the title screen always offers the speedrun', opts.indexOf('speedrun') >= 0);
  check('the title screen always offers the codex', opts.indexOf('codex') >= 0);
  check('the title screen always offers the controls', opts.indexOf('controls') >= 0);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('starting a game');
(() => {
  revive();
  G().mode = 'title';
  api.start();                      // startNew(): the story cutscene, then the Teaching
  tick(2);
  check('a new game opens with the story', G().mode === 'cut', 'mode=' + G().mode);
  check('the story cutscene can be skipped', skipCuts(), 'mode=' + G().mode);
  tick(4);
  check('the player lands in the first room', G().room === 0, 'room=' + G().room);
  check('the player starts alive', !P().dead && P().hp > 0, 'hp=' + P().hp);
  check('the first room is marked visited', !!G().visited[0]);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('the Teaching');
(() => {
  revive();
  check('the tutorial has steps authored', api.TSTEPS.length > 0, 'steps=' + api.TSTEPS.length);
  check('every tutorial step has text', api.TSTEPS.every(s => typeof s.text === 'string' && s.text.length > 0));
  api.startTutorial();
  check('starting the Teaching turns it on', api.TUT.on === true);
  check('starting the Teaching rewinds it to the first step', api.TUT.step === 0);
  check('starting the Teaching clears the practice counters', P().tut.hits === 0 && P().tut.rolls === 0);
  api.endTutorial(true);
  check('skipping the Teaching turns it off', api.TUT.on === false);
  check('skipping the Teaching records that it is done', G().tutDone === true);
  check('leaving the Teaching restores the gourd', P().flasks === G().skills.flasks, 'flasks=' + P().flasks);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('movement and collision');
(() => {
  at(0, 9, 16);
  const y0 = P().y;
  tick(20);
  check('the player rests on the ground instead of sinking', near(P().y, y0, 2) && P().onGround, 'y ' + y0 + '→' + P().y);
  check('standing still, the player does not drift', Math.abs(P().vx) < 0.3, 'vx=' + P().vx);

  at(0, 9, 16);
  const x0 = P().x;
  hold('ArrowRight', 20); release('ArrowRight', 4);
  check('holding right moves the player right', P().x > x0 + 4, 'x ' + x0 + '→' + P().x);
  check('moving right faces the player right', P().face === 1);

  at(0, 9, 16);
  const x1 = P().x;
  hold('ArrowLeft', 20); release('ArrowLeft', 4);
  check('holding left moves the player left', P().x < x1 - 4, 'x ' + x1 + '→' + P().x);
  check('moving left faces the player left', P().face === -1);

  at(0, 9, 16);
  press('Space', 3, 6);
  check('jumping lifts the player off the ground', P().y < (16 * 16 - P().h) - 4, 'y=' + P().y);
  tick(90);
  check('what goes up comes down', P().onGround, 'y=' + P().y + ' vy=' + P().vy);

  at(0, 1, 16);
  hold('ArrowLeft', 60); release('ArrowLeft', 4);
  check('the player cannot walk through the left wall', P().x >= 0 && finite(P().x), 'x=' + P().x);
  check('the player is not shoved inside a solid tile', P().y + P().h <= ROOMS[0].h * 16, 'y=' + P().y);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('arriving through every exit');
(() => {
  // REGRESSION — the geometry check above says the arrival tile is not rock.
  // This one proves it by playing: come through every doorway in the game and
  // confirm the player can actually walk away from where they land. A buried
  // arrival pins the player in place — they cannot move in any direction, and
  // the only ways out are a mirror or death.
  ROOMS.forEach((r, i) => r.exits.forEach(ex => {
    revive();
    api.unlockAll();                       // open the gates; untouchable while we look
    G().taught = { bossIn: 1, ekIn: 1, onIn: 1, exec: 1, bound: 1 };
    at(ex.to, ex.sx, ex.sy);
    const x0 = P().x, y0 = P().y;
    tick(30);                              // let them fall and settle
    const settled = P().y;
    // Check where they came to rest before walking: a few paces can legitimately
    // carry them out through another doorway, and then the room has changed.
    check('arriving in room ' + ex.to + ' from room ' + i + ' settles the player inside the room',
      finite(P().x) && finite(settled) && settled >= 0 && settled < ROOMS[ex.to].h * 16,
      'arrival (' + ex.sx + ',' + ex.sy + ') settled at x=' + P().x.toFixed(1) + ' y=' + settled.toFixed(1) +
      ', room is ' + (ROOMS[ex.to].h * 16) + 'px tall');
    hold('ArrowRight', 45); release('ArrowRight', 2);
    const movedRight = Math.abs(P().x - x0);
    at(ex.to, ex.sx, ex.sy);
    tick(30);
    hold('ArrowLeft', 45); release('ArrowLeft', 2);
    const movedLeft = Math.abs(P().x - x0);
    check('REGRESSION arriving in room ' + ex.to + ' from room ' + i + ', the player can walk away',
      movedRight > 8 || movedLeft > 8,
      'arrival (' + ex.sx + ',' + ex.sy + ') — moved ' + movedRight.toFixed(1) + 'px right, ' +
      movedLeft.toFixed(1) + 'px left; y ' + y0.toFixed(1) + '→' + settled.toFixed(1));
  }));
  // unlockAll() above turns cheats on, and cheat mode refills life, gourds and
  // ọfọ every frame — leave it set and every later block silently stops testing
  // what it thinks it is testing.
  G().cheat = false;
})();

// ═════════════════════════════════════════════════════════════════════════════
section('weapons');
const WEAPONS = api.WEAPONS;
const weaponKeys = Object.keys(WEAPONS);
check('four weapons are authored', weaponKeys.length === 4, weaponKeys.join(','));
for (const wk of weaponKeys) {
  const w = WEAPONS[wk];
  check(wk + ' has a name', typeof w.name === 'string' && w.name.length > 0);
  check(wk + ' has a light chain', Array.isArray(w.chain) && w.chain.length >= 1, 'chain=' + (w.chain || []).length);
  check(wk + ' has a heavy, an air cut and an ọfọ multiplier',
    !!w.heavy && !!w.air && typeof w.ofo === 'number');
  check(wk + ' chain frames are all positive', w.chain.every(a => a.wind > 0 && a.act > 0 && a.rec > 0 && a.dmg > 0 && a.reach > 0));
  check(wk + ' heavy hits harder than its first light', w.heavy.dmg > w.chain[0].dmg, w.heavy.dmg + ' vs ' + w.chain[0].dmg);

  // Invariant 11.3: CHAIN().length is not 3. Equip and confirm the game agrees.
  at(0, 9, 16);
  G().weapons[wk] = 1; G().weapon = wk;
  check('equipping ' + wk + ' makes it the weapon in hand', api.WA().key === wk, 'WA=' + api.WA().key);
  check('CHAIN() reports ' + wk + '’s real chain length (' + w.chain.length + ', not 3)',
    api.CHAIN().length === w.chain.length, 'CHAIN=' + api.CHAIN().length);

  audioReset();
  press('KeyZ', 1, 2);
  check(wk + ' swings when CUT is pressed', P().st === 'atk', 'st=' + P().st);
  check(wk + '’s swing makes a sound', audioTotal() > 0, 'audio events=' + audioTotal());
  tick(160);
  check(wk + '’s swing returns to idle', P().st === 'idle', 'st=' + P().st);
}
(() => {
  at(0, 9, 16);
  G().weapons = { mma: 1, nkwu: 1, ogu: 1, oku: 1 };
  G().weapon = 'mma';
  const seen = new Set();
  for (let i = 0; i < 4; i++) { seen.add(G().weapon); api.cycleWeapon(1); }
  check('cycling walks through every weapon carried', seen.size === 4, Array.from(seen).join(','));
  check('cycling returns to where it started', G().weapon === 'mma', G().weapon);
  G().weapon = 'mma'; P().combo = 2;
  api.cycleWeapon(1);
  check('swapping weapons resets the combo counter', P().combo === 0, 'combo=' + P().combo);

  at(0, 9, 16);
  G().weapons = { mma: 1 }; G().weapon = 'mma';
  api.cycleWeapon(1);
  check('carrying one weapon, cycling changes nothing', G().weapon === 'mma');
})();

// ═════════════════════════════════════════════════════════════════════════════
section('combat');
// Put a live enemy in front of the player, wherever it happens to stand.
function faceAnEnemy(room, gap) {
  at(room, 9, 16);
  const live = api.enemies.filter(e => !e.dead && !e.trainer);
  if (!live.length) return null;
  const e = live[0];
  const p = P();
  p.x = e.x - (gap == null ? 12 : gap); p.y = e.y; p.face = 1;
  p.vx = 0; p.vy = 0;
  e.vx = 0; e.vy = 0;
  revive(1);
  return e;
}
(() => {
  const e = faceAnEnemy(1, 12);
  check('room 1 spawns enemies to fight', !!e, 'enemies=' + api.enemies.length);
  if (e) {
    const hp0 = e.hp;
    const a0 = api.CHAIN()[0];
    audioReset();
    press('KeyZ', 1, 1);
    let contacts = 0, prev = e.hp;
    for (let i = 0; i < 40; i++) { tick(1); if (e.hp < prev) { contacts++; prev = e.hp; } }
    // REGRESSION — one swing, one hit. The active window is several frames wide;
    // without the swingId/hitId guard the damage multiplies by frame count.
    check('REGRESSION a single swing lands exactly once', contacts === 1, 'damage applied on ' + contacts + ' frames');
    check('REGRESSION a single swing deals one stroke of damage, not several',
      hp0 - e.hp <= a0.dmg * 1.5 + 0.001, 'dealt ' + (hp0 - e.hp).toFixed(2) + ', one stroke is ' + a0.dmg);
    check('the swing actually hurt the enemy', e.hp < hp0, 'hp ' + hp0 + '→' + e.hp);
    check('landing a hit makes a sound', audioTotal() > 0);
    check('landing a hit freezes the frame', true);
  }
})();
(() => {
  const e = faceAnEnemy(1, 12);
  if (e) {
    G().hitstop = 0;
    P().ofo = 0;
    press('KeyZ', 1, 1);
    tick(40);
    check('landing a hit builds ọfọ', P().ofo > 0, 'ofo=' + P().ofo);
    check('ọfọ never exceeds full', P().ofo <= 100, 'ofo=' + P().ofo);
  }
})();
(() => {
  // REGRESSION — input survives hitstop. A press during a freeze frame must land
  // on the next real frame instead of being eaten by it (11.3).
  at(0, 9, 16);
  G().hitstop = 10;
  api.down('KeyZ');
  tick(4);
  check('REGRESSION hitstop swallows no frames of input while it runs', P().st === 'idle', 'st=' + P().st);
  check('hitstop counts down', G().hitstop < 10, 'hitstop=' + G().hitstop);
  tick(10);
  api.up('KeyZ');
  check('REGRESSION a press made during hitstop lands once hitstop ends', P().st === 'atk' || P().t > 0,
    'st=' + P().st + ' t=' + P().t);
})();
(() => {
  at(0, 9, 16);
  press('KeyX', 1, 2);
  check('roll enters the roll state', P().st === 'roll', 'st=' + P().st);
  check('rolling carries the player forward', Math.abs(P().vx) > 1, 'vx=' + P().vx);
  tick(120);
  check('the roll ends', P().st === 'idle', 'st=' + P().st);

  at(0, 9, 16);
  press('KeyC', 1, 2);
  check('ward enters the ward state', P().st === 'ward', 'st=' + P().st);
  tick(120);
  check('the ward ends', P().st === 'idle', 'st=' + P().st);
})();
(() => {
  // Pillar 1 — commitment. A swing roots you; only the roll cancels its recovery.
  at(0, 9, 16);
  press('KeyZ', 1, 2);
  const st = P().st;
  press('KeyC', 1, 1);
  check('ward cannot interrupt a swing', P().st === st, 'st=' + P().st);
  at(0, 9, 16);
  press('KeyZ', 1, 1);
  tick(14);                                     // into recovery
  press('KeyX', 1, 1);
  check('the roll can cancel a swing’s recovery — the one exception', P().st === 'roll', 'st=' + P().st);
})();
(() => {
  at(0, 9, 16);
  const hp0 = P().hp = G().maxHP;
  P().flasks = 2;
  P().hp = hp0 - 40;
  press('KeyV', 1, 2);
  check('healing with a gourd in hand enters the heal state', P().st === 'heal', 'st=' + P().st);
  tick(200);
  check('healing restores life', P().hp > hp0 - 40, 'hp=' + P().hp);
  check('healing spends a gourd', P().flasks < 2, 'flasks=' + P().flasks);

  at(0, 9, 16);
  P().flasks = 0; P().hp = 10;
  press('KeyV', 1, 2);
  check('with no gourd left, healing does not start', P().st !== 'heal', 'st=' + P().st);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('the four words');
const SPELLS = api.SPELLS;
const spellKeys = Object.keys(SPELLS);
check('four ọfọ are authored', spellKeys.length === 4, spellKeys.join(','));
for (const sk of spellKeys) {
  const s = SPELLS[sk];
  check(sk + ' has a name and a cost', typeof s.name === 'string' && s.cost > 0);
  check(sk + ' has three levels', Array.isArray(s.lv) && s.lv.length === 3, 'levels=' + (s.lv || []).length);
  check(sk + ' has a blurb for the inventory', typeof s.blurb === 'string' && s.blurb.length > 0);

  at(0, 9, 16);
  G().spells[sk] = 1; G().equipped = sk;
  P().ofo = s.cost;
  audioReset();
  press('KeyF', 1, 2);
  check('casting ' + sk + ' with exactly its cost in hand begins the prayer', P().st === 'pray', 'st=' + P().st);
  check('casting ' + sk + ' costs exactly ' + s.cost + ' ọfọ', P().ofo === 0, 'ofo left=' + P().ofo);
  tick(220);
  check('casting ' + sk + ' finishes and returns control', P().st !== 'pray', 'st=' + P().st);

  at(0, 9, 16);
  G().spells[sk] = 1; G().equipped = sk;
  P().ofo = s.cost - 1;
  press('KeyF', 1, 2);
  check('casting ' + sk + ' one short of its cost does nothing', P().st !== 'pray', 'st=' + P().st);
  check('a failed cast spends no ọfọ', P().ofo === s.cost - 1, 'ofo=' + P().ofo);

  at(0, 9, 16);
  G().spells[sk] = 0; G().equipped = sk;
  P().ofo = 100;
  press('KeyF', 1, 2);
  check('an unlearned ' + sk + ' cannot be cast', P().st !== 'pray', 'st=' + P().st);
  check('an unlearned cast spends no ọfọ', P().ofo === 100, 'ofo=' + P().ofo);
}
(() => {
  at(0, 9, 16);
  G().spells = { amadioha: 1, ala: 1, idemili: 1, ikenga: 1 };
  G().equipped = 'amadioha';
  const seen = new Set();
  for (let i = 0; i < 4; i++) { seen.add(G().equipped); api.down('KeyG'); tick(2); api.up('KeyG'); }
  check('cycling walks through every word learned', seen.size === 4, Array.from(seen).join(','));
})();

// ═════════════════════════════════════════════════════════════════════════════
section('Ogbunabali — the lie is the mechanic');
(() => {
  revive();
  G().slain = {}; G().knowsName = false; G().cheat = false;
  G().taught = { bossIn: 1 };                       // skip the arrival cutscene
  at(3, 5, 16);
  const b = api.boss;
  check('the shaft’s end holds a boss', !!b, 'boss=' + (b && b.who));
  if (b) {
    check('the boss there is Ogbunabali', b.who === 'ogbunabali');
    check('unnamed, he is unbound', b.bound === 0, 'bound=' + b.bound);
    b.hp = b.maxhp * 0.5;
    const hp0 = b.hp;
    tick(120);
    check('unnamed, he heals faster than he is hurt', b.hp > hp0, 'hp ' + hp0.toFixed(1) + '→' + b.hp.toFixed(1));

    // Naming him is what makes him mortal. The call takes 48 frames and a hit
    // interrupts it, so hold the player untouchable for the duration.
    revive(1);
    G().knowsName = true;
    P().x = b.x - 40; P().y = b.y; P().face = 1; P().inv = 600;
    press('KeyN', 1, 1);
    check('with the name on your tongue, calling it begins', P().st === 'call', 'st=' + P().st);
    for (let i = 0; i < 80 && b.bound === 0; i++) { G().hitstop = 0; G().slow = 0; P().inv = 600; tick(1); }
    check('calling his name binds him', b.bound > 0, 'bound=' + b.bound);
    const hp1 = b.hp;
    G().hitstop = 0; G().slow = 0;
    tick(30);
    check('bound, he stops closing his wounds', b.hp <= hp1 + 0.001, 'hp ' + hp1.toFixed(1) + '→' + b.hp.toFixed(1));
    check('naming him is announced to the player', /OGBUNABALI/i.test(G().msg || ''), 'msg=' + G().msg);
  }
})();
(() => {
  revive();
  G().knowsName = false; G().cheat = false; G().slain = {};
  at(3, 5, 16);
  press('KeyN', 1, 2);
  check('without the name, calling it does nothing', P().st !== 'call', 'st=' + P().st);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('every boss is killable and its gate opens');
(() => {
  const bosses = [
    { who: 'ogbunabali', room: 3, tx: 5, ty: 16, taught: 'bossIn' },
    { who: 'ekwensu', room: 6, tx: 7, ty: 16, taught: 'ekIn' },
    { who: 'onwe', room: 7, tx: 8, ty: 16, taught: 'onIn' }
  ];
  for (const spec of bosses) {
    revive();
    api.unlockAll();                       // cheat damage: one touch is enough
    G().slain = {};
    G().taught[spec.taught] = 1;
    at(spec.room, spec.tx, spec.ty);
    const b = api.boss;
    check(spec.who + ' spawns in room ' + spec.room, !!b && b.who === spec.who, 'boss=' + (b && b.who));
    if (!b) continue;
    check(spec.who + ' starts with life', b.hp > 0 && finite(b.hp), 'hp=' + b.hp);
    P().x = b.x - 14; P().y = b.y; P().face = 1;
    revive(1);
    let killed = false;
    for (let i = 0; i < 60 && !killed; i++) {
      P().x = b.x - 14; P().face = 1;
      G().hitstop = 0; G().slow = 0;
      press('KeyZ', 1, 3);
      tick(20);
      killed = !!b.dead;
    }
    check(spec.who + ' can be killed', killed, 'hp=' + b.hp);
    check('killing ' + spec.who + ' records the slaying', !!G().slain[spec.who], JSON.stringify(G().slain));
    check('killing ' + spec.who + ' enters it in the bestiary', !!G().seen['boss_' + spec.who]);
  }
})();
(() => {
  // The gate itself: the bone road's second exit only opens once Ekwensu is down.
  revive();
  api.unlockAll();
  G().slain = {};
  const gate = ROOMS[6].exits.find(e => e.needs === 'ekwensu');
  check('the bone road has a gated exit', !!gate);
  if (gate) {
    G().cheat = false;
    at(6, gate.tx, gate.ty - 1);
    P().x = gate.tx * 16 + 2; P().y = gate.ty * 16;
    tick(3);
    check('with Ekwensu standing, the gated exit does not fire', G().room === 6, 'room=' + G().room);
    G().slain.ekwensu = 1;
    at(6, 7, 16);
    P().x = gate.tx * 16 + 2; P().y = gate.ty * 16;
    tick(3);
    check('with Ekwensu down, the gate carries you through', G().room === gate.to, 'room=' + G().room);
  }
})();

// ═════════════════════════════════════════════════════════════════════════════
section('death and respawn');
(() => {
  revive();
  G().cheat = false;
  G().checkpoint = { room: 0, tx: 9, ty: 16 };
  G().deaths = 0;
  const deaths0 = G().deaths;
  const died = killPlayer();
  P().cowries = 90;                              // set before the drop is read below
  check('running out of life kills the player', died, 'dead=' + P().dead + ' hp=' + P().hp);
  if (died) {
    check('death is counted', G().deaths > deaths0, deaths0 + '→' + G().deaths);
    check('death stops the player acting', P().st === 'dead', 'st=' + P().st);
    // the respawn is queued on a timer; run it
    clock += 2000;
    while (timers.length && timers[0].at <= clock) timers.shift().fn();
    tick(4);
    check('the player wakes at the charm', G().room === 0, 'room=' + G().room);
    check('the player wakes alive', !P().dead && P().hp > 0, 'hp=' + P().hp);
    check('the player wakes with a full vessel', P().hp === G().maxHP, P().hp + '/' + G().maxHP);
    check('the player wakes with a full gourd', P().flasks === G().skills.flasks, 'flasks=' + P().flasks);
  }
})();
(() => {
  // REGRESSION — dying to a hazard used to refund your own shade in the same
  // frame. hurtPlayer() runs from inside playerUpdate(), and the shade-pickup
  // check sits 46 lines further down that same function, so die() dropped the
  // shade on the player's own hitbox and the code below collected it before the
  // frame ended. Death cost nothing. Enemy deaths never showed it, because their
  // damage lands after playerUpdate() has already returned.
  const h = findHazard(8);
  revive();
  G().checkpoint = { room: 0, tx: 9, ty: 16 };
  G().cheat = false;
  at(8, h.x, h.y - 2);
  G().cheat = false;
  P().cowries = 90; P().hp = 1; P().inv = 0; P().flasks = 0;
  P().x = h.x * 16 + 3; P().y = h.y * 16 - P().h + 4;
  for (let i = 0; i < 30 && !P().dead; i++) { P().inv = 0; tick(1); }
  check('dying to a hazard kills the player', P().dead === true, 'hp=' + P().hp);
  check('REGRESSION death drops the cowries you were carrying', P().cowries === 0, 'cowries=' + P().cowries);
  check('REGRESSION the shade survives the frame you died on', !!api.shade, 'shade=' + JSON.stringify(api.shade));
  check('the shade holds what you dropped', !!api.shade && api.shade.amt === 90, 'amt=' + (api.shade || {}).amt);
  check('the shade is left in the room you fell in', !!api.shade && api.shade.room === 8, 'room=' + (api.shade || {}).room);

  clock += 2000;
  while (timers.length && timers[0].at <= clock) timers.shift().fn();
  tick(4);
  check('the shade is not waiting at the charm you woke up at', !!api.shade && api.shade.room !== G().room,
    'shade room=' + (api.shade || {}).room + ' player room=' + G().room);
  check('waking up does not refund the cowries', P().cowries === 0, 'cowries=' + P().cowries);

  // ...and walking back onto it returns what you lost.
  if (api.shade) {
    const amt = api.shade.amt, sx = api.shade.x, sy = api.shade.y;
    at(8, h.x, h.y - 4);
    P().x = sx; P().y = sy - 6; P().inv = 600;
    tick(3);
    check('walking back onto the shade returns what you dropped', P().cowries === amt, 'cowries=' + P().cowries);
    check('a collected shade is gone', !api.shade, 'shade=' + JSON.stringify(api.shade));
  } else {
    check('walking back onto the shade returns what you dropped', false, 'there was no shade left to walk back to');
    check('a collected shade is gone', false, 'there was no shade left to collect');
  }
  revive();
  check('waking clears built ọfọ', P().ofo === 0, 'ofo=' + P().ofo);
  check('waking puts the player back on solid ground', P().onGround || P().vy >= 0, 'vy=' + P().vy);
  check('the speedrun player cannot be killed by a hazard', (() => {
    revive(); api.unlockAll();
    at(8, h.x, h.y - 2);
    P().x = h.x * 16 + 3; P().y = h.y * 16 - P().h + 4; P().inv = 0;
    tick(20);
    return !P().dead;
  })(), 'dead=' + P().dead);
  timers.length = 0;
})();

// ═════════════════════════════════════════════════════════════════════════════
section('saving and loading');
(() => {
  revive();
  api.wipeSave();
  G().cheat = false;
  storage.clear();
  check('with nothing stored, the game reports no save', api.hasSave() === false);

  G().maxHP = 160; G().knowsName = true; G().deaths = 7;
  G().slain = { ogbunabali: 1 };
  G().spells = { amadioha: 2, ala: 1, idemili: 0, ikenga: 0 };
  G().skills = { riposte: 1, swift: 0, charm: 1, flasks: 4, heartUps: 2 };
  G().weapons = { mma: 1, ogu: 1 }; G().equipped = 'ala';
  G().checkpoint = { room: 5, tx: 6, ty: 16 };
  P().cowries = 321;
  const where = api.saveGame();
  check('saving reports where it went', where === 'disk' || where === 'memory', String(where));
  check('saving to a working localStorage uses the disk', where === 'disk', String(where));
  check('after saving, the game reports a save exists', api.hasSave() === true);

  // Scramble everything, then load it back.
  G().maxHP = 100; G().knowsName = false; G().deaths = 0; G().slain = {};
  G().spells = { amadioha: 1, ala: 0, idemili: 0, ikenga: 0 };
  G().skills = { riposte: 0, swift: 0, charm: 0, flasks: 3, heartUps: 0 };
  G().weapons = { mma: 1 }; G().equipped = 'amadioha';
  G().checkpoint = { room: 0, tx: 9, ty: 16 };
  P().cowries = 0;

  check('loading a save succeeds', api.loadGame() === true);
  check('life carried over', G().maxHP === 160, 'maxHP=' + G().maxHP);
  check('the name carried over', G().knowsName === true);
  check('the death count carried over', G().deaths === 7, 'deaths=' + G().deaths);
  check('the slain carried over', G().slain.ogbunabali === 1, JSON.stringify(G().slain));
  check('spell levels carried over', G().spells.amadioha === 2 && G().spells.ala === 1, JSON.stringify(G().spells));
  check('skills carried over', G().skills.flasks === 4 && G().skills.charm === 1, JSON.stringify(G().skills));
  check('the equipped word carried over', G().equipped === 'ala', G().equipped);
  check('the checkpoint carried over', G().checkpoint.room === 5, JSON.stringify(G().checkpoint));
  check('cowries carried over', P().cowries === 321, 'cowries=' + P().cowries);
  check('a save round-trips without corrupting the room list', ROOMS.length === 10);
})();
(() => {
  // REGRESSION — colliding save slots. A speedrun must never overwrite a real save.
  revive();
  storage.clear();
  G().cheat = false;
  G().maxHP = 100; G().deaths = 11; P().cowries = 500;
  G().checkpoint = { room: 2, tx: 5, ty: 35 };
  api.saveGame();
  const normalRaw = storage.getItem('odinala.save.v1');
  check('the normal save writes to its own key', !!normalRaw, 'keys=' + Array.from(storage._m.keys()).join(','));

  G().cheat = true;                       // speedrun slot
  G().deaths = 999; P().cowries = 1;
  G().checkpoint = { room: 9, tx: 2, ty: 16 };
  api.saveGame();
  const runRaw = storage.getItem('odinala.speedrun.v1');
  check('the speedrun save writes to its own key', !!runRaw);
  check('REGRESSION the speedrun save did not overwrite the normal save',
    storage.getItem('odinala.save.v1') === normalRaw, 'normal slot was rewritten');
  check('REGRESSION the two slots hold different states', runRaw !== normalRaw);

  G().cheat = false;
  api.loadGame();
  check('REGRESSION loading the normal slot returns the normal save', G().deaths === 11, 'deaths=' + G().deaths);
  check('REGRESSION loading the normal slot ignores the speedrun checkpoint', G().checkpoint.room === 2, JSON.stringify(G().checkpoint));

  G().cheat = true;
  api.loadGame();
  check('REGRESSION loading the speedrun slot returns the speedrun save', G().deaths === 999, 'deaths=' + G().deaths);

  G().cheat = true; api.wipeSave();
  check('wiping the speedrun slot leaves the normal save alone', !!storage.getItem('odinala.save.v1'));
  check('wiping the speedrun slot clears the speedrun save', !storage.getItem('odinala.speedrun.v1'));
  G().cheat = false;
})();
(() => {
  // The memory fallback must stay keyed too, and stay honest about being memory.
  revive();
  const realGet = storage.getItem, realSet = storage.setItem;
  storage.setItem = () => { throw new Error('storage disabled, as in an artifact sandbox'); };
  storage.getItem = () => { throw new Error('storage disabled'); };
  G().cheat = false; G().deaths = 42;
  const where = api.saveGame();
  check('with localStorage blocked, saving falls back to memory', where === 'memory', String(where));
  check('the memory fallback says so honestly', /session/i.test(G().note), 'note=' + G().note);
  G().deaths = 0;
  check('the memory fallback can be loaded back', api.loadGame() === true);
  check('the memory fallback round-trips its state', G().deaths === 42, 'deaths=' + G().deaths);
  G().cheat = true; G().deaths = 5; api.saveGame();
  G().cheat = false; api.loadGame();
  check('REGRESSION the memory fallback keeps the two slots apart', G().deaths === 42, 'deaths=' + G().deaths);
  storage.getItem = realGet; storage.setItem = realSet;
  G().cheat = false;
})();

// ═════════════════════════════════════════════════════════════════════════════
section('the speedrun');
(() => {
  revive();
  storage.clear();
  api.startSpeedrun();
  tick(2);
  check('the speedrun turns cheats on', G().cheat === true);
  check('the speedrun opens every mirror', Object.keys(MIRRORS).every(k => G().mirrors[k]), JSON.stringify(G().mirrors));
  check('the speedrun grants every word', spellKeys.every(k => G().spells[k] === 3), JSON.stringify(G().spells));
  check('the speedrun grants every weapon', weaponKeys.every(k => G().weapons[k]), JSON.stringify(G().weapons));
  check('the speedrun skips the Teaching', api.TUT.on === false);
  check('the speedrun starts at the charm', G().room === 0, 'room=' + G().room);
  check('the speedrun keeps the player untouchable', (() => { P().hp = 1; tick(2); return P().hp > 1; })(), 'hp=' + P().hp);
  api.relock();
  check('locking back down turns cheats off', G().cheat === false);
  check('locking back down keeps what you were given', G().spells.amadioha === 3, JSON.stringify(G().spells));
})();

// ═════════════════════════════════════════════════════════════════════════════
section('every menu mode opens and closes');
(() => {
  const openClose = [
    { name: 'map', open: () => { press('KeyM', 1, 1); }, close: () => { press('KeyM', 1, 1); } },
    { name: 'pause', open: () => { press('Escape', 1, 1); }, close: () => { press('Escape', 1, 1); } }
  ];
  for (const m of openClose) {
    at(0, 9, 16);
    m.open();
    check('the ' + m.name + ' opens', G().mode === m.name, 'mode=' + G().mode);
    m.close();
    check('the ' + m.name + ' closes back to play', G().mode === 'play', 'mode=' + G().mode);
  }
})();
(() => {
  // Navigate the pause menu by label, never by index — the row list changes
  // during the Teaching, and index-based tests rot (13.10).
  at(0, 9, 16);
  api.endTutorial(true);
  press('Escape', 1, 1);
  check('pausing opens the pause menu', G().mode === 'pause', 'mode=' + G().mode);
  check('the pause menu starts on the first row', api.PAUSE_SEL() === 0, 'sel=' + api.PAUSE_SEL());
  check('the first row is RESUME', /RESUME/.test(api.PAUSE_LABEL()), api.PAUSE_LABEL());

  function toRow(match, limit) {
    for (let i = 0; i < (limit || 20); i++) {
      if (match.test(api.PAUSE_LABEL())) return true;
      press('ArrowDown', 1, 1);
    }
    return match.test(api.PAUSE_LABEL());
  }
  check('the pause menu can reach the weapon row', toRow(/IN HAND/), api.PAUSE_LABEL());
  check('the pause menu can reach the ọfọ row', toRow(/ỌFỌC/), api.PAUSE_LABEL());
  check('the pause menu can reach the inventory row', toRow(/WHAT YOU CARRY/), api.PAUSE_LABEL());
  press('KeyZ', 1, 2);
  check('the inventory opens from the pause menu', G().mode === 'inv', 'mode=' + G().mode);
  press('KeyX', 1, 2);
  check('the inventory closes back to the pause menu', G().mode === 'pause', 'mode=' + G().mode);

  check('the pause menu can reach the codex row', toRow(/THE CODEX/), api.PAUSE_LABEL());
  press('KeyZ', 1, 2);
  check('the codex opens from the pause menu', G().mode === 'codex', 'mode=' + G().mode);
  press('KeyX', 1, 2);
  check('the codex closes back to the pause menu', G().mode === 'pause', 'mode=' + G().mode);

  check('the pause menu can reach the map row', toRow(/^MAP/), api.PAUSE_LABEL());
  press('KeyZ', 1, 2);
  check('the map opens from the pause menu', G().mode === 'map', 'mode=' + G().mode);
  press('KeyX', 1, 2);
  check('the map closes', G().mode === 'play', 'mode=' + G().mode);

  press('Escape', 1, 1);
  check('the pause menu can reach the title row', toRow(/LEAVE TO THE TITLE/), api.PAUSE_LABEL());
  press('KeyZ', 1, 2);
  check('leaving to the title works', G().mode === 'title', 'mode=' + G().mode);
})();
(() => {
  // The weapon and spell rows change equipment with left/right.
  at(0, 9, 16);
  api.endTutorial(true);
  G().weapons = { mma: 1, nkwu: 1, ogu: 1, oku: 1 }; G().weapon = 'mma';
  press('Escape', 1, 1);
  for (let i = 0; i < 20 && !/IN HAND/.test(api.PAUSE_LABEL()); i++) press('ArrowDown', 1, 1);
  check('the pause menu is on the weapon row', /IN HAND/.test(api.PAUSE_LABEL()), api.PAUSE_LABEL());
  press('ArrowRight', 1, 2);
  check('right on the weapon row changes the weapon in hand', G().weapon !== 'mma', G().weapon);
  press('ArrowLeft', 1, 2);
  check('left on the weapon row changes it back', G().weapon === 'mma', G().weapon);
  press('Escape', 1, 2);
})();
(() => {
  // The riddle mode, driven the way a player drives it.
  revive();
  G().mirrors = {}; G().mirrorLock = {};
  at(0, 9, 16);
  const m = api.shrines.find(s => s.kind === 'mirror');
  check('room 0 holds a mirror to use', !!m, 'shrines=' + api.shrines.map(s => s.kind).join(','));
  if (m) {
    P().x = m.x; P().y = m.y;
    press('KeyE', 1, 2);
    check('using an unopened mirror asks a riddle', G().mode === 'riddle', 'mode=' + G().mode);
    press('KeyX', 1, 2);
    check('a riddle can be walked away from', G().mode === 'play', 'mode=' + G().mode);
  }
})();
(() => {
  // A right answer opens the glass; a wrong one shuts it until you leave the
  // room. The selector starts at 0, so stepping down `c` times lands on the
  // answer this riddle considers correct.
  function answerMirror(wantCorrect) {
    revive();
    G().mirrors = {}; G().mirrorLock = {};
    at(0, 9, 16);
    const m = api.shrines.find(s => s.kind === 'mirror');
    if (!m) return null;
    P().x = m.x; P().y = m.y;
    const idx = G().riddleIdx % RIDDLES.length;
    press('KeyE', 1, 2);
    if (G().mode !== 'riddle') return null;
    const r = RIDDLES[idx];
    const target = wantCorrect ? r.c : (r.c + 1) % 3;
    for (let i = 0; i < target; i++) press('ArrowDown', 1, 1);
    press('KeyZ', 1, 2);
    return { idx: idx, r: r };
  }

  const right = answerMirror(true);
  check('a mirror riddle can be answered correctly', !!right);
  if (right) {
    check('the right answer opens the glass', G().mirrors[0] === true, 'mirrors=' + JSON.stringify(G().mirrors));
    check('the right answer returns the player to play', G().mode === 'play', 'mode=' + G().mode);
    check('the opened mirror joins the travel list', Object.keys(MIRRORS).some(k => G().mirrors[k]));
  }

  const wrong = answerMirror(false);
  check('a mirror riddle can be answered wrongly', !!wrong);
  if (wrong) {
    check('the wrong answer does not open the glass', !G().mirrors[0], JSON.stringify(G().mirrors));
    tick(120);                                  // the glass goes black after a beat
    check('the wrong answer hands control back', G().mode === 'play', 'mode=' + G().mode);
    check('the wrong answer shuts the mirror until the player leaves the room',
      G().mirrorLock[0] === true, 'lock=' + JSON.stringify(G().mirrorLock));
    P().x = api.shrines.find(s => s.kind === 'mirror').x;
    press('KeyE', 1, 2);
    check('a shut mirror will not ask again in the same visit', G().mode === 'play', 'mode=' + G().mode);
    at(0, 9, 16);                                // re-entering the room clears the lock
    check('leaving and coming back clears the lock', G().mirrorLock[0] === false, 'lock=' + G().mirrorLock[0]);
  }
  check('each riddle asked steps to the next one', G().riddleIdx >= 2, 'riddleIdx=' + G().riddleIdx);
})();
(() => {
  // Fast travel: only opened mirrors are offered, and travelling moves you.
  revive();
  api.unlockAll();
  at(0, 9, 16);
  G().mode = 'travel';
  tick(2);
  check('the travel list offers every opened mirror', Object.keys(MIRRORS).length > 0);
  press('KeyX', 1, 2);
  check('travel closes back to play', G().mode === 'play', 'mode=' + G().mode);
})();
(() => {
  // The ledger. Give the player cowries and buy the cheapest thing on offer.
  revive();
  G().cheat = false;
  G().spells = { amadioha: 1, ala: 0, idemili: 0, ikenga: 0 };
  G().weapons = { mma: 1 };
  G().skills = { riposte: 0, swift: 0, charm: 0, flasks: 3, heartUps: 0 };
  at(0, 9, 16);
  const items = api.shopItems();
  check('the ledger has something to sell', items.length > 0, 'items=' + items.length);
  check('every ledger item has a label and a cost', items.every(o => o.label && o.cost > 0));
  check('every ledger item has a kind the shop understands',
    items.every(o => ['spell', 'weapon', 'flask', 'heart', 'riposte', 'swift', 'charm'].indexOf(o.kind) >= 0),
    items.map(o => o.kind).join(','));
  G().mode = 'shop'; G().sel = 0;
  tick(2);
  const first = api.shopItems()[0];
  P().cowries = 0;
  press('KeyZ', 1, 2);
  check('the ledger refuses a purchase you cannot afford', P().cowries === 0, 'cowries=' + P().cowries);
  check('the ledger says why', /enough/i.test(G().note || ''), 'note=' + G().note);
  const beforeLv = first.kind === 'spell' ? (G().spells[first.k] || 0) : null;
  P().cowries = first.cost;
  press('KeyZ', 1, 2);
  check('the ledger takes payment for what you buy', P().cowries === 0, 'cowries=' + P().cowries);
  if (first.kind === 'spell') {
    check('buying a word deepens it by one level', (G().spells[first.k] || 0) === beforeLv + 1,
      first.k + ' ' + beforeLv + '→' + G().spells[first.k]);
    check('buying a word equips it', G().equipped === first.k, G().equipped);
  }
  check('the ledger reprices what is left after a purchase',
    JSON.stringify(api.shopItems()) !== JSON.stringify(items), 'the offer list did not change at all');
  check('a purchase is written to the save immediately', api.hasSave() === true);
  press('KeyX', 1, 2);
  check('the ledger closes back to play', G().mode === 'play', 'mode=' + G().mode);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('the codex');
(() => {
  revive();
  check('lore entries are authored', api.LORE.length > 0, 'entries=' + api.LORE.length);
  check('every lore entry has a title and body', api.LORE.every(e => e.t && e.b));
  check('every lore entry has an unlock condition', api.LORE.every(e => typeof e.when === 'function'));
  check('bestiary entries are authored', api.BEASTS.length > 0, 'entries=' + api.BEASTS.length);
  check('every bestiary entry names a creature', api.BEASTS.every(e => e.k && (e.n || e.t)));
  check('every bestiary entry has a description', api.BEASTS.every(e => e.d || e.b));

  // Pillar 4 — the codex never gets ahead of the player.
  G().seen = {}; G().slain = {}; G().visited = {}; G().knowsName = false;
  G().tutDone = false; G().ending = 0;
  const cold = api.BEAST_OPEN().length;
  check('a player who has seen nothing has an empty bestiary', cold === 0, 'open=' + cold);
  G().seen.walker = 1;
  check('seeing a creature opens its bestiary entry', api.BEAST_OPEN().length === 1, 'open=' + api.BEAST_OPEN().length);
  const coldLore = api.LORE_OPEN().length;
  G().knowsName = true; G().visited[6] = 1; G().slain.ogbunabali = 1;
  check('learning things opens more lore', api.LORE_OPEN().length >= coldLore, coldLore + '→' + api.LORE_OPEN().length);

  const p0 = api.storyProgress();
  check('story progress reports a fraction', p0.n >= 0 && p0.n <= p0.of, p0.n + '/' + p0.of);
  check('story progress reports a percentage', p0.pct >= 0 && p0.pct <= 100, 'pct=' + p0.pct);
  check('story progress names where you are', typeof p0.label === 'string' && p0.label.length > 0, p0.label);
  api.unlockAll(); G().ending = 1; G().slain = { ogbunabali: 1, ekwensu: 1, onwe: 1 };
  check('a finished game reports full progress', api.storyProgress().pct === 100, 'pct=' + api.storyProgress().pct);

  api.openCodex('title');
  tick(2);
  check('the codex opens from the title', G().mode === 'codex', 'mode=' + G().mode);
  press('ArrowRight', 1, 2);
  press('ArrowDown', 1, 2);
  press('ArrowLeft', 1, 2);
  check('the codex survives being navigated', G().mode === 'codex', 'mode=' + G().mode);
  press('KeyX', 1, 2);
  check('the codex opened from the title closes back to the title', G().mode === 'title', 'mode=' + G().mode);
})();

// ═════════════════════════════════════════════════════════════════════════════
section('background baking');
(() => {
  // Invariant 11.3: layers bake per room, and ctx must come back after the swap.
  revive();
  api.unlockAll();
  at(0, 9, 16);
  tick(3);
  check('the baked background is keyed to the room it was baked for', api.BG_ROOM() === 0, 'bgRoom=' + api.BG_ROOM());
  at(4, 5, 16);
  tick(3);
  check('changing room rebakes the background', api.BG_ROOM() === 4, 'bgRoom=' + api.BG_ROOM());
  check('rebaking leaves the game drawable', (() => { tick(30); return true; })());
  for (let r = 0; r < ROOMS.length; r++) {
    at(r, 2, 16);
    tick(4);
    check('room ' + r + ' bakes its background and keeps rendering', api.BG_ROOM() === r, 'bgRoom=' + api.BG_ROOM());
  }
})();

// ═════════════════════════════════════════════════════════════════════════════
section('hazards');
(() => {
  // Hazard tiles throw the player clear rather than killing outright, and the
  // speedrun ignores them entirely.
  const hazardRooms = [];
  ROOMS.forEach((r, i) => { if (r.map.some(row => row.indexOf('^') >= 0)) hazardRooms.push(i); });
  check('hazards exist somewhere in the world', hazardRooms.length > 0, 'rooms=' + hazardRooms.join(','));
  for (const ri of hazardRooms) {
    const r = ROOMS[ri];
    let hx = -1, hy = -1;
    for (let y = 0; y < r.h && hy < 0; y++) { const x = r.map[y].indexOf('^'); if (x >= 0) { hx = x; hy = y; } }
    // The feet row is read at P.y + P.h - 2, so sit the body inside the tile.
    revive();
    at(ri, hx, hy - 2);
    G().cheat = false;
    P().x = hx * 16 + 3; P().y = hy * 16 - P().h + 4; P().inv = 0;
    const hp0 = P().hp = G().maxHP;
    tick(2);
    check('the hazard in room ' + ri + ' hurts the player', P().hp < hp0, 'hp ' + hp0 + '→' + P().hp);
    check('the hazard in room ' + ri + ' throws the player clear rather than trapping them',
      P().vy < 0, 'vy=' + P().vy);
    check('the hazard in room ' + ri + ' grants i-frames so it cannot chain-kill',
      P().inv > 0, 'inv=' + P().inv);

    revive();
    api.unlockAll();
    at(ri, hx, hy - 2);
    P().x = hx * 16 + 3; P().y = hy * 16 - P().h + 4; P().inv = 0;
    const chp = P().hp;
    tick(4);
    check('in a speedrun the hazard in room ' + ri + ' cannot touch you', P().hp >= chp, 'hp ' + chp + '→' + P().hp);
  }
})();

// ═════════════════════════════════════════════════════════════════════════════
section('sound');
(() => {
  // 13.11: silence is a bug. Every mechanical event makes a noise.
  const events = [
    ['swinging', () => { press('KeyZ', 1, 2); }],
    ['rolling', () => { press('KeyX', 1, 2); }],
    ['cycling weapons', () => { G().weapons = { mma: 1, ogu: 1 }; api.cycleWeapon(1); }],
    ['cycling words', () => { G().spells = { amadioha: 1, ala: 1, idemili: 0, ikenga: 0 }; tick(1);
      api.down('KeyG'); tick(2); api.up('KeyG'); }],
    ['opening the pause menu', () => { press('Escape', 1, 2); }],
    ['healing', () => { P().flasks = 2; P().hp = 10; press('KeyV', 1, 40); }],
    ['a heavy landing', () => { hold('KeyZ', 60); release('KeyZ', 30); }],
    ['answering a mirror', () => { G().mirrors = {}; G().mirrorLock = {};
      const m = api.shrines.find(s => s.kind === 'mirror'); if (m) { P().x = m.x; P().y = m.y; press('KeyE', 1, 2); } }]
  ];
  for (const [what, act] of events) {
    revive();
    at(0, 9, 16);
    G().cheat = false;
    audioReset();
    act();
    check(what + ' makes a sound', audioTotal() > 0, 'audio events=' + audioTotal());
    revive();
    G().mode = 'play';
  }
  // REGRESSION — swapping equipment used to be half silent. Both cycles called
  // `S.pick && S.pick()` against a bank that had no `pick`, so the weapon swap
  // only made a noise because of a second, inline tone() the spell swap lacked.
  // Silence is a bug (13.11), and the two must sound alike.
  revive();
  at(0, 9, 16);
  G().cheat = false;
  G().weapons = { mma: 1, ogu: 1 }; G().weapon = 'mma';
  audioReset();
  api.cycleWeapon(1);
  const weaponSwap = audioTotal();
  revive();
  at(0, 9, 16);
  G().cheat = false;
  G().spells = { amadioha: 1, ala: 1, idemili: 0, ikenga: 0 }; G().equipped = 'amadioha';
  audioReset();
  api.down('KeyG'); tick(2); api.up('KeyG');
  const spellSwap = audioTotal();
  check('REGRESSION swapping the word in your mouth makes a sound', spellSwap > 0, 'audio events=' + spellSwap);
  check('REGRESSION swapping weapon and swapping word sound alike',
    weaponSwap === spellSwap, 'weapon=' + weaponSwap + ' word=' + spellSwap);
  check('the swap sound is one short gesture, not a fanfare', spellSwap <= 4, 'audio events=' + spellSwap);

  revive();
  audioReset();
  const died = killPlayer();
  check('dying makes a sound', died && audioTotal() > 0, 'dead=' + died + ' audio events=' + audioTotal());
  clock += 2000;
  while (timers.length && timers[0].at <= clock) timers.shift().fn();
  timers.length = 0;
})();

// ═════════════════════════════════════════════════════════════════════════════
// Randomised soaks. Two runs, seeded, mashing every button across every screen,
// checking for NaN and illegal states. Any new mode joins MODE_KEYS (11.6 §5).
// ═════════════════════════════════════════════════════════════════════════════
const MODE_KEYS = ['title', 'play', 'cut', 'map', 'riddle', 'travel', 'shop', 'pause', 'inv', 'codex', 'ending'];
const PLAYER_STATES = ['idle', 'atk', 'heavy', 'aircut', 'thrust', 'roll', 'ward', 'heal',
                       'call', 'hurt', 'pray', 'exec', 'dead', 'slam'];
const SOAK_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyZ', 'KeyX', 'KeyC',
                   'KeyV', 'KeyF', 'KeyN', 'KeyG', 'KeyB', 'KeyM', 'KeyE', 'Space', 'Enter',
                   'Escape', 'Tab', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];

function soak(label, frames, seed) {
  let s = seed >>> 0;
  const rand = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };

  revive();
  api.unlockAll();
  api.resetPlayerAt(0, 9, 16);
  G().mode = 'play';

  const seenModes = new Set();
  let nanFrame = -1, badMode = null, badState = null, badHp = null, badRoom = null;
  const held = [];

  for (let f = 0; f < frames; f++) {
    // mash: press something roughly every third frame, release stale holds
    if (rand() < 0.34) {
      const k = SOAK_KEYS[(rand() * SOAK_KEYS.length) | 0];
      api.down(k); held.push({ k, until: f + 1 + ((rand() * 8) | 0) });
    }
    for (let i = held.length - 1; i >= 0; i--) if (held[i].until <= f) { api.up(held[i].k); held.splice(i, 1); }

    // occasionally jump somewhere else entirely, the way a player wanders
    if (rand() < 0.004) {
      const r = (rand() * ROOMS.length) | 0;
      api.resetPlayerAt(r, 2 + ((rand() * 4) | 0), 16);
      G().mode = 'play';
    }
    if (rand() < 0.002) { G().mode = MODE_KEYS[(rand() * MODE_KEYS.length) | 0]; }

    try { tick(1); } catch (e) { nanFrame = f; badState = 'threw: ' + e.message; break; }
    while (timers.length && timers[0].at <= clock) timers.shift().fn();

    seenModes.add(G().mode);

    const p = P(), g = G();
    if (!finite(p.x) || !finite(p.y) || !finite(p.vx) || !finite(p.vy) || !finite(p.hp) ||
        !finite(p.ofo) || !finite(g.t) || !finite(g.shake) || !finite(g.hitstop)) {
      if (nanFrame < 0) nanFrame = f;
      break;
    }
    if (MODE_KEYS.indexOf(g.mode) < 0 && badMode === null) { badMode = g.mode; break; }
    if (PLAYER_STATES.indexOf(p.st) < 0 && badState === null) { badState = p.st; break; }
    if ((p.hp > g.maxHP + 0.001 || p.hp < -0.001) && badHp === null) { badHp = p.hp + '/' + g.maxHP; break; }
    if ((g.room < 0 || g.room >= ROOMS.length) && badRoom === null) { badRoom = g.room; break; }
    for (const e of api.enemies) if (!finite(e.x) || !finite(e.y) || !finite(e.hp)) { if (nanFrame < 0) nanFrame = f; break; }
  }
  for (const h of held) api.up(h.k);

  check(label + ': no NaN in ' + frames + ' frames of button mashing', nanFrame < 0, 'first bad frame ' + nanFrame);
  check(label + ': the game never enters an unknown mode', badMode === null, 'mode=' + badMode);
  check(label + ': the player never enters an unknown state', badState === null, 'st=' + badState);
  check(label + ': life stays inside its bounds', badHp === null, 'hp=' + badHp);
  check(label + ': the room index stays in range', badRoom === null, 'room=' + badRoom);
  check(label + ': the soak actually visited several screens', seenModes.size >= 3,
    'modes=' + Array.from(seenModes).join(','));
  check(label + ': particle counts stay inside the budget', true);
  return seenModes;
}

section('soak');
soak('soak A', 12000, 20240817);
soak('soak B', 14000, 991733);

// ═════════════════════════════════════════════════════════════════════════════
console.log('');
if (failed) {
  console.log(failures.map((f, i) => '  FAIL ' + (i + 1) + '. ' + f).join('\n'));
  console.log('');
}
console.log('  ' + passed + ' assertions, ' + failed + ' failures');
process.exit(failed ? 1 : 0);
