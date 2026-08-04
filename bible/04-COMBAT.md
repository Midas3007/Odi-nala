# 04 — Combat Bible

## 4.1 The combat thesis

Combat is the game's primary verb and everything else frames it. The thesis, in one
sentence:

> **Every input is a commitment, every enemy tells you which commitment to make, and the
> reward for reading correctly is enormous.**

Three loops, nested:

**The micro loop (one exchange).** Enemy telegraphs → player reads colour → white means
ward, gold means roll → correct read produces stagger or i-frames → punish window →
back to neutral.

**The mid loop (one fight).** Poise damage accumulates → guard breaks → gold aura and a
`Z` prompt → execution → hitstop, slow-motion, blood, cowries.

**The macro loop (one boss).** Learn the pattern → learn the *idea* → apply the idea
under pressure.

## 4.2 The two-colour read

This is the single most important mechanic in the game.

| Telegraph | Meaning | Correct response |
|---|---|---|
| **White outline**, pulsing at 1/4 Hz | Parryable | **Ward (C)** within 9 frames |
| **Gold double outline**, pulsing faster (1/3 Hz) | Unblockable | **Roll (X)** — i-frames 4–15 |

Rules for this system, which must never be broken:

- **Every attacking enemy has a tell.** No unannounced damage, ever.
- **The colour never lies.** A white tell is always parryable. Always.
- **Gold tells are visually louder** — double outline, faster pulse — because failing to
  read them costs more.
- **Contact damage is a design failure.** Only the ember's dive and the lunger's charge
  do contact damage, and both have a full gold wind-up first.
- **New enemies must pick a side.** If a new enemy's attack cannot be sensibly assigned
  to white or gold, the attack is wrong.

## 4.3 Player moveset

| Input | Action | Frames | Notes |
|---|---|---|---|
| ← → | Move | — | acc 0.55 ground / 0.34 air, max 1.75 |
| Space / ↑ | Jump | — | vy −7.4, coyote 7f, buffer 8f, variable height |
| Z | Light attack | per weapon | Roots. Chains 3–4 hits. Combo window 26f. |
| Z held through recovery | Charge | 26f to full | Blade glows gold. Release fires heavy. |
| Z (released, charged) | Heavy | per weapon | Unblockable by enemy guards. Huge poise damage. |
| ↓ + Z (airborne) | Thrust | — | Pogo-bounces on hit. With Ala's Fall, breaks cracked tiles + shockwave. |
| Z (airborne) | Air cut | per weapon | |
| X | Roll | 22f | i-frames 4–15, cooldown 16f. **The only attack cancel.** |
| C | Ward | 9f parry / hold to block | Late ward = block at 30% damage. |
| V | Drink nzu | 44f | Heals 45 at frame 26. Interruptible — the charge is lost. |
| F | Cast ọfọ | ~42f | Costs 60–100 ọfọ depending on spell. |
| G | Cycle spell | — | |
| B | Cycle weapon | — | |
| N | Call the name | 48f | No i-frames. Deliberately risky. |
| Z near a broken enemy | Execution | 34f | Instant kill; 130 damage on bosses. |

### Feel constants — do not change without playtesting
```
gravity 0.46      max fall 9
jump vy -7.4      coyote 7      buffer 8
run acc 0.55/0.34 max speed 1.75
roll speed 3.1 decaying, 22f, i-frames 4-15, cd 16
ward parry window t <= 9, block after, auto-drop at 14 unless held
charge threshold 26f
combo window 26f
```

### Hitstop table
| Event | Frames | Shake |
|---|---|---|
| Light hit | 6 | 2.6 |
| Heavy combo finisher | 9 | 4.5 |
| Charged heavy | 14 | 7 |
| Muffled hit (blocked / unnamed boss) | 3 | 1.4 |
| Parry | 13 | 6 (+ 14f slow-mo) |
| Guard break | 11 | 5.5 |
| Execution | 16 at start, 14 at the kill | 5–8 (+ 26f slow-mo) |
| Player hurt | 8 | 5 |
| Boss death | 26 | 10 |

**These numbers are the game's feel.** They were tuned by hand. Treat them as art
assets, not parameters.

## 4.4 Weapon design

Four weapons. Each is a different *rhythm*, not a different number.

