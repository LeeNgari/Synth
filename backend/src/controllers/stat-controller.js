import {song} from '../models/song-model.js';
import { user } from '../models/user-model.js';
import {album } from '../models/album-model.js';

export const getStats = async (req, res, next) => {
    try{
        const {totalSongs, totalUsers, totalAlbums} = await Promise.all([
            song.countDocuments(),
            user.countDocuments(),
            album.countDocuments(),

            song.aggregate(
                {
                $unionWith:{
                    coll:"albums",
                    pipeline:[]
                }
            },
            {
                $group: {
                    _id: "$artist",
                }
            }, {
                $count:"count",
            }
        )

        ])
        console.error(error);
        res.status(200).json({
            totalSongs,
            totalUsers,
            totalAlbums,
            totalArtists: uniquesArtists[0]?.count || 0,
        });
    }catch (error) {
        console.error(error);
        next(error);
    }
    
}