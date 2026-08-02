# 09 — Technical Architecture, Standards and Testing

## 9.1 Constraints (restated, because they govern everything)

- Pure HTML/CSS/JS. **One file.** No build step, no dependencies, no npm, no TypeScript.
- Canvas 2D only. No WebGL.
- No external assets of any kind — no images, no audio files, no web fonts.
- No network calls at runtime.
- Mobile-first. 60 FPS on a mid-range Android in a browser tab.
- `localStorage` optional; must degrade gracefully.

## 9.2 File anatomy

`odinala.html`, roughly 4,900 lines. One `<script>`. Order:

| Section | Contents |
|---|---|
| 1. Shell | Canvas, `SC` transform, `fit()`, `toLogical()`, `px`/`pxf`, input tables, `CODES`, `MENU_MODES`, `menuRepeat()` |
| 2. Persistence | `store` / `load` / `saveGame` / `loadGame` / `slot()`, two save slots |
| 3. Audio | `initAudio`, `tone`, `nz`, `S`, the music sequencer, `VOICE`, `voiceBlip` |
| 4. Data | `ROOMS` (10 ASCII maps), `WEAPONS`, `SPELLS`, `RIDDLES`, `MIRRORS`, `LORE`, `BEASTS`, `STORY` and cutscene beats |
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
5. The `STONE[]` index expression in `drawTiles`
Plus: `link()` calls in `renderMap`, and a `LORE` entry if it matters.

### Adding an enemy
`mkThing()` builder → `enemyUpdate` branch → `drawEnemy` branch → spawn char in
`spawnRoom` → the char in the tile-skip string in `drawTiles` → the char in a room map →
a `BESTIARY` entry → **a `tell` of `'white'` or `'gold'`**.

### Adding a mode
A `case` in the `frame()` switch, a branch in the render dispatch, and an entry in
`MENU_MODES`.

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

`test.js` — **218 assertions, headless Node, no dependencies.**

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
5. **Never weaken an assertion to make it pass.** If the game changed, change the
   expectation deliberately and say why.
6. **The soak tests are not optional.** They have caught real crashes.

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