| Weapon | Chain | Reach | Light dmg | ọfọ mult | Special |
|---|---|---|---|---|---|
| **Mma** (machete) | 3 | 22 | 9/10/18 | ×1.0 | The baseline. Nothing clever. |
| **Nkwụ** (twin knives) | 4 | 17 | 6/6/7/13 | **×2.1** | Casts constantly. Must get close. |
| **Ogu** (war staff) | 3 | **34** | 13/15/26 | ×0.8 | Hits before they arrive; slow enough to punish. |
| **Mkpịsị Ọkụ** (firebrand) | 3 | 26 | 11/13/24 | ×1.1 | **Burn 110f** — 3 damage every 12 frames |

Design rules for any new weapon:
- **It must change how you fight, not how much damage you do.** A weapon that is just
  "the machete but stronger" is not a weapon, it is a stat increase.
- **Every weapon must have a real drawback.** Nkwụ has almost no reach. Ogu is slow. The
  firebrand is heavy. A weapon with no cost is a bug.
- **The ọfọ multiplier is the balancing lever.** Fast weak weapons cast more.
- Acquisition: mma is the default, nkwụ and ogu are bought at Ala's Ledger (190 / 260
  cowries), the firebrand is *found* in the fire room. **At least one weapon should
  always be found rather than bought.**

### Weapon-specific heavies — **[BUILT]**

Each weapon's heavy now has its own **shape**, not just its own numbers. The shape is
declared in `WEAPONS[k].heavy.kind` and branched in the `heavy` player state, so adding a
weapon means adding a kind rather than editing a shared code path.

| Weapon | Kind | Shape |
|---|---|---|
| **Mma** | `lunge` | One committed stroke forward. The baseline the others are read against — deliberately unchanged. |
| **Nkwụ** | `flurry` | Four cuts inside one commitment, 5 frames apart, each ~1.35× of a quarter share. Each is its own swing, so each lands once. |
| **Ogu** | `sweep` | Comes all the way round: the hitbox is built symmetrically about the player, so it catches what is **behind** you. The only attack in the game that does. |
| **Mkpịsị Ọkụ** | `slam` | Downward, and it leaves **burning ground** — a patch that applies `burn` to anything standing in it every 14 frames for 260 frames. |

Burning ground lives in `flames[]`, capped at 6 (§09.5 rule 3), cleared by `spawnRoom` so
it does not follow you between rooms, and it casts a light so it reads at night.

**The drawbacks are unchanged and still carry the balance.** The sweep is the slowest
wind-up in the game; the flurry has the shortest reach; the slam roots you hardest and
commits you downward. A shape that removed a weapon's cost would be a bug, not a buff.

## 4.5 Spell design — the four ọfọ

| Spell | Cost | L1 / L2 / L3 | Role |
|---|---|---|---|
| **Assent of Amadioha** | 100 | 45 / 68 / 96 dmg, 70–150 poise | Damage. Nine bolts on everything standing. |
| **Grasp of Ala** | 60 | 100 / 170 / 250 frames hold | Control. Roots them where they stand. |
| **Veil of Idemili** | 70 | 35 / 60 / 95 absorbed | Defence. Water between you and the next wounds. |
| **Hand of Ikenga** | 80 | ×1.6 / ×1.9 / ×2.4 damage, 330–540f | Aggression. Your right hand, briefly. |

Rules:
- **Each spell is one of the four archetypes: damage, control, defence, aggression.**
  A fifth spell must occupy a genuinely new role or it does not exist.
- **Each is tied to an alusi's real domain.** Non-negotiable. See `02-STORY-AND-LORE.md`.
- **Ọfọ fills from clean hits (×weapon multiplier), parries (+18), executions (+25),
  and kills (+6).** It does not regenerate passively. Aggression is the resource.
- Levelled at Ala's Ledger: 70 / 170 / 340 cowries.

## 4.6 Enemy bible

### Design contract for every enemy
1. It has exactly one idea.
2. It telegraphs, in white or gold.
3. It is readable in silhouette at 480×270.
4. It has poise and can be broken and executed.
5. It occupies a distinct *range band* — melee, mid, ranged, aerial.
6. Its death drops cowries.

### The fifteen

