# 13 — The Claude Operating Manual

**Read this first, every session, before anything else.**

This document tells you how to work on Ọdịnala. It outranks your defaults. Where
your instincts and this manual disagree, the manual wins.

---

## 13.1 What you are working on

Ọdịnala is a **finished, working game** that is being extended — not a prototype,
not a greenfield project. Ten rooms, four bosses, nine enemy species, four
weapons, an ending, and 218 passing assertions already exist.

**The consequence:** your default posture is *conservative*. Your job is to add
without breaking. A change that adds a feature and breaks a test has made the
project worse, not better.

## 13.2 The first five minutes of every session

1. `node test.js` — confirm **0 failures**. If it fails before you have touched
   anything, stop and report it.
2. Read `bible/01-VISION.md` §1.5 (the five pillars). Everything you build serves
   one of them.
3. Read **only** the chapter that covers the task. Use the map below.
4. State your plan in two or three sentences before writing code.

## 13.3 Task-to-chapter map

Do not read all fourteen chapters. Read the one you need.

| Task | Read |
|---|---|
| Adding a room, biome, or level layout | `04-WORLD.md` |
| Adding or tuning an enemy | `06-ENEMIES.md`, then `05-COMBAT.md` §5.9 |
| Adding a boss | `07-BOSSES.md`, then `02-STORY.md` §2.5 |
| Changing frame data, weapons or spells | `05-COMBAT.md` |
| Anything visual | `08-ART.md` |
| Anything audible | `09-AUDIO.md` |
| Menus, HUD, controls, accessibility | `10-UI.md` |
| Writing any text at all | `02-STORY.md` §2.6, `03-LORE.md` §3.7 |
| Anything using an Igbo word or deity | `03-LORE.md` — **and then ask** |
| Refactoring, performance, tests | `11-TECH.md` |
| Deciding what to do next | `12-ROADMAP.md` §12.3 |

## 13.4 How to work

**Small, complete, verified.** One coherent change. Test it. Then the next. Never
stack six half-finished systems and test at the end — this codebase is one file
and a broken intermediate state is expensive.

**Test before and after. Always.** `node test.js` is not a formality; it has
caught four genuine bugs in this project that manual play did not.

**A new system ships with new assertions.** Not "I will add tests later." The
same commit.

**A bug fix ships with a test that would have caught it.** Every real bug found
here has a permanent test guarding it. Add yours to that set.

**Update the docs in the same change.** `CLAUDE.md` at the repo root, plus the
relevant bible chapter. A system nobody documented is a system the next session
will break.

## 13.5 When to stop adding features

This is the most important section in the manual, because it is the thing you
will get wrong.

**Stop and consolidate when any of these is true:**

- Three or more items from §12.4's polish checklist are failing
- Any test is failing, or was disabled to make something pass
- A system exists that has no assertions
- Frame time on a low-end device is over budget
- You have added two new systems since the last time you played the game end to end
- The last three changes were all at priority level 5 of §12.3

**Signs you are building the wrong thing:**

- You are adding a system because it is interesting to build, not because §12.3
  ranks it
- You are working on Phase 3 items while Phase 1 items are unfinished
- You cannot name which pillar the feature serves
- The feature makes the game *bigger* but not *better*
- You are about to write "for now" or "placeholder" in a comment

**When in doubt: finish something instead of starting something.**

## 13.6 Refactoring rules

**Do not refactor for taste.** The file is 5,000 lines and one file on purpose.
That is not technical debt, it is the product.

Refactor **only** when:
- A specific change you have been asked to make genuinely requires it, and
- You have stated why *before* doing it, and
- The tests pass identically before and after

**Never:**
- Split the file into modules
- Introduce a class hierarchy
- Add a build step to "clean things up"
- Rename things across the codebase for consistency
- Convert data tables into classes
- Replace the hand-rolled loop with a framework

If you find yourself writing "while I was in there, I also…" — stop. Revert that
part.

## 13.7 The invariants you must never break

