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

**[NOT BUILT]** Weapon-specific heavy attacks. Currently each weapon has its own heavy
*numbers* but the same *shape*. Giving Ogu a sweeping heavy and Nkwụ a rapid flurry
would be the highest-value combat addition available.

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

### The ten

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

### Enemy roster gaps — **[NOT BUILT]**
Ranked by what the roster is missing mechanically:

1. ~~**A healer / buffer.**~~ **[BUILT]** `n`, Onye Mmezi. Stands off, picks the nearest
   ally that is missing poise or already broken, and channels for 72 frames; on
   completion it returns 55% of that ally's poise and shuts a broken guard early. A gold
   thread names the target the whole time it is working, so the decision is always
   legible. Staggering it cancels the channel outright — that is the counterplay, and it
   is why it is frail (30 HP against the warden's 78). It retreats from the player and
   only swings, white-telegraphed, when cornered.
2. **A grappler.** Something that grabs and must be broken out of. Adds a real fear.
3. **A shield-and-spear pair that fights as a unit.**
4. **A mimic prop** — a skull or idol that is an enemy. The prop vocabulary already
   supports this and it would be cheap.
5. **A swimmer** for Iyi Idemili — the water room has no unique enemy, which is a gap.
6. **A wall-crawler** that changes the vertical read.

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
| Room 9, the open sky | **[PROPOSED]** an alusi of the air | A fight with real verticality — the game has none |
| Room 5, the water | Idemili's python | Optional. Non-lethal — it tests you and lets you pass |
| Room 4, the market | **do not** | The market must stay safe |
| Room 8, the fire | A forge-thing that reforges its own guard | Poise that regenerates fast, forcing burst |

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
