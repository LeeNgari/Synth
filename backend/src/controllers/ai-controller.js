import { spawn } from "child_process";
import { song } from "../models/song-model.js";
import path from "path";
import { fileURLToPath } from "url";

// ES module-safe __dirname resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Path to Python script
const pythonScriptPath = path.resolve(__dirname, "../../../scripts/ai.py");



export const clapSearchHandler = async (req, res) => {
	try {
		const { query } = req.body;

		if (!query) {
			return res.status(400).json({ success: false, message: "Query is required" });
		}

		console.log("Running CLAP script for query:", query);
		const pythonPath = "/home/lee-ngari/project/synthprep/spotdl/venv/bin/python";

		const process = spawn(pythonPath, [pythonScriptPath, query], {
			stdio: ["ignore", "pipe", "pipe"]
		});



		let result = "";

		process.stdout.on("data", (data) => {
			console.log("[PYTHON STDOUT]", data.toString());
			result += data.toString();
		});

		process.stderr.on("data", (data) => {
			console.error("[PYTHON STDERR]", data.toString());
		});


		process.on("close", async (code) => {
			if (code !== 0) {
				return res.status(500).json({ success: false, message: "CLAP script failed" });
			}

			let embedding;
			try {
				// Clean any trailing logs, then parse
				const jsonStart = result.indexOf("[");
				const jsonEnd = result.lastIndexOf("]") + 1;
				const cleanJson = result.slice(jsonStart, jsonEnd);

				embedding = JSON.parse(cleanJson);

				if (!Array.isArray(embedding) || embedding.length !== 512) {
					throw new Error("Invalid embedding shape");
				}
			} catch (err) {
				console.error("Failed to parse embedding:", err);
				return res.status(500).json({ success: false, message: "Failed to parse embedding" });
			}

			console.log("✅ Embedding parsed, searching MongoDB...");

			const results = await song.aggregate([
				{
					$vectorSearch: {
						index: "vector_index",
						queryVector: embedding,
						path: "embedding",
						numCandidates: 100,
						limit: 10,
					},
				},
				{
					$project: {
						title: 1,
						artist: 1,
						audioUrl: 1,
						imageUrl: 1,
						duration: 1,
						album: 1,
						score: { $meta: "vectorSearchScore" },
					},
				},
			]);

			res.status(200).json({ success: true, songs: results });
		});

	} catch (err) {
		console.error("CLAP search failed:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
