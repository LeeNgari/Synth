import express from "express";
import { clapSearchHandler } from "../controllers/ai-controller.js";

const router = express.Router();

router.post("/search", clapSearchHandler);

export default router;
