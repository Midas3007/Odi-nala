# 12 — Roadmap, Polish Checklist and Definition of Done

## 12.1 Where the game is

**Shipped and working:** 10 rooms · 4 bosses · 9 enemy species · 4 weapons ·
4 spells × 3 levels · 5 skills · tutorial · codex (lore + bestiary) · riddle
mirrors + fast travel · cowrie economy + ledger · map · pause + inventory ·
save/load with two slots · speedrun mode · one ending · procedural soundtrack ·
synthesized voices · 218 passing assertions.

**The honest gaps:** one ending where three are designed · no accessibility
options beyond speedrun · no weather · no NG+ · six bosses and thirteen enemy
species unbuilt · no charms/relics · the market and water rooms are thin on
content relative to their atmosphere.

## 12.2 Phased roadmap

### Phase 1 — Finish what is started (highest value)
1. **Accessibility pass.** Screen-shake slider, grain/flash toggles, Slow Ward,
   text scale, remappable keys. Highest value per hour of work in the whole list.
2. **Ending 2 — The Return.** The choice at the door. The structure is stubbed.
3. **Content density in rooms 4 and 5.** They are the prettiest and the emptiest.
   Two encounters each, one lore stone each, one secret.
4. **The Market Debt boss.** The best of the unbuilt six (§07.3).
5. **Weather.** Rain in Ọhịa, ash in Ọkụ, dust on the bone road.

### Phase 2 — Breadth
6. Six new enemy species from the §06.3 list, biome-appropriate.
7. Variant system — palette/scale/dressing swaps, no new AI.
8. Two new bosses: Nne Mmiri and Ọkụ Nna.
9. Two new rooms to house them.
10. Charms/relics — 12 passives, one slot at first, three by the end.

### Phase 3 — Depth
11. **NG+.** Keep weapons, spells, skills, codex. Reset the world. Faster tells
    (never below the 14-frame floor), +40% enemy health, one new attack per boss.
12. **Ending 3 — The Ninth Name.** The hidden one. Requires the tenth chalk stone.
13. Boss rush from the codex.
14. Weapon-specific heavy attacks.
15. The voice deepening (§09.5).

### Phase 4 — Polish and extras
16. Photo mode.
17. The remaining bosses and species to the 10/22 targets.
18. Igwe super-boss.
19. Full polish checklist pass (§12.4).

**Sequencing rule:** never start a phase before the previous one's items are
*done* by §12.5's definition. This project's greatest risk is breadth without
finish.

## 12.3 Prioritisation rule

When choosing what to build next, in order:

1. Does it fix something **broken**?
2. Does it remove a **barrier** (accessibility, clarity, a bug)?
3. Does it **finish** something already half-built?
4. Does it deepen a system the player already uses?
5. Does it add a new system?

**Never work at level 5 while anything sits at level 1 or 2.**

## 12.4 The polish checklist

Two hundred and twelve items. Tick them; do not skim them.

### Combat feel (1–24)
1. Every attack has a wind-up pose distinct from neutral
2. Every wind-up ≥ 14 frames
3. Every tell is set for the whole wind-up and cleared on the active frame
4. White and gold are visually distinct at 32px
5. Gold tells have a doubled outline as well as a colour
6. Hitstop scales with damage
7. Only one shake source dominates at a time
8. Every hit has a sound
9. Muffled hits sound and feel worse than clean ones
10. Blood decals persist and do not fade
11. Hit sparks are directional
12. Fast particles leave trails
13. Every death particle inherits the killing blow's direction
14. Roll i-frames are 4–15 and never change
15. Roll-cancel works out of attack recovery
16. Parry window is 9 frames and requires facing the attack
17. A parry that lands feels better than a hit that lands
18. Guard break has its own sound, flash and prompt
19. Executions have slow motion
20. Input survives hitstop
21. Coyote time works off every ledge
22. Jump buffer works into every landing
23. No attack can be cancelled into another attack
24. Every enemy is punishable after its biggest attack

