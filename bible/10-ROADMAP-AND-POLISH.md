# 10 — Roadmap, Polish Checklist and Definition of Done

## 10.1 Where the project stands

Shipping. Thirteen rooms, five bosses, fifteen enemy types, four NPCs, four weapons, four spells, a
tutorial, a codex, an ending, fast travel, two save slots, a speedrun mode, and a
test suite. Roughly 90 minutes for a first completion.

**Phase 2 is closed.** All twelve items are built, and the audio and world chapters
have no `[NOT BUILT]` gaps left in them.

Phase 1 is **closed**. Both crash-class bugs are fixed, `tools/audit.py` is clean and
wired into `node test.js`, and the loop can no longer be killed by a throw.

## 10.2 The roadmap

### Phase 1 — Stability (blocking)
| # | Item | Notes |
|---|---|---|
| 1.1 | ~~Room 9 `M` tile with no `MIRRORS` entry~~ | **Done.** Was exactly as diagnosed. Guarded by a test that answers every mirror correctly. |
| 1.2 | ~~`MIRRORS` entries for rooms 8 and 9~~ | **Done.** Mirror at the Forge, Mirror under the Open Sky. Room 8 needed an `M` tile too. |
| 1.3 | ~~Defensive fallbacks in the mirror path~~ | **Done.** `mirrorInfo()` falls back to the room name and warns once. Empty travel list no longer divides by zero. |
| 1.4 | ~~try/catch around the `frame()` body~~ | **Done.** Sets `G.crashed`, draws a one-line notice, restores `ctx` from `baseCtx`, keeps pumping rAF. |
| 1.5 | ~~Fix everything the audit reports~~ | **Done.** 4 problems to 0: room 9 mirror, room 3 to room 2 landing, two embedded spawns in room 6. |
| 1.6 | ~~Runtime de-embed~~ | **Done.** `unstickPlayer()` runs first in `playerUpdate`, searches outward preferring up, falls back to the last charm. Silent. |
| 1.7 | ~~Regression tests plus the audit wired in~~ | **Done.** 623 assertions. The audit is now the first section of the suite. |

### Phase 2 — Content (the doubling)
| # | Item | Value |
|---|---|---|
| 2.1 | ~~Four NPCs~~ | **Done.** dibia, market woman, younger ọgbanje, mother's shade. |
| 2.2 | ~~Boss in room 9~~ | **Done.** Ikuku, named by Midas. Never lands; sweeps you up, stoops you off. Gates room 7. |
| 2.3 | ~~Boss in room 8~~ | **Done.** Ụzụ Ọkụ. Poise refills 7× faster than a normal enemy. Gates room 9. |
| 2.4 | ~~Six enemies~~ | **Done.** healer, mimic, grappler, pair, swimmer, wall-crawler. Roster is nine → fifteen. |
| 2.5 | ~~Endings B and C~~ | **Done.** Nlọghachi by refusing the execution, Onye Ọma by killing nothing avoidable. |
| 2.6 | ~~Weapon-specific heavy shapes~~ | **Done.** lunge / flurry / sweep / slam-with-burning-ground. |
| 2.7 | ~~Charms~~ | **Done.** Three cords, five charms, bought at the ledger, worn from the pause menu. |
| 2.8 | ~~Bone road music; Ekwensu and Onwe themes~~ | **Done.** `bone` is its own track. Onwe's theme is the opening theme in retrograde, built by a function so it cannot drift. |
| 2.9 | ~~Three rooms: ogilisi tree, second market, dibia's compound~~ | **Done.** Rooms 10, 11 and 12. |
| 2.10 | ~~Ambient beds per room~~ | **Done.** One looping noise source per track, filter and gain only. |
| 2.12 | ~~Ụzụ and Ikuku themes; ducking under speech~~ | **Done.** The audio chapter has no gaps left. |
| 2.11 | ~~Per-boss title cards~~ | **Done.** Name and epithet, read out of the bestiary, over a struck-bell stinger. Cheap, big perceived-quality win. |

