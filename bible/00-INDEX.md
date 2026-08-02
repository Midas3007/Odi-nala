# Ọdịnala — Development Bible

**Version 1.0 · The document of record.**
If this document and the code disagree, the code is wrong and gets changed.
If this document and a good idea disagree, argue it out in writing and amend the document.

---

## What this is

Ọdịnala is a hand-made, single-file, browser-native Metroidvania built on Igbo
cosmology. It exists. It runs. It has ten rooms, four bosses, nine enemy species,
four weapons, four spells, a tutorial, a codex, an ending, and 539 automated
assertions guarding all of it.

This bible is not a pitch for a game that might exist. It is the operating
specification for one that already does, written so that development can
continue for years without the thing drifting into a different game.

---

## The files

| File | What it governs |
|---|---|
| `00-INDEX.md` | This. How to use the bible. |
| `01-VISION.md` | Creative vision, design pillars, tone, references, prohibitions, wishlist triage |
| `02-STORY.md` | Plot, timeline, world history, endings, dialogue style |
| `03-LORE.md` | Cosmology, gods, spirits, the ọgbanje, glossary, codex entry standards |
| `04-WORLD.md` | World bible, biome bible, level design rules, environmental storytelling |
| `05-COMBAT.md` | Combat design, frame data, weapons, spells, the tell system |
| `06-ENEMIES.md` | Enemy design bible — every species, its lesson, its numbers |
| `07-BOSSES.md` | Boss design bible — every boss, every phase, every tell |
| `08-ART.md` | Art direction, palette, animation standards, VFX standards, lighting bible |
| `09-AUDIO.md` | Audio bible, music direction, the instrument set, voice system |
| `10-UI.md` | UI/UX guide, progression, economy, NPC and quest design, accessibility |
| `11-TECH.md` | Technical architecture, coding standards, performance rules, testing |
| `12-ROADMAP.md` | Feature roadmap, polish checklist (200+ items), definition of done |
| `13-CLAUDE-MANUAL.md` | **The Claude Operating Manual.** Read this first, every session. |

---

## How to read it

**If you are Claude Code opening this repository for the first time:** read
`13-CLAUDE-MANUAL.md` in full, then `01-VISION.md`, then whichever chapter covers
the work in front of you. Do not read all fourteen files before every change —
that is a waste of context. The manual tells you which file each kind of task
maps to.

**If you are a human:** read 01, 02, 03 for the game. Read 05, 06, 07 for how it
plays. Read 11, 13 if you are going to touch the code.

---

## The one-paragraph version

You are an ọgbanje — a spirit-child who is born, dies young, and is born again to
the same mother, nine times over. On the tenth, a dibia found your iyi-uwa, the
buried charm that ties you to the other side, and buried it under an ogilisi tree
so you would have to stay. Then something took your mother anyway. So you dug up
your own charm and broke the bargain from the wrong side, and now you cannot die
properly and neither can the thing that took her. The game is the walk from that
tree to the land of the dead, and the question of whether you go back into the
cycle when you get there.

---

## The rule that outranks every other rule

**Ọdịnala is a game about a specific culture, made with care.** Igbo names,
words, deities and practices are used because they are the subject, not because
they are texture. Every use is either accurate or clearly marked as this game's
invention. Nothing is included because it sounded exotic. If a choice cannot pass
that test, it does not go in, however good it would look.
