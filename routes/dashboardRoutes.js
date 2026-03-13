import express from "express";
import { fetchDashboardMetrics } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/metrics", authMiddleware, fetchDashboardMetrics);

export default router;