# 04 — World, Biome and Level Design Bible

## 4.1 The map as it stands

Ten rooms. The route is a loop with two dead-end branches, not a web.

```
        [4 market] --- [5 water]
           |                |
[0 charm]-[1 path]-[2 shaft]-[3 Ogbunabali]
                                    |
                              [6 bone road] --(needs Ekwensu)-- [8 fire] -- [9 sky] -- [7 Ala Mmụọ / END]
```

Room indices are load-bearing. **Five tables are indexed by room number** and all
five must be updated together when a room is added:
`MAPPOS`, `ROOM_TRACK`, `AMBIENT`, the `STONE` palette index inside `drawTiles`,
and the `link()` calls in `renderMap`.

## 4.2 Room-by-room design intent

| # | Name | Hour | Intent | Teaches |
|---|---|---|---|---|
| 0 | Ala Iyi-uwa — the buried charm | Night, moonlit | Safety. The only room that is ever calm. | Every verb, via the Teaching |
| 1 | Ọhịa — the path that watches | Pre-dawn | First real resistance; the chasm gate | Enemy variety; that gaps need a tool |
| 2 | Ụzọ Ala — the shaft | No sky | Vertical, oppressive, worked stone | That someone was here before |
| 3 | Ebe Ọchịchịrị — where he keeps the dark | No sky | Arena. Flat, deliberate, nothing to hide behind | Naming |
| 4 | Ahịa Mmụọ — the night market | Night, lantern-lit | The world is busy without you | That you are not the subject |
| 5 | Iyi Idemili — the water that remembers | Underwater dusk | Beauty. The one lovely place. | Reward for exploring |
| 6 | Okọchị Ọkpụkpụ — the bone road | Harsh noon, dry | Attrition. Long, open, exposed | Endurance; the gate |
| 8 | Ọkụ Mmụọ — the fire that does not go out | No sky, firelight | Hazard pressure | That the floor can be the enemy |
| 9 | Igwe — the open sky | Golden hour | Breath before the end. A horizon. | Nothing. It is a rest. |
| 7 | Ala Mmụọ — the land of spirits | Starless | The end | — |

**The Igwe rule:** Igwe exists because the player needs to see the sky once, and
because putting it immediately before the final room means the last thing before
the door is the world they are choosing to leave. Never move it.

## 4.3 Level design rules

These are hard rules for authoring any new room.

**Geometry**

1. **Rooms are hand-drawn ASCII.** One character per 16px tile. No exceptions.
2. **Room width 30–60 tiles, height 20–40.** Wider than 60 and the camera loses
   the player; taller than 40 and the vertical parallax breaks.
3. **A room has 2–4 exits.** One is a dead end only if it holds a reward.
4. **The floor row is always solid for at least 3 tiles either side of an exit.**
   Arriving in a room must never drop you into a hazard.
5. **No jump in the game exceeds 3 tiles vertical or 3 tiles horizontal**
   unaided. Anything wider is a gate, and gates require a tool, never skill.
6. **Every gap wider than 5 tiles must have a visible reason** — a chasm with
   spikes, a lava pit, a broken bridge. Never a blank hole.

**Encounter placement**

7. **Never place an enemy within 4 tiles of an exit.** The player must be able to
   enter, see, and choose.
8. **Maximum 3 active enemies in the player's screen at once.** Beyond that, the
   tell system stops being readable, and readability is Pillar 2.
9. **Never combine two gold-tell enemies in one encounter.** Two unblockables at
   once removes the choice between roll and ward, which is the whole game.
10. **A ranged enemy is always placed so that its line to the player crosses
    something** — a platform, a pillar, a gap. Never a clean corridor shot.
11. **The first encounter in any new room uses an enemy the player has already
    met.** Introduce the new species second, alone, with room to watch it.

**Rhythm**

12. **Charm (save) spacing: 60–120 seconds of play apart.** Never further.
13. **Every room has at least one quiet stretch of 6+ tiles with nothing in it.**
    Silence is a design element; a wall-to-wall room reads as noise.
14. **The approach to every boss is a corridor with no enemies.** The player
    should have 3–5 seconds of nothing before the door.
