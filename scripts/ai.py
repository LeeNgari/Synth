import sys
import json
import torch
from transformers import ClapProcessor, ClapModel

def log(msg):
    print(msg, file=sys.stderr)

log("⏳ Loading CLAP model and processor...")
model = ClapModel.from_pretrained("laion/clap-htsat-unfused")
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")
log("✅ Model and processor loaded.")

def generate_embedding(text):
    log(f"🔍 Generating embedding for query: '{text}'")
    inputs = processor(text=[text], return_tensors="pt", padding=True)
    with torch.no_grad():
        embedding = model.get_text_features(**inputs)
    log("✅ Embedding generated successfully.")
    return embedding[0].tolist()

if __name__ == "__main__":
    query = " ".join(sys.argv[1:])
    log(f"📥 Received query: {query}")
    embedding = generate_embedding(query)
    log("📤 Returning embedding as JSON")
    print(json.dumps(embedding))  # This goes to stdout cleanly
