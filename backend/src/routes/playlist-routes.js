import  {Router} from 'express';
import {
  createPlaylist,
  addSongToPlaylist,
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
} from "../controllers/playlist-controller.js";
import { protectRoute } from '../middleware/authMiddleware.js';
const router = Router();

router.post("/create", protectRoute, createPlaylist);
router.post("/:playlistId/songs/:songId", protectRoute, addSongToPlaylist);
router.get("/me", protectRoute, getUserPlaylists);
router.get("/public", getPublicPlaylists);
router.get("/:playlistId", getPlaylistById);

export default router;