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
  logoutController,
  logoutAllDevicesController
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

const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many OTP requests, try again later"
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many refresh attempts"
});

// router.post("/login" , login);
// router.post("/register", register);
// router.post("/refresh", loginLimiter ,refreshToken);
// router.post("/send-otp", otpLimiter ,sendOtpC);
// router.post("/verify-otp", otpLimiter ,verifyOtp);
// router.post("/reset-password", otpLimiter ,resetPassword);
// router.post("/verify-login-otp", otpLimiter ,verifyLoginOtp);
// router.post("/api/alerts", authMiddleware, generateAlerts);
// router.post("/logout", authMiddleware, logoutController);
// router.post("/logout-all",authMiddleware,logoutAllDevicesController);

router.post("/login" , login);
router.post("/register", register);
router.post("/refresh",refreshToken);
router.post("/send-otp",sendOtpC);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-login-otp",verifyLoginOtp);
router.post("/api/alerts", authMiddleware, generateAlerts);
router.post("/logout", authMiddleware, logoutController);
router.post("/logout-all",authMiddleware,logoutAllDevicesController);

export default router;