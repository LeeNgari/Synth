import { spawn } from "child_process";
import { song } from "../models/song-model.js";
import { user } from "../models/user-model.js";
import path from "path";
import { fileURLToPath } from "url";
import { enhanceSongs } from "./song-controller..js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pythonScriptPath = path.resolve(__dirname, "../../../scripts/ai.py");

export const clapSearchHandler = async (req, res) => {
	try {
		const { query } = req.body;
		const clerkId = req.auth?.userId;

		if (!query || !clerkId) {
			return res.status(400).json({ success: false, message: "Query and user required" });
		}

		console.log("Running CLAP script for query:", query);

		const process = spawn("/home/lee-ngari/project/synthprep/spotdl/venv/bin/python", [pythonScriptPath, query]);

		let result = "";

		process.stdout.on("data", (data) => {
			result += data.toString();
		});

		process.stderr.on("data", (data) => {
			console.error("Python stderr:", data.toString());
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

			console.log("Embedding received, querying MongoDB...");

			const rawResults = await song.aggregate([
				{
					$vectorSearch: {
						index: "vector_index",
						queryVector: embedding,
						path: "embedding",
						numCandidates: 100,
						limit: 10,
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
						releaseDate: 1,
						popularity: 1,
						score: { $meta: "vectorSearchScore" }
					}
				}
			]);

			// Fetch current user for enhanceSongs
			const currentUser = await user.findOne({ clerkId });

			// Run enhanceSongs to add like/dislike info
			const enhanced = await enhanceSongs(rawResults, currentUser);

			return res.status(200).json({ success: true, songs: enhanced });
		});
	} catch (err) {
		console.error("CLAP search failed:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
