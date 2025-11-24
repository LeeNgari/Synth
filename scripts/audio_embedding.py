import sys
import json
import torch
from transformers import ClapProcessor, ClapModel
import requests
import torchaudio
from io import BytesIO

print("Loading CLAP model...", file=sys.stderr)
model = ClapModel.from_pretrained("laion/clap-htsat-unfused")
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
print("Model loaded.", file=sys.stderr)

def generate_embedding(audio_url):
    print(f"Downloading audio from {audio_url}", file=sys.stderr)
    audio_data = requests.get(audio_url).content
    audio_waveform, sample_rate = torchaudio.load(BytesIO(audio_data))

    inputs = processor(audios=audio_waveform, sampling_rate=sample_rate, return_tensors="pt", padding=True)
    with torch.no_grad():
        embedding = model.get_audio_features(**inputs)
    return embedding[0].tolist()

if __name__ == "__main__":
    audio_url = sys.argv[1]
    embedding = generate_embedding(audio_url)
    print(json.dumps(embedding))
