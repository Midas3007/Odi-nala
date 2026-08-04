# 07 — Audio Bible

## 7.1 The audio thesis

**There are no audio files. Every sound in this game is synthesized at runtime by
WebAudio.** No samples, no MP3s, no soundfonts. The single-file constraint forbids them,
and the constraint produced something better than a stock library would have: a
soundtrack that is *actually* built the way the music it references is built.

## 7.2 Music direction

### The reference, stated plainly
Two traditions, layered:

1. **Traditional Igbo ensemble music** — the instruments and, crucially, the *rhythmic
   architecture*. A bell timeline that never changes while everything else argues around
   it.
2. **The Nollywood spiritual thriller score**, roughly 1992–2008 — *Living in Bondage*,
   *Nneka the Pretty Serpent*. Low synth strings under a scene where someone is told
   something terrible. Melodrama played completely straight. This is where the `pad`
   voice comes from, and it is why the boss track has one.

Neither is a costume. The bell timeline is real; the pad is real; they coexist the way
they coexist in an actual Nollywood soundtrack recorded in Enugu.

### The bell timeline — the spine
West African ensemble music is organised around a bell pattern in **12 pulses** that
repeats unchanged for the entire piece. Everything else is placed relative to it.

```
BELL7  = [3,0,1,0,3,1,0,3,0,1,0,1]   the seven-stroke timeline
BELL_S = [3,0,0,1,0,0,3,0,1,0,0,0]   sparse — for quiet rooms
BELL_B = [3,1,0,3,1,0,3,1,0,3,1,1]   dense — boss and fire
```
Values are scale degrees; `3` is an accent, `1` is a light stroke.

**This is not a stylistic choice you may revert to 4/4.** The 12-pulse structure is the
music. A track in 16 steps is a different genre.

### The instruments

| Function | Instrument | Synthesis |
|---|---|---|
| `mOgene(t,f,vol)` | **Ogene** — iron bell | Four oscillators at inharmonic ratios **1, 2.76, 5.4, 8.9** through a bandpass at 4f. The inharmonic partials are why it rings like metal and not like a beep. |
| `mUdu(t,hi)` | **Udu** — clay pot | Sine from 150 Hz falling exponentially to 46 Hz over 190 ms, plus a 20 ms lowpassed noise transient for the palm slap |
| `mEkwe(t,f)` | **Ekwe** — slit log drum | 45 ms noise burst through a bandpass at Q 9, plus a triangle at 0.52f for the body. Two pitches for the two lips. |
| `mShaker(t,vol)` | **Ichaka / oyo** — gourd rattle | 55 ms noise, highpass 5200 Hz |
| `mOpi(t,f,dur,vol)` | **Opi** — horn/flute | Triangle with a 5.2 Hz vibrato LFO on frequency, lowpass at 5f, plus a bandpassed noise breath transient |
| `mGuitar(t,f,vol)` | **Palm-wine guitar** | Sawtooth through a lowpass sweeping 7f → 2f over 220 ms |
| `mPad(t,f,dur,kind)` | **The Nollywood strings** | Four detuned oscillators (1, 1.005, 1.5, 2.0) through a lowpass at 380–520 Hz, slow attack |

### The arrangements

| Track | Rooms | Scale | Tempo | Character |
|---|---|---|---|---|
| `night` | 0, 7 | A minor pentatonic | 0.195 | Sparse bell, no shaker. Almost silence. |
| `ogilisi` | 10 | A minor pentatonic | 0.215 | **The sparsest track in the game.** One pot a bar, one note, no answer. |
| `forest` | 1 | D minor pentatonic | 0.168 | Full seven-stroke, shaker running |
| `shaft` | 2 | E minor, low | 0.235 | Slowest. Almost no percussion. |
| `ulo` | 12 | E minor, low | 0.225 | The market's **guitar** in the shaft's key, stopping mid-phrase. |
| `bone` | 6 | C minor pentatonic | 0.180 | Dry and walking. **No pad** — the one track with nothing under it. |
| `market` | 4 | C major-ish | **0.152** | **Highlife** — guitar, full rattle, fastest |
| `elu` | 11 | C major-ish | 0.172 | The same highlife one floor up. Guitar carries, **rattle does not**. |
| `water` | 5 | A minor, +8ve | 0.205 | Airy, bells, delay-heavy |
| `fire` | 8 | C# minor | 0.146 | Hot, close, dense ekwe |
| `sky` | 9 | G major | 0.230 | Open, high, spacious |
| `boss` | 3 | **C with a flat second** | **0.132** | The same bell, knocked wrong. War drums. Pad. |
| `ekwensu` | 6, boss alive | E minor, low | 0.138 | The shaft scale played at boss tempo — the bone road's own ground, sped up under you. |
| `onwe` | 7, boss alive | A minor pentatonic | 0.186 | **`night` in retrograde.** See below. |
| `uzu` | 8, boss alive | C# minor | 0.140 | **Two fixed lines.** The bell, and a hammer four to the bar. |
| `ikuku` | 9, boss alive | G major | 0.158 | **No udu, no ekwe.** Nothing marks the floor. |

