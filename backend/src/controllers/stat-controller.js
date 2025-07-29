import { song } from '../models/song-model.js';
import { user } from '../models/user-model.js';
import { album } from '../models/album-model.js';

export const getStats = async (req, res, next) => {
    try {
        // Get total counts
        const [totalSongs, totalUsers, totalAlbums] = await Promise.all([
            song.countDocuments(),
            user.countDocuments(),
            album.countDocuments()
        ]);

        // Get unique artists from songs
        const songArtists = await song.distinct("artist");

        // Get unique artists from albums
        const albumArtists = await album.distinct("artist");

        // Merge and deduplicate artist names
        const uniqueArtistsSet = new Set([...songArtists, ...albumArtists]);
        const totalArtists = uniqueArtistsSet.size;

        res.status(200).json({
            totalSongs,
            totalUsers,
            totalAlbums,
            totalArtists
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};
