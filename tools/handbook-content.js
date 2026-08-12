// Ọdịnala — handbook content.
//
// The prose. Every number interpolated here comes in through `T` (the live
// tables) and `K` (constants read out of odinala.html by pattern). Nothing in
// this file is a literal frame count, and if you add one, test.js will not
// catch it — the assertions check the *document* against the tables, so a
// hand-typed number that happens to be right today drifts silently tomorrow.

'use strict';

// ── small helpers ────────────────────────────────────────────────────────────
const esc = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const WORDS = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth'];
const COUNT = ['one','two','three','four','five','six','seven','eight','nine','ten'];
const many = (n) => COUNT[n-1] || String(n);
const Many = (n) => { const w = many(n); return w[0].toUpperCase() + w.slice(1); };

function weaponRows(w) {
  const rows = [];
  w.chain.forEach((a,i) => rows.push([ (i+1)+ (i===w.chain.length-1?' (finisher)':''), a ]));
  rows.push(['heavy', w.heavy]);
  rows.push(['in the air', w.air]);
  return rows;
}

// range band, derived from reach rather than asserted
function band(reach) {
  if (reach <= 18) return 'inside';
  if (reach <= 28) return 'close';
  if (reach <= 36) return 'long';
  return 'very long';
}

// ── the parts ────────────────────────────────────────────────────────────────

function partOne(ctx) {
  const { T, K, f2s, frames } = ctx;
  const S = [];
  const p = (x) => S.push({ t:'p', x });
  const h = (x, l) => S.push({ t:'h', x, l:l||2 });
  const ul = (x) => S.push({ t:'ul', x });
  const tbl = (head, rows, cls) => S.push({ t:'tbl', head, rows, cls });
  const note = (x) => S.push({ t:'note', x });

  h('The verbs', 2);
  p('Nine things you can do. Each one costs you something, and the cost is always time you cannot take back.');
  tbl(['', 'what it costs you', 'what it commits you to'], [
    ['Move', 'nothing', 'nothing. You may always stop.'],
    ['Jump', 'nothing', 'the arc. You get ' + frames(K.coyote) + ' of grace after walking off a ledge, and a press up to ' + frames(K.jumpBuffer) + ' early still lands.'],
    ['Cut', 'a wind-up you cannot cancel', 'the whole swing. Wind-up, strike, recovery — and only the recovery can be rolled out of.'],
    ['Charge', 'holding through the recovery', 'nothing until it is full, and then a heavy. The ring closes at ' + frames(K.chargeAt) + ' of holding.'],
    ['Roll', frames(K.rollCd) + ' before you may roll again', 'the direction you are facing. Invulnerable from frame ' + K.rollIfrom + ' to ' + K.rollIto + '.'],
    ['Ward', 'your footing', 'the next ' + frames(K.wardWindow) + '. After that it is a block, not a parry.'],
    ['Drink', 'a gourd, and a long stand-still', 'the whole animation. ' + K.gourdHeal + ' life, and you cannot move while it happens.'],
    ['Cast', 'ọfọ', 'the cast. Ọfọ never returns on its own — it is earned by hitting things.'],
    ['Name', 'nothing but the walk to find it', 'nothing. It is the only free thing in the game.']
  ]);

  h('White can be turned. Gold cannot.', 2);
  p('This is the game. Everything else is detail.');
  p('Before an enemy hits you, it outlines itself. The outline is one of two colours and it never lies.');
  tbl(['', 'looks like', 'you have', 'do'], [
    ['White', 'a single bone-white outline, pulsing slowly', frames(K.wardWindow) + ' from the moment you press ward', 'Ward it.'],
    ['Gold',  'a double gold outline, pulsing faster', 'as long as the wind-up runs', 'Roll. There is no other answer.']
  ]);
  p('The double outline is deliberate. If the two colours read the same to you, the outline *count* still differs, and the settings screen will swap gold for violet.');
  p('Turn a white tell and you get all of this at once: ' + K.ofoParry + ' ọfọ, ' +
    K.parryCowrie + ' cowries, the attacker staggered, and — against an ordinary enemy — its guard broken outright. ' +
    'A single clean parry is a guard break. Nothing else in the game is that efficient.');
  p('Ward too late and it becomes a block. You take about a third of the damage and keep the stun. That is much better than being hit and much worse than being right.');
  note('If you cannot hold the ' + K.wardWindow + '-frame window, the settings screen widens it to ' + K.wardAssist + '. It is on the title menu, it is described plainly, and using it is playing the game.');

  h('Frame data', 2);
  p('All times in frames at 60 per second. Wind-up is the tell. Active is when it can hit. Recovery is when you are committed and can only roll out.');
  for (const k of Object.keys(T.weapons)) {
    const w = T.weapons[k];
    S.push({ t:'h', x: w.name, l:3 });
    tbl(['', 'wind', 'active', 'recovery', 'damage', 'poise', 'reach', 'knock'],
      weaponRows(w).map(([label,a]) => [label, a.wind, a.act, a.rec, a.dmg, a.poise, a.reach, a.kb]), 'fd');
    const extra = [];
    extra.push('Chain of ' + w.chain.length + '.');
    extra.push('Ọfọ ×' + w.ofo + '.');
    if (w.heavy.kind === 'flurry') extra.push('The heavy is ' + w.heavy.hits + ' strikes ' + w.heavy.gap + ' frames apart, not one.');
    if (w.heavy.kind === 'lunge') extra.push('The heavy travels forward.');
    if (w.heavy.kind === 'sweep') extra.push('The heavy sweeps everything in front of you.');
    if (w.heavy.kind === 'slam') extra.push('The heavy leaves burning ground where it lands.');
    if (w.burn) extra.push('Anything it hits burns for ' + frames(w.burn) + '.');
    p(extra.join(' '));
  }
  tbl(['everything else', ''], [
    ['Roll invulnerability', 'frames ' + K.rollIfrom + '–' + K.rollIto + ' of the roll'],
    ['Roll cooldown', frames(K.rollCd)],
    ['Ward window', frames(K.wardWindow) + ', or ' + K.wardAssist + ' with the assist on'],
    ['Charge threshold', frames(K.chargeAt) + ' of holding'],
    ['Combo window', frames(K.comboWin) + ' after a swing ends before the chain resets'],
    ['Coyote time', frames(K.coyote)],
    ['Jump buffer', frames(K.jumpBuffer)],
    ['Guard-break window', frames(K.brokenNormal) + ' on an ordinary enemy, ' + frames(K.brokenBoss) + ' on a boss'],
    ['Swift Hand', 'recovery × ' + K.swiftMult + ' on everything']
  ]);

  h('The four weapons', 2);
  p('None of these is the best one. Each is a different rhythm, and the fight you are in decides which rhythm is right.');
  for (const k of Object.keys(T.weapons)) {
    const w = T.weapons[k];
    const c = w.chain;
    const dps = (c.reduce((s,a)=>s+a.dmg,0) / c.reduce((s,a)=>s+a.wind+a.act+a.rec,0) * 60).toFixed(1);
    S.push({ t:'h', x: w.name, l:3 });
    p('*' + w.blurb + '*');
    let says;
    if (k === 'mma') says = 'The one you start with and the one nothing punishes you for using. ' +
      c.length + ' strokes, ' + band(c[0].reach) + ' range, and a finisher worth ' + c[c.length-1].dmg + '. ' +
      'About ' + dps + ' damage a second if every stroke lands. It is the baseline the other three are measured against, and it stays good.';
    if (k === 'nkwu') says = 'The fastest thing you can hold. ' + c.length + ' strokes, the first out in ' + c[0].wind +
      ' frames, and every one of them barely a wound. What it is really for is ọfọ: at ×' + w.ofo +
      ' it fills the bar more than twice as fast as anything else, so it is the weapon for a player who fights with words. ' +
      'Its reach is ' + c[0].reach + ' — the shortest in the game. You have to be inside, and inside is where things hit you.';
    if (k === 'ogu') says = 'Reach and weight. ' + c[0].reach + ' on the opener rising to ' + c[c.length-1].reach +
      ' on the finisher, which is far enough to hit a thing before it arrives. The price is the recovery: ' +
      c[c.length-1].rec + ' frames on the finisher and ' + w.heavy.rec + ' on the heavy, and a whiffed heavy is most of a second ' +
      'standing still in front of something. It suits patience and punishes optimism.';
    if (k === 'oku') says = 'It burns. Anything it touches keeps taking damage for ' + f2s(w.burn) +
      ' after you have stopped hitting it, which means its real damage is higher than the table says and its ' +
      'best use is to touch something once and then leave. The heavy leaves burning ground behind it. ' +
      'It is the only weapon that keeps working while you are somewhere else.';
    p(says);
  }

  h('The four ọfọ', 2);
  p('Ọfọ is not mana. It does not refill on its own, ever. You get it by hitting things — ' +
    K.ofoHit + ' a light hit and ' + K.ofoHeavy + ' a heavy, both multiplied by the weapon — ' +
    K.ofoKill + ' for a kill, ' + K.ofoParry + ' for a parry, ' + K.ofoExec + ' for an execution. The bar holds 100.');
  tbl(['', 'cost', 'role', 'I', 'II', 'III'], Object.keys(T.spells).map(k => {
    const s = T.spells[k];
    const lv = s.lv.map(l => Object.keys(l).map(kk => kk+' '+l[kk]).join(', '));
    const role = k==='amadioha' ? 'damage' : k==='ala' ? 'control' : k==='idemili' ? 'defence' : 'aggression';
    return [s.name + ' — ' + s.ig, s.cost, role, lv[0], lv[1], lv[2]];
  }), 'fd');
  for (const k of Object.keys(T.spells)) p('**' + T.spells[k].name + '.** ' + T.spells[k].blurb);

  h('Poise, guard breaks and executions', 2);
  p('Everything that fights has a second bar you cannot see until it matters. Poise. Damage takes life; poise damage takes composure, and the two are separate numbers in the frame tables above.');
  p('Empty the poise bar and the guard breaks: the thing freezes, turns gold, and stands there for ' +
    frames(K.brokenNormal) + ' — ' + frames(K.brokenBoss) + ' if it is a boss. Stand close and press cut and you execute it. ' +
    'Against an ordinary enemy that is simply death. Against a boss it is ' + K.execDmg + ' damage, ' + K.ofoExec + ' ọfọ, ' +
    K.execHeal + ' life back, and — the part almost nobody finds — it extends the name.');
  p('Two things break poise fastest: heavies, which carry two to three times the poise damage of a light stroke, and parries, which break an ordinary enemy in one.');

  h('Resources', 2);
  tbl(['', 'where it comes back', 'what you lose on death'], [
    ['Life', 'a rest charm, a gourd (' + K.gourdHeal + '), or an execution (' + K.execHeal + ')', 'all of it, obviously'],
    ['Gourds', 'a rest charm, free and always', 'nothing — they refill'],
    ['Ọfọ', 'hitting things. Never on its own.', 'all of it'],
    ['Cowries', 'killing things, and ' + K.parryCowrie + ' a parry', 'all of them, dropped where you fell']
  ]);
  p('Death drops your cowries as a shade in the room you died in. Walk back and take them and you lose nothing. Die again on the way and the first shade is gone. One charm wearing the clay pot keeps half of them with you instead.');
  p('Resting at a charm refills life and gourds, saves, and puts every ordinary enemy back on its feet. It is also the only place the ledger opens.');

  S.push({ t:'h', x:'What you can wear', l:3 });
  p('Bought at the ledger and worn a few at a time. None of them is a stat increase in disguise; each one changes a rule.');
  tbl(['', '', 'cost', 'what it changes'], Object.keys(T.charms).map(k => {
    const c = T.charms[k];
    return [c.name, c.sub || '', c.cost, c.blurb];
  }));

  h('Reading a fight', 2);
  p('Principles, not answers.');
  ul([
    '**Never stand in neutral.** Every enemy in the game occupies one range band and is helpless outside it. Be inside it deliberately or be outside it deliberately. The place you die is the edge.',
    '**The roll is the only cancel you get.** You cannot cancel a wind-up. You cannot cancel an active frame. You can roll out of recovery, and that is the whole of your escape budget — spend it on getting out of a commitment you regret, not on moving around.',
    '**A wind-up is always longer than the strike.** If something seems to hit instantly, you missed the tell, not the timing.',
    '**Parry the white ones on purpose.** A parry is worth more than the damage you skipped: ọfọ, cowries, a stagger and, on an ordinary enemy, an outright guard break. Fighting defensively is not the slow way through this game, it is the fast one.',
    '**Charge in the recovery.** The charge builds while you are already committed, so the heavy costs you almost nothing you were not already paying.',
    '**When you are surrounded, you are already wrong.** Four is the most the game will ever put on one screen. If four are on you, the mistake was the positioning two seconds ago.'
  ]);
  return S;
}

