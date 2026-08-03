# 09 — Technical Architecture, Standards and Testing

## 9.1 Constraints (restated, because they govern everything)

- Pure HTML/CSS/JS. **One file.** No build step, no dependencies, no npm, no TypeScript.
- Canvas 2D only. No WebGL.
- No external assets of any kind — no images, no audio files, no web fonts.
- No network calls at runtime.
- Mobile-first. 60 FPS on a mid-range Android in a browser tab.
- `localStorage` optional; must degrade gracefully.

## 9.2 File anatomy

`odinala.html`, roughly 5,200 lines. One `<script>`. Order:

| Section | Contents |
|---|---|
| 1. Shell | Canvas, `SC` transform, `fit()`, `toLogical()`, `px`/`pxf`, input tables, `CODES`, `MENU_MODES`, `menuRepeat()` |
| 2. Persistence | `store` / `load` / `saveGame` / `loadGame` / `slot()`, two save slots |
| 3. Audio | `initAudio`, `tone`, `nz`, `S`, the music sequencer, `VOICE`, `voiceBlip` |
| 4. Data | `ROOMS` (13 ASCII maps), `WEAPONS`, `SPELLS`, `RIDDLES`, `MIRRORS`, `LORE`, `BEASTS`, `STORY` and cutscene beats |
| 5. State | `G` (global), `P` (player), `R` (current room), `cam`, `enemies`, `boss`, `shots`, `parts`, `pickups`, `shrines`, `decals`, `amb` |
| 6. Entities | Builders, `enemyUpdate`, `bossUpdate`, `playerUpdate`, `swing`, `damage`, `hurtPlayer`, `tryParry` |
| 7. Systems | Tutorial, riddles, mirrors, ledger, codex, map, pause, inventory, ending |
| 8. Rendering | `buildBackLayers` (cached), `drawBG`, `drawTiles`, `drawProps`, entity painters, `drawForeground`, `drawLights`, `drawGrain`, `drawHUD` |
| 9. Loop | `frame()` — a mode switch, then a render dispatch |
| 10. Test hook | `__ODINALA_TEST` export |

## 9.3 The loop

Fixed timestep, 60 Hz, accumulator capped at 60 ms.

```js
while (acc >= step) {
  acc -= step;
  menuRepeat();
  let consumed = true;
  switch (G.mode) {
    case 'title': G.t++; titleUpdate(); break;
    /* ... one case per mode ... */
    default:
      if (G.hitstop > 0) { G.hitstop--; consumed = false; }
      else if (G.slow > 0 && G.t % 2 === 0) { G.slow--; G.t++; consumed = false; }
      else update();
  }
  if (consumed) for (const k in pressed) pressed[k] = false;
}
```

**The `consumed` flag is load-bearing.** It is why a tap during a freeze frame is not
eaten. Do not simplify it.

### The crash guard

`frame()` is a wrapper. All the work is in `frameBody()`, and the wrapper is:

```js
function frame(now){
  try{ frameBody(now); }
  catch(err){ /* log once, G.crashed = true, restore ctx, draw a notice */ }
  requestAnimationFrame(frame);   // unconditional — this is the whole point
}
```

**The rAF call is outside the try and must stay there.** A throw anywhere in any update
or painter used to escape `frame()`, skip the re-schedule, and stop the game permanently:
the player sees a frozen picture, does not know it is a crash, and loses the run. One bad
property lookup should never be able to do that again.

On a caught error the guard also restores `ctx` from `baseCtx`. `buildBackLayers()` swaps
`ctx` for an offscreen context; if it throws mid-bake the swap-back never happens and
every later frame paints into a discarded canvas — which looks exactly like a freeze.

`G.crashed` and `G.crashErr` are set once and surfaced as a small non-blocking strip at
the bottom of the screen. The game keeps playing. **A game running with one broken system
beats a game that has stopped.**

### The soft-lock net

`unstickPlayer()` is the first thing `playerUpdate()` calls. If the player's body overlaps
solid tiles — which should be impossible — it searches outward in 2px steps up to three
tiles, preferring up, and moves them to the first free spot; if nothing is free it returns
them to the last rest charm. It is silent: no message, no mode, the player never learns it
exists.

It tests `SOLID` only. One-way platforms are deliberately excluded, because resting on one
is normal and is not being stuck.

This is a net, not a licence. `tools/audit.py` is what stops bad geometry shipping; this is
what stops bad geometry ending a run if it does.

## 9.4 Coding standards

### Naming
- `G` global game state, `P` player, `R` current room, `C` colour palette.
- Painters are verbs: `drawTiles`, `treeShape`, `maskFace`.
- Builders are `mkThing`.
- Constants that are data tables are `SCREAMING`: `ROOMS`, `WEAPONS`, `SPELLS`, `BELL7`.
- Frame counters are `t`; cooldowns are `cd`; timers count **down**.

