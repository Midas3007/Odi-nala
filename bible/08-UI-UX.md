# 08 — UI, UX and Accessibility

## 8.1 The UI thesis

**The HUD tells you three things: what you have, what you can spend, and what is about
to kill you.** Everything else lives in menus.

At 480×270 logical pixels, screen real estate is the scarcest resource in the project.
Every element must justify its footprint against the alternative of not existing.

## 8.2 The HUD

Top-left cluster, in reading order:

| Element | Position | Behaviour |
|---|---|---|
| **Life rail** | 8,8 — 86×5 | Notched every 50 HP. Bone; turns `blood` below 25% and the top edge blinks. |
| **Ọfọ bar** | 8,16 — 56×2.5 | Gold when full, dim otherwise. A white hot line when full. |
| **Gourds** | 8,24 | Icon + `×3 / 4` — carried and capacity |
| **Cowries** | 54,24 | Cowrie icon + number |
| **Map / pause / sound icons** | after the rails | 16×16, framed, **tappable hit regions** |

Bottom-right: equipped weapon name (in the weapon's tint colour), equipped ọfọ with its
level in Roman numerals, and the control hint `F cast / G ọfọ / B blade`.

Bottom-centre: **boss health bar** when a boss is live, with its name — `???` until
known, then the true name. Below it, a thin poise bar, but **only while bound**, which
is itself information.

Transient: `say()` banners at the bottom, `G.note` at the top-centre for system messages
(saves, purchases).

### HUD rules
- **Nothing in the HUD animates unless it is communicating something.** No idle
  shimmer, no breathing bars.
- **Low health is the only element that blinks.**
- **Every icon is a tap target** (`HUDBTN`), hit-tested through `toLogical()`, and only
  active in `play` mode.
- **The HUD never covers the play area's centre third.**

## 8.3 Menus

Eleven modes: `title`, `play`, `cut`, `map`, `riddle`, `travel`, `shop`, `pause`, `inv`,
`codex`, `ending`. Each is a `case` in the frame loop switch and a branch in the render
dispatch.

### Structural rules
- **Every menu is Z to confirm, X to go back.** No exceptions.
- **Every menu is navigable with the joystick**, and every menu mode is in `MENU_MODES`
  so the stick snaps to a single axis.
- **Hold a direction to keep scrolling** after 20 frames, stepping every 6.
- **The selected row is a 14% gold wash plus a gold pip in the margin.** Consistent
  everywhere.
- **No nested menus deeper than two levels.** Pause → inventory is the maximum.
- **No confirmation dialogs.** Purchases are instant. The only irreversible action in
  the game is starting a new save, and that has its own title entry.

### The title screen
`CONTINUE` shows real progress: a text beat (*"the name, read off the stone"*), a
percentage, and a gold bar. Ten story beats tracked in `storyProgress()`.
Then `BEGIN AGAIN`, `SPEEDRUN — everything open`, `THE CODEX`, `HOW TO FIGHT`.

### The pause menu
`RESUME / IN HAND (weapon) / ỌFỌ (spell) / WHAT YOU CARRY / THE CODEX / MAP / SOUND /
CHEATS / SAVE NOW / LEAVE TO THE TITLE`. Weapon and spell rows take left/right to cycle
in place — no submenu.

### The codex
Two tabs: **the lore**, unlocking as the story reveals it, and **the bestiary**, listing
only what you have actually killed, with a count. Reachable from the title *and* the
pause menu.

### The map
Thumbnails at 2px per tile, **only for rooms visited**. Gold squares are doorways, cyan
is an attuned mirror, red is a shrine. A blinking gold dot is you. Links drawn between
visited rooms.

**It is baked, not redrawn.** Every tile of every visited room used to be painted on
every frame the map was open — 12,072 of them at thirteen rooms, measured at **2.79 ms a
frame against 0.54 ms for playing**, which is five times the cost of the actual game in
a screen where nothing moves. It bakes to an offscreen canvas exactly the way the
parallax does, and re-bakes only when its key changes: which rooms you have seen, which
mirrors are lit, and which room you are standing in. It costs 0.56 ms now.

**The key is the whole safety of it.** A map that has not noticed you walked somewhere
new is worse than a slow one, and every field of that key is a thing you can watch
change on screen. There is a REGRESSION test per field, and one on the cost ratio, so a
future change that quietly kills the cache fails rather than just gets slower.

**`MAPPOS` has to be checked by eye against 480×270.** It is hand-placed pixel positions
with no constraint on them, so three new rooms pushed two thumbnails off the right edge
and dropped labels on top of other rooms, and nothing failed. It is laid out in four
bands now — the warm strip on top, the opening rooms under it, the shaft down the right,
the back half along the bottom — and adding a room means re-checking the whole layout,
not just appending to the table.

## 8.4 Controls

### Keyboard
```
← →  move          Space / ↑  jump        ↓  crouch / interact
Z    cut (hold through recovery to charge, release for heavy)
X    roll          C  ward
V    drink nzu     F  cast ọfọ    G  cycle ọfọ    B  cycle weapon
N    call the name E  use / ledger
M    map           Esc  pause     P  mute        K  toggle cheats
```

### Touch — first-class, not a port
- **Floating joystick**, bottom-left, confined to a 44% × 38% region so it can never
  reach the HUD icons. A dashed circle shows where it lives. On press the base appears
  under your thumb; the knob tracks within 34px.
- **In menus the stick snaps to one axis**, dead zone 7px, and will not re-fire until
  the direction changes. In play the dead zone is 9px, horizontal triggers earlier, and
  down requires a deliberate push (1.6× dead zone *and* clearly more vertical).
- **Action buttons on the right**, each labelled with **both its name and its key**:
  CUT/Z, ROLL/X, WARD/C, JUMP/␣, and a smaller row HEAL/V, ỌFỌ/F, SWAP/G, USE/E, NAME/N.
  The key letters exist so the tutorial can say "press Z" and be legible on a phone.
- **☰ menu button**, top-right.

**Touch rule: never add a gesture.** No swipes, no double-taps, no long-presses. Every
action is a discrete button or the stick.

## 8.2b Hold-to-scroll and MENU_MODES

**Every mode the player steers with a direction must be in `MENU_MODES`.** This is not
only about `menuRepeat()`. The touch stick branches on the same list, and a mode that is
missing from it falls through to the *play* branch — which calls `clearDirs()` then
`down()` on **every `pointermove` event**. Holding the stick then re-presses the direction
dozens of times a second.

The codex was missing from the list and did exactly that: holding the stick scrolled the
lore and bestiary past everything you were trying to read. Fixed by adding `codex`.

Repeat rates are per mode in `MENU_REPEAT` — `[frames before repeating, frames between]`.
The default is `[20, 6]`. **The codex is deliberately slower at `[30, 13]`**, because its
rows are things you read rather than things you count past, and overshooting an entry
costs a re-read rather than one more tap.

## 8.2c Boss title cards — **[BUILT]**

A thin band across the middle of the screen: the boss's name in serif, its epithet under
it in small type, two gold rules top and bottom, over a 55% dark wash. It fades in over
22 frames, holds, and fades out over the last 34 of its 190.

Rules that made it work:

- **It does not stop the game.** No pause, no input lock, no key to dismiss. The fight is
  already happening underneath it and the player can already be moving. A card you have
  to dismiss is a modal, and §8.1 does not allow modals.
- **The band is thin and the middle is clear.** It sits across `H/2` at 30px so the boss
  and the player both stay visible through it. A full-screen card would hide the first
  tell of the fight, which is the one the player most needs to see.
- **Name and epithet come from `BEASTS`** via `bossCard()`, so the card and the bestiary
  cannot disagree. There is no second table of boss names, and there must not be — a boss
  whose card says one thing and whose codex entry says another is the drift `tools/audit.py`
  exists to prevent, in a place the audit cannot see.
- **It is raised on every entry to a room with a live boss**, from `resetPlayerAt()`,
  alongside the stinger (07-AUDIO §7.6) — including after a death. The arrival *cutscene*
  beside it is gated on `G.taught.*` and plays once; the card is deliberately **not**,
  because it is a label on the fight rather than a story beat, and the walk back after
  dying should announce what you are walking back to. Once the boss is dead the room stops
  raising it, which is what `!boss.dead` is for. There is a REGRESSION test on both halves.

## 8.5 Accessibility

Some of this is built; much is not. **[NOT BUILT]** markers are honest.

### Built
- **No reliance on colour alone for the critical read** — gold tells have a *double
  outline* and a faster pulse as well as a different hue. A colourblind player reads the
  outline count.
- **Input buffering through hitstop** — presses during freeze frames are not eaten.
  This helps everyone and it helps players with slower reaction times more.
- **Coyote time (7f) and jump buffering (8f)** — forgiving platforming.
- **Hold-to-scroll in menus** — no repeated tapping.
- **Full keyboard and full touch parity.** Nothing is mouse-only.
- **Speedrun mode** as a pressure valve for players who cannot or do not want to clear
  the combat: invulnerable, one-hit kills, everything unlocked. **This is the game's
  accessibility mode and it is unlocked from the title, not hidden.**
- **Skippable tutorial and skippable cutscenes.**
- **No flashing above 0.5 alpha.**

### Built in Phase 3 — the "HOW YOU PLAY" screen

One screen holds all six, reached from **the pause menu and the title**, because a player
who needs it should not have to start a run to find it.

1. ~~**Rebindable keys.**~~ **[BUILT]**
2. ~~**Parry assist**~~ — **[BUILT]** widens the ward window from 9 frames to 14. That is
   the *only* number it changes: the tell still has to be white and you still have to be
   facing it.
3. ~~**Text size.**~~ **[BUILT]** Scales the **fiction only** — `wrapText` and the say
   banner — at ×1.35. HUD numbers and menu rows deliberately do not scale, because they
   are laid out against fixed pixel positions and would collide at 480×270.
4. ~~**Reduced motion.**~~ **[BUILT]** `shake()` becomes a no-op and so does `slowmo()`,
   which exists *because* of this: slow-motion was set inline at four separate sites, and
   an option that catches three of four is worse than none.
5. ~~**Reduced flashing.**~~ **[BUILT]** Capped **where the flash is painted**, not where
   it is set — a dozen sites set `G.flash` and exactly one paints it.
6. ~~**Colourblind tell colours.**~~ **[BUILT]** Gold becomes **violet**, a hue used
   nowhere else: gold means rest charms and broken guards, cyan means mirrors, red means
   fire. **The white tell never changes**, because white always means turnable, and there
   is a REGRESSION test that the option leaves it alone.
7. **Screen reader support.** Still **[NOT BUILT]** and still honestly impossible in a
   canvas game without a parallel DOM tree.

### Rebinding: how, and what may not be rebound

**Rebinding happens at the event boundary and nowhere else.** The game goes on reading
canonical codes — `KeyZ` means cut for ever, in all several hundred `tap()` call sites —
and `BINDS` maps the key physically pressed onto one of those. That is why this cost no
changes to any game logic, and why the touch buttons, which call `down()` with canonical
codes, needed none either.

**Binding is a swap, not an assignment.** One physical key drives one action and one
action has one key; assigning without swapping leaves the displaced action with no key
at all and no way to get it back.

**`Escape`, `Tab`, `Enter`, `K`, `R` and the WASD aliases cannot be rebound.** A player
who binds cut to Escape and then cannot open the pause menu to undo it has been locked
out of the game *by an accessibility feature*. There is a REGRESSION test per fixed key.

### Where the settings live — not in the save

Bindings and assists are stored under their **own key**, not in the save slot. In the
slot, starting a new game wipes the keys somebody rebound and loading an old save turns
off an assist they need — the accessibility principle below, broken by a storage
decision. Loading always starts from the defaults and applies only what is valid, so a
junk table can never leave a player unable to move.

### Accessibility principle
**Never gate accessibility behind difficulty.** The speedrun mode is on the title
screen, described plainly, with no shaming language. A player who uses it has played the
game.

## 8.6 UX rules learned the hard way

These are all real bugs that were found and fixed. They are here so they are not
reintroduced.

- **Input must survive hitstop.** `pressed` flags are cleared only on frames where
  `update()` ran. Clearing unconditionally makes heavy hits feel broken.
- **Never overload a key that already has a movement meaning.** The ledger was on `↑`
  and never opened, because `↑` is jump and consumed the tap first. It is `E` now.
- **The joystick must not overlap the HUD.** It did; it does not now.
- **Labels must say what they do.** The heal button said `NZU` and nobody knew what it
  was. It says `HEAL` and the tutorial explains that the gourd holds nzu.
- **A menu must reset its selection when opened**, or the second visit lands somewhere
  unexpected.
- **If storage is blocked, say so.** Never claim to have saved when you have not.

## 8.7 The five-second rule

A new player, five seconds after the game starts, must be able to answer:
1. Which thing on screen am I? *(bone mask, only lit figure)*
2. How much life do I have? *(the rail, top-left)*
3. What do I press? *(the Teaching says so, with the key on the button)*

If a change breaks any of those three, the change is wrong.