function partTwo(ctx) {
  const { T, ENEMY_TELL, BOSS_ATK } = ctx;
  const S = [];
  const p = (x) => S.push({ t:'p', x });
  const h = (x,l) => S.push({ t:'h', x, l:l||2 });
  const tbl = (head, rows, cls) => S.push({ t:'tbl', head, rows, cls });

  const order = [0,10,1,4,11,5,2,12,3,6,8,9,7];
  const character = {
    0:'Where you wake, on top of your own charm. A rest charm, a mirror, and a teacher who will not stay a teacher.',
    10:'A dead end off the left of the first room, in the direction you have no reason to go. Nothing to fight. Look at the ground.',
    1:'Trees and a name that promises something the room never does. Nothing watches you here.',
    4:'The one warm place. Lanterns, highlife, people who will talk to you. Come back to it.',
    11:'Above the market, where the light comes from underneath. There is a rest charm up here and it is the only one in the warm half of the game.',
    5:'The gentlest room. Something of yours is in it.',
    2:'Straight down. The longest descent, and the room whose whole job is to make you walk past one particular stone. Read it.',
    12:'West at the bottom of the shaft. Somebody worked here. Take what he left.',
    3:'Flat, empty and lit red. No platforms, nothing to hide behind. That is deliberate: this fight is about information, not footwork.',
    6:'Attrition. Long, dry, and busier than anything before it.',
    8:'A forge, not a hell. Things are made permanent here, which is why the last weapon is in it. The floor will hurt you.',
    9:'Open sky, hundreds of feet underground. Nobody remarks on this.',
    7:'Arrival. The music is the music from the first room, and that is not an accident.'
  };
  const looking = {
    0:'the shape of the thing you did', 10:'eight of something, and a ninth that is not there',
    1:'the way up on the right', 4:'two people worth talking to, and the ledger',
    11:'somewhere to rest', 5:'a piece of yourself',
    2:'a name, cut into stone in nine strokes', 12:'something small, wrapped in cloth that used to be white',
    3:'the first thing that cannot be beaten by hitting it', 6:'the way east, once you have earned it',
    8:'the last weapon', 9:'height, and what it costs', 7:'yourself'
  };

  h('The road', 2);
  p('Every place, in the order the game gives them to you. What is in each is named. Where it is, is not.');
  tbl(['#','place','what it is','what you are looking for','holds'], order.map(i => {
    const r = T.rooms[i], tiles = [...new Set(r.map.join(''))];
    const holds = [];
    if (tiles.includes('S')) holds.push('rest charm');
    if (tiles.includes('M')) holds.push('mirror');
    if (tiles.includes('h')) holds.push('heart shard');
    if (tiles.includes('F')) holds.push('a weapon');
    if (tiles.includes('N')) holds.push('the stone');
    return [i, r.name, character[i]||'', looking[i]||'', holds.join(', ') || '—'];
  }));

  h('The map', 2);
  S.push({ t:'map' });

  h('The bestiary', 2);
  p('What each thing does, what colour it tells in, and the one line that matters.');
  const practical = {
    walker:'Two honest swings, both white, both turnable. Learn the parry on this one.',
    lunger:'It folds down before it comes and it comes gold. Do not ward. Roll.',
    thrower:'It never closes. Parry the bone and it goes back the way it came.',
    warden:'Light attacks are wasted on the shield. Charged heavy, or go around.',
    roller:'Rolling it only bruises. Wait until it stands up, then turn the bite.',
    horned:'Near swing is white, the charge is gold. Watch which shoulder drops.',
    ember:'It falls and the fall cannot be turned. Step out from under it.',
    crawler:'Two bites, and the second is the one that gets you because you were already leaving.',
    effigy:'It cannot follow you. That is the answer to it.',
    healer:'Kill it first or you are fighting the room twice.',
    mimic:'It stands up before it strikes. The surprise is that it was scenery, never that the attack was unfair.',
    grappler:'The grab is gold and there is no turning a pair of hands aside. Mash out.',
    pairshield:'It will not attack while its partner lives. Kill the spear.',
    pairspear:'It reaches past its own shield, so the safe-looking spot is the one place it can hit you.',
    swimmer:'It ignores the floor entirely. Fight it on its line, not yours.',
    ceiling:'It lives above you and drops. Look up in that room.',
    boss_ogbunabali:'You cannot hurt him until you can name him.',
    boss_ekwensu:'The biggest thing in the game and the most honest.',
    boss_onwe:'It has no moveset of its own.',
    boss_uzu:'Its guard reforges faster than you can break it. Do not try to out-break it.',
    boss_ikuku:'It never lands. Stop waiting for it to.',
    chalk:'It is a teacher. It drills you slowly with white swings and then goes live, and only then does anything of its gold.'
  };
  // Tell colours come out of the enemy update code and life and poise come off
  // the builders, so this table cannot drift away from the fights it describes.
  const tellWords = (ts) => !ts || !ts.length ? '—'
    : ts.length > 1 ? 'white and gold' : ts[0];
  tbl(['', 'what it is', 'tells', 'life', 'poise', 'how to fight it'], T.beasts.map(b => {
    const isBoss = /^boss_/.test(b.k);
    const name = (b.t || b.n || b.k) + (b.sub ? ' — ' + b.sub : '');
    const flavour = (Array.isArray(b.b) ? b.b[0] : (b.b || b.d || '')).split('. ')[0].replace(/\.?$/, '.');
    if (isBoss) {
      const st = T.boss[b.k.replace('boss_','')] || [0,0,0,0];
      const ts = [...new Set((BOSS_ATK[b.k.replace('boss_','')] || []).map(a => a.tell))];
      return [ name, flavour, tellWords(ts), st[2], st[3], practical[b.k] || '' ];
    }
    const t = (ENEMY_TELL || {})[b.k] || {}, e = ctx.ENEMY[b.k] || {};
    return [ name, flavour, tellWords(t.tells), e.hp == null ? '—' : e.hp,
             e.poise == null ? '—' : e.poise, practical[b.k] || '' ];
  }));

  h('The gates', 2);
  p('There are three real gates in the whole game and this is all of them.');
  S.push({ t:'ul', x:[
    '**Cracked floors.** Something you are given by the first boss opens them. Until then a cracked tile is a floor.',
    '**The bone road\'s far door.** It will not open while a particular thing is still standing on that road. The game says so when you try it.',
    '**One gate is not physical at all.** There is a door in this game that is not a door, and no amount of walking opens it. It is the best idea in here and you should find it yourself.'
  ]});
  return S;
}

