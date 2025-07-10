import  {Router} from 'express';
import { fetchAllUsers, addToHistory } from '../controllers/user-controller.js';
import { protectRoute } from '../middleware/authMiddleware.js';
const router = Router();

router.get("/",protectRoute, fetchAllUsers);
router.post("/history/:songId", protectRoute,addToHistory);

export default router;