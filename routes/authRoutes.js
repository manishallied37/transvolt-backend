import express from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  register,
  refreshToken,
  sendOtpC,
  verifyOtp,
  resetPassword,
  verifyLoginOtp,
  generateAlerts,
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts, try again later",
  standardHeaders: true,
  legacyHeaders: false
});

router.post("/login", loginLimiter, login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post("/send-otp", sendOtpC);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-login-otp", verifyLoginOtp);
router.post("/api/alerts", authMiddleware, generateAlerts);

export default router;