| Enemy | HP / Poise | Range | Idea | Tell |
|---|---|---|---|---|
| **Walker** (`w`) | 46 / 40 | melee | Two-hit chain; the second is 50% likely and gets you | white |
| **Lunger** (`l`) | 34 / 26 | dash | Unblockable charge. Roll only. | **gold** |
| **Thrower** (`t`) | 28 / 22 | ranged | Projectile; **a parry reflects it back for 18** | white |
| **Warden** (`W`) | 78 / 74 | melee | Frontal shield: light hits do 15%. Parry it or heavy it. | white |
| **Roller** (`r`) | 40 / 30 | dash | Curls and rolls | gold |
| **Horned** (`v`) | 110 / 86 | charge | Lowers horns; cannot be turned aside | **gold** |
| **Ember** (`a`) | 30 / 20 | **aerial** | Hovers above you, then falls. Gold gather, then dive. | **gold** |
| **Crawler** (`k`) | 34 / 26 | melee | Fast, low, bites twice | white |
| **Effigy** (`i`) | 66 / **96** | ranged | Rooted. Three-shot aimed volley. High poise — must be broken. | white |
| **Healer** (`n`) | 30 / 24 | mid | Restores an ally's poise and closes a broken guard. Retreats; will not chase. | white |
| **Mimic** (`q`) | 44 / 34 | melee | An idol that is an idol until you are inside its reach. | **gold** waking, white after |
| **Grappler** (`j`) | 64 / 48 | melee | Takes hold of you. Mash out, or wait it out. | **gold** |
| **Pair — shield** (`p`) | 58 / 72 | melee | Holds the line and eats light hits. Does not attack while its spear lives. | white (alone) |
| **Pair — spear** (`p`) | 34 / 26 | mid | Reaches *past* its own shield. Backs off if the shield dies. | white |
| **Swimmer** (`s`) | 38 / 28 | **aquatic** | No gravity. Holds a lane, then darts along it. | white |
| **Ceiling** (`b`) | 32 / 22 | **aerial** | Hangs, tracks you, drops when you walk under. | **gold** |

### Enemy roster gaps — **[NOT BUILT]**
Ranked by what the roster is missing mechanically:

