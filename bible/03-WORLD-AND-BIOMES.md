# 03 — World, Biomes and Level Design

## 3.1 The map, as built

Eleven rooms. Rooms are indexed 0–10 and **every index-keyed table must be updated together**
when a room is added (see `09-TECHNICAL.md` §Adding a room).

```
                  [4 market] ── [5 water]
                       │             │
   [0 charm] ─ [1 path] ┴─ [2 shaft] ─┘
        │
  [10 ogilisi]
                             │
                        [3 Ogbunabali]
                             │
                        [6 bone road] ══ needs: ekwensu ══
                                                          │
                                              [8 hellfire] ─ [9 open sky] ─ [7 Ala Mmụọ]
```

Route notes:
- 1→4 is a vertical climb on the right side of the forest, gated on nothing.
- 5→2 is a **one-way drop** through a cracked floor, requiring Ala's Fall. It is the
  loop that makes the water room worth revisiting.
- 6→8 carries `needs:'ekwensu'` with a locked message. This is the only hard story gate.
- Four mirrors (rooms 0, 2, 4, 5) form the fast-travel network. Note that no mirror
  exists past the story gate — **[NOT BUILT]**: rooms 8 and 9 should each get one.

## 3.2 Biome bible

Each biome is defined by seven things: palette, stone set, music track, ambient
particle, light sources, hazard, and the emotion it is engineering. All seven must be
specified before a new biome is built.

### Room 0 — Ala Iyi-uwa (the buried charm)
| | |
|---|---|
| **Palette** | `#0d1412` tint. Cold green-black. |
| **Stone** | `STONE[2]` — mossy earth |
| **Music** | `night` — A minor pentatonic, sparse bell, no shaker. Almost silence. |
| **Ambient** | dust motes |
| **Light** | the charm shrine; **a moon** — the only room with one |
| **Hazard** | none |
| **Emotion** | waking up somewhere you should not be |

The moon is the single most important art decision in this room. It is the last sky the
player sees until room 9, and it is why room 9 lands.

### Room 10 — Ogilisi (the tree at the boundary) — **[BUILT]**
| | |
|---|---|
| **Palette** | `#101710`. Green-black, a shade warmer than room 0. |
| **Stone** | `STONE[10]` — dug earth with roots through it |
| **Music** | `ogilisi` — room 0's scale, thinner than the shaft. The sparsest track in the game. |
| **Ambient** | dust |
| **Light** | none. The one room with no light source of its own. |
| **Hazard** | none |
| **Emotion** | the hole is smaller than you remember |

A dead end off the **left** wall of room 0 — the direction the player has no reason to
go. Nothing to fight, nothing to buy, no charm, no mirror. It exists to be looked at.

**Eight mounds and a hole.** The hole is where the ninth would be, and nothing in the
game says so; the codex entry counts the mounds and stops. This is the number-nine rule
in 3.4 working exactly as written — a player who counts is rewarded and a player who
does not feels a rhythm.

The pit is **two tiles deep, not three.** Three was the first draft and it was wrong
twice: it is a soft-lock risk at the far end of a dead-end room, and a hole you have to
work to climb out of is not a hole that is smaller than you remember. There is a
REGRESSION test that climbs out of it.

**The hole had to be drawn, not left empty.** Bare tiles are not a hole — you see the
parallax through the gap and it reads as a window cut in the wall. `drawProps` fills it
with dug earth going black downwards, a lit lip where the spade went in, roots let
through from the tree, and — the part that mattered most — a dark band over the tile
underneath, because `drawTiles` lights the top edge of every solid tile and a lit surface
at the bottom of a grave reads as a floor with a lamp on it.

The tree is drawn **once, in the near plane**, at a size nothing else in the game
reaches. The room is named for a single tree; twelve of them in parallax is a forest, and
there is already a forest. The generic wooded parallax runs behind it, which is correct —
it is a boundary, and there has to be something on the other side.

### Room 1 — Ọhịa (the path that watches)
| | |
|---|---|
| **Palette** | `#0c130e`. Green-black, denser. |
| **Stone** | `STONE[3]` |
| **Music** | `forest` — D minor pentatonic, full seven-stroke bell, shaker running |
| **Ambient** | falling leaves |
| **Light** | god-rays through the canopy |
| **Hazard** | none |
| **Emotion** | being looked at |

Three parallax layers of living trees plus an overhead canopy of dark ellipses. The name
is a promise the game does not literally keep — nothing watches you here — and that
unfulfilled dread is correct.

### Room 2 — Ụzọ Ala (the shaft)
| | |
|---|---|
| **Palette** | `#0a0f14`. Blue-black. |
| **Stone** | `STONE[4]` |
| **Music** | `shaft` — E minor, slowest tempo (0.235 s/pulse), almost no percussion |
| **Ambient** | falling grit |
| **Light** | the name-shrine, one mirror |
| **Hazard** | none (the fall is the hazard) |
| **Emotion** | descending; the point of no return that isn't one |