// ═══ PART III — the answers ══════════════════════════════════════════════════

function partThree(ctx) {
  const { T, K, BOSS_ATK, f2s, frames } = ctx;
  const S = [];
  const p = (x) => S.push({ t:'p', x });
  const h = (x,l) => S.push({ t:'h', x, l:l||2 });
  const tbl = (head, rows, cls) => S.push({ t:'tbl', head, rows, cls });
  const ul = (x) => S.push({ t:'ul', x });

  S.push({ t:'warn', x:
    'What follows is the whole of it. The riddles with their answers, every boss taken apart, ' +
    'the true name and where it is cut, and all three endings with the exact conditions. ' +
    'The second thing this game is about is that knowing something is the only progression that matters, ' +
    'and you are about to be handed all of it at once. It will still be a good game afterwards. ' +
    'It will not be the same one.' });

  h('The riddles', 2);
  p('Ten of them, real gwam gwam gwam, asked by unattuned glass. Answer right and the mirror joins your travel network for good.');
  p('Answer wrong and the glass goes black. You have to leave the room entirely and come back, and it asks a different one next time — it cycles through all ten. That is the whole punishment: it costs you a walk, not a run. Nothing is lost and nothing is closed.');
  tbl(['', 'Igbo', 'in English', 'answer'], T.riddles.map((r,i) => [i+1, r.ig, r.en, r.a[r.c]]));

  h('The bosses', 2);
  const bossIdea = {
    ogbunabali:'He cannot be hurt while he is nobody. Everything about this fight is about going and getting a name and coming back with it. Until you do, you do about a tenth of your damage and the sound of your own sword tells you so — the hit is muffled, deliberately, so you learn it without being told.',
    ekwensu:'He is the biggest thing in the game and he is the only one who tells you the truth. Nothing here is a trick. Every attack is signposted and every signpost is honest. If he kills you, he did it in plain sight.',
    uzu:'A smith. His guard reforges faster than you can break it, so the entire fight is the discovery that breaking his guard is not the plan. Hit the body.',
    ikuku:'It never lands. Every instinct you have built over the last hour — wait for the ground, punish the recovery — is the wrong instinct here, because there is no recovery on the ground to punish.',
    onwe:'It has no moveset of its own. Everything it does it does because it watched you do it first, which is why it is exactly as quick as you are and exactly as good. A thing that can only copy has a problem if it is given nothing to copy.'
  };
  const bossAbout = {
    ogbunabali:'It is about the fact that the answer was written on a stone you already walked past. The game showed you the shaft, made you descend the whole of it, and put nine strokes of chalk at eye height on the way. Everybody walks past it. The fight is the game asking whether you were paying attention, and the walk back is the answer.',
    ekwensu:'It is about being paid. He tells you, unprompted, who paid him and what for, and it is the worst thing you hear in the game. He is not lying. He has no reason to.',
    uzu:'It is about knowing when to stop using the thing that has worked all game. Poise has been your answer to everything since the first walker. Here it is a trap, and the fight is over the moment you notice.',
    ikuku:'It is about height. You have spent the whole game on the ground, and this is the one fight the ground does not help with.',
    onwe:'It is not a fight. It is the last question the game asks, and there are three ways to answer it, and two of them do not involve your sword. See the endings.'
  };
  for (const who of ['ogbunabali','ekwensu','uzu','ikuku','onwe']) {
    const st = T.boss[who], entry = T.beasts.filter(b => b.k === 'boss_' + who)[0] || {};
    S.push({ t:'h', x:(entry.t || who.toUpperCase()) + (entry.sub ? ' — ' + entry.sub : ''), l:3 });
    p('**The idea.** ' + bossIdea[who]);
    tbl(['', 'life', 'poise', 'contact', 'reach'], [[ '', st[2], st[3], st[0], st[1] ]], 'fd');
    const atks = BOSS_ATK[who] || [];
    if (atks.length) {
      tbl(['attack','tells','wind-up','what to do'], atks.map(a => [
        a.state.replace(/Wind$/,''), a.tell, frames(a.wind),
        a.tell === 'white' ? 'Ward it. On a boss a parry does not break the guard, but it staggers him and it extends the name.'
                           : 'Roll. There is nothing else.'
      ]));
    }
    p('**What it is about.** ' + bossAbout[who]);
  }

  h('The true name', 2);
  p('In the shaft, on a chalk stone, nine strokes. Press down at it and read it. It costs nothing and it is the single most valuable thing in the game.');
  p('Knowing it is not enough. In the fight you have to *call* it — the name key — and calling it binds him for ' +
    frames(K.bindTime) + '. While bound he takes full damage and full poise damage. While not bound he takes ' +
    Math.round(K.unnamedMult * 100) + '% of it and the hit sounds wrong.');
  p('**The part almost nobody finds:** the bind extends. Every parry you land adds ' + frames(K.bindParry) +
    ', and every execution adds ' + frames(K.bindExec) + ', up to a ceiling of ' + frames(K.bindCap) + '. ' +
    'A player who parries well never has to call it twice. This one fact turns the fight from a timer into a rhythm, ' +
    'and the game never tells you.');

  h('The three endings', 2);
  tbl(['', 'condition', ''], [
    ['A', 'Kill it.', ''],
    ['B', 'Do not.', ''],
    ['C', 'Arrive having killed nothing you did not have to.', '']
  ]);
  S.push({ t:'h', x:'Ending A — you finish it', l:3 });
  p('Fight Onwe and win. This is what happens if you do the thing the whole game has trained you to do, and the game does not consider it a failure.');
  S.push({ t:'h', x:'Ending B — Nlọghachi', l:3 });
  p('At a certain point Onwe lowers its hands. Its guard drops and it stops attacking, and it stays that way for ' +
    frames(420) + ' — about seven seconds. Walk into it instead of swinging and you get the second ending.');
  p('Seven seconds is not long when everything you have learned says to press the attack. That is the design. ' +
    'It is not a puzzle, it is a reflex test in the other direction.');
  S.push({ t:'h', x:'Ending C — Onye Ọma', l:3 });
  p('Reach Onwe having killed nothing avoidable. If you do, Onwe never raises its hands at all — it is standing down when you arrive, and walking into it ends the game.');
  p('**What counts.** A boss is unavoidable exactly when some door is locked behind it. That is derived from the world, not from a list, and it means:');
  ul([
    '**Unavoidable, and free to kill:** the three bosses that gate doors.',
    '**Avoidable, and it costs you the ending:** Ikuku, and *every ordinary enemy in the game*.',
    '**Never counts:** the chalk teacher in the first room. It comes apart whether you fight it or skip it.'
  ]);
  p('**Where it is easy to lose by accident.** Every walker, thrower, crawler, ember and mimic between the first room and the last counts. One kill anywhere — including one you did not mean, in a corridor you were only passing through — closes it for that run. There is no warning and no indicator. The stats card at the end tells you afterwards, on the line that reads *left standing*.');

  h('Secrets, and things most players miss', 2);
  ul([
    '**Executions heal you.** ' + K.execHeal + ' life, every time. Against a boss they also do ' + K.execDmg + ' damage and extend the name.',
    '**Parries pay.** ' + K.ofoParry + ' ọfọ and ' + K.parryCowrie + ' cowries each, and against an ordinary enemy a single parry breaks the guard outright.',
    '**The charge builds during recovery.** You are already committed; the heavy is nearly free.',
    '**The one-way drop.** There is a cracked floor in the water room that drops you back into the shaft. It needs the first boss\'s gift, and it closes the map into a loop.',
    '**The dibia\'s chalk.** Something small is lying at the bottom of the shaft, west. Take it to the man in the market. He says something he would rather not have said.',
    '**Nine graves.** Eight mounds and a hole, off the first room, in the direction you have no reason to walk. Stand at each one. The codex fills in a line at a time and the ninth is yours.',
    (() => {
      let sh = 0, wp = 0;
      T.rooms.forEach(r => { const j = r.map.join('');
        sh += (j.match(/h/g)||[]).length; wp += (j.match(/F/g)||[]).length; });
      const sold = T.shop.filter(s => s.kind === 'weapon').length;
      return '**' + Many(sh) + ' heart shards** and **' + (wp === 1 ? 'one weapon' : many(wp) + ' weapons') +
             '** are lying in the world rather than sold. The ledger has the other ' + many(sold) + '.';
    })(),
    '**Talk to the market woman more than once.** She has six things to say and they are in an order.',
    '**Speedrun mode**, from the title, is not a difficulty setting — it is every mirror open, every word learned, every weapon in hand, full life, and you cannot be touched. It saves to its own slot and cannot overwrite a real run.',
    '**A rematch.** Once you have put a boss down, its bestiary page will take you back to it.'
  ]);

  h('The lore the game never says outright', 2);
  p('**Why nine.** Nine burials. Nine strokes of nzu on the stone, and the same nine across the player\'s own mask — you have been wearing the count this whole time. Nine eyes on Ogbunabali. Nine bolts in Amadioha. Nine mounds behind the compound, eight closed. Nobody in the game ever remarks on it. A player who counts is being answered; a player who does not is being kept in rhythm.');
  const loreBy = (id) => (T.lore.filter(l => l.id === id)[0] || { b:[] }).b;
  p('**What an ọgbanje is.** ' + (loreBy('ogbanje')[0] || ''));
  p('**What you actually did.** ' + (loreBy('iyiuwa')[2] || ''));
  p('**What Ekwensu was paid.** He is a deity of war, bargaining and reversal, and the missionary translation into the Christian devil is one of the things this game exists to argue with. He does not lie, because he has no reason to. He was paid, he says so, and the name on the contract is one you have been carrying since the first cutscene.');
  p('**Who Onwe is.** ' + (loreBy('onwe')[0] || ''));
  p('**And the last thing.** ' + (loreBy('end')[1] || ''));
  return S;
}