### Style
- Two-space indent. Semicolons. `const` by default.
- **Comments explain *why*, never *what*.** `// the inharmonic partials are why it rings
  like metal` is a good comment. `// draw the bell` is noise.
- Functions do one thing. If a function needs a section header comment inside it, split it.
- **No classes.** Plain objects and functions. The codebase is consistent about this.
- **No `async`/`await` in the game loop.** The only promise is `AudioContext.resume()`.

### The traps — each of these was a real bug

1. **`ctx` is `let`, not `const`.** `buildBackLayers()` swaps it to an offscreen canvas
   and swaps it back. If you reassign it, restore it in the same function, and use
   `try`/`finally` if there is any chance of throwing.
2. **One swing, one hit.** `P.swingId` increments per attack; entities carry `hitId`.
   Remove the guard and every attack silently multiplies damage by its active frames.
3. **Baked background.** Anything static you add to the far layers goes in
   `buildBackLayers()`. Anything animated must stay in the per-frame path or it freezes.
4. **Chain length varies by weapon.** Never assume 3. `P.combo` cycles modulo
   `CHAIN().length`.
5. **Nothing reads `ATK` / `HEAVY` / `AIRCUT` any more.** Go through `WA()` and `CHAIN()`.
6. **Memory save fallback is keyed.** It was a single variable once, and the speedrun
   save clobbered the real one.
7. **`say()` is a banner, not a modal.** For anything blocking, add a mode.
8. **Timers count down and are decremented in exactly one place.** Two decrements is a
   heisenbug.

### Adding a room — the five-table checklist
Rooms are indexed and **five separate tables are keyed by index**. Miss one and you get
a silent wrong-palette or a crash:
1. `ROOMS` — the map and its `exits`
2. `MAPPOS` — thumbnail position on the map screen
3. `ROOM_TRACK` — which music track
4. `AMBIENT` — which particle
5. `ROOM_STONE` — which stone set the room is cut from
Plus: `link()` calls in `renderMap`, and a `LORE` entry if it matters.

All five are counted against `ROOMS` by `tools/audit.py`, so missing one is a red gate
rather than a wrong palette three rooms later. Item 5 used to be a nested ternary on the
room index with a silent `else` — every room added past 9 would have been painted in the
sky's pale blue, and the audit could not see it. It is a table now for exactly that
reason: **a lookup with a default is not a table, it is a bug with a fallback.**

The room's `E` tiles and its `exits` rects must also agree exactly — see
`03-WORLD-AND-BIOMES.md` §3.3, "Doorways". Three shipped exits did not.

### Adding an enemy
`mkThing()` builder → `enemyUpdate` branch → `drawEnemy` branch → spawn char in
`spawnRoom` → the char in the tile-skip string in `drawTiles` → the char in a room map →
a `BESTIARY` entry → **a `tell` of `'white'` or `'gold'`**.

### Adding a mode
A `case` in the `frame()` switch, a branch in the render dispatch, an entry in **`MODES`**,
and — if the player steers it with a direction — an entry in `MENU_MODES` (§8.2b).

`MODES` is the list of every mode the game can legally be in, and the soak asserts
`G.mode` is always one of them. `test.js` used to keep **its own copy** of that list, and
it had drifted: `charm` went in with 2f and never reached the test, so the charm screen
was never soak-tested, and the drift only announced itself when `opts` was added and
mashing happened to open it. The game owns the list now and the suite reads it.

### Adding an NPC
NPCs are shrine-like, so they cost far less than an enemy: an entry in `NPCS` (spawn
char, room, voice, prompt, and a `beats()` that reads current world state) → a branch in
`drawNPC` → a profile in `VOICE` → the char in the tile-skip string in `drawTiles` → the
char in the room map. `spawnRoom` and the interaction handler are generic and need no
edit. `tools/audit.py` reads the spawn chars straight out of `NPCS`, so a new NPC is
covered by the embedded-in-solid check automatically.

`beats()` is called fresh on every conversation, so dialogue tracks world state without
any extra machinery. `G.met` counts conversations and is saved.

## 9.5 Performance

### The budget
16.6 ms per frame. Target under 8 ms of JS on a mid-range Android, leaving headroom for
the browser.

### Rules
1. **Bake anything static.** The three parallax tree layers are drawn once per room into
   offscreen canvases and blitted with a parallax offset. Before this change the trees
   cost roughly a thousand canvas operations per frame; after, three `drawImage` calls.
   **This is the single most important optimisation in the project.**
2. **Cull everything off-screen.** Tiles are drawn only within the camera rect. Lights,
   particles, ambient motes and props all bail early.
3. **Cap every unbounded array.** Particles, decals (~110), ambient motes, cowrie
   pickups (expire at 900 frames).
4. **No allocation in the hot path.** No `map`/`filter`/`reduce` inside per-frame loops.
   Reuse objects; iterate backwards when splicing.
5. **`ctx.save()`/`restore()` are not free.** Use them for transforms; use explicit
   `globalAlpha` restoration for alpha.
