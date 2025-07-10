import json
import os
import subprocess

INPUT_JSON = "song2.json"
OUTPUT_DIR = "downloads"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Read only the first song
with open(INPUT_JSON, "r", encoding="utf-8") as f:
    songs = json.load(f)

song = songs[0]
url = song["spotify_url"]
print(f"🎧 Downloading: {song['title']}")

command = [
    "python", "-m", "spotdl", url,
    "--audio", "youtube",  # explicitly set provider
    "--output", OUTPUT_DIR,
    "--log-level", "DEBUG"
]

try:
    result = subprocess.run(command, capture_output=True, text=True)
    print("\n📦 STDOUT:")
    print(result.stdout)
    print("\n❗ STDERR:")
    print(result.stderr)

    # Try to match any file in the output dir (any audio extension)
    downloaded_files = os.listdir(OUTPUT_DIR)
    found = False
    for f in downloaded_files:
        if song["title"].lower()[:10] in f.lower():
            song["file_path"] = os.path.join(OUTPUT_DIR, f)
            found = True
            break
    if not found:
        song["file_path"] = None

except Exception as e:
    print(f"❌ Download failed: {e}")
    song["file_path"] = None

print(f"\n✅ Done. Saved file path: {song['file_path']}")
