import "./config/env.js";
 
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import crypto from "crypto";
 
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./media/routes/eventRoutes.js";
import netradyneRoutes from "./media/routes/netradyneRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
 
const app = express();
 
app.set("trust proxy", 1);
app.disable("x-powered-by");
 
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);
 
app.use((req, res, next) => {
  req.id = crypto.randomUUID();
  next();
});
 
morgan.token("req-id", (req) => req.id);
 
app.use(
  morgan(
    ':remote-addr [:date[iso]] req-id=:req-id ":method :url" :status :res[content-length] - :response-time ms'
  )
);
 
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
 
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
 
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
 
app.use(apiLimiter);
 
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/netradyne", netradyneRoutes);
app.use("/alerts", alertRoutes);
app.use("/dashboard", dashboardRoutes);
 
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date()
  });
});
 
app.use((err, req, res, next) => {
 
  console.error(`[${req.id}]`, err);
 
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    requestId: req.id
  });
 
});
 
const PORT = process.env.PORT || 5000;
 
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});