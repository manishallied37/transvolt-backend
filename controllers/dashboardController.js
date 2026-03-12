import { getDashboardMetrics } from "../services/alerts/dashboardService.js";

export const fetchDashboardMetrics = async (req, res) => {

  try {

    const metrics = await getDashboardMetrics();

    res.json(metrics);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to fetch dashboard metrics"
    });

  }

};