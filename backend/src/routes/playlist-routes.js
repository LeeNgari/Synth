import  {Router} from 'express';
import {
  createPlaylist,
  addSongToPlaylist,
  getUserPlaylists,
  getPublicPlaylists,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  removeSongFromPlaylist,
} from "../controllers/playlist-controller.js";
import { protectRoute } from '../middleware/authMiddleware.js';
const router = Router();

router.post("/create", createPlaylist);
router.post("/:playlistId/songs/:songId", protectRoute, addSongToPlaylist);
router.get("/me", protectRoute, getUserPlaylists);
router.get("/public", getPublicPlaylists);
router.get("/:playlistId", getPlaylistById);
router.put("/:playlistId", protectRoute, updatePlaylist);
router.delete("/:playlistId", protectRoute, deletePlaylist);
router.delete("/:playlistId/songs/:songId", protectRoute, removeSongFromPlaylist);

export default router;