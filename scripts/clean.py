import json

# File paths
input_json = 'songs_with_mp3.json'
output_json = 'input.json'  # You can set this to input_json to overwrite

# Load original songs
with open(input_json, 'r', encoding='utf-8') as f:
    songs = json.load(f)

# Remove entries with null or empty local_mp3_path
filtered_songs = [song for song in songs if song.get('local_mp3_path')]

# Save cleaned list
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(filtered_songs, f, indent=2, ensure_ascii=False)

print(f"✅ Cleaned list saved to: {output_json}")
print(f"🧹 Removed {len(songs) - len(filtered_songs)} songs with null local_mp3_path.")
