import { Router } from 'express'
import { callback, getMe } from "../controllers/auth-controller.js"
import { protectRoute } from '../middleware/authMiddleware.js';

const router = Router()

router.get("/me", protectRoute, getMe);
router.post("/callback", callback)

export default router