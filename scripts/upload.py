import os
import json
import cloudinary
import cloudinary.uploader

# === SETUP YOUR CREDENTIALS HERE ===
cloudinary.config(
    cloud_name='du74ofrgc',
    api_key='373597549273934',
    api_secret='um9cMqb8tETDjQfpC0QhkCBg6IY',
    secure=True
)

# === FILE PATHS ===
input_json = 'input.json'
output_json = 'songs_with_cloudinary.json'

# === LOAD SONGS ===
with open(input_json, 'r', encoding='utf-8') as f:
    songs = json.load(f)

updated_songs = []

for song in songs:
    local_path = song.get('local_mp3_path')

    if not local_path or not os.path.exists(local_path):
        print(f"❌ Skipping {song['title']} — MP3 not found.")
        song['cloudinary_url'] = None
        updated_songs.append(song)
        continue

    print(f"⬆️ Uploading: {song['title']}")

    try:
        upload_result = cloudinary.uploader.upload(
            local_path,
            resource_type='video',  # Cloudinary treats audio as 'video'
            folder='mp3-uploads',   # Optional folder
            public_id=os.path.splitext(os.path.basename(local_path))[0],
            overwrite=False
        )
        song['cloudinary_url'] = upload_result.get('secure_url')
        print(f"✅ Uploaded: {song['title']}")
    except Exception as e:
        print(f"❌ Error uploading {song['title']}: {e}")
        song['cloudinary_url'] = None

    updated_songs.append(song)

# === SAVE UPDATED JSON ===
with open(output_json, 'w', encoding='utf-8') as f:
    json.dump(updated_songs, f, indent=2, ensure_ascii=False)

print(f"\n📄 Updated JSON saved to: {output_json}")