### Enemies (25–44)
25. Every enemy has one stated lesson
26. Every enemy is identifiable as a silhouette
27. No two gold-tell enemies share an encounter
28. Never more than 3 enemies near the player
29. New species introduced alone, second in a room
30. Every enemy has a bestiary entry
31. Bestiary entries state no frame data
32. Poise bars appear only when damaged
33. Broken enemies glow gold with a Z prompt
34. Poise regenerates after 150 idle frames
35. Ranged lines of fire always cross geometry
36. Enemies never spawn within 4 tiles of an exit
37. Enemies respect one-way platforms
38. Enemies turn at ledges
39. Enemies do not stack on one another
40. Off-screen enemies do not attack
41. Burning enemies show flames
42. Every enemy drops cowries
43. Every enemy can be parried or explicitly cannot, never ambiguously
44. Every enemy has a distinct death sound or particle colour

### Bosses (45–62)
45. Each has a one-sentence thesis
46. Each has a hook no other has
47. 3–5 attacks, ≥1 white, ≥1 gold
48. Two phases minimum with a visible transformation
49. No boss heals on a phase change
50. Health bar with a name label
51. `???` where the name is content
52. Intro cutscene ≤ 2 beats
53. Outro cutscene ≤ 3 beats
54. Death grants a tool, opens a gate, or ends the game
55. Arena is flat and wide
56. A charm within 60 seconds of the door
57. A 3–5 second empty corridor before entry
58. Door locks on entry, unlocks on either death
59. Music switches on entry and back on death
60. Beatable with every weapon — verified
61. `G.slain` flag set
62. Lore entry unlocked

### World and level (63–86)
63. Every room reachable from another room's exits
64. Every exit wired both ways or deliberately one-way
65. Every arrival tile is solid ground
66. No unaided jump exceeds 3 tiles
67. Every gap over 5 tiles has a visible reason
68. Every gate's key is visible before it is found
69. Charms 60–120 seconds apart
70. Every room has one thing worth finding
71. Every room has one quiet stretch of 6+ tiles
72. All five room-indexed tables updated
73. Room has a `STONE` palette row
74. Room has an ambient particle type
75. Room has a music track
76. Room has a declared hour and matching light
77. Room has a foreground layer
78. Baked background layers rebuild on room change
79. Camera clamps to room bounds
80. Camera never shows outside the map
81. No tile pops in at the screen edge
82. Hazards are visually obvious
83. Hazards knock the player clear
84. One-way drops are visible before you take them
85. Every mirror lands you on solid ground
86. Map shows only visited rooms

### Art (87–112)
87. Nothing is a rectangle that should be a shape
88. Every tree has roots, taper, lean, bark, forked limbs, canopy
89. Dead trees strip the canopy and add strands
90. Every mask has a top light edge and an under-shadow
91. Every mask has carved brows as separate strokes
92. Nose is a ridge, not a nose
93. Eyes are holes with a highlight, or cowries
94. Horns derive from the ikenga
95. Skulls have a separate jaw mass
96. Figures elongate; heads slightly small
97. Bosses are 2–3× player height
98. Silhouette readable as black at 32px
99. Ledges have grass blades at half-pixel
100. Overhangs have hanging growth
101. Ground has strata and flecks
102. Water has drips on a timer
103. Sky has three cloud banks lit along the top
104. Fire breathes on a cycle
105. Lava surface moves
106. Parallax uses haze alpha as well as speed
107. Foreground responds to `windAt()`
108. No pure white, no pure black
109. Saturated colour only on lights and tells
110. Rim light on the player's lit edge
111. Idle bob on everything alive
112. Landing has a squash frame

### Lighting and VFX (113–130)
113. One warm source per scene, two at most
114. Every light flickers
115. Every light has a colour, not just brightness
116. Lights cull off-screen
117. Darkness is the default state
118. Grain at 0.05, re-seeded each frame
119. Vignette always on
120. No bloom on everything
121. No lens flare
122. Chromatic effect only on parry
123. Particle count under budget
124. Decal count under budget
125. Ambient motes on two depth planes
126. Ambient motes wind-driven
127. Weather is particles plus a light shift, never an overlay
128. Screen flash never washes the frame
129. Every VFX has an off switch for accessibility
130. No effect obscures a tell

