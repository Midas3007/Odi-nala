# Claude Operating Manual

**Read this before writing a line of code.** The rest of the bible tells you what the
game is. This tells you how to work on it.

## 1. The prime directive

**The game is already good and already shipping.** Your default action is not to add
things. It is to make what exists work correctly, feel better, and stay small enough to
keep working on. A change that adds a system and costs 4ms a frame is a bad trade even
if the system is interesting.

## 2. Before you touch anything

```bash
node test.js                          # must end: 0 failures
python3 tools/audit.py odinala.html   # must end: audit clean
```

If either is already failing when you arrive, **fix that first and commit it alone.**
Never build on a red baseline.

## 3. The loop for every change

1. **Read the relevant bible file.** The answer is usually already there.
2. **Write the test first** if you are fixing a bug. Watch it fail.
3. **Make the smallest change that works.**
4. **Run both checks.**
5. **Play it.** Actually open the HTML and play the part you changed. The tests prove it
   isn't broken; they cannot prove it is good.
6. **Commit, one logical change per commit.**
7. **Update the bible** if you decided something it didn't cover.

## 4. Priorities, in strict order

When two things conflict, the higher one wins. Always.

1. **It doesn't crash.** A frozen game is worse than a missing feature.
2. **It doesn't soft-lock.** A player who cannot move has lost their save.
3. **It doesn't lose progress.** Saves are sacred.
4. **It runs at 60 FPS on a phone.**
5. **It feels good.** Hitstop, weight, readability.
6. **It's correct to the culture.** See §9.
7. **It has more content.**
8. **It has more systems.**

Note that "more systems" is last. That is deliberate.

## 5. Refactoring rules

- **Refactor only what you are already changing.** No drive-by cleanups in a feature
  commit.
- **Never split the file.** One HTML file is a product constraint, not an accident.
- **Never add a build step, a bundler, a framework, or a dependency.** If your solution
  needs one, it's the wrong solution.
- **Do not rename things for taste.** `G`, `P`, `R`, `C` are terse on purpose and the
  whole codebase is consistent.
- **If a function needs a section-header comment inside it, split the function.**
- **Delete dead code the moment it's dead.** No commented-out blocks left behind.
- Refactoring commits are separate from feature commits and say so.

## 6. The traps — all of these were real bugs

1. **`ctx` is `let`.** `buildBackLayers()` swaps it for an offscreen context. Always
   restore it, and use `try`/`finally` if anything between might throw.
2. **One swing, one hit.** `P.swingId` / `e.hitId`. Remove the guard and damage silently
   multiplies by the number of active frames.
3. **Baked background.** Static art goes in `buildBackLayers()`. Animated art stays
   per-frame. Put animated art in the bake and it freezes; put static art per-frame and
   you lose the phone.
4. **Chain length varies by weapon.** Never assume 3. Use `CHAIN().length`.
5. **Input must survive hitstop.** The `consumed` flag in the frame loop is why taps
   during freeze frames aren't eaten. Do not "simplify" it.
6. **Never overload a key that already has a movement meaning.** The ledger was on `↑`
   and silently never opened, because jump consumed the tap first.
7. **Index-keyed tables drift.** Adding a room means five tables plus the map links.
   `tools/audit.py` catches this — run it.
8. **Timers count down, decremented in exactly one place.**
9. **Menus must reset their selection when opened.**
10. **If storage is blocked, say so.** Never claim a save that didn't happen.

## 7. Performance discipline

The budget is 16.6 ms; target under 8 ms of JS.

- **Bake anything static.** This is the single most important optimisation in the
  project — the tree layers went from ~1000 canvas ops a frame to three `drawImage`
  calls.
- **Cull everything off-screen.**
- **Cap every unbounded array.**
- **No allocation in the hot path.** No `map`/`filter`/`reduce` per frame.
- **Measure before optimising.** Add a frame-time overlay, test in the fire room (the
  heaviest), compare. Never optimise on intuition.
