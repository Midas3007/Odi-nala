# 01 — Creative Vision

## 1.1 The core theme

**Refusal.**

Not identity, not destiny, not sacrifice — those are the surface. The engine
underneath every system in this game is a child who was given a role by the
cosmos and said no.

The ọgbanje is, in Igbo belief, a child who is meant to come and go. The cycle is
not evil. It is *how things are*, the way weather is how things are. Ọdịnala's
protagonist breaks it — not to save the world, not because they were chosen, but
because someone they loved was taken and the cycle had nothing to say about it.

Everything downstream follows from this:

- You cannot die properly. Death is a fail state that the *story* refuses to
  honour. You wake at your charm and the world remembers you died.
- Neither can the enemies. Ogbunabali regenerates because he is not supposed to
  be killable. He becomes killable only when you name him — when you refuse his
  version of events.
- The final boss is **Onwe** — yourself — because the last thing standing between
  you and the door out is the version of you that would have gone quietly.
- The ending is a choice about whether to step back into the cycle.

**The theme test:** if a proposed feature has nothing to do with refusing an
assigned role, it is probably decoration. That is not automatically a no, but it
has to justify itself some other way.

## 1.2 The emotion the player should feel most often

**Grim competence.**

Not fear. Not wonder. Not power fantasy. The feeling of a person who is
frightened, outmatched, and doing it correctly anyway.

Concretely, the most common minute-to-minute emotion should be: *"I know what
that wind-up means and I know what to do about it, and if I do it wrong that is
my fault."*

Secondary emotions, in the order we want them:

1. **Recognition** — "I have seen this tell before." The white/gold system exists
   to manufacture this.
2. **Unease** — the sense that the world is older than you and does not care.
   Carried by lighting, audio, and the way NPC-less rooms are still clearly
   *inhabited*.
3. **Grief, briefly and rarely.** Reserved for the mother, the shades, and the
   ending. Overused, it goes numb.
4. **Small, earned triumph.** An execution. A parried gold-adjacent chain. Not a
   fanfare — a moment of quiet.

**What we never want the player to feel:** confusion about what killed them,
boredom during a boss's recovery frames, or that a death was the game's fault.

## 1.3 Tone

**Dark, but not nihilistic. Grave, but not humourless. Mysterious, never coy.**

The register is *funeral*, not *horror*. Nothing jumps out. The dread is that the
world has rules older than you and they are being applied.

The prose voice is plain and declarative, with the rhythm of oral storytelling.
Short sentences. Concrete nouns. The occasional line that lands like a proverb
because Igbo storytelling actually works that way.

**Yes:**
> "Nine times your mother carried you to term. Nine times she buried you before
> the yam came up."

**No:**
> "The ancient darkness stirs, and destiny calls upon the chosen one."

The game is allowed exactly one register of dry humour, and only from the world,
never from the protagonist: the boss who lies badly, the market ghosts who
haggle, the idol that "cannot follow you, which it does not appear to consider a
problem." The protagonist never quips.

## 1.4 What makes Ọdịnala different from every other Metroidvania

Four things. Everything else is craft that others also have.

**1. Bosses lie to you, and the lie is the mechanic.**
Ogbunabali cannot be killed while he is unnamed. He regenerates faster than you
can damage him, and he talks the whole time — "I did not take her," "you were
never buried." The lies are not flavour. Somewhere else in the world, chalk on a
stone gives you his true name, and speaking it is what makes him mortal. **No
other game in the genre makes *contradicting a boss's account of events* the
damage mechanic.** Protect this. It is the single most defensible idea here.

**2. The world is Igbo, specifically and correctly.**
Not "African-inspired." Not a fantasy continent with kalimba music. Real deities
with their real domains — Ala the earth who owns the dead, Amadioha the lightning
of justice, Idemili the water, Ikenga the right hand and personal achievement.
Real practices — nzu chalk, iyi-uwa, the dibia, cowries, ogene and udu and ekwe,
gwam gwam gwam riddles. The masquerade is a masquerade, not a generic
skull-faced knight.

**3. Riddles as the fast-travel key.**
Mirrors do not just unlock. They ask you an actual Igbo riddle — *ụlọ nne m
enweghị ọnụ ụzọ*, my mother's house has no door — and a wrong answer shuts the
glass until you leave the room and come back. Travel is earned with knowledge,
not currency.

**4. It is a single HTML file that runs on a cheap Android phone.**
This is a design constraint that has become an identity. No engine, no build, no
install. You can send the whole game to someone as one file and they can play it.
That is worth protecting even when it is inconvenient.

## 1.5 The five design pillars

Every feature is judged against these. In order of precedence when they conflict.

### Pillar 1 — Commitment
Every action roots you. The three-hit chain, the charged heavy, the roll, the
ward, the heal, the cast. Once you start, you are in it. The single exception is
the roll-cancel out of attack recovery, and it is the only one on purpose,
because a game with no outs is not tense, it is unfair.

