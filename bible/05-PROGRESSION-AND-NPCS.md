# 05 — Progression, Economy, NPCs and Quests

## 5.1 The progression thesis

The player gets stronger in four currencies, and only one of them is numbers.

1. **Knowledge** — a name, a riddle answer, a boss's pattern. Never lost, never bought.
2. **Access** — Ala's Fall opens cracked floors; mirrors open the map.
3. **Numbers** — heart shards, gourds, spell levels, skills. Bought with cowries.
4. **Options** — weapons and spells. Bought or found.

**Knowledge outranks the other three.** The name is worth more than any upgrade in the
game and it costs nothing but attention. This ordering is the game's argument.

## 5.2 The cowrie economy

Cowries (`P.cowries`) drop from every kill as physical pickups that arc out and
magnetise to the player within 44px.

| Source | Yield |
|---|---|
| Thrower | 12 |
| Walker / crawler / lunger / ember | 15 |
| Warden / effigy | 26 |
| Boss | 260 |
| Cowrie Charm skill | ×1.5 on everything |
| Parry | +4 (small, but it rewards defence) |

**Death drops your cowries as a shade** in the room where you fell. Walk back and take
them. This is the Souls loop and it is correct: it makes the walk back meaningful
without punishing you twice.

### Ala's Ledger — the shop (E at any rest charm)

| Item | Cost |
|---|---|
| Learn a spell | 70 |
| Spell level 2 | 170 |
| Spell level 3 | 340 |
| Nkwụ (twin knives) | 190 |
| Ogu (war staff) | 260 |
| Another gourd (max 5) | 110 × (current − 2) |
| Deepen the vessel (+30 HP, max 3) | 130 × (owned + 1) |
| Riposte — parries strike back for 20 | 210 |
| Swift Hand — 25% faster recovery | 230 |
| Cowrie Charm — +50% drops | 160 |

**Total cost of everything: roughly 3,400 cowries.** A complete playthrough should yield
enough for perhaps 60–70% of that. **You should not be able to buy everything in one
run.** That is what makes the choices choices.

### Economy rules
- **Never sell healing.** Gourd *capacity* is buyable; gourd refills are free at charms.
  A game where you can buy your way out of a hard fight has no hard fights.
- **Never sell the name.** Knowledge is not for sale.
- **Prices are round and legible.** No 187-cowrie items.
- **Nothing is missable.** Every purchasable remains purchasable forever.

## 5.3 The mirrors and the riddles

Eight mirrors: rooms 0, 2, 4, 5, 6, 7, 8, 9. The Forge and the Open Sky were added in
Phase 1 — the back half of the game had no fast travel, and room 9 had an `M` tile with
no table entry, which was the freeze.

**Every `M` tile must have a `MIRRORS` entry and every entry must have an `M` tile.**
`tools/audit.py` fails on either. A mirror with no entry no longer throws — `mirrorInfo()`
falls back to the room's own name and warns once on the console — but the fallback is a
net, not a licence: fix the table.

An unattuned mirror asks a **gwam gwam gwam** — a real Igbo riddle — presented in Igbo
with an English gloss below and three answers.

- **Correct** → the mirror attunes permanently and joins the travel network. Saved.
- **Wrong** → the glass goes black. `G.mirrorLock[room] = true`. You must **leave the
  room entirely and come back** before it will ask again, and it asks a *different*
  riddle (`G.riddleIdx` advances every attempt, cycling through ten).

This punishment is exactly right: it costs a walk, not a run. Never make it harsher.

The ten riddles are real traditional forms. If you add more, they must be real. Do not
invent riddles and present them as traditional.

## 5.4 The tutorial — "The Teaching"

After the opening cutscene, a masquerade of chalk stands up in the clearing and drills
the player through eleven steps. Each step waits on the player *actually performing the
action* — not on a timer, not on a button prompt dismissal.

Walk → jump → cut → three-hit chain → charged heavy → roll → ward a white tell → break
its guard → execute it → drink nzu → cast your first ọfọ.

Design rules that made it work and must be preserved:
- **A key badge shows the exact button.** The touch buttons carry the same letters, so
  "press Z" is legible on a phone.
- **A pip bar shows progress.** Eleven pips. The player can see the end.
- **It says "good." between steps.** One word. That is the entire reward and it is
  enough.
- **The teacher does not hit back at first.** It watches. Then it drills — slow,
  white-outlined swings that exist to be parried. Then, on the final step, it **goes
  live**: full health, gold tells, no mercy.