// ═══ PART IV — the game as prose ═════════════════════════════════════════════
// Second person, past tense. Short declaratives. No exclamation marks. Igbo
// unglossed. House style is bible/02-STORY-AND-LORE.md §2.9, and the test for
// every line is the one in that file: if it could appear on a fantasy novel's
// back cover, it is wrong.

function partFour(ctx) {
  const S = [];
  const p = (x) => S.push({ t:'p', x });
  const h = (x,l) => S.push({ t:'h', x, l:l||3 });

  p('*What follows is the game, told as a story. It is not a guide and it will not help you play. ' +
    'It has every ending in it.*');

  h('Ala Iyi-uwa');
  p('Three days after they took your mother you went back to the tree and put your hand in the ground.');
  p('The dibia had buried something under the ogilisi the year you were born. He had not explained it to you, ' +
    'because you were an infant, and he had not explained it afterwards either, because by then it was working ' +
    'and there was nothing to explain. You knew where it was the way you knew where your own hands were.');
  p('The soil came away easily. That should have told you something.');
  p('You do not remember the digging. You remember waking at the bottom of the hole with the taste of clay in ' +
    'your mouth and a mask on your face that you had not put there. Bone-white. Nine strokes of nzu across the brow. ' +
    'You counted them later, much later, and by then you had counted other things and the number had stopped ' +
    'being a coincidence.');
  p('The moon was out. It was the only time in the whole of what followed that you saw one.');
  p('A shape stood up out of the chalk at the far end of the clearing. It had arms, roughly. It swung at you slowly ' +
    'and outlined itself in white before every swing, which no living thing has ever done, and you understood after ' +
    'the third swing that it was showing you rather than trying. When you turned one of its swings aside it came apart ' +
    'into powder and did not reassemble.');
  p('It had been a teacher. There was nobody to tell.');

  h('Ogilisi');
  p('You went left first, which there was no reason to do.');
  p('Behind the compound the ground rose into a row of low mounds. Eight of them. Grass had closed over the first ' +
    'few and somebody had carried a stone up for the fourth, which meant that by the fourth somebody had decided ' +
    'this was a thing that would keep happening and had started marking it.');
  p('You stood at each one. There was no ninth mound. There was a hole, and you had been sleeping in it, and it was ' +
    'smaller than you remembered.');
  p('Nothing announced itself. No sound, no light, no line of text. You worked out what you had been looking at ' +
    'much later, from a page in the codex that had been filling itself in one sentence at a time while you walked.');

  h('Ọhịa');
  p('The path east watched you. That is what the name means and the room does nothing else to earn it — no ambush, ' +
    'no enemy, no event. Trees, a wind that came from the wrong direction, and a way up on the right.');
  p('You climbed. You learned in that room that you could step off a ledge and still jump for a few frames afterwards, ' +
    'and that if you pressed jump slightly too early the game remembered and did it anyway. Nobody told you either thing. ' +
    'They are the two small mercies in a game that has very few.');
  p('You also died in that room, to something with a spear and no particular interest in you.');
  p('You came back. That is what you are. It happened at the last charm you had knelt at, and it happened without ' +
    'ceremony and without a screen telling you that you had failed, and the cowries you had been carrying were lying ' +
    'in a small heap of light where you had fallen, waiting for you to walk back and pick them up. If you died again ' +
    'on the way, they were gone.');
  p('Eight children stayed in the ground. You could not manage it once.');

  h('Ahịa Mmụọ');
  p('The market that opens at night was the one warm place and you knew it within a second of arriving, because the ' +
    'music changed and the lanterns were the first colour in the game that was not grey or gold.');
  p('The dead haggle. They were not interested in you. A man sat behind a mat of small things and did not recognise ' +
    'you, and he was the dibia who had buried your charm, and he was dead now and still working. He explained ọgbanje ' +
    'to you the way you explain the weather to somebody from elsewhere: patiently, and without any sense that it might ' +
    'be a difficult thing to hear.');
  p('A woman stood behind a mat with nothing on it. She had one thing to say each time you came back. Over six ' +
    'visits she described a woman she had known, and it took until the fifth before you were certain.');
  p('There was a ledger at the rest charm. You could buy your way out of some of your own limitations with cowries ' +
    'taken off the things you had killed. This was the game being honest about what it was.');
  p('There was also a mirror there, and the mirror asked you a riddle before it would let you use it. Gwam gwam gwam. ' +
    'The kind children ask each other, phrased exactly the way children phrase them, and one of the ten was about a ' +
    'thing that speaks and has no mouth, which you did not think about again for several hours.');
  p('Answer wrong and the glass went black and you had to leave the room and come back and it asked a different one. ' +
    'It cost a walk. Nothing in this game is ever closed to you permanently, which is a strange kind of generosity ' +
    'from something that will not let you die.');

  h('Ahịa Elu');
  p('Above the market the light came from underneath, which is wrong and looks wrong, and the roofs went up in ' +
    'four steps. There was a charm at the top. It is the only place to rest in the warm half of the world and you ' +
    'used it more than you expected to.');

  h('Iyi Idemili');
  p('The water room is the gentlest thing in the game. The music is nearly in a major key, which happens exactly once. ' +
    'A python is somewhere in the design of it, in the way the pillars turn.');
  p('There was a piece of your own heart in the water. You put it back. It did not feel like a reward.');
  p('There was also a girl. Another one like you, younger, still inside the arrangement, not yet dug up. She asked you ' +
    'what was on the other side of not going back, and you had been on that side for three days and could not answer her. ' +
    'She did not seem surprised.');

  h('Ụzọ Ala');
  p('Then down, for a long time.');
  p('The shaft is the longest room and the whole of its job is to make you walk past one stone. It is at eye height. ' +
    'It has nine strokes of nzu on it and a name under them, and if you press down while standing at it you read the name.');
  p('Most people walk past it. The game knows this and has built the next twenty minutes around it.');

  h('Ụlọ Dibia');
  p('West at the bottom of the shaft was a compound that had fallen in. Somebody had worked there. There was a shelf, ' +
    'and on the shelf a small bundle wrapped in cloth that had been white once.');
  p('You took it back to the market and put it in the dead man\'s hand. He looked at it for a while and said something ' +
    'he would rather not have said, and then he went back to arranging his mat.');

  h('Ebe Ọchịchịrị');
  p('The room where he keeps the dark is flat and red and completely empty. There is nowhere to stand that is better ' +
    'than anywhere else. This is deliberate; the fight is not about footwork.');
  p('Ogbunabali is an office rather than a person. He kills at night and he has done it since before anybody was ' +
    'counting, and it is a function, like the rain. He was very large and he had too many eyes and he told you, ' +
    'while you hit him, that he had not taken her.');
  p('You hit him a great deal. Your sword sounded wrong when it landed — muffled, as though you were striking through ' +
    'cloth — and he healed faster than you cut. Nothing you owned made any difference to him at all.');
  p('So you went back up the shaft and read the stone, and came down again, and said it.');
  p('He acquired edges. That is the only way to describe it. For seven seconds he was a thing that could be cut, and ' +
    'then he was nobody again and you had to say it a second time, and a third. Later you learned that every swing you ' +
    'turned aside kept him named a little longer, and that a player who parries well never has to say it twice. The ' +
    'game does not mention this anywhere.');
  p('He had been telling the truth. He did not take her. He was paid to be seen doing it, which for a thing like him ' +
    'is worse than the crime, and you understood on the walk out that you had just killed a bailiff.');
  p('He left you something that opens cracked floors. It is the only key in the game and it is not shaped like one.');

  h('Okọchị Ọkpụkpụ');
  p('The bone road is dry season made into a place. Dead trees, dust, and bones that had been arranged rather than ' +
    'scattered. It was busier than anything before it and it did not stop being busy.');
  p('At the end of it was the largest thing in the game.');
  p('The missionaries turned Ekwensu into their devil, and this is a translation error that has outlived everybody ' +
    'who made it. He is not that. He is war and bargaining and reversal, invoked before a fight and honoured at ' +
    'festival, and what he mostly is, is available.');
  p('He did not hide anything. Every swing outlined itself honestly, the white ones turnable and the gold ones not, ' +
    'and he did not feint once. He killed you several times in plain sight.');
  p('And while he did it he told you who had paid him. He had no reason to lie and he did not appear to enjoy it. ' +
    'A life had been kept back that was owed, and something had to balance the books, and the fee was collected from ' +
    'the nearest available account.');
  p('The name on the contract was yours. You had signed it the day you put your hand in that soil.');
  p('He said it the way you would read out a receipt.');
  p('You killed him anyway, because you had walked a long way and there was nothing else to do with your hands. ' +
    'It did not change anything he had said. He had not been the problem and he had never pretended to be, and ' +
    'when he went down the far door on the bone road opened, which was the only reason the game had needed him ' +
    'to be in the way.');
  p('You stood there for a while afterwards. Then you went east.');

  h('Ọkụ Mmụọ');
  p('The fire that does not go out is not a hell. There is no hell in this. It is a forge, which is a different idea ' +
    'entirely — a place where things stop being provisional.');
  p('The floor burned you if you stood on the wrong part of it. There was a smith at the far end who had been working ' +
    'there long enough to have become part of the building. Its guard closed faster than you could open it, and you ' +
    'spent a while learning that chipping was not going to work here, and then you stopped chipping and hit the body ' +
    'instead and it went down in half the time.');
  p('The last weapon was past it. A brand that keeps burning after you have stopped swinging, so that the arithmetic ' +
    'of every fight afterwards is slightly in your favour and you can walk away from something and have it still be dying.');

  h('Igwe');
  p('Then the sky.');
  p('You were several hundred feet under the ground and there was a sunset. Nobody in the game remarks on this, ever, ' +
    'and the absence of remark is the most frightening thing in it.');
  p('Something was holding the sky up. It never landed. You waited for it to land because everything else in the game ' +
    'had landed and you had built an hour of instinct on the idea that things come down and can be punished when they do. ' +
    'It swept the floor. It stooped at wherever you happened to be standing. The platforms in that room are not decoration.');
  p('You did not have to fight it. It was in the way of nothing.');

  h('Ala Mmụọ');
  p('The land of spirits looked like the first room. The music was the music from the first room. That is not an accident ' +
    'and it is not a shortcut.');
  p('Something was standing where your mother should have been.');
  p('It was your height. It held its hands the way you hold yours when you are pretending not to be afraid. It wore ' +
    'your face, and it was not a copy of your face, which is a distinction that took a moment and then took the floor ' +
    'out from under you.');
  p('There were nine children. Eight are in the ground behind the compound. You are the ninth, and you were meant to be ' +
    'the last, and the arrangement the dibia made under the ogilisi was that you would stay and the traffic would stop.');
  p('When you dug up your own iyi-uwa you broke that from the wrong side. A life kept has to be paid for out of ' +
    'somewhere. It was not taken from you. It was taken for you.');
  p('Onwe is what you were supposed to become: the one who accepted it and went back.');
  p('It fought with your moveset. Every cut it made was a cut you had made first, which meant that it was exactly as ' +
    'fast as you were and exactly as good, and the fight was not a test of skill so much as an unusually literal ' +
    'argument with yourself. In the last quarter it stopped copying you and started remembering things you had done ' +
    'earlier, and that was worse.');
  p('You broke its guard. It went gold and stopped and stood there with its hands down.');

  h('Nkwụghachi');
  p('You killed it.');
  p('The contract was void, because one of the two parties to it was dead. Nothing gave her back. Nothing was ever ' +
    'going to give her back, and the game had been careful never to promise otherwise.');
  p('What you got was smaller and it was the thing you had actually come for without knowing it. You can die properly ' +
    'now. Not today. Someday, once, in the ordinary way, and stay dead, like the eight behind the compound and unlike ' +
    'every one of the deaths you spent getting down here.');
  p('There were no credits. A card came up with your deaths on it and how long you had taken, and then the title, ' +
    'and then nothing.');

  h('Nlọghachi — the going back');
  p('Or you did not kill it.');
  p('Its guard broke and it stood there and you did not press the button. You had perhaps seven seconds. Everything ' +
    'you had learned in the preceding hours said to press it, and the whole design of the moment is that you had to ' +
    'refuse an hour of training on no notice and with no prompt telling you that refusing was an option.');
  p('The prompt faded. Onwe lowered its hands the rest of the way. It did not say anything.');
  p('You walked into it.');
  p('You went back. The arrangement resumed and the traffic reopened and you became the ninth child again, on the ' +
    'other side of it this time, waiting to be born and die and be born. Your mother was returned to the moment before ' +
    'the taking and she remembers none of this. She will bury the rest of them one at a time and she will keep trying, ' +
    'because that was always the problem, and she will never know what it cost or who paid it or that anybody did.');
  p('You chose that. It is the cruellest ending in the game and it is also the only one that gives her anything.');

  h('Onye Ọma — the one who did not');
  p('Or you arrived having killed nothing you did not have to.');
  p('Not the walkers on the path, not the things in the market, not the thrower on the bone road, not the wind holding ' +
    'up the sky. Only the three that stood in doorways, because doors do not open otherwise. Everything else in the ' +
    'world was still standing when you came through the last one, and you had walked past all of it, for hours, ' +
    'with a sword.');
  p('Onwe had nothing to work with. It could only ever do what it had watched you do, and it had watched you not do it.');
  p('Its hands were down when you arrived. It never raised them.');
  p('You walked into it, and the game ended, and the card said what it always says with one line different at the ' +
    'bottom: left standing, and then a number, and the number was everything.');
  return S;
}

