# 05 — Combat Design Bible

## 5.1 The thesis

Combat in Ọdịnala is a **conversation of commitments**. Both sides announce what
they are about to do, both sides are locked into it once started, and the winner
is whoever read the other correctly. It is not about reflexes and it is not about
resource management. It is about *knowing*.

## 5.2 The defensive binary — the single most important rule in the game

Every hostile action in Ọdịnala is one of exactly two things, announced by an
outline colour drawn around the attacker:

| Tell | Colour | Meaning | Correct answer |
|---|---|---|---|
| **White** | Bone-white, single outline, pulsing at period 4 | Parryable | **Ward** (C) within 9 frames |
| **Gold** | Gold, *double* outline, pulsing at period 3 | Unblockable | **Roll** (X), i-frames 4–15 |

**This binary is absolute.** There is no third category, no "parryable but only
from behind," no attack that changes colour mid-wind-up. If a new attack cannot
be honestly classified as one of these two, it does not get made.

**Why gold exists:** without it, the parry dominates and the roll becomes
vestigial. Gold attacks are what force the player to keep two answers loaded and
choose between them under pressure. Target ratio across the game: **roughly 70%
white, 30% gold.**

**Wind-up floor: 14 frames.** No tell may be shorter. Below that the player is
reacting to noise, not reading.

## 5.3 Player frame data (current, shipped)

### Movement
| Property | Value |
|---|---|
| Ground accel / air accel | 0.55 / 0.34 px·f⁻² |
| Max run speed | 1.75 px/f (1.05 while charging) |
| Gravity / terminal | 0.46 / 9 px/f |
| Jump velocity | −7.4 (variable height: +0.42/f while rising if released) |
| Coyote time | 7 frames |
| Jump buffer | 8 frames |
| Max unaided jump | ~3.7 tiles up, ~3.5 across |

### Defence
| Action | Frames | Notes |
|---|---|---|
| **Roll** | 22 total, **i-frames 4–15**, 16f cooldown | Speed decays across the roll. The only cancel out of attack recovery. |
| **Ward — parry window** | **t ≤ 9** | Must be facing the incoming attack |
| **Ward — block** | t > 9, while C held, ends 14f after release, hard cap 110f | 30% damage taken, pushback, no stun |
| **Heal (V)** | 44 total, heals at frame **26** | Interrupted = charge lost |

### Offence — the light chain (machete)
| Hit | Wind | Active | Recovery | Damage | Poise | Reach | Knockback |
|---|---|---|---|---|---|---|---|
| 1 | 5 | 5 | 12 | 9 | 10 | 22 | 1.6 |
| 2 | 5 | 5 | 13 | 10 | 12 | 22 | 1.8 |
| 3 | 9 | 7 | 20 | 18 | 24 | 28 | 3.4 |

Combo window after the chain: 26 frames. Swift Hand skill multiplies recovery by
0.75.

### Offence — other
| Action | Wind | Active | Rec | Dmg | Poise | Notes |
|---|---|---|---|---|---|---|
| **Charged heavy** | 14 | 8 | 26 | 34 | 56 | Charges by holding Z through recovery; ready at 26f (`CHARGE_AT`); breaks warden guards |
| **Air cut** | 4 | 6 | 10 | 9 | 10 | |
| **Down thrust** (↓+Z airborne) | — | continuous | — | 12 | 16 | Pogo bounce on hit; breaks cracked tiles once Ala's Fall is held |
| **Execution** | — | strikes at 15 | 34 | lethal (130 vs boss) | — | Requires target `broken > 0` within 24px |

### Damage-hit rule
**One swing lands once.** `P.swingId` increments per attack; every entity carries
`hitId`. Without this, damage multiplies by the number of active frames. This is
a permanent invariant, not an implementation detail.

## 5.4 Poise, breaking, and execution

Every enemy has `poise` / `poiseMax`. Damage reduces poise; a successful parry
removes 58 at once. At zero:

- The enemy enters `broken` (170f for bosses, 220f otherwise)
- It glows gold with a **Z** prompt above it
- Standing within 24px and pressing Z triggers an **execution**: 16 frames of
  hitstop, 26 frames of slow motion, a lethal strike, +25 ọfọ, +8 HP, and blood
  that stays on the floor

Poise regenerates at 0.3/frame after 150 frames without being hit.

**Executions are the game's reward loop.** They are why aggression is correct.
Any change that makes executions rarer must add something else that makes
pressure worth applying.

## 5.5 Feel — the numbers behind "weight"