- **It is skippable** from the pause menu. Always.

**This is the model for teaching anything in this game.** Never a modal. Never a wall of
text. A thing that stands up and shows you.

## 5.5 NPCs — the gap and the plan

**There are currently zero NPCs.** Every entity in the game is hostile or scenery. This
is the largest single content gap.

### Why it matters
Blasphemous and Hollow Knight both use NPCs as *tonal punctuation* — the player spends
twenty minutes being attacked and then meets someone who is simply sad. Ọdịnala has no
such punctuation, and the game is more monotone than it should be.

### The four — **[NOT BUILT, PROPOSED]**

**1. The dibia who buried your charm** — Ahịa Mmụọ, the night market.
Dead now, still working. Sits behind a mat of chalk and cowries. **He does not recognise
you**, because the last time he saw you, you were three days old and dying.

He is the game's exposition character and its only warmth. He explains what an iyi-uwa
is, what you did, and why it was a bad idea, without ever knowing he is talking to the
child he saved. If you return after killing Ogbunabali, he says the name aloud and
flinches.

*Function:* lore delivery, codex unlocks. **[PROPOSED]** he could also be the only NPC
who sells, moving the ledger out of the abstract.

**2. The market woman selling nothing** — Ahịa Mmụọ.
One line per visit, cycling. Over the course of the game she describes a woman who used
to come to this market — what she bought, how she laughed, what she was carrying the
last time. **She is describing your mother and she does not know it, and neither, for a
while, does the player.**

*Function:* the game's only slow-burn emotional thread. Costs almost nothing to build.

**3. The younger ọgbanje** — Iyi Idemili.
Still in the cycle. Has died four times. Sits in the water. Asks you what is on the
other side of not going back. **You have no dialogue options and cannot answer.** The
conversation just ends.

*Function:* makes the player's choice visible by showing the road not taken.

**4. Your mother's shade** — Ala Mmụọ, in the corridor before Onwe.
She does not know you. She is not waiting for you. She is doing something ordinary.
Brief — under thirty seconds — and completely unsentimental. If the player tries to
interact more than twice, nothing further happens.

*Function:* the emotional peak. It must be underplayed or it becomes cheap.

### NPC implementation rules
- NPCs are **shrine-like objects**, not entities. They do not move, take damage, or path.
- Interaction is **`E`**, consistent with the ledger.
- Dialogue uses the **cutscene system** (`playCut`) with the speaker's voice profile —
  no new UI needed.
- **No dialogue trees. No choices. No barks.** One conversation per state, advancing as
  the world state advances.
- Every NPC needs a **voice profile** in `VOICE` (see `07-AUDIO.md`).

## 5.6 Quest design

**There are no quests and there probably should not be many.** This game is 90 minutes
long and structured as a descent. A quest log would be a lie about its scale.

What can exist instead — **[PROPOSED]**:

**Standing requests, not quests.** The dibia mentions he lost his chalk in the shaft.
There is chalk in the shaft. Bring it back and he tells you something. No log, no
marker, no completion sound. The player either notices or doesn't.

Three such threads, maximum:
1. The dibia's chalk — rewards lore.
2. The market woman's story — rewards nothing but itself, and unlocks the final codex
   entry.
3. **[PROPOSED]** Nine graves. Somewhere in the world, nine small mounds. Standing at
   each one adds a line to a codex entry. The ninth is your own. No reward.

### Rules
- **No quest markers. No quest log. No "objective complete."**
- **No fetch quests where the item is arbitrary.** The chalk is chalk because chalk
  means something in this game.
- **Rewards are lore or access, never stats.** Stats come from the ledger.

## 5.7 Progression pacing — the intended playthrough

| Beat | Time | Player has |
|---|---|---|
| Opening + Teaching | 0–8 min | Machete, one spell, 140 cowries |
| Forest and shaft | 8–20 min | The name. ~300 cowries. First ledger visit. |
| Ogbunabali | 20–30 min | Ala's Fall. Understands the game's central idea. |
| Market and water | 30–45 min | A second weapon, a heart shard, mirrors, breathing room |
| Bone road, Ekwensu | 45–60 min | Third weapon, most of a spell tree |
| Fire and sky | 60–75 min | The firebrand. Peak power. |
| Ala Mmụọ, Onwe, ending | 75–90 min | Everything they chose |

**Target: 90 minutes for a first completion, 25–30 for a speedrun.** If a change pushes
the first completion past two hours, the change is probably wrong.