Tall room (40 tiles). The only vertical space in the game. The chalk stone with
Ogbunabali's name is here and the room's whole job is to make sure you walk past it.

### Room 3 — Ebe Ọchịchịrị (where he keeps the dark)
| | |
|---|---|
| **Palette** | `#0d0a0e`. Red-black. |
| **Stone** | `STONE[5]` |
| **Music** | `boss` — C with a flat second, 0.132 s/pulse, war drums |
| **Ambient** | ash |
| **Light** | a large dull red radial centred on the arena |
| **Hazard** | none — the boss is the hazard |
| **Emotion** | an office, not a lair |

Flat arena. No platforms. Nothing to hide behind. This is deliberate: the fight is about
information, not positioning.

### Room 4 — Ahịa Mmụọ (the market that opens at night)
| | |
|---|---|
| **Palette** | `#150e14`. Warm purple-black. |
| **Stone** | `STONE[6]` |
| **Music** | `market` — C major-ish, **highlife**, palm-wine guitar, full rattle, fastest tempo |
| **Ambient** | lantern sparks |
| **Light** | six swaying warm lanterns, orange, `#d6783a` |
| **Hazard** | none |
| **Emotion** | **relief** |

This room exists to be a break. It is the only warm, busy, almost-cheerful place in the
game and it must stay that way. Do not put a boss here. Do not make it scary later.

### Room 5 — Iyi Idemili (the water that remembers)
| | |
|---|---|
| **Palette** | `#08131a`. Cyan-black. |
| **Stone** | `STONE[7]` — wet stone with drips |
| **Music** | `water` — A minor an octave up, airy, bells |
| **Ambient** | rising bubbles |
| **Light** | four cool cyan pools, `#5abecd` |
| **Hazard** | none |
| **Emotion** | held breath, gentleness |

Caustic light bands, reed foreground, water drips off every overhang. The gentlest room.
A heart shard is the reward.

### Room 6 — Okọchị Ọkpụkpụ (the bone road)
| | |
|---|---|
| **Palette** | `#141010`. Dry red-brown. |
| **Stone** | `STONE[0]` |
| **Music** | `shaft` (reused) — **[flagged: this room deserves its own track]** |
| **Ambient** | ash |
| **Light** | sparse |
| **Hazard** | none |
| **Emotion** | attrition |

Dead trees (`treeShape` with `dead:true`), skull and horn props, ribs standing out of
the ground in the foreground. Ekwensu at the far end.

### Room 8 — Ọkụ Mmụọ (the fire that does not go out)
| | |
|---|---|
| **Palette** | `#1c0c07`. Orange-black. |
| **Stone** | `STONE[8]` — scorched |
| **Music** | `fire` — C# minor, 0.146 s/pulse, hot and close |
| **Ambient** | sparks |
| **Light** | the lava itself; heat gradient over the whole screen breathing on a 26-frame cycle |
| **Hazard** | **molten rock** (`^`) — 22 damage, ejects upward |
| **Emotion** | pressure |

Not hell. Igbo cosmology has no hell. This is a forge — where things are made
permanent — which is why the firebrand is here.

### Room 9 — Igwe (the open sky)
| | |
|---|---|
| **Palette** | `#16202e`. Blue-grey. |
| **Stone** | `STONE[9]` |
| **Music** | `sky` — G major, slowest of all (0.230 s/pulse), open and high |
| **Ambient** | leaves, drifting |
| **Light** | a low sun with a 54px bloom |
| **Hazard** | spikes (`^`) in the central chasm |
| **Emotion** | vertigo, and something wrong you cannot name |

Full sky treatment: three parallax cloud banks lit gold along their tops, hills, stars
still visible overhead, birds crossing. **You are hundreds of feet underground.** No
character comments on this. That is the horror.

### Room 7 — Ala Mmụọ (the land of spirits)
| | |
|---|---|
| **Palette** | `#0a0c16`. Deep blue-violet. |
| **Stone** | `STONE[1]` |
| **Music** | `night` — reused, and correct: it echoes room 0 |
| **Ambient** | dust |
| **Light** | minimal |
| **Hazard** | none |
| **Emotion** | arrival, dread, recognition |

Onwe is here. The music echoing room 0 is deliberate — you have arrived back at the
hole you dug.

## 3.3 Level design rules

### Room construction
- Rooms are ASCII string arrays, one character per 16px tile.
- **Standard room: 48–56 tiles wide, 20 tall.** Floor at rows 16–19. Entities stand at
  row 15. Exits at rows 14–15 on the left and right walls.
- **Deviate deliberately.** Room 2 is 30×40 because descent is its subject.
- The player is 10×18px and jumps ~3.7 tiles high, ~3.5 tiles across. **No gap wider
  than 3 tiles without a dash unlock. No ledge higher than 3 tiles without a route.**

### Doorways: the rect and the `E` tile must be the same tiles

An exit is **two things that nothing ties together**: an `exits` record, which is a
rectangle tested against the player's body, and `E` tiles in the map, which are what
paint the doorway — the gold-lit gap in the world, and the gold square on the map screen
whose legend promises "gold squares are doorways".