// ═══ the appendix ════════════════════════════════════════════════════════════
// Writing a guide is the most careful read anybody gives a codebase, and this is
// where the things that would have had to be lied about go instead. Everything
// here is either derived on the spot or a plain statement that the code and the
// design documents disagree. Nothing here is a fix; fixes go in the game.

function appendix(ctx) {
  const { T } = ctx;
  const S = [];
  const p = (x) => S.push({ t:'p', x });
  const h = (x,l) => S.push({ t:'h', x, l:l||2 });
  const ul = (x) => S.push({ t:'ul', x });

  p('This handbook is generated from the game rather than from the design bible, and the two do not agree ' +
    'everywhere. Where they differ, the pages above describe the game as it actually is. The differences ' +
    'themselves are listed here so that nobody has to find them twice.');

  const bare = T.rooms.map((r,i) => [i, r]).filter(([i,r]) => {
    const t = [...new Set(r.map.join(''))];
    return !t.includes('S') && !t.includes('M');
  });
  S.push({ t:'h', x:'Rooms with neither a rest charm nor a mirror', l:3 });
  p('`03-WORLD` §3.3 asks that every room hold a rest charm within about thirty seconds of walking, or a mirror. ' +
    (bare.length
      ? Many(bare.length) + ' of them do not: ' +
        bare.map(([i,r]) => r.name.split('—')[0].trim() + ' (' + i + ')').join(', ') + '.'
      : 'Every room currently does.'));
  if (bare.length) {
    ul([
      'A boss arena is a defensible exception — the fight is the room, and a charm inside it would undercut the walk back.',
      'The others are not. They are short rooms and the walk back to safety is not long, but the rule does not have a length clause in it, and either the rooms or the rule should move.'
    ]);
  }

  S.push({ t:'h', x:'Nine children, or ten', l:3 });
  p('`02-STORY` §2.2 says the mother buried nine children and the tenth lived, and that the nine strokes of nzu ' +
    'on the player\'s mask are one per burial. The game says something else and says it consistently: there are ' +
    'eight mounds behind the compound, the ninth grave is the hole the player woke in, and Onwe\'s own bestiary ' +
    'entry calls it *the ninth child*. Nine children, eight of them in the ground.');
  p('The game\'s version is the coherent one — nine graves, nine strokes, nine children, the last of them standing ' +
    'in the ninth hole — so this handbook follows it. The bible is the file that needs the edit.');

  S.push({ t:'h', x:'Two things found in the tables and fixed rather than documented', l:3 });
  ul([
    '**Three bestiary entries were invisible.** `ember`, `crawler` and `effigy` were authored with `n` and `d` where every other row uses `t` and `b`, and `renderCodex` reads `t` and `b`. All three drew the literal word *undefined* as their name and showed no description at all. The suite had a guard on this and the guard was written as `e.n || e.t` — the shape of the data rather than the shape of the renderer — so it passed for as long as the bug existed. Both the data and the guard are fixed.',
    '**The codex listed ONWE twice.** Two `LORE` entries shared the id `onwe` and the title `ONWE`, and both unlocked at the same moment. Nothing in the game looks lore up by id, so the only symptom was the duplicate row, but a duplicate key is a trap set for the next person. The second is now `ONWE — THE WORD`.'
  ]);
  return S;
}

