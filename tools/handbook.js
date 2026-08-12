// Ọdịnala — handbook generator.
//
//     node tools/handbook.js
//
// Writes HANDBOOK.md and handbook.html. Every number in both comes out of the
// live tables in odinala.html, read through the same __ODINALA_TEST export the
// suite uses — not out of the bible and not out of anybody's memory. Retune a
// weapon and re-run this and the documents move with it.
//
// The prose lives here. The numbers do not. If you find yourself typing a frame
// count into this file, you are doing it wrong: read it off `T` below.
//
// `test.js` re-reads HANDBOOK.md afterwards and asserts every number in it
// against the same tables, so a handbook that has drifted is a red build.

'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const HTML = path.join(ROOT, 'odinala.html');

// ── a loader, not a harness ──────────────────────────────────────────────────
// Enough stub to reach the export at the bottom of the file and no more. The
// suite's sandbox drives the game; this one only has to let it finish loading.
function loadTables() {
  const html = fs.readFileSync(HTML, 'utf8');
  const src = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  const noop = () => {};
  const param = () => ({ value: 0, setValueAtTime(){return this;}, exponentialRampToValueAtTime(){return this;},
    linearRampToValueAtTime(){return this;}, setTargetAtTime(){return this;}, cancelScheduledValues(){return this;} });
  const node = (x) => Object.assign({ connect(){return this;}, disconnect(){return this;},
    start(){return this;}, stop(){return this;} }, x);
  const ctx2d = new Proxy({}, { get:(t,k)=>{
    if (k === 'canvas') return { width:960, height:540 };
    if (k === 'measureText') return () => ({ width: 8 });
    if (k === 'createLinearGradient' || k === 'createRadialGradient')
      return () => ({ addColorStop: noop });
    if (k === 'getImageData') return (x,y,w,h) => ({ data:new Uint8ClampedArray(Math.max(4,w*h*4)) });
    return () => {};
  }, set:()=>true });
  const el = () => ({ width:0, height:0, style:{}, classList:{ add:noop, remove:noop },
    getContext:()=>ctx2d, addEventListener:noop, appendChild:noop, focus:noop,
    querySelectorAll:()=>[], getBoundingClientRect:()=>({left:0,top:0,width:960,height:540}),
    dataset:{}, textContent:'' });

  let api = null;
  const store = {};
  const sandbox = {
    console, Math, Date, JSON, Object, Array, String, Number, Boolean, isFinite, parseInt, parseFloat,
    Uint8ClampedArray, Float32Array, Path2D: function(){ return { moveTo:noop, lineTo:noop,
      bezierCurveTo:noop, quadraticCurveTo:noop, closePath:noop, rect:noop, arc:noop, ellipse:noop }; },
    document: { getElementById:()=>el(), createElement:()=>el(), addEventListener:noop,
                body:el(), hidden:false },
    addEventListener: noop, removeEventListener: noop,
    matchMedia: () => ({ matches:false, addEventListener:noop }),
    localStorage: { getItem:k=>(k in store?store[k]:null), setItem:(k,v)=>{store[k]=String(v);},
                    removeItem:k=>{delete store[k];}, clear:()=>{for(const k in store) delete store[k];} },
    requestAnimationFrame: () => 1, cancelAnimationFrame: noop,
    setInterval: () => 1, clearInterval: noop, setTimeout: () => 1, clearTimeout: noop,
    performance: { now: () => 0 },
    innerWidth: 960, innerHeight: 540, devicePixelRatio: 1,
    AudioContext: function(){ return {
      state:'suspended', currentTime:0, destination:node(), sampleRate:44100,
      resume:()=>Promise.resolve(), createGain:()=>node({gain:param()}),
      createOscillator:()=>node({frequency:param(), detune:param(), type:'sine'}),
      createBiquadFilter:()=>node({frequency:param(), Q:param(), gain:param(), type:'lowpass'}),
      createBufferSource:()=>node({buffer:null, playbackRate:param(), loop:false}),
      createBuffer:()=>({ getChannelData:()=>new Float32Array(8) }),
      createDelay:()=>node({delayTime:param()}), createWaveShaper:()=>node({curve:null}),
      createDynamicsCompressor:()=>node({threshold:param(),knee:param(),ratio:param(),
        attack:param(),release:param()}), createStereoPanner:()=>node({pan:param()}) }; },
    __ODINALA_TEST: (a) => { api = a; }
  };
  sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.self = sandbox;
  sandbox.webkitAudioContext = sandbox.AudioContext;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox, { filename: 'odinala.html' });
  if (!api) throw new Error('__ODINALA_TEST never fired — cannot read the tables');
  return api;
}