| Event | Hitstop | Shake | Slow-mo |
|---|---|---|---|
| Light hit connects | 6 | 2.6 | — |
| Third-hit / big light | 9 | 4.5 | — |
| Heavy connects | 14 | 7 | — |
| Muffled hit (unnamed boss) | 3 | 1.4 | — |
| Parry | 13 | 6 | 14 |
| Guard break | 11 | 5.5 | — |
| Execution start / strike | 16 / 14 | 5 / 8 | 26 / 14 |
| Player hurt | 8 | 5 | — |
| Boss death | 26 | 10 | — |

**Rules:**
- Only one shake source may be dominant; `shake()` takes the max, never sums.
- **Input survives hitstop.** `pressed` flags are only cleared on frames where
  `update()` actually ran. This is why heavy hits feel responsive. Never
  "optimise" it away.
- Muffled hits are deliberately *worse-feeling*: 3 frames of stop and a dull
  low-passed thud. The player should feel their weapon failing.

## 5.6 Weapons

Four, each with its own light chain, heavy, air attack, ọfọ multiplier and
optional burn. Nothing reads a global `ATK` table — everything goes through
`WA()` (equipped weapon) and `CHAIN()` (its combo). **Chain length varies; never
assume 3.**

| Weapon | Chain | Reach (1st) | Dmg (1st) | ọfọ × | Special | Source |
|---|---|---|---|---|---|---|
| **Mma** — machete | 3 | 22 | 9 | 1.0 | — | Start |
| **Nkwụ** — twin knives | **4** | 17 | 6 | **2.1** | Fast, low commitment | Ledger, 190 |
| **Ogu** — war staff | 3 | **34** | 13 | 0.8 | Long, slow, high poise | Ledger, 260 |
| **Mkpịsị Ọkụ** — firebrand | 3 | 26 | 11 | 1.1 | **Burn**: 110f DoT, 3 dmg/12f | Found in Ọkụ Mmụọ |

**Weapon design rules for future additions:**
1. A weapon changes *when you can act*, not just how much you do.
2. Every weapon must be viable against every boss. No key-weapon design.
3. Total damage-per-second across weapons must land within ±15% of each other.
   Differentiate on reach, commitment, ọfọ economy and status — never on raw DPS.
4. Maximum six weapons, ever. Beyond that the player stops learning any of them.

## 5.7 Spells — the four ọfọ

**ọfọ** is the resource: 0–100, gained from clean hits (3 × weapon multiplier),
parries (18), executions (25) and kills (6). It does not regenerate passively.
**This makes aggression the only route to magic**, which is the point.

| Spell | Cost | L1 | L2 | L3 | Role |
|---|---|---|---|---|---|
| **Nkwenye Amadioha** — nine bolts | 100 | 45 dmg / 70 poise | 68 / 100 | 96 / 150 | Panic clear |
| **Njide Ala** — the ground takes hold | 60 | 100f root | 170f | 250f | Control |
| **Ọjii Idemili** — the veil | 70 | 35 shield | 60 | 95 | Defence |
| **Aka Ikenga** — the hand | 80 | ×1.6 for 330f | ×1.9/420f | ×2.4/540f | Offence |

Upgrade costs: 70 / 170 / 340 cowries.

**Spell design rules:**
1. Four is the number. A fifth requires removing one.
2. No spell may deal more than 30% of a boss's health in one cast at max level.
3. Every spell must have a defensive *and* an offensive use case, or it will be
   ignored — Ala's root is control, but it is also an escape.
4. Casting is committed: 42 frames, no i-frames. Magic is a decision, not a
   button.

## 5.8 Skills

Bought once at the ledger, permanent.

| Skill | Cost | Effect |
|---|---|---|
| Riposte | 210 | Parries deal 20 damage and 18 poise on their own |
| Swift Hand | 230 | All attack recovery × 0.75 |
| Cowrie Charm | 160 | Drops × 1.5 |
| Gourds (to 5) | 110 each | +1 heal charge |
| Deepen the vessel (×3) | 130/260/390 | +30 max HP |

**Rule:** a skill may make an existing verb better. It may never add a new verb.
New verbs come from bosses.

## 5.9 The combat authoring checklist

For any new attack, on any entity:

- [ ] Wind-up ≥ 14 frames
- [ ] Tell is unambiguously white or gold, set on `e.tell` for the whole wind-up
- [ ] Tell clears the frame the active window opens
- [ ] Active window ≤ 12 frames
- [ ] Recovery ≥ active window (attacker is punishable)
- [ ] Hitbox is drawn from the attacker's facing, never player-seeking
- [ ] Damage is in the 10–26 band for regular enemies, 18–26 for bosses
- [ ] Parryable attacks call `tryParry()` before `hurtPlayer()`
- [ ] Unblockable attacks pass `true` as the third argument to `hurtPlayer()`
- [ ] The attack is survivable from full health at least four times over
- [ ] A test asserts the tell colour and that the unblockable ignores the ward
