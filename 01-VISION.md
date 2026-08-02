# 01 — Creative Vision

## 1.1 The core theme

**Refusal.**

Not identity, not destiny, not sacrifice — those are the themes of the games this one
sits next to. Ọdịnala is about a child who was given a role by forces older and larger
than itself, and who said no, and who is now walking through the consequences.

The ọgbanje is a child who comes to a woman, dies, and comes back to the same woman,
nine times, feeding on her grief. That is the arrangement. Our protagonist broke the
arrangement from the wrong side: they dug up their own iyi-uwa — the charm that ties a
spirit-child to the world — instead of letting a dibia bury it. That is not heroism.
It is a violation. Everything in the game treats it as one.

Three sub-themes braid through it:

**Names as power.** In this world, to name a thing correctly is to make it mortal.
Ogbunabali cannot be fought until he is named, and the whole first act is the player
learning that violence is not the answer to a question that was never about violence.
This is not a metaphor we invented — Igbo naming practice is genuinely load-bearing.
Children are named for what happened, what is feared, what is hoped.

**Grief as economy.** The ọgbanje eats a mother's grief. The player collects cowries
from the dead. Ọfọ fills when you land clean hits. Everything you spend was taken from
something that was hurt. Never make this explicit in dialogue. Let the systems say it.

**Return.** Every mechanic in the game is about coming back: the ọgbanje returns nine
times, the player respawns at charms, the mirrors return you to places you have been,
the bosses return unless correctly ended. Death is not a fail state in the fiction.
It is the character's native condition, and the thing they are trying to escape.

## 1.2 The emotion the player should feel most often

**Wary competence.**

Not fear — fear is the first ten minutes only. Not power fantasy — that is what the
speedrun mode is for, and it is deliberately walled off. The target state is the
feeling of a person who knows the rules of a dangerous place, moving carefully through
it, occasionally getting it exactly right.

The moment that defines the game: you see a **white** telegraph, you ward it on frame
seven, the screen freezes for thirteen frames, the world slows, the enemy staggers, its
guard bar shatters, and you walk into it and end it. You did that. It was not luck.

The second most common emotion should be **recognition** — a player of Igbo descent
seeing a word, an instrument, a mask, a riddle they know, rendered without explanation
or apology. The game never glosses. It never says "ọgbanje, a spirit child in Igbo
belief." It says ọgbanje and moves on, and lets the player who doesn't know go and find
out.

## 1.3 Tone

**Dark, but not grim. Mythic, not gothic.**

The distinction matters. Blasphemous is *gothic* — it is about guilt, mortification,
and a religion that hates the body. Ọdịnala is *mythic* — it is about arrangements with
powers that are not evil, only enormous and uninterested. Ala is not a villain. She is
the ground. Amadioha is not cruel. He is lightning.

Concretely, tonal rules:

- **No sadism.** Nothing in this game is cruel for the camera. Blasphemous's flagellants
  and impaled penitents are not our register. Our horror is quieter: nine small graves,
  a mask that is your face, a boss who says "I did not take her" and is lying.
- **No irony.** The game is entirely sincere. There are no jokes at the expense of the
  belief system it is built on.
- **Dry, not portentous.** The narrator's voice is flat and a little wry. *"You die
  again. You have always died again."* Not *"Alas, the cycle claims thee once more."*
- **Warmth exists.** The night market is busy and almost cheerful. The music there is
  highlife. It is a relief, and it is meant to be.

## 1.4 What makes Ọdịnala different from every other Metroidvania

Four things, in order of importance.

**1. Bosses lie to you in the dialogue box, and the lie is the mechanic.**
Ogbunabali cannot be killed. Your damage is reduced to 10% and he regenerates 0.30 HP
a frame — faster than you can cut. Nothing in the UI tells you this is wrong. The
player is meant to fight him, lose, and *understand*. The answer is not a bigger
sword; it is a stone in another room with his true name chalked on it, and pressing
N. To our knowledge no other Metroidvania makes epistemology the boss mechanic.