// ═══ the map ═════════════════════════════════════════════════════════════════
// MAPPOS in the game is in half-tiles and the room boxes are ROOMS[i].w/h tiles
// wide, so the same coordinates that draw the in-game map draw this one. Room
// contents are read off the tile grid, never listed.

function mapData(T, api) {
  const POS = api.MAPPOS;
  const LINKS = [[0,1],[1,2],[2,3],[1,4],[4,5],[5,2],[3,6],[6,8],[8,9],[9,7],[0,10],[4,11],[2,12]];
  const rooms = T.rooms.map((r,i) => {
    const tiles = [...new Set(r.map.join(''))];
    return {
      i, name:r.name.split('—')[0].trim(), x:POS[i][0], y:POS[i][1], w:r.w*2, h:r.h*2,
      charm: tiles.includes('S'), mirror: tiles.includes('M'),
      shard: tiles.includes('h'), weapon: tiles.includes('F'), stone: tiles.includes('N'),
      boss: ['B','X','O','U','I'].some(c => tiles.includes(c))
    };
  });
  return { rooms, links: LINKS };
}

function mapSvg(T, api) {
  const { rooms, links } = mapData(T, api);
  const SC = 2.6, PAD = 26;
  const maxX = Math.max(...rooms.map(r => r.x + r.w)), maxY = Math.max(...rooms.map(r => r.y + r.h));
  const X = (v) => (v * SC + PAD).toFixed(1), Y = (v) => (v * SC + PAD).toFixed(1);
  // a deterministic wobble, so the boxes are drawn rather than printed
  let seed = 20260804;
  const wob = (n) => { seed = (seed * 1664525 + 1013904223) >>> 0; return (seed / 4294967296 - 0.5) * n; };
  const out = [];
  out.push('<svg class="map" viewBox="0 0 ' + (maxX*SC + PAD*2).toFixed(0) + ' ' +
           (maxY*SC + PAD*2 + 26).toFixed(0) + '" role="img" ' +
           'aria-label="A map of the thirteen rooms of Odinala and the ways between them">');
  out.push('<title>What you have walked</title>');

  // the ways between, drawn first and underneath, so a room sits on top of its
  // own doorways rather than being crossed out by them
  for (const [a,b] of links) {
    const ra = rooms[a], rb = rooms[b];
    const ax = ra.x + ra.w/2, ay = ra.y + ra.h/2, bx = rb.x + rb.w/2, by = rb.y + rb.h/2;
    const mx = (ax+bx)/2 + wob(12), my = (ay+by)/2 + wob(12);
    out.push('<path class="lnk" d="M' + X(ax) + ' ' + Y(ay) + ' Q' + X(mx) + ' ' + Y(my) +
             ' ' + X(bx) + ' ' + Y(by) + '"/>');
  }

  for (const r of rooms) {
    const x0 = r.x, y0 = r.y, x1 = r.x + r.w, y1 = r.y + r.h;
    const d = 'M' + X(x0+wob(2.5)) + ' ' + Y(y0+wob(2.5)) +
              ' L' + X(x1+wob(2.5)) + ' ' + Y(y0+wob(2.5)) +
              ' L' + X(x1+wob(2.5)) + ' ' + Y(y1+wob(2.5)) +
              ' L' + X(x0+wob(2.5)) + ' ' + Y(y1+wob(2.5)) + ' Z';
    out.push('<path class="rm' + (r.boss ? ' boss' : '') + '" d="' + d + '"/>');

    // the floor of the room, one point per column: the topmost solid tile. It
    // is read off the same grid the game walks on, so the silhouette in here is
    // the silhouette down there.
    const src = T.rooms[r.i], pts = [];
    const sol = (x,y) => { const c = api.tileAt(src, x, y); return c === '#' || c === 'c'; };
    for (let tx = 0; tx < src.w; tx++) {
      // the first solid tile with air above it, which is the floor you would
      // land on, rather than the ceiling every column starts with
      let ty = src.h - 0.5;
      for (let y = 1; y < src.h; y++) if (sol(tx, y) && !sol(tx, y - 1)) { ty = y; break; }
      pts.push(X(r.x + tx*2) + ' ' + Y(r.y + ty * 2));
    }
    out.push('<polyline class="flr" points="' + pts.join(' ') + '"/>');

    out.push('<text class="rn" x="' + X(x0) + '" y="' + (r.y*SC + PAD - 6).toFixed(1) + '">' +
             r.i + '  ' + esc(r.name) + '</text>');
    const marks = [];
    if (r.charm)  marks.push(['charm', '\u25c6']);
    if (r.mirror) marks.push(['mirror', '\u25cb']);
    if (r.shard)  marks.push(['shard', '\u2665']);
    if (r.weapon) marks.push(['weapon', '\u2020']);
    if (r.stone)  marks.push(['stone', '\u2016']);
    if (r.boss)   marks.push(['bossmk', '\u25b2']);
    marks.forEach((m, j) => out.push('<text class="mk ' + m[0] + '" x="' +
      (r.x*SC + PAD + 6 + j*16).toFixed(1) + '" y="' + (y0*SC + PAD + 16).toFixed(1) + '">' + m[1] + '</text>'));
  }
  out.push('<text class="key" x="' + PAD + '" y="' + (maxY*SC + PAD + 18).toFixed(0) + '">' +
           '\u25c6 rest charm \u00b7 \u25cb mirror \u00b7 \u2665 heart shard \u00b7 \u2020 a weapon ' +
           '\u00b7 \u2016 the stone \u00b7 \u25b2 something waits here' +
           '</text>');
  out.push('</svg>');
  return out.join('\n');
}

// The Markdown map is the same graph drawn with a pen. Room numbers come off
// the table, so a renumbered world moves the diagram with it.
function mapAscii(T) {
  const n = (i) => '[' + i + '] ' + T.rooms[i].name.split('—')[0].trim();
  return [
    '    ' + n(11),
    '      |',
    '    ' + n(4) + ' ---- ' + n(5),
    '      |                         |',
    '    ' + n(1) + ' ------------- ' + n(2) + ' ---- ' + n(12),
    '      |                         |',
    '    ' + n(0) + '            ' + n(3),
    '      |                         |',
    '    ' + n(10) + '        ' + n(6),
    '                                |',
    '                             ' + n(8),
    '                                |',
    '                             ' + n(9),
    '                                |',
    '                             ' + n(7)
  ].join('\n');
}

// ═══ assembling the document ═════════════════════════════════════════════════

// Section marks. These are drawn in the manner of nsibidi — an ideographic
// script that is genuinely Igbo and Ejagham — but not one of them is a real
// nsibidi sign and none of them means anything. They are ink, chosen for the
// page. Inventing meaning for a living script is not ours to do; borrowing its
// visual grammar of strokes, arcs and crossings is.
const MARK = {
  // four strokes and a bar: the teaching, counted out
  teaching: 'M4 4 L4 20 M10 4 L10 20 M16 4 L16 20 M22 4 L22 20 M1 12 L25 12',
  // a line that turns twice: the road
  road:     'M2 20 L9 6 L17 20 L24 6',
  // a closed ring struck through: the answer inside the question
  answers:  'M13 3 A9 9 0 1 0 13 21 A9 9 0 1 0 13 3 M4 21 L22 3',
  // two figures, one behind the other, sharing a foot
  odinala:  'M8 21 L8 8 L13 3 L18 8 L18 21 M13 3 L13 21 M4 21 L22 21',
  // a mark struck out: the errata
  errata:   'M3 8 L23 8 M3 16 L23 16 M9 3 L7 21 M19 3 L17 21'
};
const glyph = (k) => '<svg class="glyph" viewBox="0 0 26 24" aria-hidden="true">' +
  '<path d="' + MARK[k] + '"/></svg>';

const PARTS = [
  { n:'I',   id:'teaching', t:'THE TEACHING',
    sub:'How the game works. No spoilers of any kind \u2014 nothing here that the first ten minutes does not already show you.',
    spoil:0, build:partOne },
  { n:'II',  id:'road', t:'THE ROAD',
    sub:'Where to go, in order, and what is worth finding. Light spoilers: this names every place and every thing, but never where.',
    spoil:1, build:partTwo },
  { n:'III', id:'answers', t:'THE ANSWERS',
    sub:'Riddles, bosses, the name, the endings. Complete spoilers.',
    spoil:2, build:partThree },
  { n:'IV',  id:'odinala', t:'\u1eccD\u1ecaNALA',
    sub:'The whole game, as a story. Complete spoilers, including all three endings.',
    spoil:3, build:partFour }
];

