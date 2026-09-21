import json
import re

# 1. Read existing first 246 real players
with open('src/data/players.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Split by the first generated player ID
idx = text.find('p-プレミ-0000')
if idx == -1:
    idx = text.find('p-') # fallback
    
# Extract the JSON array of the first 246 players
# We can find the start of PLAYERS_DATABASE: Player[] = [
start_idx = text.find('PLAYERS_DATABASE: Player[] = [')
sub_text = text[start_idx:idx]

# Let's extract each player object in sub_text
# We can parse them using regex
player_matches = re.findall(r'\{\s*\"id\":\s*\"([^\"]+)\",[\s\S]*?\"priceHistory\":\s*\[[\s\S]*?\]\s*(?:,\s*\"status\":\s*\"active\")?(?:,\s*\"isCardEligible\":\s*true)?\s*\}', sub_text)
print(f"Extracted {len(player_matches)} existing real player blocks")