6. **Gradients are expensive.** Create them per frame only where the shape changes;
   never inside a per-tile loop.
7. **`fillRect` beats `beginPath`/`fill`.** `px`/`pxf` are `fillRect`. Prefer them for
   anything rectangular.
8. **Never read back from the canvas.** No `getImageData` in the loop.
9. **Text is expensive.** Set `font` once per group, not per string.

### Profiling protocol
Before optimising, measure. Add a temporary frame-time overlay, run the fire room (the
heaviest — lava gradients, heat pass, embers, four enemy types), and compare. Do not
optimise on intuition.

## 9.6 Testing

`test.js` — **1,635 assertions, headless Node, no dependencies**, about 30 seconds.

`node test.js --quick` skips the two soaks and runs in about 7 seconds. That is the
inner loop only — **it is not the gate**, it says so in its own output, and what you run
before a commit is `node test.js` with no arguments. The soaks are 21 of the 30 seconds
and they are not optional (rule 6 below). Its
first section shells out to `tools/audit.py`, so a red audit is a red test run.

### How it works
It stubs `document`, `AudioContext`, `localStorage` and `requestAnimationFrame`, loads
the game's script out of the HTML, and drives the real loop frame by frame. Then it
asserts on real state.

### What it covers
Boot and title flow · cutscene skipping · movement, jump, roll, ward · combo cycling ·
charge→heavy · execution on broken enemies · parry vs unblockable · late-ward chip
damage · warden shield · every room reachable · every room paints without throwing ·
background cache invalidation · mirrors landing on solid ground · riddles right and
wrong · the mirror lock and its release · cowrie drops and collection · the ledger ·
all four spells · weapon swapping, chain lengths, reach, burn · lava damage · save/load
round-trip · save-slot isolation · pause and inventory · jump heights and the speedrun
air jump · menu hold-to-scroll · the tutorial · the codex · the ending · **two randomised
soaks** (12,000 and 14,000 frames of button mashing across every mode) checking for NaN
and illegal states.

### Testing rules
1. **Run `node test.js` before and after every change.** It must end `0 failures`.
2. **Every new system gets assertions**, and gets added to the `__ODINALA_TEST` export.
3. **Every bug gets a regression test** *before* it is fixed.
4. **Tests must be hermetic.** Reset `G.hitstop`, `G.slow`, `P.face`, `P.st` before
   asserting. Most flaky failures in this suite's history were leftover hitstop.
   **`G.cheat` is the other one** — `unlockAll()` leaves it on, and cheat mode refills
   life, gourds and ọfọ every frame, so a block that forgets to clear it silently stops
   testing what it thinks it is testing.
5. **Never weaken an assertion to make it pass.** If the game changed, change the
   expectation deliberately and say why.
6. **The soak tests are not optional.** They have caught real crashes.
7. **Assertions tagged `REGRESSION` guard a bug that actually shipped**, and each was
   mutation-tested when it was fixed: put the bug back, watch the suite go red, restore.
   A guard nobody has seen fail is a guard nobody should trust. Currently guarded:
   dropped inputs during hitstop, multi-hit swings, colliding save slots, an arrival
   buried in rock, a shade reclaimed on the frame it was dropped, a silent equipment
   swap.
8. **Exit arrivals are checked twice** — once on the geometry, and once by actually
   coming through the doorway and walking away from where you land. `tools/audit.py`
   covers the static half; the suite covers the played half. An arrival buried in rock
   pins the player: no direction moves them, and it reads as a hang rather than a bug.

*(Rules 4's cheat clause, 7 and 8 recovered from `bible/archive/11-TECH.md` §11.6 — they
describe the shipped suite and the new set had dropped them.)*

### Syntax check
```bash
python3 -c "import io;s=io.open('odinala.html',encoding='utf-8').read();js=s.split('<script>')[1].split('</script>')[0];io.open('/tmp/game.js','w',encoding='utf-8').write(js)" && node --check /tmp/game.js
```

### What tests cannot check
Feel, timing, colour, audio, whether a fight is fun. **The tests prove the game is not
broken. They cannot prove it is good.** Play it.

## 9.7 Save format

JSON in `localStorage` under `odinala.save.v1`, or `odinala.speedrun.v1` for cheat runs
— **two slots, so a speedrun cannot overwrite a real playthrough.**

Stored: story flags, `maxHP`, cowries, checkpoint, visited rooms, mirrors, spells,
weapons + equipped, skills, taken pickups, taught flags, slain bosses, seen enemies,
lore unlocked, ending, cheat flag.

Rules:
- **Save on: rest charm, mirror attune, purchase, weapon pickup, heart shard, boss
  death, manual save, leaving to title.**
- **Never auto-save mid-combat.**
- **If storage throws, fall back to a keyed in-memory object and tell the player**
  — "Saved for this session only." Never claim a save that did not happen.
- **Version the key.** Breaking the format means `v2`, not a migration.