- If a feature costs more than ~1 ms a frame, it needs to justify itself explicitly.

## 8. When to stop adding features

Stop and consolidate when any of these is true:

- `node test.js` takes longer than about 30 seconds
- The file passes ~8,000 lines
- Frame time on the fire room passes 10 ms
- There are more than two `[NOT BUILT]` items you added yourself and didn't finish
- You've added a system that nothing in the bible asked for
- A first playthrough takes more than two hours

Any of those means the next commit is polish, tests, or deletion — not features.

**And the harder rule:** if you find yourself building something because it would be
interesting to build rather than because the game needs it, stop. This project's biggest
risk is not that it's too small. It's that it becomes a pile of half-finished systems
that all technically work.

## 9. Cultural correctness — non-negotiable

This game is built on a living belief system. Some specific standards:

- **Ekwensu is not Satan.** Missionary translation flattened him into the Christian
  devil. He is a deity of war and bargaining. Preserve this.
- **Ala Mmụọ is not hell.** Igbo cosmology has no hell. Ọkụ Mmụọ is a *forge*, not a
  place of punishment.
- **An ikenga is properly an object** — a carved personal shrine. Our treatment of it as
  a granted, temporary power is deliberate and correct; do not make it permanent.
- **Riddles must be real.** If you add a `gwam gwam gwam`, it must be a genuine
  traditional form. Do not invent one and present it as traditional.
- **Never gloss in dialogue.** `ọgbanje`, not "ọgbanje, a spirit child in Igbo belief."
  The codex explains; the game does not stop to teach.
- **Don't smear pan-African.** Nsibidi is Igbo. Adinkra is Akan. Do not use Adinkra here.
- **When you're not sure, flag it rather than guessing.** Write `[CHECK WITH MIDAS]` in
  the bible and move on.

## 10. Writing standards

Every line of player-facing text follows `bible/02-STORY-AND-LORE.md` §2.9:
short declaratives, no exclamation marks, no archaic English, second person for the
narrator, bosses in quotation marks, Igbo unglossed, dry rather than portentous, ~110
characters maximum per cutscene beat.

If a line could appear on a fantasy novel's back cover, rewrite it.

## 11. Definition of done

A change is done when **all** of these are true:

- [ ] `node test.js` → 0 failures
- [ ] `python3 tools/audit.py odinala.html` → clean
- [ ] New behaviour has assertions, and new state is in the `__ODINALA_TEST` export
- [ ] You have played the affected part in a browser
- [ ] It works with a keyboard **and** with touch
- [ ] It runs at 60 FPS in the heaviest room
- [ ] Player-facing text follows the style guide
- [ ] Any new enemy has a `tell` of `'white'` or `'gold'` and a bestiary entry
- [ ] Any new room passes the five-table checklist
- [ ] Any new mode is in `MENU_MODES` and has Z-confirm / X-back
- [ ] The bible is updated if you decided something it didn't cover
- [ ] Dead code deleted, no commented-out blocks
- [ ] One logical change, one commit, a message that says why

## 12. What to tell Midas

At the end of each work session, report:

1. **What you built** — one line each.
2. **What you cut, and why.** This is the most valuable part. If you decided against
   something in the bible, say so and say what you'd do instead.
3. **What you found.** Bugs, weirdness, things that don't match the bible, anything that
   made you go "huh."
4. **What you'd do next**, if it were your call.

Don't pad this with a summary of what you were asked to do. He knows what he asked for.
Tell him what he doesn't know.

## 13. Things you may decide without asking

- Any numeric tuning that a test doesn't assert on
- Enemy placement within an existing room
- Which of two equally-good implementations to use
- Naming of internal functions and variables
- What order to do the backlog in, within a phase

## 14. Things you must ask about

- Changing the single-file constraint
- Changing a design pillar
- Changing anything marked cultural in §9
- Cutting a named character, boss, or ending
- Anything that makes a first playthrough longer than two hours
- Anything that would need an external asset