The boss track is the forest track's structure with a poisoned scale. That relationship
should be preserved in any new boss music.

**The bone road is deliberately padless.** Every other track has the Nollywood strings
under it somewhere. The road of bones is the one place in the game where nothing is
holding you up, and the arrangement says so before the room does.

### Onwe's theme — built, not written

`TRACKS.onwe = retrograde(TRACKS.night, { spb:.186, mix:.92 })`.

`retrograde()` reverses every pattern array — udu, ekwe, shaker, guitar — and reverses
both the order of the four `opi` phrases and the notes inside each. The bell timeline is
**not** reversed, because it never changes for anything (§7.2).

This is a function and not a transcribed copy on purpose: Onwe is the player's mirror, so
if the opening theme is ever edited, Onwe's theme must change with it. A hand-copied
retrograde would silently drift the day someone retunes `night`, and the mirror would
stop being a mirror. **If you edit `night`, do not touch `onwe` — it already followed.**

### The last two boss themes

Both were on the `BOSS_TRACK` fallback until they weren't. Each is built around the one
thing that is true about the fight.

**`uzu` — the smith keeps working.** A hammer is a timeline in its own right, so this is
the only track in the game with **two fixed lines running at once**: the bell that never
changes, and an anvil stroke square on beats 0, 3, 6 and 9 that never changes either. The
melody has to argue against both. That is what a forge sounds like and it is also what
the fight is — a guard that reforges faster than you can break it.

**`ikuku` — nothing marks the floor.** Ikuku never lands, so its theme has **no udu and
no ekwe**, the two drums that tell you where the ground is. What is left is bell, rattle
and breath. The bell stays because the bell always stays (§7.2); it is the *ground* that
is missing, not the spine. There is a REGRESSION test on those two arrays being empty,
because a well-meaning edit adding "a bit of low end" would quietly delete the idea.

### Ducking — **[BUILT]**

**Ducking is not fading out.** §7.2 forbids fading the music out for a cutscene and that
still holds: the room's track keeps playing, keeps its place, and keeps its drone. It
just steps back to **42%** on a 0.18 s time constant so the voice reads over it, and
comes back up when the cutscene ends.

`musicDuck()` runs from `musicSched` on its 60 ms interval — **before** the muted guard,
so a muted bus still settles to zero — and writes to the gain only when the target
actually changes, not every tick. `musicToggle()` clears `duckedTo` so mute and duck
decide the gain in one place instead of fighting over it.

**It must never duck to silence.** There is a REGRESSION test asserting the ducked level
is above zero, because `DUCK = 0` would satisfy every other assertion here and would be
exactly the mistake §7.2 exists to prevent.

### Beds

`BEDS` is one continuous filtered-noise source per track — wind, water, crowd, fire —
started once and never restarted. `musicSetBed()` moves only the bandpass frequency and
the gain, both on 0.8 s ramps, so a room change is a shift in the air rather than a cut.

It is **keyed by track, not by room**, on purpose: a sixth room-indexed table is a sixth
table to drift (§9), and rooms that share an arrangement should share the air in them.
The bed hangs off `MUS.bus`, so `P` mutes it with everything else — a bed on its own
output would keep hissing through a mute, which is the bug this note exists to prevent.

### Melody: call and response
Each track carries **four 12-step phrases** in `opi[]`, cycling by bar. On step 6, if
the phrase is silent there, a lower answering note fires 40% of the time. That is
call-and-response, and it is why the music does not loop audibly despite being tiny.

### The bus
Everything runs through `MUS.bus` → a **240 ms delay with 0.28 feedback at 0.30 wet**.
Ogene, opi and guitar are sent to the delay; drums are not. That split is what makes the
percussion tight and the melody spacious.

A **drone** sits under everything: a lowpassed sawtooth at the scale root, an octave
down, at 0.042 gain, retuned with a 0.6 s time constant when the room changes.

### Music rules
- **Never fade the music out for a cutscene.** The room's track continues under it. This
  is a Nollywood convention and it is correct.
- **The track changes on room entry**, via `musicForRoom()`. A boss room with a live boss
  overrides — `BOSS_TRACK` names the theme, and anything not in it falls back to `boss`.
  Ụzụ and Ikuku take that fallback and are still owed themes of their own.
- **`P` mutes everything** and the HUD speaker icon reflects it.
- **New room = new arrangement**, even if it reuses a scale.

## 7.3 Voices

