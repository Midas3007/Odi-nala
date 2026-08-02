# 06 — Enemy Design Bible

## 6.1 The doctrine

**Every enemy teaches exactly one thing.** If you cannot state an enemy's lesson
in one sentence, it is not designed, it is decorated.

This is why the target is **22 species, not 200**. Variety the player *feels*
comes from **variants** — same AI, different palette, stat scale and biome
dressing — which cost almost nothing and preserve readability.

Nine species exist. Thirteen slots remain.

## 6.2 The nine, as shipped

### 1. Walker — *Onye Ọfịa*
**Lesson:** white means turn it.
HP 46 · poise 40 · dmg 12 · **white**
Patrols, closes to 36px, winds 28f, swings, and **50% of the time swings again**
after a 15f re-wind. The second swing is the whole point: it punishes players who
parry once and relax.

### 2. Lunger
**Lesson:** gold means move.
HP 34 · poise 26 · dmg 16 · **gold**
Crouches 26f with a doubled gold outline, then dashes at 3.4 px/f. The game's
first unblockable and therefore the first time the roll is mandatory.

### 3. Thrower
**Lesson:** a parry is not only for melee.
HP 28 · poise 22 · shot dmg 10 · **white** (the shot)
Stationary, fires every 110f. **A warded shot reverses and damages whatever it
hits**, including the thrower. This is the game's best small delight and it
should never be removed.

### 4. Warden — *Ndị Nche*
**Lesson:** some guards must be broken, not out-damaged.
HP 78 · poise 74 · dmg 20 · **white** (overhead)
Frontal light attacks do **15%** damage. Answers: parry the overhead, hit from
behind, or land a charged heavy — which ignores the shield entirely. The first
enemy that requires the player to *choose a tool*.

### 5. Roller
**Lesson:** spacing, not timing.
HP 40 · poise 30 · **gold**
Curls and rolls along the ground. Cannot be parried; must be jumped or out-paced.

### 6. Horned
**Lesson:** commitment cuts both ways.
HP 110 · poise 86 · **gold**
Lowers the horns and charges. Huge recovery on a miss — the punish window is the
lesson. Ikenga's horned silhouette is the visual root.

### 7. Ember — *Ọkụ Nwa*
**Lesson:** the threat can be above you.
HP 30 · poise 20 · dmg 15 · **gold**
Hovers ~44px above the player's head, gathers for 26f, then falls at 4.2 px/f.
The only enemy that attacks on the vertical axis. Emits sparks constantly so it
is legible even at the edge of the screen.

### 8. Crawler — *Nkakwu Mmụọ*
**Lesson:** do not walk away early.
HP 34 · poise 26 · dmg 10 · **white** ×2
Runs at 1.9 px/f, bites, re-winds 11f, bites again. The second bite catches
players who parried the first and immediately moved.

### 9. Effigy — *Arụsị Nche*
**Lesson:** some things must simply be destroyed.
HP 66 · **poise 96** (the highest of any non-boss) · **white**
Rooted. Wakes at 210px, fires a three-shot aimed volley. Cannot be avoided by
leaving — it will keep firing. Its high poise means breaking it is a genuine
commitment.

## 6.3 The thirteen remaining slots

Specified so a future contributor does not invent a tenth walker.

| # | Working name | Lesson | Tell | Biome |
|---|---|---|---|---|
| 10 | **Mourner** | Attacks only when you attack | white | Ala Mmụọ |
| 11 | **Chalk-eater** | Destroys lore stones if not killed fast | none (flees) | Any |
| 12 | **Drummer** | Buffs nearby enemies; kill it first | white | Market |
| 13 | **Weaver** | Creates a hazard the arena keeps | gold | Bone road |
| 14 | **Diver** | Attacks from below, out of water | gold | Water |
| 15 | **Twin** | Two bodies, one health pool | white | Spirit |
| 16 | **Tally** | Grows stronger each time it kills you | white | Any |
| 17 | **Bellows** | Reignites dead embers | none | Fire |
| 18 | **Palm-wine ghost** | Harmless unless struck; drops big | none | Market |
| 19 | **Stilt-walker** | Out-ranges every weapon but the staff | white | Bone road |
| 20 | **Cold one** | Slows the player's recovery on hit | gold | Sky |
| 21 | **Nine** | Nine tiny bodies; the ninth is real | white | Spirit |
| 22 | **Root** | Only vulnerable while it is attacking | gold | Forest |

Design intent: each occupies a mechanical space nothing else does. Numbers 16 and
21 are thematic payloads (the tally of deaths; the ninth of nine) and should be
authored late, when the player knows the game well enough to feel them.

## 6.4 Variants — how to get breadth cheaply

A **variant** shares AI wholesale and changes only:
- Palette (three colours)
- Silhouette details (mask shape, horn presence, raffia length)
- HP / poise / damage scale, ±40%
- Biome-specific death particles

**Rules:**
1. A variant **never** changes its tell colour from the parent. A player who
   learns "this shape is white" must never be punished for it.
2. Maximum 3 variants per parent species.
3. A variant is never introduced in the same room as its parent.
4. Variants get **one shared bestiary entry** with a line about the regional
   difference. They are not separate creatures.

With 22 parents × up to 3 variants, the player can encounter ~60 visually
distinct hostiles while the codebase carries 22 behaviours. That is the honest
answer to "200 enemy types."

## 6.5 The enemy authoring checklist

- [ ] Its lesson is stated in one sentence, in the bestiary entry's tone
- [ ] `mkThing()` builder with HP, poise, size
- [ ] Branch in `enemyUpdate` with an explicit state machine (`idle → wind → act → rec`)
- [ ] `e.tell` set for the entire wind-up, cleared on the active frame
- [ ] Branch in `drawEnemy`, including the broken-gold aura and poise bar
- [ ] Spawn character added to `spawnRoom` and to the `drawTiles` skip list
- [ ] Bestiary entry in `BEASTS` (30–60 words, §03.7)
- [ ] Placed first in a room where the player can watch it alone
- [ ] Never placed with a second gold-tell enemy
- [ ] Test asserting it spawns in its room and that a 400-frame soak runs clean
- [ ] `node test.js` → 0 failures
