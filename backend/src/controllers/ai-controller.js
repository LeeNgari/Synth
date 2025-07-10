import { spawn } from "child_process";
import { song } from "../models/song-model.js";
import path from "path";
import { fileURLToPath } from "url";

// Fix relative path to Python file using ES module-safe method
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.resolve(__dirname, "../../../scripts/index.py");

export const clapSearchHandler = async (req, res) => {
	try {
		const { query } = req.body;

		if (!query) {
			return res.status(400).json({ success: false, message: "Query is required" });
		}

		console.log("Calling CLAP script with query:", query);

		const process = spawn("python3", [pythonScriptPath, query]);

		let result = "";

		process.stdout.on("data", (data) => {
			result += data.toString();
		});

		process.stderr.on("data", (data) => {
			console.error("Python error:", data.toString());
		});

		process.on("close", async (code) => {
			if (code !== 0) {
				return res.status(500).json({ success: false, message: "CLAP script failed" });
			}

			let embedding;
			try {
				embedding = JSON.parse(result);
			} catch (err) {
				return res.status(500).json({ success: false, message: "Failed to parse embedding" });
			}

			console.log("Embedding received, querying MongoDB");

			const results = await song.aggregate([
				{
					$vectorSearch: {
						index: "clap-song-index", // Replace with your actual index name
						queryVector: embedding,
						path: "embedding",
						numCandidates: 100,
						limit: 10
					}
				},
				{
					$project: {
						title: 1,
						artist: 1,
						audioUrl: 1,
						imageUrl: 1,
						duration: 1,
						album: 1,
						score: { $meta: "vectorSearchScore" }
					}
				}
			]);

			return res.status(200).json({ success: true, songs: results });
		});
	} catch (err) {
		console.error("CLAP search failed:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
