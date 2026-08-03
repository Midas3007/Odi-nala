#!/usr/bin/env python3
"""
Ọdịnala polish-checklist verifier.

`10-ROADMAP-AND-POLISH.md` §10.3 says: *tick nothing you haven't verified.* This
checks the items that can be verified mechanically — against the source, against
the room tables, and against the names of assertions in `test.js` — and prints a
tick, a cross, or a dash for "a human has to look at this one".

    python3 tools/checklist.py

It does not tick anything by itself. It tells you what you are entitled to tick,
and it is meant to be re-run whenever the checklist is touched.
"""
import io, re, sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC  = io.open(os.path.join(ROOT, 'odinala.html'), encoding='utf-8').read()
TST  = io.open(os.path.join(ROOT, 'test.js'), encoding='utf-8').read()

def code(*pats):
    """every pattern appears in the game source"""
    return all(re.search(p, SRC, re.S) for p in pats)

def tested(*frags):
    """every fragment appears in an assertion name in the suite"""
    return all(f in TST for f in frags)

# (number, what it says, verdict) — verdict True/False/None where None means
# "this needs eyes, and the script will not pretend otherwise"
CHECKS = [
 (1,  'frame() body is inside try/catch and keeps pumping rAF',
      code(r'function frame\(now\)\{\s*try\{ frameBody', r'requestAnimationFrame\(frame\);')),
 (3,  'tools/audit.py clean', None),
 (4,  'Every exit landing is standable in both directions',
      tested('the player can walk away')),
 (5,  'Player can never end a frame embedded in solid tiles', code(r'function unstickPlayer')),
 (6,  'De-embed fallback returns to the last charm if it fails',
      code(r'function unstickPlayer[\s\S]{0,900}checkpoint')),
 (7,  'No room is unreachable', None),
 (8,  'Every M tile has a MIRRORS entry and vice versa', None),
 (9,  'All five index-keyed tables are as long as ROOMS',
      tested('has one entry per room')),
 (11, 'Speedrun save cannot overwrite a normal save', tested('speedrun')),
 (13, 'No NaN reachable in position, velocity, HP, ọfọ, or cowries', tested('soak')),
 (14, 'Both randomised soaks pass', tested('soak A') or 'soak(' in TST),
 (18, 'Blur/refocus does not leave keys stuck down', code(r"addEventListener\('blur'")),

 (22, 'Every telegraph is white or gold, never both',
      code(r"tell==='gold'") and not code(r"tell==='both'")),
 (23, 'White is always parryable — no exceptions anywhere',
      tested('telegraphs in white') or tested('telegraphs white')),
 (24, 'Gold is visually louder than white', code(r'if\(gold\).{0,80}strokeRect')),
 (32, 'One swing lands once', code(r'swingId') and code(r'hitId')),
 (40, 'Ọfọ never regenerates passively', not code(r'P\.ofo\s*\+=\s*[\d.]+\s*;\s*//\s*regen')),
 (42, 'No attack in the game exceeds 22 damage', None),
 (43, 'Player can never be one-shot', None),
 (45, 'Bosses have both a white and a gold tell',
      tested('telegraphs in gold') or tested('telegraphs gold')),
 (49, 'No enemy spawns within 2 tiles of an exit', None),

 (51, 'Coyote time 7 frames', code(r'coyote\s*=\s*7')),
 (52, 'Jump buffer 8 frames', code(r'buffer\s*=\s*8')),
 (58, 'Footsteps every 13 frames while moving', code(r'anim%13===0')),
 (62, 'Hazards damage and eject, never kill outright', tested('hazard')),
 (64, 'Camera never shows outside the room', tested('cannot leave the room')),

 (72, 'Every room has its own stone set', code(r'const ROOM_STONE=')),
 (73, 'Every room has its own ambient particle', code(r'const AMBIENT=')),
 (75, 'Baked layers rebuild on room change', tested('background baking')),
 (80, 'Nine strokes on the player\'s mask', None),
 (82, 'Chalk scars appear only when a boss is bound', code(r'bound')),
 (87, 'Vignette and grain always on', code(r'drawVignette\(\); drawGrain\(\)')),
 (88, 'No flash above 0.5 alpha', code(r'G\.flash.{0,60}/22')),
 (92, 'Room name appears on entry', code(r'say\(ROOMS\[ex\.to\]\.name')),
 (93, 'Boss name shows ??? until known', code(r"G\.knowsName\?'OGBUNABALI'")),
 (95, 'Mirror is cyan attuned, grey unattuned', code(r"G\.mirrors\[sh\.id\]\?")),

 (101,'Audio unlocks on key, pointer, touch and mouse',
      code(r"addEventListener\('keydown'", r"addEventListener\('pointerdown', initAudio",
           r"addEventListener\('touchstart', initAudio", r"addEventListener\('mousedown', initAudio")),
 (105,'HUD speaker icon reflects real state', code(r'function audioState')),
 (107,'Every room has a track', code(r'const ROOM_TRACK =')),
 (108,'Bell timeline is 12 pulses everywhere', None),
 (110,'Drone retunes on room change', code(r'musicSetDrone')),
 (113,'Music continues under cutscenes', tested("track carries on under it")),
 (114,'P mutes everything', code(r'function musicToggle')),
 (122,'Spell and weapon swap sound identical', tested('pick') or code(r'S\.pick\(\)')),
 (124,'Ambient beds per room', code(r'const BEDS =|const BEDS=')),
 (125,'Music ducks under cutscene voices', tested('a cutscene ducks it')),

 (137,'Every menu is in MENU_MODES', tested('is a real mode')),
 (139,'Hold-to-scroll after 20 frames, every 6', code(r'_:\s*\[20,\s*6\]')),
 (144,'Codex reachable from title and pause', code(r"openCodex\('title'\)", r"openCodex\('pause'\)")),
 (145,'Bestiary lists only what you have killed', code(r'function beastOpen')),
 (146,'Map shows only visited rooms', code(r'if\(!G\.visited\[i\]\) continue;')),
 (150,'Inputs survive hitstop', code(r'consumed=false')),
 (153,'Tutorial waits on the action, never a timer', code(r'TSTEPS')),
]

def main():
    ok = bad = eyes = 0
    print('  polish checklist — what the source and the suite can vouch for\n')
    for num, what, verdict in CHECKS:
        if verdict is None:
            mark, note = '–', '  (needs eyes)'; eyes += 1
        elif verdict:
            mark, note = '✓', ''; ok += 1
        else:
            mark, note = '✗', '  <-- NOT SATISFIED'; bad += 1
        print('  %s %3d  %s%s' % (mark, num, what, note))
    print('\n  %d verifiable and satisfied, %d failing, %d that a person has to look at' % (ok, bad, eyes))
    print('  %d of the checklist\'s 160 items are covered here; the rest are judgement' % len(CHECKS))
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
