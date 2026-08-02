# 02 — Story Bible

## 2.1 The logline

A spirit-child who was supposed to keep dying digs up the charm that binds them
to the living world, and walks into the land of the dead to take back the one
person the cycle never accounted for.

## 2.2 The premise in full

An **ọgbanje** is a child who is born to a woman, dies young, and is born again
to the same woman. In Igbo belief this is not a metaphor. It is a specific,
recognised affliction, and it has a specific, recognised cure: find the child's
**iyi-uwa** — a small object, buried before birth, that ties them to the spirit
world — dig it up, and destroy it or bury it where it cannot be recovered. The
child then stays.

Our protagonist was ọgbanje nine times. On the tenth pregnancy a **dibia**
(a diviner-healer) found the iyi-uwa and buried it beneath an **ogilisi** tree —
the tree planted at boundaries and shrines, the one you do not cut down.

It worked. The child stayed. They grew.

And then, before the year turned, something took the mother. Not illness. Not
age. Something that walks at night and answers to no name the dibia could find.

The child went back to the ogilisi tree and dug up their own charm.

This is the wrong way to break the bargain. Destroying an iyi-uwa releases you.
*Recovering* it puts you back into the cycle from the living side — you regain
what an ọgbanje has (you cannot stay dead) without regaining what an ọgbanje is
(you are no longer owed a return). You become a thing with no place: unkillable
and unwelcome, on both sides.

The game begins the moment the charm comes out of the ground.

## 2.3 Structure — the eight movements

The game is not divided into chapters in the UI. But it has eight movements, and
the `storyProgress()` function tracks them for the CONTINUE screen.

**I — The Charm (Ala Iyi-uwa).**
You wake on top of your own charm, in the clearing with the ogilisi tree. The
**chalk masquerade** stands up out of the ground. It is not sent by anyone; it is
what the dibia left behind to keep the hole shut. It teaches you to fight because
that is what a guard does, and then it dies, because you are not what it was
built for.

**II — The Path That Watches (Ọhịa).**
The forest between the compound and everything else. Nothing here is on your
side. The title is literal — the environmental storytelling establishes that
something is counting you.

**III — The Shaft (Ụzọ Ala).**
A vertical descent through worked stone. Someone dug this, a long time ago, and
it goes down toward Ala. Here you find **nzu on stone** — chalk marks, nine
strokes, left by a dibia who came down before you — giving you the name
**OGBUNABALI**. This is the game's central information beat: a name is a weapon.

**IV — He Who Kills at Night (Ebe Ọchịchịrị).**
Ogbunabali is the thing that took your mother. He denies it, at length, in the
dialogue box, while your blade slides off him and his wounds close faster than
you can open them. Speaking his true name makes him mortal for seven seconds at a
time. Killing him grants **Ala's Fall** — the earth's permission to break the
ground.

**V — The Market and the Water (Ahịa Mmụọ, Iyi Idemili).**
The optional-feeling middle. The night market is *doing business* — the dead
haggle, lanterns sway, nobody acknowledges you. Idemili's water remembers things
that happened to it. These two rooms carry most of the world-building and most of
the mirrors, and they are where the player learns that the world does not revolve
around them.

**VI — The Bone Road (Okọchị Ọkpụkpụ).**
The dry season road, paved with what did not make it. **Ekwensu** waits at the
end. Where Ogbunabali lied, Ekwensu is honest to the point of insult — it was
*paid* to do what it did, it says so, and it does not care who by. It is the
largest thing in the game.

**VII — Fire and Sky (Ọkụ Mmụọ, Igwe).**
The two rooms between the bone road and the door. The fire that does not go out
is where the dead who cannot be placed are kept burning; you take a brand out of
it. Igwe, the open sky, is the only place in the game with a horizon, and it is
directly before the end on purpose — you should be able to see out just before
you go in.

**VIII — The Land of Spirits (Ala Mmụọ).**
**Onwe** — *self* — is waiting, wearing your face, your height, your hands. It is
what you would have been if you had stayed buried the tenth time: the obedient
version, the one who went back. It fights exactly as you do. Killing it opens the
door.

## 2.4 Timeline

| When | What |
|---|---|
| Before memory | Ala takes the dead into the ground. The arrangement is old and nobody signed it. |
| Long before | The shaft is dug. By whom is never stated; a dibia's chalk is the only evidence anyone came back. |
| ~40 years before | The night market begins keeping its hours. The dead have always traded; the market is only the current arrangement. |
| Mother's youth | She is told she will have trouble keeping children. She has them anyway. |
| Nine times | You are born. You die. Each time before the yam harvest — the marker of a year survived. |
| The tenth | The dibia finds the iyi-uwa and buries it under the ogilisi. You stay. |
| Within the year | Ogbunabali takes the mother. Ekwensu was paid to make it possible. Who paid is the unanswered question of the game. |
| Days later | You dig up the charm. **The game begins.** |

