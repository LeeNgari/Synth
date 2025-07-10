import e from "express";
import { song } from "../models/song-model.js";
import { album } from "../models/album-model.js";
import { user } from "../models/user-model.js";

export const getAllSongs = async (req, res, next) => {
    try {
        const songs = await song.find().sort({ createdAt: -1 }).lean()
        let currentUser = null;
        if (req.auth?.userId) {
            currentUser = await user.findOne({ clerkId: req.auth.userId });
        }
        const enrichedSongs = await enhanceSongs(songs, currentUser);
        res.status(200).json(enrichedSongs);
    } catch (error) {
        console.error(error);
        next(error);
    }
}
export const getSongsByIds = async (req, res, next) => {
	try {
		const ids = req.query.ids?.split(",") || [];

		if (!ids.length) {
			return res.status(400).json({ message: "No song IDs provided." });
		}

		const songs = await song.find({ _id: { $in: ids } }).lean();

		let currentUser = null;
		if (req.auth?.userId) {
			currentUser = await user.findOne({ clerkId: req.auth.userId });
		}

		const enrichedSongs = await enhanceSongs(songs, currentUser);
		res.status(200).json(enrichedSongs);
	} catch (error) {
		console.error(error);
		next(error);
	}
};

export const getFeaturedSongs = async (req, res, next) => {
    try {
        const songs = await song.aggregate([
            {
                $sample: { size: 6 }
            }, {
                $project: {
                    id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])
        let currentUser = null;

        // Try to get the logged-in user from Clerk if available
        if (req.auth?.userId) {
            currentUser = await user.findOne({ clerkId: req.auth.userId });
        }
        const enrichedSongs = await enhanceSongs(songs, currentUser);
        res.status(200).json(enrichedSongs);
    } catch (error) {
        console.error(error);
        next(error);
    }
}
export const getMadeForYouSongs = async (req, res, next) => {
    try {
        const songs = await song.aggregate([
            {
                $sample: { size: 4 }
            }, {
                $project: {
                    id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])
        let currentUser = null;

        // Try to get the logged-in user from Clerk if available
        if (req.auth?.userId) {
            currentUser = await user.findOne({ clerkId: req.auth.userId });
        }
        const enrichedSongs = await enhanceSongs(songs, currentUser);
        res.status(200).json(enrichedSongs);
    } catch (error) {
        console.error(error);
        next
    }
}
export const getTrendingSongs = async (req, res, next) => {
    try {
        const songs = await song.aggregate([
            {
                $sample: { size: 4 }
            }, {
                $project: {
                    id: 1,
                    title: 1,
                    artist: 1,
                    imageUrl: 1,
                    audioUrl: 1,
                }
            }
        ])
        let currentUser = null;

        // Try to get the logged-in user from Clerk if available
        if (req.auth?.userId) {
            currentUser = await user.findOne({ clerkId: req.auth.userId });
        }
        const enrichedSongs = await enhanceSongs(songs, currentUser);
        res.status(200).json(enrichedSongs);
    } catch (error) {
        console.error(error);
        next(error);
    }
}
export const searchSongs = async (req, res, next) => {
    try {
        const query = req.query.q;
        const regex = new RegExp(query, 'i');

        const [songs, albums] = await Promise.all([
            song.find({ title: regex }).populate('album').lean(),
            album.find({ title: regex }).lean()
        ]);

        let currentUser = null;

        // Try to get the logged-in user from Clerk if available
        if (req.auth?.userId) {
            currentUser = await user.findOne({ clerkId: req.auth.userId });
        }
        const enrichedSongs = await enhanceSongs(songs, currentUser);
        res.json({ success: true, songs: enrichedSongs, albums });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
export const likeSong = async (req, res, next) => {
    try {
        const currentUser = await user.findOne({ clerkId: req.auth.userId });
        const songId = req.params.songId;

        const alreadyLiked = currentUser.likedSongs.includes(songId);
        const alreadyDisliked = currentUser.dislikedSongs.includes(songId);

        if (alreadyLiked) {
            await user.updateOne({ clerkId: req.auth.userId }, { $pull: { likedSongs: songId } });
        } else {
            if (alreadyDisliked) {
                await user.updateOne({ clerkId: req.auth.userId }, { $pull: { dislikedSongs: songId } });
            }
            await user.updateOne({ clerkId: req.auth.userId }, { $addToSet: { likedSongs: songId } });
        }

        res.json({ success: true, liked: !alreadyLiked });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
export const dislikeSong = async (req, res, next) => {
    try {
        const currentUser = await user.findOne({ clerkId: req.auth.userId });
        const songId = req.params.songId;

        const alreadyDisliked = currentUser.dislikedSongs.includes(songId);
        const alreadyLiked = currentUser.likedSongs.includes(songId);

        if (alreadyDisliked) {
            await user.updateOne({ clerkId: req.auth.userId }, { $pull: { dislikedSongs: songId } });
        } else {
            if (alreadyLiked) {
                await user.updateOne({ clerkId: req.auth.userId }, { $pull: { likedSongs: songId } });
            }
            await user.updateOne({ clerkId: req.auth.userId }, { $addToSet: { dislikedSongs: songId } });
        }

        res.json({ success: true, disliked: !alreadyDisliked });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
}
const enhanceSongs = async (songs, currentUser) => {
    return await Promise.all(
        songs.map(async (s) => {
            const songId = s._id.toString();
            const likeCount = await user.countDocuments({ likedSongs: songId });
            const dislikeCount = await user.countDocuments({ dislikedSongs: songId });

            return {
                ...s,
                likeCount,
                dislikeCount,
                likedByCurrentUser: currentUser?.likedSongs?.includes(songId) || false,
                dislikedByCurrentUser: currentUser?.dislikedSongs?.includes(songId) || false,
            };
        })
    );
};

