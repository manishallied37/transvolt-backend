import express from "express";
import { generateAlert } from "../services/alerts/alertService.js";

const router = express.Router();

router.get("/generate", async (req, res) => {

  try {

    const count = req.query.count || 5;

    const result = await generateAlert(count);

    res.json(result);

  } catch (error) {

    console.error(error);
    res.status(500).json({ error: "Failed to generate alerts" });

  }

});

export default router;