**Every tile inside an exit rect must be `E`, and every `E` tile must be inside an exit
rect.** `tools/audit.py` fails on either, and `test.js` walks into every side doorway to
prove the rect is reachable — a check the audit structurally cannot do.

Three exits were wrong when this rule was written, all of them shipped and all of them
working, which is why nobody had noticed:

- **Room 3 → the bone road** had *no `E` tile at all*. The way out of the first boss room
  was an invisible trigger in open air, and the map screen showed the boss room with one
  doorway when it has two.
- **Rooms 0 → 1 and 6 → 8** had rects sitting one column past their doorway art, on tiles
  that `padEnd()` had quietly filled with rock. Both fired anyway, because the player's
  body overlapped the rect by a single pixel before collision stopped it. Room 6's is the
  gate to the forge — the whole back half of the game was reachable through a one-pixel
  accident.

**Map rows must also be the same length.** A short row is padded with `#`, so a doorway
authored at the end of a short row silently becomes wall. That is what happened to rooms
0 and 6, and the audit now fails on ragged rows for that reason.

### Tile vocabulary
| Char | Meaning |
|---|---|
| `#` | solid |
| `-` | one-way platform |
| `c` | cracked — breaks to Ala's Fall |
| `^` | hazard (lava in room 8, spikes elsewhere) |
| `E` | exit trigger |
| `S` | rest charm (save point) |
| `N` | chalk stone (the name) |
| `M` | mirror |
| `h` | heart shard |
| `F` | weapon pickup |
| `w l t W v a k i` | walker, lunger, thrower, warden, horned, ember, crawler, effigy |
| `B X O` | Ogbunabali, Ekwensu, Onwe |
| `K` | the chalk masquerade (tutorial) |
| `.` | empty |

### Pacing rules
- **Every room has a rest charm within ~30 seconds of walking**, or a mirror.
- **No more than four enemies live in one screen** at 480×270. Five reads as a mob and
  the combat stops being readable.
- **Alternate pressure and release.** Forest (pressure) → market (release) → water
  (release) → bone road (pressure) → fire (high pressure) → sky (release) → end.
- **A boss room is always preceded by a rest charm** in the previous room, within
  fifteen seconds.
- **Never place an enemy within 2 tiles of an exit.** Arriving into a hit is unfair and
  reads as a bug.

### The gating philosophy
Only three real gates in the whole game:
1. **Ala's Fall** (post-Ogbunabali) opens cracked floors — the 5→2 loop.
2. **The name** — an epistemic gate, not a physical one.
3. **`needs:'ekwensu'`** on the bone road's second exit — the one hard story lock.

That is deliberately few. This is not a game about being locked out. Add gates only
when the ability being gated is *fun*, so that returning is a pleasure rather than a
chore.

## 3.4 Environmental storytelling guide

The game has almost no NPCs and very little text. Everything the player learns about the
world, they learn from looking. Rules:

**Repeat the number nine.** Nine burials. Nine bolts in Amadioha's Assent. Nine strokes
of nzu on the player's mask. Nine eyes on Ogbunabali. Nine strokes on the chalk stone.
Nine mounds in the burial cutscene art, eight dark and one red. Never explain this. A
player who counts should be rewarded; a player who doesn't should feel a rhythm.

**Props carry the lore.** Skulls and horns on the bone road are not decoration — they
say the road is old and the traffic was heavy. Idols in Ala Mmụọ say someone made these
and left. Lanterns in the market say someone lit them tonight.

**Blood stays.** The decal system persists blood on the floor per room. A room the
player has fought through looks fought through. This is memory made visible and it
matters more than it costs.

**The chalk is the game's writing system.** Nzu marks appear on the name stone, on the
player's mask, on shrines, and on Ekwensu's chest when he is bound. White chalk always
means *something has been named or blessed*. Never use it decoratively.

**Light tells you where safety is.** Rest charms glow gold. Mirrors glow cyan when
attuned and grey when not. Everything else that glows is dangerous. This is a hard rule
and it means the player can read a dark screen instantly.

### Prop placement checklist
- [ ] Does this prop say something the player could not learn from dialogue?
- [ ] Is it in the parallax layer that matches its size?
- [ ] Does it break the silhouette of anything the player needs to read?
- [ ] Does it glow? If yes, is it either safe (gold/cyan) or dangerous (orange/red)?
- [ ] Would removing it change the room's meaning? If no, remove it.

## 3.5 Rooms not yet built — **[NOT BUILT]**

Ranked by value.

1. **A village at dawn — playable prologue.** Ten minutes of ordinary life before the
   taking, with no combat. Would transform the ending. Highest narrative value in the
   entire wishlist.
2. ~~**The ogilisi tree**~~ — **[BUILT]** as room 10. See 3.2.
3. **A second market level** — Ahịa Mmụọ is the game's best room and there is only one.
4. **The river crossing** — Idemili's python, as an optional boss.
5. **A collapsed dibia's compound** — books, chalk, tools, the man who buried your charm.
