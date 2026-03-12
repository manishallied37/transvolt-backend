import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getEventMedia } from "../controllers/eventController.js";

const router = express.Router();

router.get("/:eventId/media", authMiddleware, getEventMedia);
// router.get("/:eventId/media", getEventMedia);

export default router;
