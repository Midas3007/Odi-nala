# 11 — Technical Architecture, Standards and Performance

## 11.1 Hard constraints

Non-negotiable. These define the project.

1. **One HTML file.** All markup, CSS and JavaScript in `odinala.html`.
2. **No build step.** No bundler, transpiler, minifier, or package manager.
3. **No external libraries.** No frameworks, no engines, no CDN links.
4. **No external assets.** No images, no audio files, no fonts. Everything is
   drawn in Canvas 2D or synthesized in WebAudio.
5. **Canvas 2D only.** No WebGL.
6. **Mobile first.** Touch is a first-class input, not a port.
7. **60 FPS on a low-end Android** (roughly a 2019 budget device).
8. **Vanilla ES2018.** No modules, no TypeScript, no optional chaining beyond what
   Safari 12 supports.
9. **Offline.** The file must run from `file://` with no network.

## 11.2 Architecture

One `<script>`, ordered:

1. **Canvas + input** — logical 480×270 at `SC = 2`; `px()` half-pixel snap,
   `pxf()` free
2. **Save/load** — `localStorage` with a **keyed** in-memory fallback; two slots
   (normal, speedrun)
3. **Audio** — unlock handshake, SFX bank, music sequencer, voice profiles
4. **Rooms** — ASCII maps + exit lists
5. **Entities** — player state machine, enemy builders and AI, bosses
6. **Systems** — tutorial, riddles, mirrors, ledger, codex, map, pause, ending
7. **Rendering** — baked background, tiles, props, entities, foreground, lights,
   grain, HUD
8. **Loop** — fixed 60 Hz step with mode dispatch
9. **Test hook** — `__ODINALA_TEST` export, last in the file

## 11.3 The invariants

Break any of these and something subtle goes wrong.

| Invariant | Why |
|---|---|
| **`ctx` is `let`, not `const`** | `buildBackLayers()` swaps it to an offscreen canvas. Always restore it. |
| **`pressed` clears only on frames where `update()` ran** | Input must survive hitstop. Clearing unconditionally makes heavy hits feel broken. |
| **`P.swingId` / `e.hitId`** | One swing lands once. Without it, damage multiplies by active-frame count. |
| **`CHAIN().length` is not 3** | Weapons have different chain lengths. Never hardcode. |
| **Background layers are baked per room** | Anything static goes in `buildBackLayers()`. Anything animated must stay per-frame or it freezes. |
| **Five tables are room-indexed** | `MAPPOS`, `ROOM_TRACK`, `AMBIENT`, `STONE` index, `renderMap` links. |
| **`MENU_MODES` membership** | Drives joystick snapping and hold-to-scroll. |
| **Save slots are keyed even in the memory fallback** | A speedrun must never overwrite a real save. |
| **`e.tell` is set for the whole wind-up** | It is the entire defensive contract with the player. |

## 11.4 Coding standards

**Naming.** Terse where it is local and obvious (`e`, `p`, `dx`, `sx`), full words
where it is a system (`buildBackLayers`, `storyProgress`). Igbo names for game
concepts (`ofo`, `cowries`, `nzu`, `WA`), English for machinery.

**Comments.** Comment *why*, never *what*. The good comments in this codebase read
like design notes: *"presses survive hitstop and slow-mo: a tap during a freeze
frame still lands on the next real frame instead of being eaten by it."* Match
that register.

**Functions.** One job. Draw functions draw and never mutate state. Update
functions mutate and never draw. **This separation is absolute** — the only
exception is particle spawning from update, which is a queue push.

**State.** Global `G` for game state, `P` for the player, module-level arrays for
entities. No classes. No inheritance. `base()` returns a plain object and each
`mkThing()` decorates it.

**Data tables over branches.** `WEAPONS`, `SPELLS`, `TRACKS`, `BEASTS`, `LORE`,
`RIDDLES` are all tables. When adding content, extend a table; when adding
behaviour, add a branch.

**Magic numbers.** Frame data lives in tables. Physics constants are inline and
that is fine — they are tuned by feel and there are few of them.

## 11.5 Performance rules

**Budget: 16.6 ms per frame. Target 8 ms of work**, leaving headroom for GC and
the compositor.

| Rule | Limit |
|---|---|
| Background layers | Baked once per room. Never per-frame tree drawing. |
| Live particles | ≤ 260 |
| Blood decals | ≤ 110, culled oldest-first |
| Ambient motes | ≤ 54 per room |
| Point lights | ≤ 8 visible, culled off-screen |
| Active enemies per room | ≤ 12 spawned, ≤ 3 near the player |
| Live projectiles | ≤ 24 |
| Canvas ops per frame | ≤ ~2,500 |
| Gradient creation | Never inside a per-entity loop |
| `drawImage` per frame | ≤ 6 (the baked layers) |

**Culling is mandatory.** Every draw loop checks the camera bounds first. Tiles
iterate only the visible range.

**Allocation.** Do not allocate per frame in hot paths. Particles reuse a capped
array. No `.map`/`.filter` inside `update()` or `render()` on entity lists.

**When adding something expensive, ask in this order:**
1. Can it be baked once per room?
2. Can it be culled by camera bounds?
3. Can it run every Nth frame instead of every frame?
4. Can the count be capped?
5. Only then: does it earn its cost?

## 11.6 Testing requirements

`test.js` is the contract. **539 assertions, 0 failures, always.**

**What the harness does:** stubs the DOM, canvas context, `AudioContext`,
`localStorage` and timers; loads the real script; drives the real frame loop one
tick at a time; presses real key codes. It tests the actual game, not a model of
it.

**Rules:**
1. `node test.js` before you start and after every change.
2. **A new system ships with new assertions.** No exceptions.
3. **A bug fix ships with a test that would have caught it.** Every one of the
   real bugs found in this project — dropped inputs during hitstop, multi-hit
   swings, colliding save slots, the unreachable room — has a permanent test.
4. Tests are hermetic: reset player state, clear hitstop and slow-mo, set facing.
   Most flaky-test debugging here has been forgetting `P.face`. **`G.cheat` is
   the other one** — `unlockAll()` leaves it on, and cheat mode refills life,
   gourds and ọfọ every frame, so a block that forgets to clear it silently
   stops testing what it thinks it is testing. Turn it off when you are done
   with it.
5. Two randomised soaks (12k and 14k frames across every mode) check for NaN and
   illegal states. Any new mode joins the soak's key list.
6. If the test harness needs to reach a new internal, add it to the
   `__ODINALA_TEST` export. Do not test through the DOM.

**What must always have coverage:**
- Every room is reachable from some other room's exit list
- Every exit's arrival tile is walkable — checked twice, once on the geometry
  and once by actually coming through the doorway and walking away from where
  you land. An arrival buried in rock pins the player: no direction moves them,
  and only a mirror or death gets them out. It reads as a hang, not a bug.
- Every mirror's destination lands on solid ground
- Every boss is killable and its gate opens
- Every weapon swings and its chain length is right
- Every spell fires and costs what it says
- Save/load round-trips, and the speedrun slot does not touch the normal one
- Death and respawn
- Every menu mode opens and closes
