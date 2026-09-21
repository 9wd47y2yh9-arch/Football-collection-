import json
import re

# Load the verified 246 real players
with open('src/data/players.ts', 'r', encoding='utf-8') as f:
    text = f.read()

idx = text.find('\"id\": \"p-プレミ-0000\"')
last_brace = text.rfind('},', 0, idx)
start_bracket = text.find('PLAYERS_DATABASE: Player[] = [') + len('PLAYERS_DATABASE: Player[] = [')
raw_json = text[start_bracket:last_brace+1].strip()
active_players = json.loads('[' + raw_json + ']')

print(f"Loaded {len(active_players)} base real players.")

# Ensure each base player has status, isCardEligible, isRegularCard, isLegendPool
for p in active_players:
    p['status'] = 'active'
    p['isCardEligible'] = True
    p['isRegularCard'] = True
    p['isLegendPool'] = False
    if 'jaName' not in p:
        p['jaName'] = p['name']
    if 'esName' not in p:
        p['esName'] = p.get('enName', p['name'])

existing_ids = set(p['id'] for p in active_players)
print(f"Unique base IDs: {len(existing_ids)}")
