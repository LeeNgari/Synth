import { Router } from "express";
import { protectRoute, requireAdmin } from "../middleware/authMiddleware.js";
import {
  createSong,
  deleteSong,
  createAlbum,
  deleteAlbum,
  updateUserRole,
} from "../controllers/admin-controller.js";

const router = Router();

router.use(protectRoute, requireAdmin);

router.put("/users/:userId/role", updateUserRole);

router.delete("/songs/:id", deleteSong);
router.post("/songs", createSong);

router.post("/albums", createAlbum);
router.delete("/albums/:id", deleteAlbum);

export default router;
