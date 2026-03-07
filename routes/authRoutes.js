import express from "express";
import { login, register, refreshToken, sendOtp, verifyOtp, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh", refreshToken);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;