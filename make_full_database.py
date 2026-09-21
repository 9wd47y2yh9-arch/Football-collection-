# -*- coding: utf-8 -*-
import json
import re
import sys
import random
import unicodedata

sys.path.append('.')
from scripts.legends import LEGENDS_LIST
from scripts.rosters_europe import EUROPE_PLAYERS
from scripts.rosters_world import WORLD_PLAYERS
from scripts.rosters_extended import EXTENDED_REAL_PLAYERS
from scripts.rosters_massive import MASSIVE_REAL_PLAYERS

# 1. Read existing real players from src/data/players.ts
with open('src/data/players.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

players_text = ''.join(lines[2:42405]).strip()
if players_text.startswith('export const PLAYERS_DATABASE: Player[] = '):
    players_text = players_text[len('export const PLAYERS_DATABASE: Player[] = '):]
if players_text.endswith(';'):
    players_text = players_text[:-1]

existing_all = json.loads(players_text)
# Filter out fictional placeholders
existing_real = [p for p in existing_all if not any(k in p.get('id', '') for k in ['プレミ', 'ラリー', 'セリエ', 'ブンデ', 'リーグ'])]

print(f"Retained {len(existing_real)} existing verified real players.")

# Track existing names to prevent duplicate entries
seen_names = set()
for p in existing_real:
    seen_names.add(p['name'].strip())
    seen_names.add(p.get('enName', '').strip().lower())
    p['status'] = 'active'
    p['isRegularCard'] = True
    p['isLegendPool'] = False

# 2. Add new real players from our comprehensive scripts
new_active_tuples = EUROPE_PLAYERS + WORLD_PLAYERS + EXTENDED_REAL_PLAYERS + MASSIVE_REAL_PLAYERS
added_active_count = 0

def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

dates = ["09/16", "09/17", "09/18", "09/19", "09/20"]

for item in new_active_tuples:
    # item: (name_ja, name_kana, name_en, club, league, nationality, position, number, ovr, rarity, age, height, foot, careerBio)
    name_ja = item[0].strip()
    name_en = item[2].strip()
    if name_ja in seen_names or name_en.lower() in seen_names:
        continue
    seen_names.add(name_ja)
    seen_names.add(name_en.lower())

    slug = slugify(name_en)
    if not slug:
        slug = f"player-{random.randint(1000, 9999)}"
    pid = f"p-{slug}-{item[7]}"

    rarity = item[9]
    ovr = item[8]
    if rarity == 'SSR':
        base_issue = 2000
        base_price = int(ovr * 1800 + random.randint(10000, 30000))
    elif rarity == 'SR':
        base_issue = 5000
        base_price = int(ovr * 700 + random.randint(5000, 15000))
    elif rarity == 'R':
        base_issue = 10000
        base_price = int(ovr * 150 + random.randint(1000, 4000))
    else:
        base_issue = 25000
        base_price = int(ovr * 15 + random.randint(100, 400))

    rem_issue = max(10, base_issue - random.randint(5, 80))
    
    ph = []
    curr = base_price
    for d in dates:
        factor = 1.0 + (random.randint(-6, 6) / 100.0)
        curr = int(curr * factor)
        ph.append({"date": d, "price": curr})

    player_obj = {
        "id": pid,
        "name": name_ja,
        "kanaName": item[1].strip(),
        "enName": name_en,
        "jaName": name_ja,
        "esName": name_en,
        "club": item[3].strip(),
        "league": item[4].strip(),
        "nationality": item[5].strip(),
        "position": item[6].strip(),
        "number": item[7],
        "ovr": ovr,
        "rarity": rarity,
        "age": item[10],
        "height": item[11],
        "foot": item[12],
        "careerBio": item[13].strip(),
        "baseIssueCount": base_issue,
        "remainingIssueCount": rem_issue,
        "basePrice": base_price,
        "priceHistory": ph,
        "status": "active",
        "isRegularCard": True,
        "isLegendPool": False
    }
    existing_real.append(player_obj)
    added_active_count += 1

print(f"Added {added_active_count} new real active players. Total active: {len(existing_real)}")

# 3. Build LEGENDS list (108 verified real legends)
# Tuple: (name_ja, name_kana, name_en, club, nationality, position, number, ovr, rarity, age, height, foot, careerBio, league)
legends_objects = []
for idx, item in enumerate(LEGENDS_LIST):
    name_ja = item[0].strip()
    name_kana = item[1].strip()
    name_en = item[2].strip()
    club = item[3].strip()
    nationality = item[4].strip()
    position = item[5].strip()
    number = item[6]
    ovr = item[7]
    rarity = item[8]
    age = item[9]
    height = item[10]
    foot = item[11]
    career_bio = item[12].strip()
    league = item[13].strip()

    slug = slugify(name_en)
    leg_id = f"leg-{slug}-{idx+1}"

    base_issue = 1000 if rarity == 'SSR' else 3000
    base_price = int(ovr * 2500 + random.randint(20000, 50000)) if rarity == 'SSR' else int(ovr * 1200 + random.randint(10000, 25000))
    rem_issue = max(5, base_issue - random.randint(10, 50))
    
    ph = []
    curr = base_price
    for d in dates:
        factor = 1.0 + (random.randint(-4, 5) / 100.0)
        curr = int(curr * factor)
        ph.append({"date": d, "price": curr})

    leg_obj = {
        "id": leg_id,
        "name": name_ja,
        "kanaName": name_kana,
        "enName": name_en,
        "jaName": name_ja,
        "esName": name_en,
        "club": club,
        "league": league,
        "nationality": nationality,
        "position": position,
        "number": number,
        "ovr": ovr,
        "rarity": rarity,
        "age": age,
        "height": height,
        "foot": foot,
        "careerBio": career_bio,
        "baseIssueCount": base_issue,
        "remainingIssueCount": rem_issue,
        "basePrice": base_price,
        "priceHistory": ph,
        "status": "legend",
        "isRegularCard": False,
        "isLegendPool": True
    }
    legends_objects.append(leg_obj)

print(f"Loaded {len(legends_objects)} verified real legends.")

# 4. Generate the TypeScript output file
out_ts = """import { Player, Rarity, Position, ScoutBanner } from '../types';

export const PLAYERS_DATABASE: Player[] = """ + json.dumps(existing_real, ensure_ascii=False, indent=2) + """;

export const LEGEND_PLAYERS_DATABASE: Player[] = """ + json.dumps(legends_objects, ensure_ascii=False, indent=2) + """;

export const ALL_PLAYERS_DATABASE: Player[] = [
  ...PLAYERS_DATABASE,
  ...LEGEND_PLAYERS_DATABASE
];

export const PLAYER_MAP: Record<string, Player> = ALL_PLAYERS_DATABASE.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, Player>);

export const SCOUT_BANNERS: ScoutBanner[] = [
  {
    id: 'normal',
    name: '通常スカウト',
    subTitle: '常設スカウト・世界各国の実在トップ選手を幅広く獲得',
    costSingle: 100,
    costTen: 950,
    costFifty: 4250,
    ssrRate: 0.03,
    pityTarget: 150,
    bannerBg: 'from-blue-900/40 via-slate-900 to-slate-950',
    accentColor: 'text-blue-400',
  },
  {
    id: 'half',
    name: 'ハーフアニバーサリースカウト',
    subTitle: '記念特別スカウト・SSR確率アップ＆お得な価格',
    costSingle: 50,
    costTen: 450,
    costFifty: 2000,
    ssrRate: 0.045,
    pityTarget: 100,
    bannerBg: 'from-amber-600/40 via-yellow-950 to-slate-950',
    accentColor: 'text-amber-400',
  },
  {
    id: 'premium',
    name: 'プレミアムスカウト',
    subTitle: 'SSR出現確率2倍！6%の高確率プレミアムスカウト',
    costSingle: 200,
    costTen: 1900,
    costFifty: 8000,
    ssrRate: 0.06,
    pityTarget: 150,
    bannerBg: 'from-fuchsia-700/40 via-purple-950 to-slate-950',
    accentColor: 'text-fuchsia-400',
  },
  {
    id: 'legend',
    name: 'レジェンド限定スカウト',
    subTitle: '歴代の偉大なスーパースター約100名のみが出現する特別スカウト',
    costSingle: 250,
    costTen: 2400,
    costFifty: 11000,
    ssrRate: 0.08,
    pityTarget: 120,
    bannerBg: 'from-amber-500/40 via-stone-900 to-slate-950 border border-amber-500/30',
    accentColor: 'text-amber-300',
  },
];

export const ALL_PLAYERS = ALL_PLAYERS_DATABASE;
"""

with open('src/data/players.ts', 'w', encoding='utf-8') as f:
    f.write(out_ts)

print(f"Successfully generated src/data/players.ts!")
print(f"- Active Players: {len(existing_real)}")
print(f"- Legend Players: {len(legends_objects)}")
print(f"- Total Real Players: {len(existing_real) + len(legends_objects)}")
