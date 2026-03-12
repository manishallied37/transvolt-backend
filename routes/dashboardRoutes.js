import express from "express";
import { fetchDashboardMetrics } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/metrics", fetchDashboardMetrics);

export default router;