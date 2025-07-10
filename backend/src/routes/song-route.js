import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import { getAllSongs,getSongsByIds, getFeaturedSongs, getMadeForYouSongs, getTrendingSongs, likeSong,dislikeSong, searchSongs } from "../controllers/song-controller..js"

const router = Router();

router.get("/",getAllSongs); 
router.get("/featured", getFeaturedSongs); 
router.get("/made-for-you", getMadeForYouSongs);
router.get("/trending", getTrendingSongs); 
router.get("/search", searchSongs)
router.post("/like", likeSong);
router.post("/dislike", dislikeSong);
router.get("/by-ids", getSongsByIds);





export default router