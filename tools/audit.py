#!/usr/bin/env python3
"""
Ọdịnala static audit.

Finds the class of bug that has cost this project the most time: data tables that
are keyed by room index and have drifted out of sync, and geometry that puts the
player somewhere they cannot leave.

    python3 tools/audit.py odinala.html

Exits non-zero if anything is wrong, so it can go in a pre-commit hook.
"""
import io, re, sys

SOLID = set('#c')
NPC_CHARS = ''
PLATFORM = set('-')

def load(path):
    s = io.open(path, encoding='utf-8').read()
    blocks = re.findall(
        r'\{ name:"(.*?)",\s*tint.*?map:\[(.*?)\],\s*\n\s*exits:\[(.*?)\]\s*\}',
        s, re.S)
    rooms = []
    for name, mp, ex in blocks:
        rows = re.findall(r'"([^"]*)"', mp)
        rooms.append({'name': name, 'rows': rows, 'exits': ex})
    return s, rooms

def at(rows, x, y):
    if y < 0 or y >= len(rows):
        return '#'
    r = rows[y]
    return '#' if x < 0 or x >= len(r) else r[x]

def main(path):
    s, rooms = load(path)
    problems = []

    # NPC spawn chars come from the game itself, so adding an NPC cannot quietly
    # opt it out of the embedded-in-solid check below
    global NPC_CHARS
    NPC_CHARS = ''.join(re.findall(r"ch:'(.)'", s))

    # ---- 1. every index-keyed table must be as long as ROOMS -----------------
    n = len(rooms)
    for table in ('MAPPOS', 'ROOM_TRACK', 'AMBIENT', 'ROOM_STONE'):
        m = re.search(r'const\s+' + table + r'\s*=\s*\[(.*?)\];', s, re.S)
        if not m:
            problems.append(f'{table}: not found')
            continue
        body = m.group(1)
        if table == 'MAPPOS':
            count = body.count('[')
        elif table == 'ROOM_STONE':
            count = len(re.findall(r'\d+', body))
        else:
            count = len(re.findall(r"'", body)) // 2
        if count < n:
            problems.append(
                f'{table} has {count} entries but there are {n} rooms — '
                f'rooms {count}..{n-1} will fall back or crash')

    # ---- 2. every M tile needs a MIRRORS entry (this froze the game) --------
    m = re.search(r'const MIRRORS\s*=\s*\{(.*?)\n\};', s, re.S)
    keys = set(re.findall(r'\n\s*(\d+)\s*:', m.group(1))) if m else set()
    for i, r in enumerate(rooms):
        if 'M' in ''.join(r['rows']) and str(i) not in keys:
            problems.append(
                f'room {i} ({r["name"][:30]}) has an M tile but MIRRORS has no '
                f'entry for it — answering its riddle correctly will throw and '
                f'kill the requestAnimationFrame loop')
    for k in keys:
        if int(k) >= n or 'M' not in ''.join(rooms[int(k)]['rows']):
            problems.append(f'MIRRORS[{k}] points at a room with no M tile')

    # ---- 3. exit landings must be standable ---------------------------------
    for i, r in enumerate(rooms):
        for to, sx, sy in re.findall(r'to:(\d+),\s*sx:(\d+),\s*sy:(\d+)', r['exits']):
            to, sx, sy = int(to), int(sx), int(sy)
            if to >= n:
                problems.append(f'room {i} exit -> room {to}: no such room')
                continue
            t = rooms[to]['rows']
            body = [at(t, sx, sy - 1), at(t, sx, sy - 2)]
            floor = at(t, sx, sy)
            if any(b in SOLID for b in body):
                problems.append(
                    f'room {i} -> room {to} lands at ({sx},{sy}) INSIDE GEOMETRY '
                    f'— body occupies {body}. This is a soft-lock.')
            elif floor not in SOLID and floor not in PLATFORM:
                problems.append(
                    f'room {i} -> room {to} lands at ({sx},{sy}) with no floor '
                    f"(tile '{floor}') — the player will fall on arrival")

    # ---- 3b. exit rects and E tiles must agree exactly ----------------------
    # An exit is a rect tested against the player's body, and the E tile is what
    # paints the doorway — in the world and as a gold square on the map. Nothing
    # ties them together, so they drift. Room 3's way out of the first boss room
    # had no E tile at all: the trigger worked and the doorway was invisible.
    # Rooms 0 and 6 had the opposite drift, their rects sitting one column past
    # the doorway on tiles that padEnd() had filled with rock; both fired only
    # because the player's body overlapped the rect by a single pixel before
    # collision stopped it. Require the two to line up exactly, both ways.
    for i, r in enumerate(rooms):
        rows = r['rows']
        w = max(len(row) for row in rows)
        padded = [row.ljust(w, '#') for row in rows]
        ragged = [y for y, row in enumerate(rows) if len(row) != w]
        if ragged:
            problems.append(
                f'room {i} has short map rows {ragged} — they are padded with '
                f'rock, which silently turns whatever should be at the end of '
                f'those rows into wall')
        covered = set()
        for tx, ty, tw, th, to in re.findall(
                r'\{tx:(\d+),ty:(\d+),tw:(\d+),th:(\d+),to:(\d+)', r['exits']):
            tx, ty, tw, th, to = int(tx), int(ty), int(tw), int(th), int(to)
            for y in range(ty, ty + th):
                for x in range(tx, tx + tw):
                    covered.add((x, y))
                    ch = at(padded, x, y)
                    if ch != 'E':
                        problems.append(
                            f"room {i} exit -> room {to}: rect tile ({x},{y}) is "
                            f"'{ch}', not 'E' — the trigger and the doorway art "
                            f"are in different places")
        for y, row in enumerate(padded):
            for x, ch in enumerate(row):
                if ch == 'E' and (x, y) not in covered:
                    problems.append(
                        f'room {i} has an E tile at ({x},{y}) that no exit rect '
                        f'covers — a doorway the player can walk into forever')

    # ---- 4. every room except 0 must be reachable ---------------------------
    reach = set()
    for r in rooms:
        for to in re.findall(r'to:(\d+)', r['exits']):
            reach.add(int(to))
    for i in range(1, n):
        if i not in reach:
            problems.append(f'room {i} ({rooms[i]["name"][:30]}) is unreachable')

    # ---- 5. spawn chars must not sit inside solid ---------------------------
    for i, r in enumerate(rooms):
        for y, row in enumerate(r['rows']):
            for x, ch in enumerate(row):
                # 'b' hangs from the ceiling, so for it the rule inverts: it needs
                # solid directly above and clear air below. Everything else must
                # have neither its own tile nor the one above it inside rock.
                if ch == 'b':
                    if at(r['rows'], x, y) in SOLID:
                        problems.append(f"room {i}: ceiling-dweller 'b' at ({x},{y}) is inside solid")
                    elif at(r['rows'], x, y - 1) not in SOLID:
                        problems.append(
                            f"room {i}: ceiling-dweller 'b' at ({x},{y}) has no ceiling above it "
                            f"(tile is '{at(r['rows'], x, y - 1)}') — it would hang in mid-air")
                # n q j s p are the six added in 2c and U I the two bosses added
                # in 2b; none of them were in this string, so half the roster
                # could sit inside rock and the audit would have said nothing.
                elif ch in 'wltWvakirnqjspKBXOUIhFx' + NPC_CHARS:
                    if at(r['rows'], x, y) in SOLID or at(r['rows'], x, y - 1) in SOLID:
                        problems.append(
                            f"room {i}: spawn '{ch}' at ({x},{y}) is embedded in solid")

    if problems:
        print(f'AUDIT FAILED — {len(problems)} problem(s)\n')
        for p in problems:
            print('  ✗ ' + p)
        return 1
    print(f'audit clean — {n} rooms, all tables aligned, all landings standable')
    return 0

if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'odinala.html'))
