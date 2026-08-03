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
    for table in ('MAPPOS', 'ROOM_TRACK', 'AMBIENT'):
        m = re.search(r'const\s+' + table + r'\s*=\s*\[(.*?)\];', s, re.S)
        if not m:
            problems.append(f'{table}: not found')
            continue
        body = m.group(1)
        count = body.count('[') if table == 'MAPPOS' else len(re.findall(r"'", body)) // 2
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
                if ch in 'wltWvakirKBXOhF' + NPC_CHARS:
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
