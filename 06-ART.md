# 06 — Art Direction, Animation, VFX and Lighting

## 6.1 The art thesis

**Everything is drawn in code. There are no assets.**

No sprite sheets, no PNGs, no fonts beyond the system stack. Every tree, mask, skull,
idol, cloud and drop of blood is `ctx` calls executed at runtime. This is a hard
constraint from the single-file rule, and it has produced the game's actual look:
procedural, slightly irregular, hand-drawn-feeling because the code is drawing rather
than blitting.

**Do not "fix" this by adding assets.** The constraint is the style.

## 6.2 Resolution and pixel discipline

- **Logical space: 480 × 270.** All game logic, all coordinates, all layout.
- **Backing store: 960 × 540** via `ctx.setTransform(SC,0,0,SC,0,0)` where `SC = 2`.
- **`px(x,y,w,h,c)` snaps to half-logical-pixels** — `Math.round(x*2)/2` — which lands
  exactly on a device pixel at 2×.
- **`pxf(x,y,w,h,c)` does not snap.** Use it for sub-pixel detail: bark striation,
  rim light, teeth, grain, mask carving.

The rule: **structure on the half-pixel grid, detail off it.** A character's body uses
`px`; the line carved into their mask uses `pxf`.

## 6.3 Palette

Global palette in `C`. Per-room tint in `R.tint`. Per-room stone in `STONE[]`.

| Token | Hex | Meaning — **never violate these** |
|---|---|---|
| `bone` | `#cfc6ad` | Masks, nzu, the player. Signifies *named, blessed, or self*. |
| `chalk` / `chalkDim` | light neutrals | UI text, parry flashes |
| `gold` / `goldDim` | `#c8952e` | **Danger you cannot parry**, and **safety you can rest at**. See §6.4. |
| `uhie` | camwood red | Blood, damage, wounds |
| `blood` | deep red | Player damage, low-health warning |
| `glass` | `#6fb7c8` | Mirrors, Idemili, water |
| `moss` | greens | Growth |
| `indigo` | `#1c2533` | Spirit, vanishing, Ogbunabali's teleport |

**Ten stone sets**, one per room, each with `base / lit / top / side / fleck / moss`.
Adding a room means adding a stone set.

### The three-value rule
Every object must read at three values minimum: **a dark mass, a mid tone, and a light
edge.** A silhouette with no top-light does not read at this resolution. This is why
every solid tile gets `P0.lit` on its top two pixels and `P0.top` on its first.

## 6.4 The colour semantics contract

This is the most important art rule in the game and it is a **gameplay** rule wearing an
art hat:

| Colour | Always means |
|---|---|
| **White / bone outline** | This attack can be turned. Ward it. |
| **Gold double outline** | This attack cannot be turned. Roll it. |
| **Gold aura + `Z` prompt** | This enemy's guard is broken. Execute it. |
| **Gold glow, static** | A rest charm. You are safe here. |
| **Cyan glow** | An attuned mirror. |
| **Grey glow** | An unattuned mirror. |
| **Orange / red glow** | Fire. It will hurt you. |

