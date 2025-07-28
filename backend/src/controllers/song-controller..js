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

export const getLikedSongs = async (req, res) => {
    try {
        const clerkId = req.auth.userId;
        const currentUser = await user
            .findOne({ clerkId })
            .lean()
            .populate("likedSongs");
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const likedSongsRaw = currentUser.likedSongs.slice(0, 5);

        const likedSongs = await enhanceSongs(likedSongsRaw, currentUser);


        res.json(likedSongs);
    } catch (err) {
        console.error("Error fetching liked songs:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};

export const getListeningHistory = async (req, res) => {
    try {
        const clerkId = req.auth.userId;

        // 1. Find the user and populate the 'song' field in the history
        const currentUser = await user
            .findOne({ clerkId })
            .populate({
                path: "listeningHistory.song",
                model: "Song",
            })
            .lean();


        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }


        let listeningHistory = currentUser.listeningHistory
            .filter(entry => !!entry.song)
            .sort((a, b) => new Date(b.listenedAt) - new Date(a.listenedAt))
            .slice(0, 6)
            .map(entry => ({
                ...entry.song,
                listenedAt: entry.listenedAt,
            }));





        if (typeof enhanceSongs === 'function') {
            listeningHistory = await enhanceSongs(listeningHistory, currentUser);
        }


        res.json(listeningHistory);

    } catch (err) {
        console.error("Error fetching listening history:", err);
        res.status(500).json({ message: err.message || "Internal server error" });
    }
};


export const getPopularSongs = async (req, res) => {
    try {
        const currentUser = await user.findOne({ clerkId: req.auth.userId }).lean();

        const popularSongs = await song.find()
            .sort({ popularity: -1 }) // ✅ Highest popularity first
            .limit(8)
            .lean();

        const enhanced = await enhanceSongs(popularSongs, currentUser);

        res.json(enhanced);
    } catch (err) {
        console.error('Error fetching trending songs:', err);
        res.status(500).json({ message: 'Failed to fetch trending songs' });
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
export const likeSong = async (req, res) => {
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
};

export const dislikeSong = async (req, res) => {
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
};

export const addToHistory = async (req, res) => {
    try {
        const { songId } = req.params; // Get songId from request params
        const { userId: clerkId } = req.auth; // Get clerkId from auth


        if (!songId) {
            return res.status(400).json({ message: "Song ID is required" });
        }

        // Use a single 'updateOne' call for efficiency. No need to find the user first.
        await user.updateOne(
            { clerkId: clerkId },
            {
                $push: {
                    listeningHistory: {
                        song: songId,
                        listenedAt: new Date(), // Correct field name
                    },
                },
            }
        );

        res.json({ success: true, message: "Song added to history." });

    } catch (err) {
        console.error("Error adding to history:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
const enhanceSongs = async (songs, currentUser) => {
    const likedSet = new Set(
        currentUser?.likedSongs?.map(s =>
            s?._id ? s._id.toString() : s.toString()
        ) || []
    );

    const dislikedSet = new Set(
        currentUser?.dislikedSongs?.map(s =>
            s?._id ? s._id.toString() : s.toString()
        ) || []
    );

    return await Promise.all(
        songs.map(async (s) => {

            const songId = s._id.toString();

            const likeCount = await user.countDocuments({ likedSongs: songId });
            const dislikeCount = await user.countDocuments({ dislikedSongs: songId });



            return {
                ...s,
                likeCount,
                dislikeCount,
                likedByCurrentUser: likedSet.has(songId),
                dislikedByCurrentUser: dislikedSet.has(songId),
            };
        })
    );
};



