import  {Router} from 'express';
import { fetchAllUsers } from '../controllers/user-controller.js';
import { protectRoute } from '../middleware/authMiddleware.js';
const router = Router();

router.get("/",fetchAllUsers);


export default router;