const api = loadTables();

// ── the numbers, all of them, read off the game ──────────────────────────────
const G = api.G, P = api.P;
G.cheat = false; G.spells = {}; G.weapons = { mma:1 };
G.skills = { riposte:0, swift:0, charm:0, flasks:3, heartUps:0 };
G.maxHP = 100; G.charms = {}; P.cowries = 0;

const T = {
  weapons: api.WEAPONS,
  spells:  api.SPELLS,
  riddles: api.RIDDLES,
  mirrors: api.MIRRORS,
  beasts:  api.BEASTS,
  lore:    api.LORE,
  boss:    api.BOSS_STATS,
  charms:  api.CHARMS,
  rooms:   api.ROOMS,
  shop:    api.shopItems()
};

// Constants the game states as behaviour rather than as a table. Each is read
// out of odinala.html by pattern, so this file still owns no numbers of its own.
const SRC = fs.readFileSync(HTML, 'utf8');
function num(re, what) {
  const m = SRC.match(re);
  if (!m) throw new Error('handbook: could not read ' + what + ' out of odinala.html');
  return parseFloat(m[1]);
}
const K = {
  wardWindow:  num(/P\.st==='ward' && P\.t<=\(OPT\.assist\?\d+:(\d+)\)/, 'ward window'),
  wardAssist:  num(/P\.st==='ward' && P\.t<=\(OPT\.assist\?(\d+):\d+\)/, 'assisted ward window'),
  rollIfrom:   num(/P\.st==='roll' && P\.t>=(\d+) && P\.t<=\d+/, 'roll i-frame start'),
  rollIto:     num(/P\.st==='roll' && P\.t>=\d+ && P\.t<=(\d+)/, 'roll i-frame end'),
  rollCd:      num(/P\.rollCd=(\d+)/, 'roll cooldown'),
  chargeAt:    num(/const CHARGE_AT = (\d+)/, 'charge threshold'),
  execReach:   num(/EXEC_REACH = (\d+)/, 'execution reach'),
  comboWin:    num(/P\.comboWin=(\d+); P\.st='idle'/, 'combo window'),
  coyote:      num(/P\.coyote=(\d+)/, 'coyote time'),
  jumpBuffer:  num(/P\.buffer=(\d+)/, 'jump buffer'),
  gourdHeal:   num(/P\.hp=Math\.min\(G\.maxHP,P\.hp\+(\d+)\)/, 'gourd heal'),
  hazardFire:  num(/hurtPlayer\(G\.room===8\?(\d+):\d+/, 'lava damage'),
  hazardSpike: num(/hurtPlayer\(G\.room===8\?\d+:(\d+)/, 'spike damage'),
  ofoHit:      num(/P\.ofo \+ \(hv\?\d+:(\d+)\)\*WA\(\)\.ofo/, 'ọfọ per light hit'),
  ofoHeavy:    num(/P\.ofo \+ \(hv\?(\d+):\d+\)\*WA\(\)\.ofo/, 'ọfọ per heavy hit'),
  ofoKill:     num(/P\.ofo \+ \(e\.kind==='boss'\?0:(\d+)\)/, 'ọfọ per kill'),
  ofoParry:    num(/P\.ofo = Math\.min\(100, P\.ofo\+(\d+)\);\n  P\.cowries/, 'ọfọ per parry'),
  ofoExec:     num(/P\.ofo = Math\.min\(100, P\.ofo\+(\d+)\);/, 'ọfọ per execution'),
  parryCowrie: num(/P\.cowries \+= (\d+);/, 'cowries per parry'),
  bindTime:    num(/boss\.bound = (\d+); boss\.stagger/, 'bind duration'),
  // two different sites, and they extend by different amounts — anchored on
  // their surroundings so they cannot both match the first one
  bindParry:   num(/e\.bound>0\)\{ e\.bound = Math\.min\(\d+, e\.bound\+(\d+)\)/, 'bind extension per parry'),
  bindExec:    num(/e\.stagger=46;\s*\n\s*e\.bound = Math\.min\(\d+, e\.bound\+(\d+)\)/, 'bind extension per execution'),
  bindCap:     num(/e\.bound = Math\.min\((\d+), e\.bound\+140\)/, 'bind cap'),
  execDmg:     num(/damage\(e, (\d+), P\.face, 1, false, 0\); e\.broken=0/, 'execution damage to a boss'),
  execHeal:    num(/P\.hp  = Math\.min\(G\.maxHP, P\.hp\+(\d+)\)/, 'execution heal'),
  unnamedMult: num(/a\.dmg\*boon\*\(bound\?1:([\d.]+)\)/, 'damage against an unnamed boss'),
  brokenNormal:num(/e\.broken = \(e\.kind==='boss'\) \? \d+ : (\d+)/, 'guard-break window'),
  brokenBoss:  num(/e\.broken = \(e\.kind==='boss'\) \? (\d+) : \d+/, 'boss guard-break window'),
  swiftMult:   num(/G\.skills\.swift\?Math\.round\(a\.rec\*([\d.]+)\)/, 'swift hand recovery'),
};

// Enemy stats, read off the builders rather than restated. Every builder in the
// game has the same shape — `base(x,y,w,h,hp,poise)` and then a `.kind=` on the
// same variable — so the roster is discovered rather than listed, and a new
// enemy appears in the handbook the day somebody writes its builder.
function builders() {
  const out = {};
  const re = /=\s*base\(x,y,(\d+),(\d+),(\d+),(\d+)\);\s*(\w+)\.kind='(\w+)'/g;
  let m;
  while ((m = re.exec(SRC))) out[m[6]] = { w:+m[1], h:+m[2], hp:+m[3], poise:+m[4] };
  if (Object.keys(out).length < 14) throw new Error('handbook: enemy builders stopped matching');
  return out;
}
const ENEMY = builders();

// ── presentation helpers ─────────────────────────────────────────────────────
// A designer's tuning value is not a sentence. Nine frames is a seventh of a
// second, and that is the thing a player can actually feel.
const f2s = (f) => {
  const s = f / 60;
  if (s < 0.10) return 'about a ' + Math.round(1/s) + 'th of a second';
  if (s < 1) return 'about ' + s.toFixed(2).replace(/0$/,'') + ' s';
  return s.toFixed(1) + ' s';
};
const frames = (f) => f + ' frames (' + f2s(f) + ')';

// ── boss attacks, read out of each boss's update function ────────────────────
// Every wind-up state in the game names its own tell colour and its own length,
// so the pattern tables below are extracted rather than transcribed.
function bossAttacks() {
  const lines = SRC.split('\n');
  const fns = [];
  lines.forEach((l, i) => { const m = /^function (\w+)\(b\)\{/.exec(l); if (m) fns.push([m[1], i]); });
  const out = {};
  const owner = { bossUpdate:'ogbunabali', ekwensuUpdate:'ekwensu', onweUpdate:'onwe',
                  uzuUpdate:'uzu', ikukuUpdate:'ikuku' };
  fns.forEach(([name, start], idx) => {
    const who = owner[name]; if (!who) return;
    const end = idx + 1 < fns.length ? fns[idx + 1][1] : start + 260;
    const body = lines.slice(start, end).join('\n');
    const found = [];
    const re = /b\.st==='(\w*[Ww]ind\w*)'\)\{[\s\S]{0,260}?tell='(white|gold)'[\s\S]{0,200}?t>=(?:Math\.round\()?F?\(?(\d+)/g;
    let m;
    while ((m = re.exec(body))) found.push({ state:m[1], tell:m[2], wind:+m[3] });
    // some states set the tell before the branch; sweep for any we missed
    const re2 = /else if\(b\.st==='(\w+)'\)\{ b\.tell='(white|gold)'[\s\S]{0,180}?t>=(?:Math\.round\()?F?\(?(\d+)/g;
    while ((m = re2.exec(body))) {
      if (!found.some(f => f.state === m[1])) found.push({ state:m[1], tell:m[2], wind:+m[3] });
    }
    out[who] = found;
  });
  return out;
}
const BOSS_ATK = bossAttacks();

// ── ordinary enemies, likewise ───────────────────────────────────────────────
// enemyUpdate() is one long function branching on e.kind, so each kind's block
// runs from its own `if(e.kind===...)` to the next one. Tell colours and the
// distance at which the thing commits are both in there; neither is restated.
function enemyTells() {
  // bounded at the next top-level function, because drawEnemy() branches on
  // e.kind with the same shape and would otherwise overwrite every entry with
  // an empty one — which it did, silently, until the output was looked at
  const from = SRC.indexOf('function enemyUpdate(e){');
  const to   = SRC.indexOf('\nfunction ', from + 24);
  if (from < 0 || to < 0) throw new Error('handbook: could not find enemyUpdate');
  const body = SRC.slice(from, to);
  const marks = [];
  const re = /if\(e\.kind==='(\w+)'\)\{/g;
  let m;
  while ((m = re.exec(body))) marks.push([m[1], m.index]);
  const out = {};
  marks.forEach(([kind, at], i) => {
    const chunk = body.slice(at, i + 1 < marks.length ? marks[i + 1][1] : at + 4000);
    // one statement at a time, because at least one kind assigns its tell with
    // a ternary and a colour-literal sweep across the whole block would pick up
    // colours from statements that are not tell assignments at all
    const tells = new Set();
    for (const stmt of chunk.split(';')) {
      if (!/\.tell\s*=/.test(stmt)) continue;
      let t; const tre = /'(white|gold)'/g;
      while ((t = tre.exec(stmt))) tells.add(t[1]);
    }
    const reach = [];
    let d; const dre = /adx<(\d+)/g;
    while ((d = dre.exec(chunk))) reach.push(+d[1]);
    out[kind] = { tells: [...tells], commitAt: reach.length ? Math.max(...reach) : null };
  });
  return out;
}
const ENEMY_TELL = enemyTells();

module.exports = { api, T, K, ENEMY, ENEMY_TELL, BOSS_ATK, f2s, frames };

// `--check` regenerates into memory and compares, so the suite can fail a build
// whose documents have fallen behind the tables without writing anything.
function build() {
  const { buildMarkdown, buildHtml } = require('./handbook-content.js');
  const CTX = { T, K, ENEMY, ENEMY_TELL, BOSS_ATK, f2s, frames, api };
  return { 'HANDBOOK.md': buildMarkdown(CTX), 'handbook.html': buildHtml(CTX) };
}
module.exports.build = build;

if (require.main === module) {
  const out = build();
  const check = process.argv.indexOf('--check') >= 0;
  const stale = [];
  for (const name of Object.keys(out)) {
    const at = path.join(ROOT, name);
    if (check) {
      let cur = null;
      try { cur = fs.readFileSync(at, 'utf8'); } catch (e) { cur = null; }
      if (cur !== out[name]) stale.push(name);
    } else {
      fs.writeFileSync(at, out[name]);
    }
  }
  if (check) {
    if (stale.length) {
      console.error('  stale: ' + stale.join(', ') + ' — run `node tools/handbook.js`');
      process.exit(1);
    }
    console.log('  handbook is current with the tables');
  } else {
    console.log('  HANDBOOK.md and handbook.html written from the live tables');
    console.log('  ward ' + K.wardWindow + 'f · roll i-frames ' + K.rollIfrom + '-' + K.rollIto +
                ' · charge ' + K.chargeAt + 'f · bind ' + K.bindTime + 'f');
  }
}