*What this forbids:* cancel-everything combat, dodge-cancelling into dodge,
free-form air juggling.

### Pillar 2 — The read is the skill
White outline: parryable, turn it. Gold outline: unblockable, get out of the way.
This binary is the game's entire defensive vocabulary and it is taught in the
first two minutes. Every enemy, every boss, every projectile obeys it without
exception.

*What this forbids:* attacks with ambiguous tells, tells shorter than 14 frames,
"gotcha" attacks with no wind-up, random attack selection with no readable
pattern.

### Pillar 3 — Weight
Hitstop scales with damage. The screen shakes. Blood stays on the floor. A heavy
landing freezes 14 frames; a muffled hit on an unnamed boss freezes 3 and sounds
wrong. The player should feel the difference between a good hit and a bad one
through the controller-less medium of a phone screen.

*What this forbids:* damage numbers, hit-flash-only feedback, more than one
screen-shake source firing at once.

### Pillar 4 — The world is older than you
No NPC explains the plot. No quest marker. The story is on stones, in chalk, in
what a boss denies, in a market that only opens at night and is clearly still
doing business. The codex fills in as you go and never gets ahead of you.

*What this forbids:* exposition dumps, tutorial pop-ups outside the Teaching,
mission logs, anything that tells you where to go next.

### Pillar 5 — It has to run on a cheap phone
480×270 logical, painted at 2×. One file. No libraries. Background layers baked
once per room. If a beautiful feature costs the frame budget on a low-end
Android, the feature loses.

*What this forbids:* per-frame procedural generation, large sprite atlases,
particle counts above the budget in §11, physics libraries.

## 1.6 Gameplay vision — the balance of the thing

**Combat is the point.** This is a Blasphemous-shaped game, not a Hollow
Knight-shaped one. Exploration exists to space out the fights and to hide the
information the fights require. Target split of player time: **55% combat, 30%
exploration/traversal, 10% reading and menus, 5% platforming.**

**Bosses are Souls-like, not Zelda-like.** They do not have a gimmick you solve
once. They have a moveset you learn. The exception is Ogbunabali, whose *naming*
is a Zelda-like key — but the fight after the naming is pure Souls.

**Platforming should never kill you.** Gaps exist to gate progress (the chasm
needing the air-dash), not to test precision. There is no pixel-perfect jump in
this game and there never will be. If a jump is hard, it is a bug.

**Puzzles: exactly one kind.** The riddles at the mirrors, and the true-name
puzzle. No block-pushing, no light-beam redirection, no switch mazes. The puzzle
of this game is *paying attention to what the world told you*.

**Difficulty target:** a competent action-game player should die 15–30 times in a
full playthrough, and every single death should be legible. The chalk masquerade
in the tutorial should kill roughly a third of players once. Ogbunabali should
kill most players two to four times.

## 1.7 References

**Games — and specifically what we take:**

- **Blasphemous** — the primary reference. Take: attack commitment, weight,
  execution finishers, religious iconography treated with total seriousness, the
  courage to be slow. Do not take: its map's hostility, its obscure quest
  triggers, instant-death spikes.
- **Hollow Knight** — take: the quality bar on tell readability, the way the
  world reveals itself, the restraint of its UI. Do not take: its charm-build
  breadth (we are not a build game) or its scale.
- **Nine Sols** — take: the parry-forward defensive read, the idea that deflection
  is the primary verb. Do not take: its parry's total dominance; ours has to share
  space with the roll, which is why gold tells exist.
- **Hyper Light Drifter** — take: colour discipline, wordless environmental
  storytelling, the confidence to leave things unexplained.
- **Dark Souls** — take: boss legibility, the shade-recovery loop, the bonfire
  rhythm. Do not take: stat builds, equipment weight, poise math the player has to
  read a wiki to understand.
- **Tunic** — take: the idea that knowledge itself is the unlock. Our riddles are
  a cousin of its manual.
- **Ori** — take: nothing mechanically. Referenced only as a warning: our
  traversal should never become the main course.

**Film and art:**

- **Princess Mononoke** — the model for how to treat gods. They are not good or
  evil, they are *large*, and they have interests. Ala is not on your side.
- **Nollywood's supernatural canon** (the *Living in Bondage* lineage) — the
  register of the music, and the seriousness with which spiritual consequence is
  treated. Not the melodrama.
- **Chinua Achebe, *Things Fall Apart*** — the prose voice. Plain declaratives,
  proverbs used as argument, the assumption that the reader is an adult.
- **Ben Enwonwu's sculpture** — the model for how figures should be proportioned
  when we render masquerades and idols. Elongation, stillness, mass.
