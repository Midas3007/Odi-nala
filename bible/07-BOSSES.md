# 07 — Boss Design Bible

## 7.1 The doctrine

**A boss is an argument, not an encounter.** Each one states a position about the
theme (refusal), and defeating it is disagreeing with it successfully.

Practical consequence: **ten bosses, not forty.** Four exist. Six remain. If a
proposed boss's thesis cannot be written in one sentence, it is an elite enemy,
and elite enemies are fine — they just are not this.

Every boss must have:
1. **A thesis** — one sentence, thematic
2. **A mechanical hook** — one system nothing else in the game has
3. **Three to five attacks**, at least one white and one gold
4. **Two phases minimum**, with a visible transformation
5. **A parry-able window** — no boss may be unpunishable
6. **A death that changes the world** — a gate opens, a tool is granted

## 7.2 The four that exist

### The Chalk Masquerade — *Mmanwụ Nzu* (tutorial boss)
**Thesis:** "You are supposed to stay in the hole."
**Hook:** it is a *teacher*. It runs the eleven-step Teaching, waits for the
player to perform each verb, says "good." between steps, and then, on the final
step, **goes live** — full health, gold telegraphs, no more mercy.
**Why it works:** the tutorial is not a separate mode. The thing teaching you is
the thing that then tries to kill you, which is the most honest tutorial design
available.
Reward: 140 cowries. Death: comes apart into chalk dust.

### Ogbunabali — *he who kills at night*
**Thesis:** "Nothing happened. You are remembering wrong."
**Hook — the naming.** HP 520. While **unbound**, incoming damage is multiplied
by **0.10** and he regenerates **0.30 HP/frame** — mathematically unkillable, and
the player is meant to discover this by failing. Reading the nzu in the shaft
gives the name; pressing **N** binds him for **420 frames**. Parries extend the
bind by 140; executions by 260. When the bind lapses he re-seals and the
regeneration resumes.
**Attacks:** slash chain (white, 2 hits, 3 in phase 2) · leap smash with ground
shockwaves (gold) · vanish-and-strike (gold) · ember fan (white, phase 2 only).
**Phase 2 at 50%:** all timings × 0.72, third slash added.
**Dialogue:** he lies throughout — "I did not take her," "you were never buried,"
"your mother sent me." The lies are the tell that a name exists.
Reward: **Ala's Fall**.

### Ekwensu — *the one who was paid*
**Thesis:** "Something happened, I was paid for it, and I would do it again."
**Hook — honesty.** No naming, no trick, no gimmick. The largest body in the
game, the widest attacks, and a fight that is purely about the white/gold read
executed under pressure. It is the game's skill check, deliberately placed after
a boss that was a knowledge check.
Gate: its death opens the bone road's second exit (`needs:'ekwensu'`).

### Onwe — *self*
**Thesis:** "You could have stayed. It would have been easier for everyone."
**Hook — the mirror.** It has your silhouette, your height, your posture and your
moveset. **Design rule for any rework: Onwe must reflect the player's current
build** — same weapon class, same spell tier. The horror is not fighting a hero,
it is fighting *you specifically*.
Death: triggers the ending sequence and the stats card.

## 7.3 The six remaining

| # | Working name | Thesis | Hook | Where |
|---|---|---|---|---|
| 5 | **The Dibia** | "I did the right thing and it cost you everything." | Does not fight. Summons. Killing the summons is how you reach him — and each one is a person he saved. | Optional, deep in the shaft |
| 6 | **Nne Mmiri** (water) | "I keep what is given to me." | Fights in water; the arena floods and drains, changing which platforms exist | Iyi Idemili, optional |
| 7 | **The Market Debt** | "You have been trading and not paying." | Its health is your **cowries**. Fighting it spends your money. | Ahịa Mmụọ, optional |
| 8 | **The Ninth** | "There were nine before you." | Nine small bodies; only the ninth is real, and it changes which one each phase | Ala Mmụọ |
| 9 | **Ọkụ Nna** (the fire-father) | "Nothing here is allowed to be finished." | Revives every enemy you killed in the room, once | Ọkụ Mmụọ |
| 10 | **Igwe** (the sky itself) | "You are very small." | Arena is a cliff edge; the boss is off-screen and attacks the *platform* | Igwe, super-boss |

**The Market Debt** is the strongest of these and should be built first — a boss
whose health bar is your wallet is the kind of idea this game exists to have.

## 7.4 Phase design rules

1. **Two phases minimum, four maximum.**
2. **A phase change is always visible and audible** — screen flash, shake, a
   sound, and a change in silhouette or colour. Never a silent stat change.
3. **A new phase adds at most one new attack** and re-times existing ones. A phase
   that replaces the whole moveset throws away what the player just learned.
4. **Phase timings scale by 0.7–0.75**, never faster. Below that, tells drop under
   the 14-frame floor.
5. **Every phase must contain at least one white tell.** A phase with no parry
   removes the player's best tool at the moment they need it most.
6. **No boss heals on phase change.** Ogbunabali's regeneration is a *mechanic
   the player defeats*, not a wall.

## 7.5 Arena rules

- Flat and wide. The boss fight is the content; geometry must not compete.
- No hazards unless the hazard *is* the hook (Ọkụ Nna, Nne Mmiri).
- One charm within 60 seconds of the door.
- A 3–5 second empty corridor before entry.
- The door locks behind the player and unlocks on death — theirs or the boss's.
- The boss health bar sits at the bottom centre, with the name label. Ogbunabali's
  label reads `???` until named — **this is the single best UI beat in the game.**

## 7.6 Boss authoring checklist

- [ ] Thesis written in one sentence
- [ ] Hook is a system nothing else has
- [ ] 3–5 attacks, ≥1 white and ≥1 gold
- [ ] Every wind-up ≥ 14 frames, ≥ 20 preferred
- [ ] Phase 2 threshold, transformation, and one added attack
- [ ] Punish window ≥ 30 frames after its biggest attack
- [ ] Health bar with name; `???` if the name is content
- [ ] Intro cutscene (2 beats max) and outro cutscene (3 beats max)
- [ ] Death grants a tool, opens a gate, or ends the game
- [ ] Bestiary entry, lore entry, and `G.slain` flag
- [ ] Music switches to `boss` on entry and back on death
- [ ] Tests: spawns, phase transition fires, is killable, gate opens on death
- [ ] Beatable by all four weapons — verified, not assumed
