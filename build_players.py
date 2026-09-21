import re
import json

with open('src/data/players.ts', 'r', encoding='utf-8') as f:
    orig = f.read()

# Check how many players exist
player_matches = list(re.finditer(r"\{\s*id:\s*'([^']+)'", orig))
print(f"Found {len(player_matches)} existing players")

