# Ọdịnala — repository guide

**This file is the quick reference. The full specification is in `bible/`.**

Before doing anything, read `bible/13-CLAUDE-MANUAL.md`. It is the operating
manual for this project and it tells you which chapter to read for the task in
front of you. Then read `bible/01-VISION.md` §1.5 — the five design pillars —
because everything you build has to serve one of them.

`bible/00-INDEX.md` lists all fourteen chapters.

---

# Ọdịnala — working notes

An Igbo-mythology Metroidvania. One file, no build step, no dependencies.
Open `odinala.html` in a browser and it runs.

## Before changing anything

```bash
node test.js
```

552 assertions, headless, about 18 seconds. It stubs the DOM, the 2D context,
AudioContext, `localStorage` and the frame clock, loads the real script out of
`odinala.html`, and drives the real loop one tick at a time — it tests the game,
not a model of it. It ends with two randomised soaks (12k and 14k frames of
button mashing across every screen) checking for NaN and illegal states.
**If it does not end with `0 failures`, the change is not done.**

The audio stub *records* instead of no-opping, so "silence is a bug" is
assertable: every emitter in the game short-circuits on `if(!AC) return`, and a
null AudioContext would hide every silent event rather than catch it. Sound only
starts after a key is delivered through the game's own listeners, the same
unlock handshake a real device does.

Assertions tagged **REGRESSION** guard a bug this project has actually shipped:
dropped inputs during hitstop, multi-hit swings, colliding save slots, arrivals
that bury the player in rock, a shade reclaimed on the frame you dropped it, and
a silent equipment swap. Do not weaken one to make a change pass — put the bug
back instead and watch it go red, which is how each of them was verified.

Syntax check on its own:

```bash
python3 -c "import io;s=io.open('odinala.html',encoding='utf-8').read();js=s.split('<script>')[1].split('</script>')[0];io.open('/tmp/game.js','w',encoding='utf-8').write(js)" && node --check /tmp/game.js
```

The test harness reaches into the game through a hook at the very bottom of
the script (`__ODINALA_TEST`). If you add a system, add it to that export and
write assertions for it.

## Shape of the file

Everything lives in one `<script>`. Rough order:

1. **Canvas + input** — logical space is 480×270, painted at 2× (`SC`).
   `px()` snaps to half-pixels; `pxf()` doesn't, for fine detail.
2. **Save/load** — `localStorage` with a keyed in-memory fallback. Two slots:
   normal and speedrun.
3. **Audio** — `initAudio()` does the silent-buffer unlock handshake. The music
   is a live 12-pulse step sequencer with synthesized ogene, udu, ekwe, ichaka,
   opi and palm-wine guitar. Voices are per-character blips, one profile per
   speaker.
4. **Rooms** — 10 hand-drawn ASCII maps, one char per tile, plus an `exits` list.
   Tile chars: `#` solid, `-` platform, `c` cracked, `E` exit, `S` charm,
   `N` chalk, `M` mirror, `h` heart shard, `w l t W v a k i` enemies, `F` weapon, `^` hazard, `B X O` bosses.
5. **Entities** — player state machine, nine enemy kinds, three bosses.
6. **Systems** — tutorial, riddles, mirrors, ledger, codex, map, pause, ending.
7. **Rendering** — background (baked), tiles, props, entities, foreground,
   lights, grain, HUD.

## Things that will bite you

- **`ctx` is `let`, not `const`.** `buildBackLayers()` temporarily swaps it to an
  offscreen canvas. If you reassign it, put it back.
- **Background layers are cached per room.** Anything static you add to `drawBG`
  belongs in `buildBackLayers()`, keyed off `bgRoom`. Anything animated must stay
  in the per-frame path or it will freeze.
- **One swing, one hit.** `P.swingId` increments per attack and entities carry
  `hitId`. Skip this and damage multiplies by the number of active frames.
- **Input survives hitstop.** `pressed` flags are only cleared on frames where
  `update()` actually ran. Clearing them unconditionally makes heavy hits feel
  broken.
- **Artifacts block `localStorage`.** The fallback keeps saves in memory for the
  session and says so honestly. Don't "fix" it by assuming storage exists.
- **`say()` is a banner, not a modal.** For anything blocking, use a mode.

## Adding a mode (menu, screen, overlay)

Three places: a `case` in the `frame()` switch, a branch in the render dispatch
below it, and an entry in `MENU_MODES` so the joystick snaps to one direction
and hold-to-scroll works.

## Adding an enemy

`mkThing()` builder → a branch in `enemyUpdate` → a branch in `drawEnemy` →
a spawn char in `spawnRoom` → the char in your room map → an entry in `BESTIARY`.
Give it a `tell` of `'white'` (parryable) or `'gold'` (must be rolled) — that
distinction is the whole defensive game.

## Weapons

`WEAPONS` is a table of four, each with its own `chain` (the light combo),
`heavy`, `air`, an `ofo` multiplier and an optional `burn`. Nothing reads the
old `ATK`/`HEAVY`/`AIRCUT` constants any more — go through `WA()` (the equipped
weapon) and `CHAIN()` (its combo). Chain length varies, so never assume 3:
`P.combo` cycles modulo `CHAIN().length`.

- `mma` machete — the default, three strokes, balanced
- `nkwu` twin knives — four fast strokes, low damage, 2.1x ọfọ gain
- `ogu` war staff — long reach, slow, heavy poise damage
- `oku` firebrand — found in room 8, applies `e.burn` for damage over time

Bought at the ledger (nkwu, ogu) or found (oku). `B` cycles; there is also a
pause-menu row with left/right.

## Hazards

`^` is a hazard tile. In room 8 it paints as molten rock with a moving surface
and throws the player clear; everywhere else it is spikes. It is not solid — the
check is a tile lookup under the player's feet in `playerUpdate`, gated on
`G.cheat` and i-frames.

## The ten rooms

0 charm · 1 path · 2 shaft · 3 Ogbunabali · 4 market · 5 water · 6 bone road ·
7 land of spirits (Onwe, the ending) · 8 hellfire · 9 open sky

Route: 6 → 8 → 9 → 7. The bone road's second exit carries `needs:'ekwensu'`,
so the way onward only opens once that boss is down. If you add a room, update
`MAPPOS`, `ROOM_TRACK`, `AMBIENT`, the `STONE` palette index in `drawTiles`,
and the `link()` calls in `renderMap` — all of them are indexed by room number.

## Environment painters

`treeShape` (roots, bark, forked limbs, canopy, `dead:true` for the bone road),
`stoneColumn`, `maskFace`, `idolStatue`, `skullShape`, `hornPair`. Rooms 8 and 9
paint their own sky in `drawBG` — hellfire gets breathing heat, lit cliffs and
rising sparks; the sky room gets a low sun, three parallax cloud banks lit along
their tops, hills, stars and birds. `windAt(t)` drives leaf motion in the
foreground; use it for anything that should move with the same gust.

## Ideas that were scoped out

- A second ending branch (the choice is stubbed as `G.ending`, only 1 is used)
- Charm/relic equipment slots, in the style of Blasphemous rosary beads
- Boss rush from the codex
- Room 9 (the sky) has space for a fourth boss
- A fifth weapon; the table is trivial to extend
- Weapon-specific heavy attacks (currently one shape per weapon)