From `11-TECH.md` §11.3, repeated here because breaking them is subtle and the
symptoms are confusing.

1. **`ctx` is `let`.** `buildBackLayers()` swaps it. Always restore it.
2. **`pressed` clears only on frames where `update()` ran.** Input must survive
   hitstop.
3. **`P.swingId` / `e.hitId`.** One swing lands once.
4. **`CHAIN().length` is not 3.**
5. **Static art bakes; animated art does not.** Anything you put in
   `buildBackLayers()` freezes.
6. **Five tables are room-indexed.** Update all five.
7. **New modes go in `MENU_MODES`.**
8. **Save slots stay keyed** even in the memory fallback.
9. **`e.tell` covers the whole wind-up.**

## 13.8 When to ask instead of deciding

**Always ask about culture.** If a feature needs an Igbo name, deity, practice or
word that is not already in `03-LORE.md`, stop and ask. Do not invent one because
it sounds right. This is the one rule with no exceptions — it is in `00-INDEX.md`
as the rule that outranks the others.

**Ask before:**
- Adding a boss (each one is a large authoring commitment)
- Changing frame data on a shipped verb (roll, ward, the chain)
- Changing the ending or adding an ending
- Removing anything the player can currently do
- Anything that would break the single-file constraint

**Decide yourself:**
- Enemy placement within the §04.3 rules
- Palette choices within §08.3
- Which polish items to fix
- Test structure
- Internal function naming

## 13.9 When to push back

**Say so before building it** if a request:

- Fights a pillar (§01.5)
- Appears on the prohibited list (§01.8)
- Duplicates a system that exists
- Would break the performance budget
- Would require an external library, asset or build step
- Is a Phase 3 item while Phase 1 items are unfinished
- Would need invented Igbo material

Push back once, clearly, with the reason and an alternative. Then do what you are
told if the answer stands. You are the technical conscience of the project, not
its owner.

**Example of good pushback:**
> "That would need a fifth spell, and §05.7 caps it at four because past that the
> player stops learning any of them. Two alternatives: deepen Ala's Grasp to level
> 4, or replace Idemili if you have gone off it. Which would you like?"

## 13.10 Working with the tests

`test.js` stubs the DOM, canvas, audio, storage and timers, then drives the real
loop. It tests the game, not a model of it.

**Writing a new test:**
```js
revive();                     // resets HP, state, hitstop, slow-mo, and P.face
api.G.hitstop = 0;            // belt and braces before any timing-sensitive check
api.resetPlayerAt(room, tx, ty);
tick(6);
if (api.G.mode === 'cut') { press('KeyX', 2); tick(4); }   // skip cutscenes
// ... act ...
check('a sentence describing the expectation', condition, 'debug info');
```

**Things that have caused flaky tests here, so check them first:**
- `P.face` not set — the swing goes the wrong way and hits nothing
- Hitstop or slow-mo left over from a previous block, so `update()` never runs
- A cutscene triggering on room entry and swallowing input
- A queued boss outro (`G.outroT`) firing mid-test
- Menu navigation by index after a menu gained a row — **navigate by label**

**Never:**
- Disable a test to make a change pass
- Assert on internal frame counters that tuning will legitimately change
- Test through the DOM — add to the `__ODINALA_TEST` export instead

## 13.11 The quality bar

Before you say a piece of work is finished, all nine items in §12.5 must be true.
The two that get skipped most often, and must not be:

- **"It sounds right."** Silence is a bug. Every mechanical event has a sound.
- **"It looks right."** There is no placeholder art in this project. If you add a
  thing, it is drawn to the standard in `08-ART.md` or it does not ship.

## 13.12 The short version

- Read the manual, run the tests, state the plan
- One change at a time, tested both sides
- Serve a pillar or do not build it
- Ask about culture, every time
- Finish before you start
- Do not refactor because it would be tidier
- Documentation is part of the change
- Silence and placeholder art are bugs
- **A smaller finished game beats a larger unfinished one**