### Audio (131–150)
131. Audio unlock handshake includes the silent buffer
132. `resume()` is awaited and re-checked
133. Unlock wired to key, pointer, touch, mouse and every touch button
134. Music starts when the context genuinely runs
135. Watchdog re-checks every 45 frames
136. `audioState()` reports honestly
137. HUD shows blocked audio
138. All rhythm in 12 pulses
139. Bell timeline never changes within a track
140. Every room has a track
141. Boss track is the only dissonant one
142. Drone glides between rooms
143. Delay on bells, opi, guitar; never drums
144. Every mechanical event has a sound
145. Nothing loops but the music
146. No one-shot over 800 ms
147. One-shot volume ceiling 0.08
148. Every speaker has a voice profile
149. Voice blips fire on non-space characters
150. Mute persists across rooms

### UI (151–176)
151. Serif for the world, sans for the game, never mixed in a line
152. HUD drawn as chalk marks
153. Nothing animates unless it is saying something
154. Health flashes below 25%
155. ọfọ shimmers only at full
156. Gourds show count and capacity
157. Cowries counted with an icon
158. Map, pause and sound icons are tappable
159. Touch buttons carry their key letters
160. Prompts name their key
161. Joystick snaps to one direction in menus
162. Joystick cannot reach the HUD icons
163. Hold-to-scroll works in every menu
164. Every mode is in `MENU_MODES`
165. Every mode has an exit key
166. ESC closes every screen
167. Banner text is one sentence
168. Cutscene beats are skippable
169. Codex never gets ahead of the player
170. Codex shows found, never missing
171. CONTINUE shows story progress
172. Save confirms honestly when storage is blocked
173. Speedrun badge visible when active
174. Boss bar shows `???` where appropriate
175. No text is clipped at 480×270
176. No text overlaps the play area during combat

### Technical (177–200)
177. One file, no build, no libraries, no assets
178. `node test.js` → 0 failures
179. New system ships with new assertions
180. Bug fix ships with a regression test
181. Two soaks include every mode
182. `ctx` restored after every swap
183. `pressed` clears only when `update()` ran
184. `swingId`/`hitId` respected by every damage path
185. `CHAIN().length` never hardcoded
186. Static art baked, animated art per-frame
187. All five room-indexed tables in sync
188. Save slots keyed in the memory fallback
189. No allocation in hot paths
190. Every draw loop culls by camera
191. No gradient created inside an entity loop
192. Canvas ops under budget
193. 60 FPS on a low-end Android — measured, not assumed
194. Runs from `file://` with no network
195. Runs with `localStorage` disabled
196. Runs with audio blocked
197. Runs at any window aspect ratio
198. No console errors in a full playthrough
199. No memory growth over 20 minutes
200. `CLAUDE.md` updated with every new system

### Culture (201–212)
201. Every Igbo word is spelled correctly with proper diacritics
202. Every deity's domain matches belief
203. Ekwensu is never written as satanic
204. Every riddle is grammatically correct Igbo
205. Riddle answers are concrete nouns
206. Masks reference real mmanwụ, not generic skulls
207. Nine means the cycle, always, and is never used casually
208. No invented Igbo word ships without being marked (G)
209. The lore bible marks every entry (R) or (G)
210. Nothing is included because it sounded exotic
211. The mother is never depicted
212. The ending never returns her

## 12.5 Definition of Done

A feature is **done** when all nine are true. Not eight.

1. **It works** — manually played, not just tested
2. **It is tested** — new assertions exist and `node test.js` reports 0 failures
3. **It is on-pillar** — you can name which of the five pillars it serves
4. **It looks right** — meets §08's standards, not "placeholder for now"
5. **It sounds right** — has its sound; silence is a bug
6. **It is legible** — the player can tell what happened and why
7. **It performs** — measured on a real low-end device, still 60 FPS
8. **It is documented** — `CLAUDE.md` and the relevant bible chapter updated
9. **It is culturally checked** — §12.4 items 201–212 hold

**"Placeholder" is not a state this project has.** If it is not done, it is not
merged. A smaller finished game beats a larger unfinished one, every time.