### Phase 3 — Depth
| # | Item | Notes |
|---|---|---|
| 3.1 | ~~Rebindable keys~~ | **Done.** Remapped at the event boundary; no game logic knows. |
| 3.2 | ~~Accessibility: parry assist, text size, reduced motion, reduced flashing, colourblind tells~~ | **Done.** All five, on one screen, reachable from the title. |
| 3.3 | ~~Codex expansion; nine graves thread~~ | **Done.** The row in room 10; the entry grows as you walk it. |
| 3.4 | ~~Day/night cycle~~ | **Done, deliberately narrowed.** The night turns; it never becomes day. See 03-WORLD §3.6 for why. |
| 3.5 | ~~Water surface, ripples, reflections in Iyi Idemili~~ | **Done.** The wet floor holds what stands on it. |
| 3.6 | ~~Heat shimmer as real distortion in the fire room~~ | **Done.** Real strip distortion, 1.4 ms after a rewrite from 92.7. |
| 3.7 | Logo lockup and title key art |
| 3.8 | Boss rush from the codex |
| 3.9 | Photo mode |
| 3.10 | NG+ framed as *chi* |

### Phase 4 — If the project keeps going
Playable village prologue · harmattan and rain weather · Idemili's python as an optional
non-lethal boss · more weapons · a second speedrun category.

### Explicitly not on the roadmap
40 bosses · 200 enemy types · recorded voice acting · procedural generation · multiplayer
· crafting · a difficulty selector. See `01-VISION.md` §1.9 and §1.10.

## 10.3 The polish checklist

Work it top to bottom. Tick nothing you haven't verified in a browser.

### Stability (1–20)
1. [ ] `frame()` body is inside try/catch and keeps pumping rAF
2. [ ] No table lookup can throw on a missing key
3. [ ] `tools/audit.py` clean
4. [ ] Every exit landing is standable in both directions
5. [ ] Player can never end a frame embedded in solid tiles
6. [ ] De-embed fallback returns to the last charm if it fails
7. [ ] No room is unreachable
8. [ ] Every `M` tile has a `MIRRORS` entry and vice versa
9. [ ] All five index-keyed tables are as long as `ROOMS`
10. [ ] Save never claims success when storage threw
11. [ ] Speedrun save cannot overwrite a normal save
12. [ ] Loading a save from a previous version fails soft, not hard
13. [ ] No NaN reachable in position, velocity, HP, ọfọ, or cowries
14. [ ] Both randomised soaks pass
15. [ ] No unbounded array
16. [ ] No `setInterval` left running after a mode change
17. [ ] Audio failure never blocks gameplay
18. [ ] Blur/refocus doesn't leave keys stuck down
19. [ ] Tab-out and back doesn't spiral the accumulator
20. [ ] Resize doesn't break `toLogical()` hit testing

### Combat feel (21–50)
21. [ ] Every attacking enemy telegraphs
22. [ ] Every telegraph is white or gold, never both
23. [ ] White is always parryable — no exceptions anywhere
24. [ ] Gold is visually louder than white
25. [ ] Wind-up is always longer than the strike
26. [ ] Every hit produces all seven impact-stack elements
27. [ ] Hitstop scales with damage
28. [ ] Parry is the brightest sound in the game
29. [ ] `muffle` plays on any hit that didn't count
30. [ ] Guard break freezes 11 frames and flashes gold
31. [ ] Execution has slow-motion and two blood decals
32. [ ] One swing lands once
33. [ ] Roll i-frames are 4–15 and feel like it
34. [ ] Roll-cancel out of recovery works from every attack
35. [ ] Charge ring is unmissable at full
36. [ ] Every weapon has a real drawback
37. [ ] Each weapon changes rhythm, not just numbers
38. [ ] Burn ticks visibly on the body
39. [ ] Every spell fills one of the four archetype roles
40. [ ] Ọfọ never regenerates passively
41. [ ] No enemy deals contact damage without a gold wind-up
42. [ ] No attack in the game exceeds 22 damage
43. [ ] Player can never be one-shot
44. [ ] Enemy knockback never pushes them off-screen
45. [ ] Bosses have both a white and a gold tell
46. [ ] Every boss has a 50% phase change that adds, not replaces
47. [ ] Bosses are executable and it extends their window
48. [ ] No more than four live enemies on one screen
49. [ ] No enemy spawns within 2 tiles of an exit
50. [ ] Combat is readable with every VFX firing at once

