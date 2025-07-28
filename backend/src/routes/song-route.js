import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import {
    getAllSongs, getSongsByIds, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, likeSong,
    dislikeSong, addToHistory, searchSongs, getListeningHistory,
    getLikedSongs, getPopularSongs
} from "../controllers/song-controller..js"

const router = Router();

router.get("/", getAllSongs);
router.get("/featured", getFeaturedSongs);
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs);
router.get("/search", searchSongs)

router.get("/history", protectRoute, getListeningHistory);
router.get("/liked", protectRoute, getLikedSongs);
router.get("/popular", getPopularSongs);


router.post("/:songId/like", protectRoute, likeSong);
router.post("/:songId/dislike", protectRoute, dislikeSong);
router.post("/history/:songId", addToHistory)

router.get("/by-ids", getSongsByIds);





export default router