**2. The cosmology is Igbo, and it is not decoration.**
Ala is the earth and grants the ground-slam. Amadioha is lightning and grants the
dash. Idemili is water and grants the shield. Ikenga is the right hand and grants the
damage buff. Each ability is the alusi's actual domain. The riddles at the mirrors are
real Igbo *gwam gwam gwam*. The music is a real seven-stroke bell timeline. Nothing here
is "African-inspired." It is specific.

**3. Every swing roots you.**
This is Blasphemous's contribution and we take it seriously. You cannot cancel an
attack except by rolling out of its recovery frames. Every input is a commitment you
have to mean. See `04-COMBAT.md`.

**4. It is one HTML file.**
No build step, no dependencies, no install. You can email the entire game. This is not
a technical footnote — it is a design constraint that has shaped everything, and it is
part of the pitch.

## 1.5 Design pillars

Five. If a feature does not serve one of these, it does not go in.

### Pillar 1 — Commitment
Every action costs something you cannot take back. Attacks root. Rolls have a cooldown.
The ward window is nine frames. Gourds are finite between charms. A boss's name, once
spoken, holds for seven seconds. The player should always be spending, never idling.

### Pillar 2 — The world knows things you don't
Information is the real progression. Names on stones, riddles in glass, lore in the
codex, a boss's lie contradicted by a chalk inscription two rooms back. The player gets
stronger by *understanding*, and the systems reward that literally.

### Pillar 3 — Specificity over legibility
When there is a choice between a term the player will understand immediately and the
correct Igbo word, use the correct word and make the meaning clear from context. `Nzu`
not `potion`. `Ọfọ` not `mana`. `Iyi-uwa` not `soul stone`. The codex is where the
explanation lives, and it is optional.

### Pillar 4 — Weight
Hits stop time. Screens shake. Blood stays on the floor. Nothing is weightless, nothing
is floaty, nothing pings. When a guard breaks, the game freezes for eleven frames and
flashes gold. If a new mechanic cannot be given weight, it is the wrong mechanic.

### Pillar 5 — It runs on the phone in your pocket
Sixty frames a second on a mid-range Android in a browser tab. This is a hard pillar,
not an aspiration. It is why the background is baked, why there are no sprite sheets,
why the whole game is procedural drawing. Any feature that threatens the frame budget
loses.

## 1.6 References

### Games — and specifically what we take from each

| Game | What we take | What we explicitly do not take |
|---|---|---|
| **Blasphemous** | Attack commitment, parry→stagger→execution loop, prayers as spendable spells, heavy religious specificity, unrelenting art density | Its cruelty, its penitence systems, its gothic guilt, its instant-death spike design |
| **Hollow Knight** | Charm-like modularity of upgrades, quiet melancholy, the map as an earned object, bosses that teach by pattern | Its scale (we are a fraction of the size and should stay that way), its charm-notch economy |
| **Nine Sols** | The parry as the core defensive verb rather than the dodge; culturally-grounded mythology treated seriously rather than as flavour | Its deflection-only combat — we keep the roll as a real alternative |
| **Hyper Light Drifter** | Wordless environmental storytelling; a palette with the confidence to be almost monochrome per zone | Its dash-spam combat |
| **Tunic** | The idea that the player's real progression is *knowledge* — the manual, the secrets | Its obscurantism; we never hide critical path behind a puzzle without a fair tell |
| **Ori** | Nothing, deliberately. Listed because it is the metroidvania everyone reaches for and its softness, lushness and orchestral swell are the opposite of this game's register. | |

### Film and image

- **Princess Mononoke** — the single most important non-game reference. Gods are not
  good or evil; they are *large*, and the forest is a political actor. The kodama and
  the Nightwalker are the tonal ancestors of our alusi. Take the *moral neutrality of
  the enormous*.
- **Nollywood, specifically the 1990s–2000s spiritual thriller** — *Living in Bondage*,
  *Nneka the Pretty Serpent*, *Karishika*. This is the register for the cutscenes and
  the boss voices: melodrama played completely straight, low synth strings under a
  scene where someone is told something terrible. The music direction leans on this
  explicitly. **[PROPOSED — confirm or overrule: I have leaned into Nollywood as a
  primary tonal reference for cutscenes based on your instruction about the music.]**