function sections(ctx) {
  return PARTS.map(P => Object.assign({}, P, { body: P.build(ctx) }));
}

// ── Markdown ─────────────────────────────────────────────────────────────────
// Bold/italic markers in the prose are Markdown already, so this emitter mostly
// gets out of the way. The HTML one has to convert them.

function mdInline(s) { return String(s); }

function mdTable(head, rows) {
  const cells = (r) => '| ' + r.map(c => String(c).replace(/\|/g,'\\|')).join(' | ') + ' |';
  return [cells(head), '|' + head.map(()=>'---').join('|') + '|'].concat(rows.map(cells)).join('\n');
}

function buildMarkdown(ctx) {
  const L = [];
  L.push('# Ọdịnala — the handbook');
  L.push('');
  L.push('*Generated from the game itself by `node tools/handbook.js`. Every number below is read out of ' +
         'the live tables in `odinala.html`, and `test.js` asserts them back against those tables — so if a ' +
         'weapon is retuned and this file is not regenerated, the build goes red. Do not edit this file by hand.*');
  L.push('');
  L.push('It is in four parts and they get worse as they go.');
  L.push('');
  for (const P of PARTS) L.push('- **Part ' + P.n + ' — ' + P.t + '.** ' + P.sub);
  L.push('');
  L.push('---');
  L.push('');
  for (const P of sections(ctx)) {
    L.push('## Part ' + P.n + ' — ' + P.t);
    L.push('');
    if (P.spoil === 1) L.push('> **Spoiler warning — light.** ' + P.sub);
    if (P.spoil === 2) L.push('> **Spoiler warning — complete.** ' + P.sub +
      ' Stop here if you have not finished the game. It will still be a good game afterwards. It will not be the same one.');
    if (P.spoil === 3) L.push('> **Spoiler warning — complete, including all three endings.** ' + P.sub);
    if (P.spoil) L.push('');
    for (const node of P.body) {
      if (node.t === 'p')    { L.push(mdInline(node.x)); L.push(''); }
      else if (node.t === 'h') { L.push('#'.repeat(node.l + 1) + ' ' + node.x); L.push(''); }
      else if (node.t === 'ul') { node.x.forEach(li => L.push('- ' + mdInline(li))); L.push(''); }
      else if (node.t === 'tbl') { L.push(mdTable(node.head, node.rows)); L.push(''); }
      else if (node.t === 'note') { L.push('> ' + mdInline(node.x)); L.push(''); }
      else if (node.t === 'warn') { L.push('> **Read this first.** ' + mdInline(node.x)); L.push(''); }
      else if (node.t === 'map') { L.push('```'); L.push(mapAscii(ctx.T)); L.push('```'); L.push('');
        L.push('Rest charm, mirror, heart shard and weapon locations are in the table above.'); L.push(''); }
    }
    L.push('---');
    L.push('');
  }
  L.push('## Appendix — the errata');
  L.push('');
  for (const node of appendix(ctx)) {
    if (node.t === 'p') { L.push(mdInline(node.x)); L.push(''); }
    else if (node.t === 'h') { L.push('#'.repeat(node.l + 1) + ' ' + node.x); L.push(''); }
    else if (node.t === 'ul') { node.x.forEach(li => L.push('- ' + mdInline(li))); L.push(''); }
  }
  L.push('---');
  L.push('');
  L.push('*Ọdịnala is one HTML file. So, nearly, is this.*');
  L.push('');
  return L.join('\n');
}

// ── HTML ─────────────────────────────────────────────────────────────────────

