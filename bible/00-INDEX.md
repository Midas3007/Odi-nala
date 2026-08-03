# Ọdịnala — Development Bible

This is the complete design and production document for Ọdịnala, an Igbo-mythology
Metroidvania that ships as a single HTML file.

It exists so that any contributor — human or Claude — can make a decision about this
game without asking anyone, and arrive at the same answer the director would have.

## Status of the project

The game is **playable, complete, and shipping**. There is a beginning, ten rooms,
three bosses, an ending, and 924 automated assertions that all pass. This bible is
not a plan for a game that does not exist. It is the operating manual for a game
that does, and the map for where it goes next.

Anything in this document that describes behaviour the code does not yet have is
marked **[NOT BUILT]**. Anything I decided rather than Midas is marked
**[PROPOSED — confirm or overrule]**. Everything else describes shipped behaviour
and should be treated as law until Midas says otherwise.

## The documents

| File | What it governs |
|---|---|
| `01-VISION.md` | Theme, tone, emotion, pillars, references, non-goals |
| `02-STORY-AND-LORE.md` | Plot, cosmology, timeline, gods, spirits, endings |
| `03-WORLD-AND-BIOMES.md` | The ten rooms, biome rules, level design, environmental storytelling |
| `04-COMBAT.md` | Combat feel, weapons, spells, enemy bible, boss bible |
| `05-PROGRESSION-AND-NPCS.md` | Economy, unlocks, mirrors, riddles, dialogue style |
| `06-ART.md` | Palette, silhouette, animation, VFX, lighting |
| `07-AUDIO.md` | Instruments, timelines, arrangement, voices, SFX |
| `08-UI-UX.md` | HUD, menus, controls, accessibility |
| `09-TECHNICAL.md` | Architecture, coding standards, performance, testing |
| `10-ROADMAP-AND-POLISH.md` | Feature roadmap, 200-item polish checklist, definition of done |
| `CLAUDE-OPERATING-MANUAL.md` | **Read this first if you are Claude Code** |

### A note on `bible/archive/`

An earlier version of this bible exists in `bible/archive/`. It is **superseded** and
must not be treated as authoritative — it predates the weapon system, rooms 8 and 9,
three of the enemy types, and the two crash bugs currently outstanding. It is kept only
because it may contain a detail this version dropped. If you find something there that
should be here, move it here and delete it there. Never cite it.

## Reading order

**If you are about to write code:** `CLAUDE-OPERATING-MANUAL.md`, then `09-TECHNICAL.md`,
then whichever domain file covers your task.

**If you are about to design content:** `01`, then `02`, then the domain file.

**If you are about to draw something:** `01`, `06`, `03`.

**If you are Midas:** start with `01` and `02` and tell me what I got wrong.

## The one-sentence version

You are a child who was never supposed to stay, walking back through the country of
the dead to take back the woman who kept trying to keep you.

## How to disagree with this document

The bible loses to the game. If a rule in here makes the game worse when you actually
play it, the rule is wrong — change the rule, note the change, and move on. Document
what the game *is*, not what it was supposed to be.