- **Masquerade photography — Chinua Achebe's descriptions, the Mmanwu festival, Ijele
  masquerade.** For the boss silhouettes. What matters is the *raffia*: the mass of
  fibre that moves independently of the body inside it, so the shape is never quite
  readable.
- **Nsibidi** — the ideographic script. Our UI glyphs and shrine markings derive from
  this. Not Adinkra — that is Akan, and using it here would be exactly the kind of
  pan-African smear this game refuses.
- **Uli** — Igbo body and wall painting. Thin, confident, curvilinear line. This is the
  reference for our UI stroke weight and the chalk motifs.

### Igbo cultural references, specifically

These are load-bearing and must not be altered without consultation:

- **Ọgbanje / abiku** — the repeating spirit-child. Our protagonist.
- **Iyi-uwa** — the buried token binding an ọgbanje to the world. Finding and
  destroying it is how a dibia ends the cycle. Our protagonist dug up their own.
- **Alusi / arụsị** — the deities. We use Ala (earth, morality, the most senior),
  Amadioha (lightning, justice), Idemili (water, the pillar), Ikenga (the right hand,
  personal achievement — note that an ikenga is properly an *object*, a carved personal
  shrine, and our treatment of it as a granted power should respect that).
- **Chi** — personal destiny-spirit. **[NOT BUILT]** — the natural home for a
  New Game Plus framing.
- **Ekwensu** — often flattened to "devil" by missionary translation. He is properly a
  trickster and a deity of war and bargaining. Our Ekwensu is "the one who was paid" —
  a mercenary, not Satan. **This distinction matters and must be preserved.**
- **Ogbunabali** — "he who kills at night," a real deity of nocturnal death.
- **Nzu** — white chalk, used for blessing, marking, and welcome. Our healing item.
- **Ọfọ** — the staff/symbol of authority and truth. Our spell resource.
- **Gwam gwam gwam** — the riddle-game formula, "guess guess guess."
- **Ekwe, udu, ogene, ichaka, opi** — the instruments. See `07-AUDIO.md`.
- **Ọzọ, dibia, Ala Mmụọ, Ahịa Mmụọ** — title, diviner, land of spirits, spirit market.

## 1.7 Gameplay vision (answering the brief directly)

**How should combat feel?** Deliberate and heavy, closer to Blasphemous than to
Hollow Knight. Three-hit chains that root you. A nine-frame parry window that is the
highest-skill and highest-reward action in the game. Enemies telegraph in one of two
colours and the colour is the entire read: **white can be turned, gold cannot.**

**Exploration or combat?** **Combat leads, exploration frames it.** Midas chose this
explicitly at the outset. Rooms are combat arenas connected by traversal, not a maze
with fights in it. We are not building a map that takes twenty hours to fill in.

**Should puzzles matter?** Yes, but as *gates and rewards*, never as critical-path
walls. The riddles at the mirrors are the model: getting one wrong costs you a walk,
not a run. The one exception is the true-name mechanic, which is a critical-path
epistemic puzzle, and it is fair because the answer is chalked on a stone in a room
you must pass through.

**Should platforming be difficult?** No. Platforming is *transportation*, not
challenge. Jump arc is generous (coyote time 7 frames, jump buffer 8 frames). There
are no pixel-perfect jumps and there will never be any. Traversal gates exist to gate
progress, not to test dexterity.

**Souls-like or Zelda-like bosses?** **Souls-like in execution, Zelda-like in
conception.** Each boss is beaten by understanding one idea (Zelda), but the execution
of that understanding demands real mechanical skill under pressure (Souls). Ogbunabali
is the purest expression: the *idea* is "name him," the *execution* is surviving a
seven-second window while doing enough damage.

## 1.8 Technical limits (hard, non-negotiable)

- **Pure HTML/CSS/JS.** No frameworks, no bundlers, no npm, no TypeScript.
- **One file.** The entire game ships as `odinala.html`. No external assets. No image
  files, no audio files, no fonts. Everything is drawn procedurally and synthesized at
  runtime.
- **Canvas 2D only.** No WebGL. No DOM-based game objects (the touch overlay is the
  sole exception and is chrome, not game).
