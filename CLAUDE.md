# Ọdịnala

An Igbo-mythology Metroidvania that ships as a single HTML file. Open
`odinala.html` in a browser and it runs. No build step, no dependencies, no
external assets.

**This file is the index. `bible/` is the detail.** Where this file and the
bible disagree, the bible wins.

## Read before you touch anything

1. `bible/CLAUDE-OPERATING-MANUAL.md` — how to work on this project. It outranks
   your defaults, and it is specific about refactoring, when to stop adding
   features, and what "done" means.
2. `bible/09-TECHNICAL.md` — architecture, the traps, performance, testing.
3. `bible/00-INDEX.md` — what is in the other nine chapters, and the reading
   order for the task in front of you.

Do not read the whole bible up front. Read the manual, then the one chapter
that covers your task.

## The two gates

Both must pass before **and** after every commit. Neither is optional.

```bash
node test.js                          # must end: 0 failures
python3 tools/audit.py odinala.html   # must end: audit clean
```

`test.js` drives the real game loop one tick at a time against the real script,
through the `__ODINALA_TEST` hook at the bottom of `odinala.html`. If you add a
system, add its state to that export and write assertions for it — never test
through the DOM. Details in `bible/09-TECHNICAL.md` §9.6.

`tools/audit.py` is a static check for the class of bug that has cost this
project the most time: index-keyed tables that have drifted apart, and geometry
that puts the player somewhere they cannot leave. Adding a room means updating
five tables — the audit is what catches you missing one.

If either gate is already red when you arrive, fix that first and commit it
alone. Never build on a red baseline.

## Ground rules that never change

Pure HTML/CSS/JS · one file · canvas 2D · no dependencies · no external assets ·
mobile-first · 60 FPS target.

The single-file constraint is a product decision, not an accident. Do not split
the file, add a build step, or introduce a dependency. If a solution needs one,
it is the wrong solution.

## Layout

| Path | What it is |
|---|---|
| `odinala.html` | The entire game |
| `test.js` | Headless harness, run with `node test.js` |
| `tools/audit.py` | Static room and table audit |
| `tools/checklist.py` | Decides what the polish checklist may tick |
| `bible/` | Design authority — 11 chapters plus the operating manual |
| `bible/archive/` | A superseded earlier bible. **Never cite it.** Kept only in case it holds a detail the current set dropped; if you find one, move it into the current file and note it there. |
