# 08 — Art Direction, Animation, VFX and Lighting Bible

## 8.1 The look in one line

**Carved wood and white chalk, lit by one warm source in a cold dark, drawn
entirely in code.**

Not pixel art in the retro-nostalgia sense. The 480×270 logical resolution is a
performance decision, and the art fights *against* the grid rather than
celebrating it — curves, gradients, half-pixel detail, real silhouettes.

## 8.2 Resolution and the half-pixel rule

- **Logical space: 480×270. Backing canvas: 960×540 (`SC = 2`).**
- `ctx.setTransform(SC,0,0,SC,0,0)` once at boot; everything is authored in
  logical units.
- **`px()`** snaps to half-pixels (`Math.round(x*2)/2`) — the workhorse.
- **`pxf()`** does not snap — for fine detail that should land on a real device
  pixel: bark striation, eye highlights, grass blades, chalk strokes.

**The rule:** primary forms on the half-pixel grid, detail free-floating. This is
what makes a mask read as *carved* rather than as blocks.

## 8.3 Palette

Cold base, one warm accent, one blood accent. Colour is *scarce* — a gold thing
on screen means something.

| Role | Hex | Used for |
|---|---|---|
| `bone` | `#cfc6ad` | Nzu, masks, health, the player's face |
| `gold` | `#c8952e` | Charms, mirrors, break prompts, unblockable tells, lanterns |
| `goldDim` | `#8a6a2a` | Inactive gold |
| `uhie` | `#8c2f2f` | Blood, sash, execution |
| `chalk` / `chalkDim` | `#e8e2d0` / `#7d7768` | White tells, parry flash, UI text |
| `glass` | `#6fb7c8` | Mirrors, Idemili's veil |
| `indigo` | `#1c2533` | Spirit, vanish |
| `moss` | biome-varied | Ledge growth |

**Rules:**
1. **No pure white and no pure black** in world art. `#e8e2d0` and `#050706`.
2. **Saturated colour is reserved for light sources and tells.** Everything else
   sits between 8% and 35% saturation.
3. **Each biome gets one palette row in `STONE`** (base, lit, top, side, fleck,
   moss) — six colours, and it must be legible against the player silhouette.
4. **Never introduce a new accent hue.** Gold and blood are the accents. A new
   one dilutes both.

## 8.4 Character and creature art standards

**The player:** black robe, bone mask, blood sash. Detail includes carved brow,
nose ridge, mouth slit, nine strokes of nzu across the forehead, cowrie beads at
the throat, robe folds, hem fringe, alternating legs, cloth trailing off the back,
and a warm rim light on the lit edge.

**Silhouette first.** Every creature must be identifiable as a black shape at
32px. If it is not, no amount of detail saves it.

**The mask standard (`maskFace`).** Every masked thing in the game uses the same
painter, parameterised. Real mmanwụ reference: carved planes, not organic faces.
Requirements: a top light edge, an under-shadow, a lit and a shadowed vertical
side, carved brows as separate strokes, a nose *ridge* (not a nose), a mouth as a
slit, and eyes that are holes with a highlight — or cowries, for idols.

**Horns (`hornPair`)** derive from the ikenga. Never devil horns — always the
ram's curve or the straight ceremonial pair.

**Skulls (`skullShape`)** get a cranial dome, a brow ridge, orbital shadow with a
single highlight, a nasal triangle, and a jaw that is a separate mass. Never a
cartoon skull.

**Proportion:** figures elongate. Reference Enwonwu's sculpture — heads slightly
small, limbs long, stillness. Bosses are 2–3× the player's height.

## 8.5 Environment art standards

**Trees (`treeShape`)** — the thing that most distinguishes this game visually.
Every tree must have: buttress roots spreading into the ground; a tapered,
*leaning* trunk; bark striation and knots clipped inside the silhouette; limbs
forking recursively three to four levels; a canopy of 14 overlapping ellipse
masses; lit clumps on the upper-left; and loose individual leaves scattered on
the silhouette edge. `dead: true` strips the canopy and adds hanging strands.

**Never a rectangle with a green blob on top.** That was the old code and it was
replaced for a reason.

**Ground (`drawTiles`)** — per tile: base fill, deterministic flecks, strata
lines, top-lip highlight, moss on the lip, grass blades at half-pixel, hanging
growth under overhangs, side shading, corner ambient occlusion, and — in water —
drips that fall on a timer.

