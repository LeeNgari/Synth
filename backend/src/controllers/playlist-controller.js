import { Playlist } from "../models/playlist-model.js";
import { user } from "../models/user-model.js";
import { song } from "../models/song-model.js";


export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description, songIds, isPublic = false } = req.body;
    const currentUser = await user.findOne({ clerkId: req.auth.userId });

    if (!title || !songIds || songIds.length === 0) {
      return res.status(400).json({ message: "Title and at least one song required." });
    }

    // Fetch first song for image

    const firstSong = await song.findById(songIds[0]);

    if (!firstSong) {
      return res.status(404).json({ message: "First song not found" });
    }
    const imageUrl = firstSong.imageUrl;

    const newPlaylist = new Playlist({
      title,
      description,
      createdBy: currentUser._id,
      songs: songIds,
      isPublic,
      imageUrl,
    });

    await newPlaylist.save();

    res.status(201).json({ success: true, playlist: newPlaylist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add a song to a playlist
export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { playlistId, songId } = req.params;
    const currentUser = await user.findOne({ clerkId: req.auth.userId });

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    if (!playlist.createdBy.equals(currentUser._id)) {
      return res.status(403).json({ message: "You do not own this playlist" });
    }

    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: "Song already in playlist" });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.status(200).json({ success: true, playlist });
  } catch (err) {
    next(err);
  }
};

// Get current user's playlists
export const getUserPlaylists = async (req, res, next) => {
  try {
    const currentUser = await user.findOne({ clerkId: req.auth.userId });

    const playlists = await Playlist.find({ createdBy: currentUser._id }).populate("songs");

    res.status(200).json({ success: true, playlists });
  } catch (err) {
    next(err);
  }
};

// Get all public playlists
export const getPublicPlaylists = async (req, res, next) => {
  try {
    const playlists = await Playlist.find({ isPublic: true }).populate("songs");
    res.status(200).json({ success: true, playlists });
  } catch (err) {
    next(err);
  }
};

// Get a playlist by ID
export const getPlaylistById = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId).populate("songs");
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });

    // If private and not the owner, reject
    if (!playlist.isPublic && req.auth?.userId) {
      const currentUser = await user.findOne({ clerkId: req.auth.userId });
      if (!playlist.createdBy.equals(currentUser._id)) {
        return res.status(403).json({ message: "This playlist is private" });
      }
    } else if (!playlist.isPublic && !req.auth?.userId) {
      return res.status(403).json({ message: "Login to view private playlists" });
    }

    res.status(200).json({ success: true, playlist });
  } catch (err) {
    next(err);
  }
};