15. **Every room contains exactly one thing worth finding** — a shard, a mirror,
    a lore stone, a weapon, or a genuinely good sightline. Never zero.

## 4.4 Biome bible

Each biome is defined by six variables. Adding a biome means specifying all six.

| Biome | Palette anchor | Light | Ambient particle | Ground | Music | Foreground |
|---|---|---|---|---|---|---|
| Forest (0,1) | Desaturated green-black | Cold moon + warm charm | Falling leaves | Soil, roots, moss lips | `night` / `forest` | Boughs, vines, grass |
| Worked stone (2) | Blue-grey | None; only shrines | Falling grit | Cut blocks, strata | `shaft` | Root arcs |
| Arena (3) | Red-black | Low red bloom | Ash | Scorched flat | `boss` | Minimal — nothing hides the fight |
| Market (4) | Warm purple-brown | Six swaying lanterns | Lantern sparks | Trodden earth, stalls | `market` | Hanging cloth |
| Water (5) | Teal | Cold blue caustics | Rising bubbles | Wet stone, drips | `water` | Reeds |
| Bone (6) | Bleached tan-grey | Harsh flat daylight | Ash | Dust, bone shards | `shaft` | Standing ribs |
| Fire (8) | Orange-black | Lava from below, breathing | Sparks rising | Black rock, molten | `fire` | Heat haze |
| Sky (9) | Blue-gold | Low sun | Drifting leaves | Cliff stone | `sky` | Cloud wisps |
| Spirit (7) | Indigo-white | Starless, sourceless | Ash | Pale, wrong | `night` | Minimal |

**Biome authoring rule:** a new biome must be describable in one sentence that
contains a *material*, not a mood. "Wet stone under cold water" is a biome. "A
place of sorrow" is not.

## 4.5 Environmental storytelling guide

The world tells the story through five channels, in order of strength.

**1. What is still working.**
The strongest tool in the game. The night market's lanterns are lit, the stalls
are staffed, business is happening. Nobody lit them for you. A world that
maintains itself without the player is a world that existed before them.

**2. What someone left behind.**
Chalk on stone. A brand still in the fire. Nine mounds in a row, eight of them
grown over. The dibia is a character the player never meets and knows well.

**3. Repetition with one difference.**
Nine of anything, with the ninth wrong, is the game's signature. Nine strokes of
chalk. Nine bolts. Nine mounds, the ninth open. **Use nine deliberately and never
casually** — it is the ọgbanje's number and it should always mean *the cycle*.

**4. Scale and sightline.**
Ekwensu is the largest thing in the game and you see it from across the bone road
before you fight it. Igwe has a horizon precisely because nowhere else does.

**5. Absence.**
No bodies where there should be bodies. No door on the far side of the arena. The
mother is never depicted, in any room, in any art, at any point. The player never
sees her face and never will.

**Prohibited:** audio logs, readable notes with prose paragraphs, corpses posed
to spell out a narrative, skeletons holding items, blood arrows pointing at
secrets.

## 4.6 Time of day

Authored per room, not simulated (see §01.9). A room declares its hour and four
things derive from it:

1. **Sky gradient** (or its absence)
2. **Key light colour and angle** — warm low sun in Igwe, cold high moon in room 0
3. **Ambient particle tint**
4. **Music track selection**

The only room permitted a moving clock is **Igwe**, where the sun may creep
across a long arc, because the sky is that room's subject.

## 4.7 Adding a room — the checklist

1. Draw the ASCII map. Verify widths are consistent (build it programmatically).
2. Add to `ROOMS` with `name`, `tint`, `map`, `exits`.
3. Wire exits **both ways** and verify the arrival tile is solid ground.
4. Update all five indexed tables (§4.1).
5. Add a `STONE` palette row if the material is new.
6. Add ambient particle type if new.
7. Add music track if new; otherwise reuse.
8. Place: one charm, one thing worth finding, 4–8 enemies obeying §4.3.
9. Add a lore entry that this room unlocks.
10. Add a test asserting the room is reachable from an existing room's exit list.
11. Run `node test.js`. Zero failures or it does not ship.