### Movement (51–65)
51. [ ] Coyote time 7 frames
52. [ ] Jump buffer 8 frames
53. [ ] Variable jump height
54. [ ] No gap over 3 tiles without a dash
55. [ ] No ledge over 3 tiles without a route
56. [ ] No pixel-perfect jump anywhere
57. [ ] Landing produces dust
58. [ ] Footsteps every 13 frames while moving
59. [ ] Pogo bounce is consistent
60. [ ] Ala's Fall breaks every cracked tile it should
61. [ ] Speedrun jump and air jump feel deliberate
62. [ ] Hazards damage and eject, never kill outright
63. [ ] No instant-death anything
64. [ ] Camera never shows outside the room
65. [ ] Camera doesn't jitter at room bounds

### Art (66–100)
66. [ ] Every enemy identifiable in flat-black silhouette
67. [ ] Distinct heights across the roster
68. [ ] Three-value rule on every object
69. [ ] Structure on `px`, detail on `pxf`
70. [ ] No colour outside `C` and the stone sets
71. [ ] Gold means only its two sanctioned things
72. [ ] Every room has its own stone set
73. [ ] Every room has its own ambient particle
74. [ ] Parallax haze increases with distance
75. [ ] Baked layers rebuild on room change
76. [ ] Nothing animated is inside the bake
77. [ ] Foreground scrolls faster than the player
78. [ ] Leaves react to `windAt()`
79. [ ] Raffia strands sway on independent phases
80. [ ] Nine strokes on the player's mask
81. [ ] Nine eyes on Ogbunabali
82. [ ] Chalk scars appear only when a boss is bound
83. [ ] Blood decals persist per room
84. [ ] Decals capped
85. [ ] Every light flickers on two frequencies
86. [ ] Off-screen lights culled
87. [ ] Vignette and grain always on
88. [ ] No flash above 0.5 alpha
89. [ ] Props never break a silhouette the player must read
90. [ ] Every prop is a seeded function call
91. [ ] Cutscene art is legible at a glance
92. [ ] Room name appears on entry
93. [ ] Boss name shows `???` until known
94. [ ] Weapon name is tinted to the weapon
95. [ ] Mirror is cyan attuned, grey unattuned
96. [ ] Rest charm glows gold when it is the active checkpoint
97. [ ] Trees have roots, bark, forked limbs and lit canopy
98. [ ] Dead trees have no canopy
99. [ ] Sky room reads as sky
100. [ ] Fire room breathes

### Audio (101–125)
101. [ ] Audio unlocks on key, pointer, touch and mouse
102. [ ] Silent-buffer handshake fires
103. [ ] `resume()` awaited, `audioReady` only when running
104. [ ] Watchdog re-checks every 45 frames
105. [ ] HUD speaker icon reflects real state
106. [ ] Title says so plainly when audio is blocked
107. [ ] Every room has a track
108. [ ] Bell timeline is 12 pulses everywhere
109. [ ] Boss track is the forest structure with a poisoned scale
110. [ ] Drone retunes on room change
111. [ ] Delay sends melody, not drums
112. [ ] Call-and-response fires on step 6
113. [ ] Music continues under cutscenes
114. [ ] `P` mutes everything
115. [ ] Nothing exceeds 0.08 gain
116. [ ] Every speaker has a voice profile
117. [ ] Voice blips fire every third character
118. [ ] Boss voice growls
119. [ ] No sound plays twice in one frame
120. [ ] Parry is the brightest cue
121. [ ] Every UI action has a sound
122. [ ] Spell and weapon swap sound identical
123. [ ] Purchases have a confirmation sound
124. [ ] Ambient beds per room *(Phase 3)*
125. [ ] Music ducks under cutscene voices *(Phase 3)*