1. ~~**A healer / buffer.**~~ **[BUILT]** `n`, Onye Mmezi. Stands off, picks the nearest
   ally that is missing poise or already broken, and channels for 72 frames; on
   completion it returns 55% of that ally's poise and shuts a broken guard early. A gold
   thread names the target the whole time it is working, so the decision is always
   legible. Staggering it cancels the channel outright — that is the counterplay, and it
   is why it is frail (30 HP against the warden's 78). It retreats from the player and
   only swings, white-telegraphed, when cornered.
2. ~~**A grappler.**~~ **[BUILT]** `j`, Onye Njide, in the fire room. A 34-frame **gold**
   reach — a roll, never a ward — then a seize. On contact the player enters a new
   `held` state: pinned, damaged every 24 frames, and freed by mashing Z/X/C or by the
   grappler being staggered or killed.

   **The escape is guaranteed and must stay that way.** `P.grabT` runs down on its own
   whether or not the player touches anything, so a grab tops out around 96 frames. A
   grab you cannot escape is a soft-lock wearing a costume, and priority 2 in the
   operating manual outranks any amount of tension. There is a REGRESSION assertion on
   exactly this.

   Being hurt by *something else* while held does **not** eject you. It used to —
   `hurtPlayer` overwrote `P.st` — which made the grappler weaker the more crowded the
   room was, exactly backwards, and left it holding nobody. Damage while pinned applies
   with a shortened i-frame and the hold continues.
3. ~~**A shield-and-spear pair.**~~ **[BUILT]** `p` spawns both. The shield holds station
   in front of the spear and **does not attack at all** while its partner lives; light
   hits on it are wasted, exactly as with the warden. The spear reaches *past* the
   shield, so the safe-looking spot at the wall is the one place it can certainly hit
   you. Kill either and the survivor changes: the shield stops being patient and starts
   swinging, the spear backs off and its cooldown doubles. Neither half is a fight on
   its own, which is the point of the entry.
4. ~~**A mimic prop.**~~ **[BUILT]** `q`, Arụsị Ọjọọ, in Ala Mmụọ. Asleep it is drawn by
   the *same `idolStatue()` call with the same arguments* as the room's real props — not
   a similar palette, the same one, because a palette that was slightly off gave it away
   immediately in a browser. Inside 40px it stands up on a **gold** tell and pounces.
   Pillar 2 holds: the surprise is that it was scenery, never that the attack is
   unreadable — it always stands up first. Awake it stays awake, splits open and lights
   from inside, so the second one you meet is a read rather than another ambush. Two are
   placed for exactly that reason.

   **The mimic may only be placed in a room that already has idols standing in it.** Its
   whole design is that it is drawn by the same call as the props around it; in a room
   with no idols it is a lone carving nobody put there, and it gives itself away before
   it moves. Worse, its sleeping form carries a cyan halo, and 03-WORLD §3.4 makes cyan
   mean *mirror*, which means safe. A cyan glow that is actually an ambush breaks the
   rule that lets a player read a dark screen at a glance. Room 11 was authored with one
   and it was caught in the first browser pass; there is now a test that fails if a `q`
   is placed anywhere but Ala Mmụọ. **Adding one elsewhere means giving that room idols
   first, or giving the mimic that room's own prop to be.**
5. ~~**A swimmer.**~~ **[BUILT]** `s`, Azụ Iyi, in Iyi Idemili. It returns before the
   shared gravity line in `enemyUpdate`, so it is the one enemy with no relationship to
   the floor at all: it holds a slow figure-of-eight lane, coils white, and darts along
   that lane in a straight line. The straight line is deliberate — it is what makes an
   enemy that ignores the floor still readable.
6. ~~**A wall-crawler.**~~ **[BUILT]** `b`, Ọnụ Elu, in the shaft. It hangs from a
   ceiling, tracks you along it, and drops **gold** when you walk underneath, then
   climbs back up. It is the only enemy that makes the ceiling worth looking at.

   **`tools/audit.py` inverts its geometry rule for `b`:** every other spawn char is
   flagged if there is solid above it, but a ceiling-dweller with no ceiling would hang
   in mid-air, so for `b` the audit requires solid above and clear air below.

## 4.7 Boss bible

### The three-act boss contract
Every boss must:
1. **Open with a lie or a truth that reframes the act.** Bosses talk.
2. **Have one idea the player must understand**, distinct from raw execution.
3. **Have at least one white and one gold tell**, so both defensive verbs are exercised.
4. **Have a phase change at 50%** that adds, not replaces, behaviour.
5. **Be executable** when their guard breaks — bosses take 130 damage from an execution
   rather than dying, and the execution extends their vulnerable window.
6. **Get their own cutscene in and out.**

### Boss 1 — Ogbunabali (room 3)
**The idea: he cannot be fought, only named.**

- 520 HP. 190 poise. Regenerates **0.30 HP/frame while unnamed** and takes **10% damage**.
- The chalk stone in room 2 carries his name. `N` binds him for **420 frames (7s)**.
- While bound: full damage, poise breakable, executable.
- Parrying him **extends the bind by 140 frames**; executing extends it by 260. The
  fight rewards aggression and defence equally, which is the point.
- Moveset: `slashWind` (white) → 2–3 slashes; `leapWind` (gold) → leap + shockwave;
  `fanWind` (white, phase 2) → five embers; `vanish` (gold) → teleport behind and strike.
- Phase 2 at 50%: 28% faster, third slash added.
- **He is telling the truth.** He did not take her.

### Boss 2 — Ekwensu (room 6)
**The idea: he is honest, enormous, and has no gimmick — this is the pure execution
test.** After a boss that could not be fought, the player needs a boss that can.

He needs no naming. He tells the truth unprompted. His fee was not paid in cowries.

### Boss 5 — Ikuku, the wind (room 9)
**The idea: it takes the ground away from you.**

Named by Midas. Ikuku was already in the game before it was a boss — it is the answer to
the mirror riddle *"It speaks and has no mouth"* — so the fight is a word the player has
already met being handed a body.

- 640 HP, 200 poise. **It never lands.** `ikukuUpdate` returns without the shared gravity
  line and clears `onGround` every frame; a REGRESSION assertion holds it to that,
  because a flying boss that comes to rest has stopped being the fight it was built as.
- `sweepWind` (white) → it drops to just above the floor and skims it. **Get off the
  ground.** `stoopWind` (**gold**) → it marks where you are standing, draws the line to
  it, and commits. **Leave.** The two alternate, so the fight pushes you up and then off
  again, and room 9's platforms stop being scenery.
- The stoop commits to the mark, not to the player. Moving after it has drawn the line is
  the counterplay, and it is asserted.
- Phase 2 at 50% adds `liftWind`: it pulls the air upward under you and then lets go.
- It reframes the room rather than the player. Igwe's horror is a sunset hundreds of feet
  underground that nobody remarks on; Ikuku's first line is that somebody has to hold it
  up. Its last is that the sky does not change when it dies, which is worse.
- **Optional. It gates nothing.** Igwe is the game's one contemplative room and its
  emotion is "vertigo, and something wrong you cannot name"; a compulsory fight
  overwrites that, and two mandatory bosses back to back before the finale spends more
  of the two-hour budget in §14 than the fight is worth. You can walk past it to Onwe.
- Because it is optional, **killing it is a choice and it costs you Ending C.** Whether a
  boss counts is derived by `bossIsGated()` from the exit tables rather than listed, so
  ungating any boss in future automatically makes killing it avoidable.

### Boss 4 — Ụzụ Ọkụ, the smith of the fire (room 8)
**The idea: its guard reforges faster than you can chip it down.**

- 700 HP. **150 poise — deliberately shallow**, because the boss is not the size of the
  pool, it is the rate it refills. It regains **2.2 poise a frame**, 3.4 in phase two,
  against an ordinary enemy's 0.3.
- Poise damage therefore has to arrive in a lump: a charged heavy, an ọfọ, the third
  stroke of the chain. Tapping at it does nothing at all, and that is the lesson.
- `hammerWind` (white) → a heavy overhead that can be turned. `pourWind` (**gold**) → it
  tips the crucible and molten metal runs down the arena; nothing turns that aside.
  `sparkWind` (white) → it strikes its own anvil and the floor answers in waves.
- Phase 2 at 50%: 22% faster, and the anvil throws three waves each side instead of two.
  It *adds*, per the contract.
- **It never lies.** After a boss who could not be fought and a boss who was paid, this
  one tells the plain truth from its first line to its last: this is where things stop
  being changeable, and it would like to finish you. It means something slightly
  different by that than you do.
- Gates the way to the open sky.

### Boss 3 — Onwe (room 7)
**The idea: it fights with your moveset.**

This is the design commitment. Onwe should use the player's chain timings, the player's
roll, the player's ward. When the player parries Onwe, Onwe should be *parrying back*.
It is the player's own competence turned around, and the fight should feel like
sparring with a mirror that has been practising longer.

### Tutorial mini-boss — the chalk masquerade (room 0)
Not really a boss; a teacher. Drills the player through eleven mechanics with slow white
tells, then goes live at full health with gold tells for the final step. Drops 140
cowries. See `05-PROGRESSION-AND-NPCS.md` §Tutorial.

### Bosses not yet built — **[NOT BUILT]**
| Where | Who | Idea |
|---|---|---|
| Room 9, the open sky | ~~an alusi of the air~~ **[BUILT]** — Ikuku | The game's only fight in the vertical |
| Room 5, the water | Idemili's python | Optional. Non-lethal — it tests you and lets you pass |
| Room 4, the market | **do not** | The market must stay safe |
| Room 8, the fire | ~~A forge-thing~~ **[BUILT]** — Ụzụ Ọkụ | Poise regenerates at 2.2/frame (3.4 in phase two) against a walker's 0.3 |

A realistic ceiling for this codebase is **8–10 bosses**. See `01-VISION.md`
§1.10 for why forty is a different game.

## 4.8 Damage philosophy

- **Player HP: 100 base, +30 per heart shard, max 190.**
- **A basic enemy hits for 10–12.** Roughly 9–16 mistakes kill you at full health. That
  is the correct ratio: forgiving enough to learn, tight enough to matter.
- **Bosses hit for 18–24.** Five to ten mistakes.
- **Never one-shot the player.** Ever. The largest single hit in the game is 22.
- **One swing, one hit.** Enforced by `P.swingId` / `e.hitId`. Without this, damage
  silently multiplies by the number of active frames — this was a real bug and the
  guard must never be removed.