**The deliberate hole:** *who paid Ekwensu* is never answered in the base game.
It is the hook for future content and it must remain unanswered until then.
Candidate answers, for the writer's eyes only — do not put these in the game
without a decision: the dibia (to be rid of an ọgbanje family for good); Onwe
(who wanted you to have a reason to come); Ala herself (who wanted the cycle
closed and did not mind how).

## 2.5 The bosses as arguments

Each boss is a position on the theme, not a health bar.

- **The chalk masquerade** — *"You are supposed to stay in the hole."*
  It has no malice. It is a lid. It teaches you the game's grammar because a lid
  has to be tested to be a lid.
- **Ogbunabali** — *"Nothing happened. You are remembering wrong."*
  Denial. The only counter to denial is a name, said out loud.
- **Ekwensu** — *"Something happened, and I was paid for it, and I would do it
  again."*
  Honesty without conscience. There is no naming, no trick. You simply have to be
  better than it.
- **Onwe** — *"You could have stayed. It would have been easier for everyone."*
  Obedience. It fights like you because it is the argument that you should not
  have refused.

## 2.6 Dialogue style guide

**Rules:**

1. **The protagonist never speaks aloud.** Not once. Their interiority arrives as
   narration in the `you` voice profile, and only in cutscenes.
2. **Bosses speak in quotation marks. Narration does not.** The player must be
   able to tell, at a glance, what is being *claimed* and what is *true*.
3. **Short sentences. Concrete nouns. No adjective stacking.** "Something that
   walks at night" beats "an ancient malevolent darkness."
4. **Proverb rhythm on the important lines.** Igbo speech uses proverbs as
   argument, not decoration. Reserve this for beats that matter.
5. **No fantasy vocabulary.** No realm, no essence, no shadow-magic, no
   chosen one, no prophecy. If a word would be at home in generic high fantasy,
   cut it.
6. **Igbo words are used untranslated when context carries them, glossed once
   when it does not.** Never both in the same line. `nzu` gets explained the first
   time by what it *does*, not by a parenthetical.
7. **Length caps.** A banner (`say()`) is one sentence, max ~90 characters. A
   cutscene beat is one to three sentences, max ~180 characters. A codex entry is
   40–80 words. Nothing else exists.
8. **Never explain the mechanic in the fiction's voice, or the fiction in the
   mechanic's voice.** The teaching prompts say "Z" because they are the game
   talking. Ogbunabali never says "parry my white attacks."

**Reference lines that define the voice:**

> "Nine times your mother carried you to term. Nine times she buried you before
> the yam came up."

> "You should have stayed. You should have grown old, and dull, and human."

> "I did not take her."

> "The glass goes black. Walk away from this room and come back to it."

> "He comes apart the way night comes apart: not defeated, only ended, and only
> here."

## 2.7 Endings

The base game ships **one** ending. `G.ending` is an integer specifically so that
more can be added without a save migration. Three are specified; two are unbuilt.

### Ending 1 — **The Refusal** (built)

Default. You kill Onwe, and you walk out of Ala Mmụọ carrying the charm.
You do not go back into the cycle. The last card is the stats card — deaths,
kills, lore recovered, time — presented flatly, the way a funeral programme lists
facts.

The last line: the mother is not returned. **This is essential and must never be
softened.** The game is about refusing a role, not about winning a prize. She is
gone. What you took back was your own no.

### Ending 2 — **The Return** (specified, unbuilt)

Requires: reach Onwe with the iyi-uwa **unbroken** and choose, at the door, to
put it back in the ground.

You step back into the cycle. The screen goes to the ogilisi tree. A woman who is
not your mother is pregnant. The cycle resumes and it is not framed as failure —
it is framed as peace, which is what makes it hurt.

Implementation note: this needs a *choice prompt at the door*, which is the only
choice prompt in the game. It must be presented without UI weighting — no "are
you sure," no highlighted default.

### Ending 3 — **The Ninth Name** (specified, unbuilt — the hidden one)

Requires: all four mirrors attuned, all lore entries found, every boss executed
rather than killed by damage, **and** finding a tenth chalk stone hidden in Igwe
that gives the name of the thing that paid Ekwensu.

You name it at the door. It answers. This is the only ending that resolves §2.4's
deliberate hole, and it should be genuinely hard to reach — the intent is that
most players learn it exists from someone else.

## 2.8 NPCs

Ọdịnala has **no talking NPCs**, and this is a design position, not an omission
(Pillar 4). The world is populated by:

- **The market ghosts** — background figures in Ahịa Mmụọ who trade with each
  other and never with you. They must never acknowledge the player. Their whole
  function is to prove the world does not need you.
- **Shades** — your own death markers. The only friendly thing in the game and it
  is you.
- **The chalk of the dibia who came before** — an NPC who is present entirely
  through handwriting. This is the model for any future "character."

**If a future feature needs an NPC**, it should follow the dibia model: presence
without dialogue. A pot still warm. A footprint. Chalk. The rule is: *the player
may deduce a person, but never meet one.*

The single permitted exception, if ever needed: a vendor at the ledger who is
**heard and never seen** — a voice from behind a curtain that speaks only in
prices and proverbs.
