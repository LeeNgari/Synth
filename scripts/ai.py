import sys
import json
from transformers import ClapProcessor, ClapModel
import torch

model = ClapModel.from_pretrained("laion/clap-htsat-unfused")
processor = ClapProcessor.from_pretrained("laion/clap-htsat-unfused")

def generate_embedding(text):
    inputs = processor(text=[text], return_tensors="pt", padding=True)
    with torch.no_grad():
        embedding = model.get_text_features(**inputs)
    return embedding[0].tolist()

if __name__ == "__main__":
    query = " ".join(sys.argv[1:])
    embedding = generate_embedding(query)
    print(json.dumps(embedding))
