import "./config/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./media/routes/eventRoutes.js";
import netradyneRoutes from "./media/routes/netradyneRoutes.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);

morgan.token("ist-time", () => {
  return new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
});

app.use(
  morgan(
    ':remote-addr - [:ist-time] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  ),
);

app.use(
  cors({
    origin: ["*"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(apiLimiter);

app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/netradyne", netradyneRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date(),
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