- **Real Mmanwụ masquerade photography** — the reference for every mask in the
  game. Carved planes, raffia, chalk, ochre. Not skulls with horns glued on.

## 1.8 Things we absolutely will not do

Non-negotiable. These are here so that a future contributor with a good idea
cannot argue them in.

1. **No procedural generation.** Every room is hand-drawn ASCII. The world is
   authored or it is nothing.
2. **No roguelike structure.** No runs, no permadeath, no randomised loadouts.
3. **No crafting.** No materials, no recipes, no upgrade trees with ingredients.
4. **No multiplayer.** Not co-op, not asynchronous messages, not leaderboards.
5. **No pixel-perfect platforming.** See §1.6.
6. **No damage numbers, no floating combat text.** Feedback is hitstop, shake,
   sound, and colour.
7. **No stamina bar.** Rolling and attacking are gated by commitment frames, not
   by a resource.
8. **No open-world sprawl.** Ten rooms now, thirty at the ceiling. Density over
   size, always.
9. **No microtransactions, ads, analytics, or telemetry.** The file is the whole
   product and it phones nobody.
10. **No external libraries, no build step, no bundler.** Ever.
11. **No AI-generated art or voice assets.** Everything is drawn in code or
    synthesized in WebAudio, by hand.
12. **No difficulty selector.** Accessibility options, yes — see §10.6. A menu
    that says "Easy / Normal / Hard," no. The Speedrun mode is the escape valve
    and it is honest about being one.
13. **No lore delivered by a talking NPC who explains the plot.**

## 1.9 The wishlist, triaged

The user's ambitions, sorted honestly into what fits, what fits later, and what
should be reshaped.

### Fits, and should be built (Tier 1)

| Want | Verdict | Where |
|---|---|---|
| Full codex | **Built.** Extend, don't rebuild | §10.4 |
| Hidden endings | **Yes — two more.** The structure already stubs `G.ending` | §02.7 |
| NG+ | **Yes.** Cheap: keep weapons/spells, reset world, harder tells | §12 Phase 3 |
| Day/night cycle | **Yes, but authored, not simulated.** See below | §04.6 |
| Dynamic weather | **Yes, per-biome and scripted.** Rain in Ọhịa, ash in Ọkụ | §08.7 |
| Photo mode | **Yes.** Trivial: freeze update, free camera, hide HUD | §12 Phase 4 |
| 40 bosses | **No. 8–10.** See below | §07.1 |
| 200 enemy types | **No. 20–24.** See below | §06.1 |
| Voice acting | **Reshaped.** See below | §09.5 |

### The three that need reshaping, and why

**"40 bosses" → 8 to 10 bosses.**
Ọdịnala's bosses are not encounters, they are *arguments*. Ogbunabali took three
distinct systems (regeneration, the lie dialogue, the naming) to work. Forty of
those is forty times the authoring and would force them to become reskins, which
would kill the one thing that makes them special. **Target: ten total.** Four
exist. Six to author. Each gets a unique mechanical thesis; if you cannot state
its thesis in one sentence, it is not a boss, it is an elite enemy.

**"200 enemy types" → 20 to 24 species, each with a lesson.**
Nine exist. Every enemy in this game teaches one thing (the warden teaches "hit
the back or break the guard"; the ember teaches "gold means move"). Two hundred
species means 190 of them teach nothing. **Target: 22.** Where the player *feels*
variety, deliver it through **variants** instead — same AI, different palette,
stat scaling and biome dressing. A bone-road walker and a market walker can look
completely different and cost almost nothing.

**"Voice acting" → the voice system we already have, deepened.**
Real voice acting means audio files, which means asset folders, which breaks the
single-file identity. But we already synthesize per-speaker voices: pitch, timbre,
vibrato, growl. **Deepen this instead:** more speaker profiles, phoneme-length
blips driven by the actual vowels in the text, breath between clauses, a lower
formant for the gods. Done well this reads as *stylised* voice, which suits the
game better than recorded dialogue would.

**"Day/night cycle" → authored time-of-day per room.**
A real simulated cycle fights the game: the night market is *called* the market
that opens at night. Instead, each room declares a fixed hour, and the sky, the
light temperature and the ambient particles derive from it. The player still
experiences a world with times of day; we keep authorial control. The one
exception: Igwe, the open sky room, may run a slow real cycle because it is the
one room where the sky is the subject.

### Fits eventually (Tier 2)

Charms/relics with passive effects (the Blasphemous rosary model, capped at ~12).
Boss rush from the codex. A New Game+ exclusive boss. Optional super-boss in
Igwe. Weapon-specific heavy attacks. A second dibia NPC who trades lore for
cowries.

### Rejected outright

Skill trees. Gear stats and inventory management. Fishing, farming, or any
non-combat minigame. Dialogue choice wheels. Romance. A hub town with vendors.
Fast travel without the riddles.
