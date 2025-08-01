import { Router } from 'express'
import { callback } from "../controllers/auth-controller.js"

const router = Router()

router.post("/callback", callback)
router.get("/callback", callback)
router.post("/callback", callback)

export default router