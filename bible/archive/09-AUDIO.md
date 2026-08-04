# 09 — Audio Bible and Music Direction

## 9.1 The thesis

**All audio in Ọdịnala is synthesized at runtime in WebAudio.** No files, no
samples, no external assets. This is what keeps the game one file, and it is also
why the music sounds like nothing else — every instrument is modelled from its
physics rather than recorded.

## 9.2 The instrument set

Modelled on real Igbo instrumentation. Each is a function; each is a physical
argument about how the thing makes sound.

| Instrument | Real | Synthesis |
|---|---|---|
| **Ogene** | Iron bell, two-toned, struck with a stick | Four oscillators at inharmonic ratios **1, 2.76, 5.4, 8.9**, through a bandpass at 4× fundamental. The inharmonicity is what makes it *metal* and not a beep. |
| **Udu** | Clay pot; palm on the mouth bends the pitch | Sine from 150 Hz falling exponentially to 46 Hz over 190 ms, plus a 20 ms low-passed noise transient for the slap |
| **Ekwe** | Hollowed log, two lips, two pitches | 45 ms noise through a bandpass at Q 9 (1250 or 1950 Hz), plus a triangle at 0.52× for the body |
| **Ichaka / oyo** | Gourd rattle | 55 ms noise, highpass at 5200 Hz |
| **Opi** | Horn/flute, the melody voice | Triangle with a 5.2 Hz vibrato at 1.2% depth, low-passed at 5× fundamental, with a bandpassed breath layer |
| **Palm-wine guitar** | The two-finger highlife figure | Sawtooth through a lowpass sweeping 7× → 2× over 220 ms |
| **Pad** | The Nollywood string bed | Four detuned oscillators (1, 1.005, 1.5, 2.0) through a lowpass, slow attack |

## 9.3 Rhythm — the bell timeline

The structural fact of West African music, and the structural fact of this
soundtrack: **12 pulses, and a bell pattern that never changes while everything
else argues around it.**

```
BELL7  = [3,0,1,0,3,1,0,3,0,1,0,1]   the seven-stroke timeline
BELL_S = [3,0,0,1,0,0,3,0,1,0,0,0]   sparse, for quiet rooms
BELL_B = [3,1,0,3,1,0,3,1,0,3,1,1]   dense, for the boss
```

**Rule: never write a track in 4/4 with a backbeat.** The 12-pulse feel is not a
stylistic garnish, it is the reason the music does not sound like every other
indie game.

## 9.4 The tracks

| Track | Rooms | Tempo (s/pulse) | Scale | Character |
|---|---|---|---|---|
| `night` | 0, 7 | 0.195 | A minor pentatonic | Sparse. Almost nothing. Space. |
| `forest` | 1 | 0.168 | D minor pentatonic | Full ensemble, shaker throughout |
| `shaft` | 2, 6 | 0.235 | E minor, low | Slow, drone-forward |
| `boss` | 3 | 0.132 | C with a flat second | The same bell knocked wrong |
| `market` | 4 | 0.152 | C major-ish | Highlife: guitar, full rattle, fast |
| `water` | 5 | 0.205 | A minor, an octave up | High bells, long delay |
| `fire` | 8 | 0.146 | C# minor | Hot, close, dense ekwe |
| `sky` | 9 | 0.230 | G major | Open, high, slow — the only unambiguously beautiful track |

**Melody:** each track carries four 12-step opi phrases, cycled by bar, plus a
40% chance of a low answering phrase on pulse 6. Call and response, which is how
the music actually works.

**Music design rules:**
1. A new area reuses an existing track unless it is *thematically* new.
2. Maximum nine tracks. Beyond that they stop having identities.
3. The boss track is the only one permitted dissonance.
4. Master bus at 0.55; a shared delay (240 ms, 0.28 feedback, 0.30 wet) sits under
   the bells, opi and guitar but never the drums.
5. **Drone** under everything at 0.042 gain, tuned to the scale root an octave
   down, changed with `setTargetAtTime` so transitions glide.

## 9.5 Voices

Not recordings. Per-character synthesized blips fired every third character as
text types out, with a distinct profile per speaker.

| Speaker | Base | Wave | Vol | Jitter | Length | Growl |
|---|---|---|---|---|---|---|
| `narr` | 118 Hz | triangle | .055 | 14 | 75 ms | — |
| `boss` | 74 Hz | sawtooth | .075 | 9 | 105 ms | yes |
| `you` | 186 Hz | sine | .042 | 22 | 55 ms | — |
| `mirror` | 520 Hz | sine | .038 | 60 | 90 ms | — |
| `ala` | 96 Hz | square | .050 | 10 | 90 ms | — |

The growl layer adds bandpassed noise at 320 Hz — it is what makes Ogbunabali
sound like something with a chest.

**The deepening plan** (this is what "voice acting" becomes, §01.9):
1. Drive blip length from the actual vowel in each character, not a fixed rate.
2. Insert a breath pause at commas and full stops.
3. Add a formant filter pair per speaker so profiles differ in *timbre*, not just
   pitch.
4. Add profiles: `ekwensu` (two voices at a fifth apart), `onwe` (the `you`
   profile pitched down 15% — it should be *almost* your voice).

## 9.6 SFX

Every sound is a function. Categories and their rules:

- **Swing** — noise burst + a short falling square. Quiet; the hit is the event.
- **Hit** — noise at 200 Hz + a falling sawtooth. Scales with damage.
- **Muffled** — low-passed, dull, deliberately *unsatisfying*. The sound of a
  weapon failing on an unnamed boss.
- **Block** — high, metallic, short.
- **Parry** — the game's best sound: 1500 Hz square + 760 Hz triangle + bright
  noise. Should feel like a bell being struck by accident.
- **Break / execution** — long, low, with a bloom.
- **Name** — a 110 Hz sine over 800 ms with a triangle over it. Used for
  everything sacred: naming, mirrors attuning, purchases, weapons found.
- **Pick** — a 45 ms dry noise transient at 1800 Hz plus a short triangle rising
  560 → 760 Hz. Handling, not consecration: taking hold of a weapon or changing
  the word in your mouth. Both `cycleWeapon()` and `cycleSpell()` end in it, and
  they must stay identical — a swap that sounds bigger one way than the other
  tells the player something untrue about which choice mattered.

**Rules:**
1. Nothing loops except the music.
2. No sound longer than 800 ms except the drone.
3. Every mechanical event has a sound. Silence is a bug, not a style.
4. Volume ceiling per one-shot: 0.08.

## 9.7 The unlock problem — never regress this

Browsers will not start audio without a gesture, and they will silently give you
a suspended context that looks fine.

**The shipped solution, which must be preserved:**
1. `initAudio()` creates the context **and plays a one-sample silent buffer** —
   the handshake iOS and Chrome want.
2. It always calls `resume()`, awaits it, and re-checks state.
3. It is wired to `keydown`, `pointerdown`, `touchstart`, `mousedown` **and**
   every touch button.
4. `afterAudio()` starts the room's music the moment the context genuinely
   becomes `running`.
5. A watchdog in `update()` re-checks every 45 frames and starts the music if the
   unlock arrived late.
6. `audioState()` returns `on | muted | blocked | off`, and the HUD shows it
   honestly. If a browser refuses, the game says so rather than pretending.

This cost a real debugging session. Do not simplify it.
