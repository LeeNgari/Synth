import os
import json
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

# === CONFIGURATION ===
input_json = 'youtube_matches.json'
output_json = 'songs_with_mp3.json'
download_dir = 'downloads'
batch_size = 10
max_workers = 4  # Number of parallel threads

os.makedirs(download_dir, exist_ok=True)

# === LOAD SONGS ===
with open(input_json, 'r', encoding='utf-8') as f:
    input_songs = json.load(f)

# Load existing progress if output file exists
if os.path.exists(output_json):
    with open(output_json, 'r', encoding='utf-8') as f:
        downloaded_songs = json.load(f)
    processed_ids = {song['id'] for song in downloaded_songs if song.get('local_mp3_path')}
else:
    downloaded_songs = []
    processed_ids = set()

# Filter out already processed songs
songs_to_process = [s for s in input_songs if s['id'] not in processed_ids]

print(f"🔄 Resuming: {len(songs_to_process)} songs left to process...")

# === DOWNLOAD FUNCTION ===
def download_song(song):
    title = song.get('title', 'Unknown Title')
    artist = song.get('artist', 'Unknown Artist')
    youtube_url = song.get('youtube_url')

    safe_name = f"{artist} - {title}".replace('/', '_').replace('\\', '_')
    output_path = os.path.join(download_dir, f"{safe_name}.mp3")

    if os.path.exists(output_path):
        print(f"✅ Already downloaded: {safe_name}")
        song['local_mp3_path'] = os.path.abspath(output_path)
        return song

    if not youtube_url:
        print(f"⚠️ Missing YouTube URL: {title} by {artist}")
        song['local_mp3_path'] = None
        return song

    print(f"⬇️ Downloading: {safe_name}")
    command = [
        'yt-dlp',
        '-x', '--audio-format', 'mp3',
        '-o', output_path,
        youtube_url
    ]

    try:
        subprocess.run(command, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        song['local_mp3_path'] = os.path.abspath(output_path)
    except subprocess.CalledProcessError:
        print(f"❌ Failed to download: {safe_name}")
        song['local_mp3_path'] = None

    return song

# === PROCESS IN BATCHES ===
def process_batches(songs, existing_songs):
    total = len(songs)
    for i in range(0, total, batch_size):
        batch = songs[i:i + batch_size]
        print(f"\n⚙️ Processing batch {i//batch_size + 1}...")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_song = {executor.submit(download_song, song): song for song in batch}
            completed = []
            for future in as_completed(future_to_song):
                result = future.result()
                completed.append(result)

        existing_songs.extend(completed)

        # Save progress after each batch
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(existing_songs, f, indent=2, ensure_ascii=False)

        print(f"💾 Saved batch {i//batch_size + 1} to {output_json}")

process_batches(songs_to_process, downloaded_songs)

print(f"\n✅ Done. Final JSON: {output_json}")