### UI/UX (126–160)
126. [ ] HUD answers the five-second rule
127. [ ] Life rail notched every 50
128. [ ] Low health blinks; nothing else does
129. [ ] Gourds show carried and capacity
130. [ ] Cowries counted
131. [ ] Map, pause and sound icons are tap targets
132. [ ] Icons only active in play mode
133. [ ] HUD never covers the centre third
134. [ ] Boss bar shows `???` until named
135. [ ] Poise bar only while bound
136. [ ] Every menu is Z-confirm, X-back
137. [ ] Every menu is in `MENU_MODES`
138. [ ] Joystick snaps to one axis in menus
139. [ ] Hold-to-scroll after 20 frames, every 6
140. [ ] Selection resets when a menu opens
141. [ ] No menu deeper than two levels
142. [ ] No confirmation dialogs
143. [ ] CONTINUE shows a real progress beat and percentage
144. [ ] Codex reachable from title and pause
145. [ ] Bestiary lists only what you've killed
146. [ ] Map shows only visited rooms
147. [ ] Joystick can't reach HUD icons
148. [ ] Every touch button shows its key letter
149. [ ] No gestures anywhere
150. [ ] Inputs survive hitstop
151. [ ] No key overloaded against a movement meaning
152. [ ] Every label says what it does
153. [ ] Tutorial waits on the action, never a timer
154. [ ] Tutorial key badges match touch buttons
155. [ ] Tutorial skippable from pause
156. [ ] Cutscenes skippable
157. [ ] Speedrun mode on the title, described without shame
158. [ ] Rebindable keys *(Phase 3)*
159. [ ] Reduced motion *(Phase 3)*
160. [ ] Text size *(Phase 3)*

### Content and writing (161–185)
161. [ ] No exclamation marks anywhere
162. [ ] No archaic English
163. [ ] Bosses in quotes, narrator not
164. [ ] Igbo unglossed in dialogue, glossed in codex
165. [ ] No cutscene beat over ~110 characters
166. [ ] No line explains a mechanic in the fiction's voice
167. [ ] Ekwensu is not Satan
168. [ ] Ala Mmụọ is not hell
169. [ ] Every riddle is a real traditional form
170. [ ] The protagonist is never named
171. [ ] Every boss opens with a line that reframes the act
172. [ ] Every boss has an in and out cutscene
173. [ ] Every enemy has a bestiary entry
174. [ ] Every alusi ability matches the alusi's real domain
175. [ ] Nine appears everywhere and is never explained
176. [ ] The market stays warm
177. [ ] A rest charm precedes every boss room
178. [ ] Nothing is permanently missable
179. [ ] Ledger prices are round
180. [ ] Not everything is affordable in one run
181. [ ] Healing is never for sale
182. [ ] Knowledge is never for sale
183. [ ] Wrong riddle costs a walk, not a run
184. [ ] Endings retain the save
185. [ ] No credits crawl

### Performance and process (186–205)
186. [ ] 60 FPS in the fire room on mid-range Android
187. [ ] Under 8 ms JS per frame
188. [ ] Static art baked
189. [ ] Everything off-screen culled
190. [ ] No per-frame allocation in hot paths
191. [ ] No gradient created inside a per-tile loop
192. [ ] `font` set once per group
193. [ ] No canvas read-back
194. [ ] Frame-time overlay available behind a flag
195. [ ] `node test.js` under 30 seconds
196. [ ] Every system in the test export
197. [ ] Every fixed bug has a regression test
198. [ ] Tests hermetic — hitstop, slow, face, state reset
199. [ ] No assertion weakened to make it pass
200. [ ] Audit runs as part of the test suite
201. [ ] File still one file
202. [ ] No dependencies
203. [ ] No external assets
204. [ ] No network calls
205. [ ] Bible updated for every decision it didn't cover

## 10.4 Definition of done

**A feature:** implemented, tested, audited, played in a browser on keyboard and touch,
60 FPS in the heaviest room, text in the house style, bible updated, one commit.

**A bug fix:** reproduced, regression test written *first* and seen to fail, fixed,
both checks green, the *class* of bug considered — not just the instance.

**A release:** every Phase 1 item closed, checklist items 1–20 ticked without exception,
both soaks passing, a full playthrough completed start to ending by a human, and the
speedrun completed too.

## 10.5 The one thing to remember

This game's failure mode is not that it is too small. It is that it becomes a pile of
half-finished systems that all technically work. **Finish things. Then start things.**