There is no voice acting and there will not be — a recorded cast breaks the single-file
constraint by two orders of magnitude. Instead: **per-character synthesized blips**, one
profile per speaker, fired every third character as text types out.

| Profile | Freq | Wave | Vol | Jitter | Dur | Growl |
|---|---|---|---|---|---|---|
| `narr` | 118 | triangle | .055 | 14 | .075 | no |
| `boss` | 74 | sawtooth | .075 | 9 | .105 | **yes** |
| `you` | 186 | sine | .042 | 22 | .055 | no |
| `mirror` | 520 | sine | .038 | 60 | .09 | no |
| `ala` | 96 | square | .05 | 10 | .09 | no |

Each blip: an oscillator with a small pitch ramp derived from character index, through a
lowpass (900 Hz if growling, 2400 if not). Growl adds a bandpassed noise layer at 320 Hz.

**This system should be deepened, not replaced.** More profiles — one per NPC — and
better formant shaping would push it further. Real VO would not.

## 7.4 Sound effects

Every SFX in `S` is a function, not a file.

| Cue | Construction |
|---|---|
| `swing` | 80 ms highpassed noise at 900 Hz + a falling square |
| `heavy` | 160 ms noise at 400 Hz + sawtooth 150→60 |
| `hit` | 110 ms noise at 200 Hz + sawtooth 130→55 |
| `muffle` | quiet, lowpassed — **the sound of a hit that did not count** |
| `block` | 60 ms noise at 2400 Hz + high square |
| `parry` | 1500 Hz square + 760 Hz triangle + bright noise — **the brightest sound in the game** |
| `brk` | 260→900 triangle + noise |
| `exec` | 90→40 sawtooth + long noise + a sine tail |
| `pick` | 45 ms dry noise at 1800 Hz + a triangle rising 560→760 — equipment handling |
| `hurt`, `die`, `heal`, `roll`, `charge`, `pray`, `name`, `step` | see `S` |

`pick` is **handling, not consecration**: taking hold of a weapon or changing the word
in your mouth. `name` is reserved for what is sacred — naming, mirrors attuning,
purchases, weapons found — and a swap is not that. Both `cycleWeapon()` and
`cycleSpell()` end in `S.pick()` and **must stay identical**: a swap that sounds bigger
one way than the other tells the player something untrue about which choice mattered.
*(Recovered from `bible/archive/09-AUDIO.md` §9.6 — the cue is shipped and the new set
had dropped it.)*

### SFX rules
- **The parry is the brightest sound in the game.** Nothing else is allowed to be
  brighter. It is the highest-skill action and it must sound like a reward.
- **`muffle` is a design tool.** When the player hits an unnamed boss and it does 10%,
  the sound tells them before the health bar does.
- **No sound plays twice in the same frame.** Guard with `P.hitOnce`.
- **Footsteps every 13 frames** while grounded and moving above 1.2 speed.
- **Nothing above 0.08 gain.** The mix is deliberately quiet; players are in a browser
  tab.

## 7.5 The unlock problem — solved, do not regress

Browsers will not let a page make sound until the user has interacted. This game got
this **wrong** in an early version and shipped silent. The fix, which must be preserved:

1. `initAudio()` is called on **keydown, pointerdown, touchstart and mousedown**.
2. On first call it constructs the context **and plays a one-sample silent buffer** —
   the handshake iOS and Chrome want.
3. It calls `resume()` and **awaits the promise**, setting `audioReady` only when the
   state is genuinely `running`.
4. On success, `afterAudio()` starts the room's music — because the room may have loaded
   before audio unlocked.
5. A **watchdog** in `update()` re-checks every 45 frames: if the context is running and
   no track is playing, start one.
6. `audioState()` returns `on / muted / blocked / off` and the HUD speaker icon shows it.
   If blocked, the title screen says so in plain language.

**Never simplify this.** Every step exists because a real browser needed it.

## 7.6 The encounter stinger — **[BUILT]**

`showBossCard()` fires one struck bell — an 88 Hz sine, a 262 Hz triangle a fifth and an
octave above it, and a short noise transient — and nothing else. **It does not interrupt
the music**, for the same reason a cutscene does not (§7.2): the room's track carries on
under it and the bell lands on top.

It is fired from the boss's arrival, once, from the same place the card is raised, so the
sound and the name cannot come apart. All five bosses use it.

## 7.7 Audio not yet built — **[NOT BUILT]**

Every room has its own arrangement, every boss has its own theme, every track has a bed,
the encounter has a stinger, and the music ducks under speech. What is left is depth
rather than gaps:

- More voice profiles as more characters are added (§7.3)
- Formant shaping on the voice blips — the system to deepen, never to replace
- Per-weapon impact timbre, so the machete and the staff do not share `hit`
