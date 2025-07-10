import json
import os
import yt_dlp
from pathlib import Path

# Configuration
INPUT_JSON_PATH = 'youtube_matches.json'  # Replace with your input JSON file path
OUTPUT_JSON_PATH = 'downloaded_songs.json'
DOWNLOAD_DIR = 'songs_downloaded'

# Ensure download directory exists
Path(DOWNLOAD_DIR).mkdir(exist_ok=True)

# yt-dlp configuration for MP3 download
ydl_opts = {
    'format': 'bestaudio/best',
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',
    }],
    'outtmpl': f'{DOWNLOAD_DIR}/%(title)s.%(ext)s',
    'quiet': False,
    'no_warnings': True,
    'noplaylist': True,
    'concurrent_fragment_downloads': 10,  # Increase parallel fragment downloads
}

def load_input_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading input JSON: {e}")
        return []

def write_output_json(songs, file_path):
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(songs, f, indent=2)

def download_song(song):
    youtube_url = song.get('youtube_url')
    if not youtube_url:
        print(f"No YouTube URL for {song['title']} by {song['artist']}")
        return None

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            filename = ydl.prepare_filename(info).replace('.webm', '.mp3').replace('.m4a', '.mp3')
            if os.path.exists(filename):
                # Create a new song entry with the file path
                downloaded_song = song.copy()
                downloaded_song['file_path'] = filename
                return downloaded_song
            else:
                print(f"Download failed for {song['title']} by {song['artist']}")
                return None
    except Exception as e:
        print(f"Error downloading {song['title']} by {song['artist']}: {e}")
        return None

def main():
    # Load input songs
    songs = load_input_json(INPUT_JSON_PATH)
    if not songs:
        print("No songs to process.")
        return

    downloaded_songs = []
    batch_size = 10

    for i, song in enumerate(songs, 1):
        print(f"Processing song {i}/{len(songs)}: {song['title']} by {song['artist']}")
        downloaded_song = download_song(song)
        if downloaded_song:
            downloaded_songs.append(downloaded_song)

        # Write to output JSON every 10 successful downloads or at the end
        if len(downloaded_songs) % batch_size == 0 or i == len(songs):
            write_output_json(downloaded_songs, OUTPUT_JSON_PATH)
            print(f"Updated {OUTPUT_JSON_PATH} with {len(downloaded_songs)} songs")

    print(f"Download complete. Total songs downloaded: {len(downloaded_songs)}")

if __name__ == "__main__":
    main()