- **No external libraries.** Ever.
- **Mobile-first.** Touch controls are first-class, not a port. The floating joystick
  and labelled buttons are primary input, not an afterthought.
- **Performance target: 60 FPS on a mid-range Android in Chrome.** Logical resolution
  480×270, rendered at 2× (960×540 backing store).
- **Offline-capable.** No network calls of any kind at runtime.
- **Storage-optional.** `localStorage` may be blocked; the game must degrade to an
  in-memory save and say so honestly.

## 1.9 Things we absolutely do not want

This list is as important as the pillars. **[PROPOSED — these are my calls based on
everything we have built; overrule freely.]**

- **No procedural level generation.** Every room is hand-authored ASCII. The world is
  small and deliberate.
- **No roguelike structure.** No runs, no permadeath, no randomised builds.
- **No crafting, no gathering, no inventory management.** Cowries buy things at a
  ledger. That is the entire economy.
- **No multiplayer, no leaderboards, no online anything.**
- **No pixel-perfect platforming.** See 1.7.
- **No instant-death traps.** Hazards damage and eject; they do not kill outright.
- **No stamina bar.** Rolling is limited by a 16-frame cooldown, not a resource. Adding
  stamina would make the combat defensive rather than committed.
- **No durability, no repair, no equipment degradation.**
- **No escort missions, no timed missions, no fetch quests.**
- **No fog-of-war grinding.** The map fills in by *visiting*, instantly and completely.
- **No microtransactions, no ads, no analytics, no telemetry.**
- **No AI-generated art or audio assets.** Everything is drawn in code. This is both a
  technical constraint and an aesthetic position.
- **No text that explains the culture to a foreign audience.** The codex explains
  in-world; the game never stops to teach.
- **No difficulty selector.** Accessibility options, yes (see `08-UI-UX.md`). A
  "casual/normal/hard" menu, no. The speedrun mode is the pressure valve.

## 1.10 The wishlist

Everything Midas has ever floated, plus everything I think this game wants, sorted by
where it actually fits. Nothing here is a promise.

### Fits now — small, high value
- Second ending branch (the `G.ending` flag already exists and only value 1 is used)
- A fourth boss in room 9, the open sky
- Fifth and sixth weapons — the table is trivially extensible
- Weapon-specific heavy attacks (currently one heavy shape per weapon)
- Charms / rosary-bead equivalents: 2–3 passive slots
- Boss rush, launched from the codex
- Photo mode (pause the world, hide the HUD, free the camera a little)

### Fits in a bigger version
- **NG+** — the natural framing is *chi*: you begin again with your personal destiny-
  spirit remembering the last run. Enemies faster, one extra gold tell per boss.
- **Day/night cycle** — genuinely good fit. Ogbunabali is *he who kills at night*.
  Night should make him stronger and the night market open. This is a real design idea,
  not a checkbox.
- **Dynamic weather** — harmattan (dust haze, reduced visibility, +fire damage) and
  rain (slippery, water spells stronger). Two states, not a simulation.
- **Hidden endings** — a third ending for a player who reaches Onwe having killed
  nothing avoidable. **[PROPOSED]**
- **NPCs with quest chains** — see `05-PROGRESSION-AND-NPCS.md`; currently there are
  zero NPCs and this is the game's biggest content gap.

### Would require a different project
- **40 bosses / 200 enemy types.** Say the honest thing: this game is excellent at ten
  rooms and three bosses. Scaling to forty bosses would take a team and two years, and
  the single-file constraint would break long before the boss count did. A realistic
  ceiling for this codebase is **8–10 bosses and 20–25 enemy types**. That is a great
  game. Forty bosses is a different game.
- **Voice acting.** Real recorded VO breaks the single-file constraint immediately —
  even heavily compressed, a full cast is tens of megabytes. The synthesized per-speaker
  voice system we have is the correct answer to this constraint and should be *deepened*
  (more speaker profiles, better formants) rather than replaced.
- **Full 3D, physics, destructible terrain.** No.

### Explicitly rejected from the wishlist
- **Full codex** — already built. Ship it, do not rebuild it.
