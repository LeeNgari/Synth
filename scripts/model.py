import torch
import torchaudio
import json
import os
from transformers import ClapProcessor, ClapModel

# Load CLAP model and processor
print("Loading CLAP model...")
processor = ClapProcessor.from_pretrained("laion/clap-htsat-fused")
model = ClapModel.from_pretrained("laion/clap-htsat-fused")
model.eval()

def get_audio_embedding(file_path, segment_duration_sec=30):
    try:
        waveform, sample_rate = torchaudio.load(file_path)

        # Convert to mono
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)

        # Resample to 48kHz
        if sample_rate != 48000:
            resampler = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=48000)
            waveform = resampler(waveform)
            sample_rate = 48000

        segment_length = sample_rate * segment_duration_sec
        total_length = waveform.shape[1]
        embeddings = []

        for start in range(0, total_length, segment_length):
            end = min(start + segment_length, total_length)
            segment = waveform[:, start:end]

            if segment.shape[1] < sample_rate * 5:
                continue

            # 🧪 Debug
            print(f"Segment shape: {segment.shape}, Samples: {segment.shape[1]}")

            # Fix shape if needed
            if segment.dim() == 1:
                segment = segment.unsqueeze(0)

            inputs = processor(audios=segment.squeeze().tolist(), sampling_rate=sample_rate, return_tensors="pt")
            with torch.no_grad():
                audio_features = model.get_audio_features(**inputs)
                embeddings.append(audio_features[0])

        if not embeddings:
            return None

        avg_embedding = torch.stack(embeddings).mean(dim=0)
        return avg_embedding.tolist()

    except Exception as e:
        print(f"Error embedding {file_path}: {e}")
        return None

# Load the input JSON file
input_file = "songs_with_cloudinary.json"
output_file = "songs_with_embeddings.json"

print(f"Loading {input_file}...")
with open(input_file, "r") as f:
    songs = json.load(f)

# Process each song
print("Generating embeddings...")
for song in songs:
    path = song.get("local_mp3_path")
    if path and os.path.exists(path):
        print(f"Embedding: {path}")
        embedding = get_audio_embedding(path)
        song["embedding"] = embedding
    else:
        print(f"Missing or invalid path: {path}")
        song["embedding"] = None

# Save the updated songs to a new JSON file
print(f"Saving output to {output_file}...")
with open(output_file, "w") as f:
    json.dump(songs, f, indent=2)

print("Done.")