function inline(s) {
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

const CSS = `
:root{
  --ink:#06080a; --ink2:#0b0f13; --bone:#cfc6ad; --bone-d:#8d8877; --hi:#e6dcc0;
  --gold:#c8952e; --gold-d:#6b5019; --uhie:#8a1c26; --spirit:#6fb7c8;
  --serif: ui-serif, Georgia, 'Times New Roman', serif;
  --sans: ui-sans-serif, system-ui, 'Segoe UI', Helvetica, Arial, sans-serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--ink);color:var(--bone);font-family:var(--serif);
  font-size:17px;line-height:1.66;-webkit-text-size-adjust:100%}
.wrap{max-width:46rem;margin:0 auto;padding:2.5rem 1.15rem 6rem}
a{color:var(--gold);text-decoration:none;border-bottom:1px solid var(--gold-d)}
a:hover{border-bottom-color:var(--gold)}
strong{color:var(--hi);font-weight:600}
em{color:var(--bone-d)}
hr{border:0;border-top:1px solid var(--gold-d);margin:2.6rem 0}

.mast{text-align:center;padding:1rem 0 2rem;border-bottom:1px solid var(--gold-d)}
.mast h1{font-family:var(--sans);font-size:2.1rem;letter-spacing:.42em;text-indent:.42em;
  margin:0 0 .35rem;font-weight:400;color:var(--hi)}
.mast .sub{font-family:var(--sans);font-size:.68rem;letter-spacing:.3em;text-indent:.3em;
  text-transform:uppercase;color:var(--gold);margin:0}
.mast .strokes{margin:1.2rem auto 0;width:150px;height:22px;display:block}
.mast .strokes path{fill:none;stroke:var(--bone-d);stroke-width:2.6;stroke-linecap:round}
.gen{font-size:.8rem;color:var(--bone-d);text-align:center;margin:1.4rem auto 0;max-width:34rem;font-style:italic}

.toc{margin:2.4rem 0 0}
.toc h2{font-family:var(--sans);font-size:.7rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--gold);border:0;padding:0;margin:0 0 .9rem}
.toc ol{list-style:none;margin:0;padding:0;counter-reset:none}
.toc li{display:flex;gap:.75rem;align-items:baseline;padding:.55rem 0;border-bottom:1px dotted #1e2429}
.toc .rn{font-family:var(--sans);color:var(--gold);font-size:.74rem;letter-spacing:.16em;
  min-width:2.6rem;padding-top:.2rem}
.toc .tt{flex:1}
.toc .tt b{display:block;font-family:var(--sans);font-weight:500;letter-spacing:.12em;color:var(--hi);font-size:.92rem}
.toc .tt span{display:block;font-size:.85rem;color:var(--bone-d);line-height:1.45}

h2,h3,h4{font-family:var(--sans);font-weight:500;color:var(--hi);line-height:1.3}
h2{font-size:1.12rem;letter-spacing:.14em;margin:2.8rem 0 .9rem;
  border-bottom:1px solid #1c2228;padding-bottom:.45rem}
h3{font-size:.94rem;letter-spacing:.12em;margin:2rem 0 .5rem;color:var(--gold)}
h4{font-size:.84rem;letter-spacing:.1em;margin:1.4rem 0 .4rem}
p{margin:0 0 1rem}
ul{padding-left:1.15rem;margin:0 0 1.1rem}
li{margin:0 0 .5rem}

.part{margin-top:3.4rem}
.part>.head{display:flex;gap:1rem;align-items:flex-start;border-top:1px solid var(--gold-d);padding-top:1.5rem}
.part .glyph{width:30px;height:28px;flex:0 0 30px;margin-top:.2rem}
.part .glyph path{fill:none;stroke:var(--gold);stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.part .head h2{border:0;padding:0;margin:0;font-size:1.3rem;letter-spacing:.2em}
.part .head .num{font-family:var(--sans);font-size:.66rem;letter-spacing:.3em;color:var(--gold);
  text-transform:uppercase;display:block;margin-bottom:.3rem}
.part .head .sub{font-size:.9rem;color:var(--bone-d);margin:.4rem 0 0}

.gate{margin:1.4rem 0 0;border:1px solid var(--gold-d);background:#0a0d10;padding:1.1rem 1.2rem}
.gate p{font-size:.9rem;color:var(--bone-d);margin:0 0 .9rem}
.gate .lvl{font-family:var(--sans);font-size:.64rem;letter-spacing:.26em;text-transform:uppercase;
  color:var(--uhie);display:block;margin-bottom:.5rem}
.gate button{font-family:var(--sans);font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  background:transparent;color:var(--gold);border:1px solid var(--gold);padding:.6rem 1.1rem;cursor:pointer}
.gate button:hover{background:var(--gold);color:var(--ink)}
.body[hidden]{display:none}

.note{border-left:2px solid var(--gold-d);padding:.15rem 0 .15rem 1rem;margin:1.2rem 0;
  color:var(--bone-d);font-size:.94rem}
.warn{border:1px solid var(--uhie);background:#12080a;padding:1.1rem 1.2rem;margin:1.4rem 0;font-size:.95rem}
.warn b{display:block;font-family:var(--sans);font-size:.66rem;letter-spacing:.26em;text-transform:uppercase;
  color:var(--uhie);margin-bottom:.55rem}

.tw{overflow-x:auto;margin:0 0 1.4rem;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-family:var(--sans);font-size:.82rem;line-height:1.45}
table.fd{font-variant-numeric:tabular-nums;white-space:nowrap;min-width:32rem}
th{text-align:left;font-weight:500;color:var(--gold);letter-spacing:.1em;font-size:.68rem;
  text-transform:uppercase;border-bottom:1px solid var(--gold-d);padding:.45rem .7rem .35rem}
td{padding:.5rem .7rem;border-bottom:1px solid #161b20;vertical-align:top;color:var(--bone)}
tr:last-child td{border-bottom:0}
td:first-child{color:var(--hi)}

/* the one element allowed out of the text column: at 46rem the whole world is
   drawn four pixels tall and nothing on it can be read */
svg.map{display:block;height:auto;margin:0 auto 1.2rem;background:#080b0e;border:1px solid #161b20;
  width:min(100vw - 2rem, 68rem);max-width:none;
  margin-left:calc(50% - min(50vw - 1rem, 34rem))}
svg.map .lnk{fill:none;stroke:#3c444c;stroke-width:2;stroke-linecap:round}
svg.map .rm{fill:#0d1216;stroke:var(--bone-d);stroke-width:1.4;stroke-linejoin:round}
svg.map .rm.boss{stroke:var(--uhie);fill:#130c0e}
svg.map .flr{fill:none;stroke:#3f4850;stroke-width:1.2;stroke-linejoin:round}
svg.map .rn{font-family:var(--sans);font-size:11px;fill:#a49d8b;letter-spacing:.06em}
svg.map .mk{font-size:14px}
svg.map .charm{fill:var(--uhie)} svg.map .mirror{fill:var(--spirit)}
svg.map .shard{fill:#d05a63} svg.map .weapon{fill:var(--gold)} svg.map .stone{fill:var(--bone)}
svg.map .bossmk{fill:var(--uhie)}
svg.map .key{font-family:var(--sans);font-size:11px;fill:var(--bone-d);letter-spacing:.04em}

.bugs{margin-top:3rem;border-top:1px solid var(--uhie);padding-top:1.4rem}
footer{margin-top:4rem;border-top:1px solid #1c2228;padding-top:1.2rem;
  font-size:.8rem;color:var(--bone-d);text-align:center;font-style:italic}

@media (max-width:520px){
  body{font-size:16px} .wrap{padding:1.6rem .9rem 4rem}
  .mast h1{font-size:1.5rem;letter-spacing:.3em;text-indent:.3em}
  .part .head{gap:.7rem} .part .head h2{font-size:1.1rem}
  .tw{margin-left:-.9rem;margin-right:-.9rem;padding:0 .9rem}
  svg.map{width:calc(100vw - 1.8rem);margin-left:-.9rem}
}

@media print{
  :root{--ink:#fff;--ink2:#fff;--bone:#15120c;--bone-d:#4a463c;--hi:#000;--gold:#6b5019;--gold-d:#a9967a;--uhie:#6d1620}
  body{background:#fff;color:#15120c;font-size:10.5pt}
  .wrap{max-width:none;padding:0}
  .gate{display:none}
  .body[hidden]{display:block}
  .part{page-break-before:always}
  h2,h3{page-break-after:avoid} table,.tw,svg.map{page-break-inside:avoid}
  .tw{overflow:visible} table.fd{min-width:0;white-space:normal}
  svg.map{background:#fff;width:100%;margin-left:0} svg.map .rm{fill:#f2efe8}
  svg.map .flr{stroke:#b9b2a2} svg.map .rn{fill:#4a463c}
  .warn{background:#faf4f4}
  .gate,footer .no-print{display:none}
  a{color:inherit;border:0}
}
`;

const JS = `
(function(){
  var gates = document.querySelectorAll('.gate');
  for (var i=0;i<gates.length;i++){
    (function(g){
      var btn = g.querySelector('button');
      var body = document.getElementById(g.dataset.opens);
      btn.addEventListener('click', function(){
        body.hidden = false;
        g.hidden = true;
        body.scrollIntoView({block:'start'});
      });
    })(gates[i]);
  }
})();
`;

function htmlNodes(body, ctx) {
  const out = [];
  for (const n of body) {
    if (n.t === 'p') out.push('<p>' + inline(n.x) + '</p>');
    else if (n.t === 'h') out.push('<h' + n.l + '>' + inline(n.x) + '</h' + n.l + '>');
    else if (n.t === 'ul') out.push('<ul>' + n.x.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul>');
    else if (n.t === 'note') out.push('<p class="note">' + inline(n.x) + '</p>');
    else if (n.t === 'warn') out.push('<div class="warn"><b>Read this first</b>' + inline(n.x) + '</div>');
    else if (n.t === 'map') out.push(mapSvg(ctx.T, ctx.api));
    else if (n.t === 'tbl') {
      out.push('<div class="tw"><table' + (n.cls ? ' class="' + n.cls + '"' : '') + '><thead><tr>' +
        n.head.map(x => '<th>' + inline(x) + '</th>').join('') + '</tr></thead><tbody>' +
        n.rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('') +
        '</tbody></table></div>');
    }
  }
  return out.join('\n');
}

function buildHtml(ctx) {
  const S = sections(ctx);
  const L = [];
  L.push('<!doctype html><html lang="en"><head><meta charset="utf-8">');
  L.push('<meta name="viewport" content="width=device-width,initial-scale=1">');
  L.push('<title>Ọdịnala — the handbook</title>');
  L.push('<style>' + CSS + '</style></head><body><div class="wrap">');

  L.push('<header class="mast"><h1>Ọdịnala</h1><p class="sub">the handbook</p>' +
    // the nine strokes of nzu across the player's brow, one per child. The
    // wobble is deterministic so the masthead does not change between builds.
    '<svg class="strokes" viewBox="0 0 150 22" aria-hidden="true">' +
    Array.from({length:9}, (_,i) => {
      const j = (n) => ((Math.sin((i+1)*n) * 10000) % 1) * 2.2;
      const x = 9 + i*16.2;
      return '<path d="M' + (x + j(3)).toFixed(1) + ' ' + (3 + j(7)).toFixed(1) +
             ' Q' + (x + 3 + j(11)).toFixed(1) + ' 11 ' +
             (x + 5 + j(5)).toFixed(1) + ' ' + (19 + j(13)).toFixed(1) + '"/>';
    }).join('') +
    '</svg></header>');
  L.push('<p class="gen">Generated from the game by <code>node tools/handbook.js</code>. Every number in it is ' +
    'read out of the live tables in <code>odinala.html</code>, and the test suite asserts them back against those ' +
    'tables — so a retuned weapon and a stale handbook is a red build. Do not edit this file by hand.</p>');

  L.push('<nav class="toc"><h2>Contents</h2><ol>');
  for (const P of S) L.push('<li><span class="rn">' + P.n + '</span><span class="tt"><b>' +
    esc(P.t) + '</b><span>' + esc(P.sub) + '</span></span></li>');
  L.push('</ol></nav>');

  for (const P of S) {
    L.push('<section class="part" id="part-' + P.id + '">');
    L.push('<div class="head">' + glyph(P.id) +
      '<div><h2><span class="num">Part ' + P.n + '</span>' + esc(P.t) + '</h2>' +
      '<p class="sub">' + esc(P.sub) + '</p></div></div>');
    if (P.spoil) {
      const lvl = P.spoil === 1 ? 'Light spoilers' : 'Complete spoilers';
      const say = P.spoil === 1
        ? 'This part names every place in the game and everything worth finding in it. It does not say where anything is, and it does not touch the story. Open it if you are stuck.'
        : P.spoil === 2
        ? 'Riddle answers, every boss taken apart, the true name, and all three endings with their exact conditions. Knowing things is the only progression this game has. Do not open this until you have finished it.'
        : 'The whole game written out as a story, carrying every ending. There is nothing left after this.';
      L.push('<div class="gate" data-opens="body-' + P.id + '">' +
        '<span class="lvl">' + lvl + '</span><p>' + say + '</p>' +
        '<button type="button">Show Part ' + P.n + '</button></div>');
      L.push('<div class="body" id="body-' + P.id + '" hidden>');
    } else {
      L.push('<div class="body" id="body-' + P.id + '">');
    }
    L.push(htmlNodes(P.body, ctx));
    L.push('</div></section>');
  }

  L.push('<section class="part bugs" id="errata"><div class="head">' +
    glyph('errata') + '<div><h2><span class="num">Appendix</span>THE ERRATA</h2>' +
    '<p class="sub">Where the game and its design documents disagree, and what was found in the tables while ' +
    'writing this.</p></div></div><div class="body">');
  L.push(htmlNodes(appendix(ctx), ctx));
  L.push('</div></section>');
  L.push('<footer>Ọdịnala is one HTML file. So, nearly, is this.</footer>');
  L.push('</div><script>' + JS + '<\/script></body></html>');
  return L.join('\n');
}

module.exports = { esc, WORDS, COUNT, many, Many, band, weaponRows, partOne, partTwo, partThree, partFour, appendix,
                   mapSvg, mapAscii, mapData, PARTS, buildMarkdown, buildHtml };