Gold does double duty (danger-you-can't-parry and safety-you-can-rest-at) and this
works because the two never appear in the same context — one is on an enemy mid-swing,
the other is on a static object. **Do not add a third meaning for gold.**

## 6.5 Character art standards

### The player
- 10 × 18px. Black robe, bone mask, red sash, cowrie beads, gold crown mark.
- **Nine strokes of nzu across the mask's brow.** Count them. They are the nine burials.
- Cloth trails behind on three offset segments, reacting to `P.vx`.
- Rim light on the trailing edge at 40% alpha.
- Legs alternate on a 6-frame cycle when grounded and moving.

### Masks — `maskFace(cx, cy, w, h, opts)`
The single most reused painter. Carved wooden mask: brow ridges, eye sockets, nose
ridge, mouth slit, and optional chalk marks. Every masquerade in the game uses it,
parameterised by wood palette and eye colour.

**Rule: an enemy's eye colour is its state.** Ambient when idle, gold when winding up.

### Silhouette rules
- Every enemy must be identifiable **by silhouette alone at 480×270**. Test by filling
  it with flat black — if you can't name it, redesign it.
- **One dominant shape per enemy.** The warden is a rectangle with a shield. The crawler
  is a low ellipse. The ember is a circle. The effigy is a post.
- **Distinct heights.** Crawler 11px, lunger 12px, walker 20px, warden 22px, effigy 24px,
  horned 26px, bosses 40px+. Height is the fastest read at this scale.

### Boss art
- 40px+ tall — roughly twice the player.
- **Raffia is the signature.** Sixteen strands along the hem, each swaying on its own
  phase (`Math.sin(G.t/11 + i)`). This is what makes a masquerade read as a masquerade
  rather than as a big man.
- Nine eyes on Ogbunabali, blinking on independent cycles.
- Chalk scars appear on the chest **only when bound** — the visual language of being
  named.

## 6.6 Environment art standards

### Trees — `treeShape(x, baseY, h, opts)`
The most complex painter in the game. In order:
1. **Buttress roots** — six quadratic wedges splaying into the ground
2. **Tapered leaning trunk** — bezier both sides, lean derived from seed
3. **Bark** — twenty striation marks and three knots, clipped inside the trunk
4. **Limbs** — recursive, three levels, each fork jittered by seed
5. **Canopy** — fourteen overlapping ellipses
6. **Light** — seven lit clumps on the upper left at 26% alpha
7. **Loose leaves** — eighteen single pixels on the silhouette edge

`dead: true` skips the canopy and adds hanging strands. This is the bone road.

### Other painters
`stoneColumn` (fluted, with three bands of nsibidi), `idolStatue`, `skullShape`,
`hornPair`, `maskFace`.

**Rule: every prop is a function, parameterised, seeded.** Never hard-code a specific
prop at a specific place — place a call with a seed.

### Parallax
Three baked layers at `k = 0.16 / 0.30 / 0.48`, plus foreground at `k = 1.5`.
Haze alpha `0.34 / 0.55 / 0.82` — **distance reads as transparency**, which at this
palette is more convincing than desaturation.

## 6.7 Animation standards

There are no animation frames. Everything is procedural.

| Technique | Where |
|---|---|
| **Sine bob** | idle breathing, hovering embers, floating pickups |
| **Phase-offset sway** | raffia, vines, reeds, lanterns — each strand `+ i * 0.8` |
| **Velocity-driven** | cloth trailing off the player, scaled by `P.vx` |
| **Step counters** | legs alternating on `Math.floor(P.anim/6) % 2` |
| **State-driven rotation** | weapon arcs via `ctx.rotate` through the swing |
| **Squash on impact** | landing dust, knockback |

### The three-part attack shape
Every attack in the game reads as **wind-up → strike → recovery**, and the art must sell
each:
- **Wind-up:** the outline pulses. The blade pulls back. This is the longest phase.
- **Strike:** a rotating arc, alpha fading with progress. 5–9 frames.
- **Recovery:** the pose holds. Nothing moves. This is where the player feels committed.

**The wind-up must always be longer than the strike.** A 5-frame wind-up on a 9-frame
strike is unreadable and unfair.

## 6.8 VFX standards

### Particles — `burst(x, y, n, colour, speed, life)`
Every particle has velocity, gravity, life, and size. Fast particles (speed > 1.4) draw
a **trail** of up to four half-size ghosts behind them, and particles above 70% life
with size > 1 get a single white hot pixel.

### The impact stack
When something is hit, in order:
1. Hitstop (freeze)
2. Screen shake
3. Particle burst
4. Enemy flash white (8 frames)
5. Knockback
6. Blood decal on the floor **(persistent, per room, capped at ~110)**
7. Sound

**All seven, every time.** A hit that skips any of them feels wrong even if the player
can't say why.

### VFX by event
| Event | Effect |
|---|---|
| Parry | 22 chalk + 10 gold particles, screen flash 9, 14f slow-mo |
| Guard break | 28 gold particles, flash 7, gold aura begins |
| Execution | 36 camwood particles, two blood decals, 26f slow-mo |
| Charge full | gold ring pulsing at `13 + sin(G.t/4)*1.5` |
| Amadioha | nine columns, screen flash 16 |
| Burn | flame pixels rising off the body every frame while `e.burn > 0` |
| Room transition | full-screen fade |

### Rules
- **Never obscure a telegraph with a particle.** If VFX hides a tell, the VFX loses.
- **Particles are capped.** The array is bounded; decals are trimmed.
- **No screen-wide white flashes above alpha 0.5.** Photosensitivity.

## 6.9 Lighting bible

Lighting is a **composited additive pass** (`drawLights`, `globalCompositeOperation =
'lighter'`) drawn after entities and before the vignette.

### Light sources
| Source | Radius | Colour | Intensity |
|---|---|---|---|
| Rest charm | 34 | `216,164,66` | 0.30 |
| Attuned mirror | 40 | `111,183,200` | 0.34 |
| Unattuned mirror | 22 | grey | 0.16 |
| Chalk shrine | 26 | `232,226,208` | 0.22 |
| Market lantern (×6) | 44 | `214,120,52` | 0.26 |
| Water pool (×4) | 52 | `90,190,205` | 0.16 |
| Boss room ambient | 120 | `140,30,40` | 0.10 |

Every light **flickers**: `1 + sin(G.t/13 + x*0.05)*0.07 + sin(G.t/5.3)*0.03`. Two
frequencies, so it never reads as a loop.

### Lighting rules
- **Off-screen lights are culled.** Always.
- **Light is information.** Gold = safe, cyan = mirror, orange = fire. See §6.4.
- **Rooms get darker as the game descends,** except the market and the sky. The player
  should feel the descent as a dimming.
- **Vignette always. Grain always.** 5% alpha, 130 pixels per frame, offset by time.

## 6.10 UI art

- **Type: system serif for fiction, system sans for mechanics.** Cutscenes, room names
  and boss names are serif. Buttons, counters and prompts are sans. Never mix within
  one element.
- **Sizes: 6, 7, 8, 9, 10, 11px.** No others.
- **Nsibidi-derived glyphs** for shrine markers and menu decoration — `glyph(x,y,s,col,rot)`.
- **Bars are rails, not gradients.** Health is a notched rail with a lit top pixel and a
  shaded bottom pixel. Notches every 50 HP.
- **Icons are 16×16 with a 1px inset frame**, drawn in `px`/`pxf`, never text glyphs.

## 6.11 Art assets that do not exist and should — **[NOT BUILT]**

A logo lockup (the title is currently set type), a key art frame for the title screen
beyond the current glyph pair, and per-boss title cards on encounter. All three are
cheap in this system and would raise perceived production value more than any amount of
additional detail on the trees.