**Sky** — Igwe's standard: five-stop gradient, a low sun with bloom, stars still
visible at the top, **three parallax cloud banks each lit gold along their tops**,
two hill silhouettes, and birds on a wing-flap cycle. Clouds are ellipse pairs,
never single blobs.

**Fire** — Ọkụ Mmụọ's standard: a breathing heat gradient on a 26-frame cycle,
black cliffs lit from below along their edges, lava tiles with a moving surface
and bright highlights, sparks lifting continuously.

**Parallax:** three baked layers at k = 0.16 / 0.30 / 0.48, plus a foreground at
k = 1.5. Depth is conveyed by **haze alpha** (0.34 / 0.55 / 0.82) as much as by
speed.

## 8.6 Animation standards

No sprite sheets. Everything is procedural.

1. **Anticipation is mandatory.** Nothing starts at full speed. Every attack has a
   wind-up pose distinct from its neutral.
2. **Idle bob** on a 20–30 frame sine; never static.
3. **Secondary motion** — cloth, raffia, fringe, vines and leaves lag the body and
   respond to `windAt(t)`.
4. **Attack arcs** are drawn as swept arcs with a bright leading edge, never as a
   static weapon sprite.
5. **Enemy wind-ups must change silhouette**, not just add an outline. A player
   with the outline turned off should still read the attack.
6. **Death is never a fade.** Bodies come apart into particles that inherit the
   killing blow's direction.
7. **Landing has a squash frame** and a dust burst.

## 8.7 VFX standards

| Effect | Rule |
|---|---|
| **Hit sparks** | Directional, with a trail of up to 4 ghosts when speed > 1.4, and a white core pixel at high alpha |
| **Blood** | Particles *plus* permanent floor decals (capped at 110, per-room). Blood does not fade. |
| **Parry** | White + gold double burst, chromatic flash, 14 frames of slow motion |
| **Execution** | 36-particle blood burst, screen flash, two decals |
| **Ambient particles** | 40–54 per room, two depth planes, wind-driven, biome-typed |
| **Weather (planned)** | Rain in Ọhịa, ash in Ọkụ, dust on the bone road — always a particle type plus a light-temperature shift, never a full-screen overlay |

**Prohibitions:** no bloom on everything, no lens flare, no chromatic aberration
outside the parry frame, no screen-space distortion, no additive white flashes
that wash the frame.

**Particle budget:** ≤ 260 live particles. `parts` is capped and the oldest are
culled. This is a hard performance rule (§11).

## 8.8 Lighting bible

The most important atmospheric system in the game.

**Model:** one baked ambient (the room `tint` gradient), plus point lights
composited with `globalCompositeOperation = 'lighter'`, plus a vignette, plus
film grain.

**Rules:**
1. **One warm source per scene, at most two.** Charms, mirrors, lanterns, lava.
2. **Every light flickers** — `1 + sin(t/13 + x·0.05)·0.07 + sin(t/5.3)·0.03`.
   A perfectly steady light reads as digital.
3. **Light has a colour, not just a brightness.** Charms `216,164,66`. Mirrors
   `111,183,200`. Lanterns `214,120,52`. Water `90,190,205`. The forge `140,30,40`.
4. **Rim light on the player's lit edge**, always, at 0.4 alpha. It is what keeps
   the silhouette off the background.
5. **Never light the whole room.** Darkness is the default state; light is an
   event.
6. **Grain at 0.05 alpha, 130 samples**, re-seeded each frame. It ties the
   composited layers together and hides banding.
7. **Vignette always on.** It is what makes a 480×270 frame feel like a
   photograph rather than a screenshot.

## 8.9 UI art standards

- Serif for the world's voice (`ui-serif, Georgia`) — cutscenes, riddles, lore.
- Sans for the game's voice (`ui-sans-serif, system-ui`) — prompts, menus, keys.
- **These never mix in one line.**
- HUD elements are drawn as chalk marks: a rail with notches, a gourd, a cowrie.
  No rounded rectangles, no drop shadows, no gradients on UI.
- Icons are 16×16 logical, drawn in code, one colour plus a dim state.
- **Nothing in the HUD animates unless it is telling you something.** The ọfọ bar
  only shimmers at full.
