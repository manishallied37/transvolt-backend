import { loginService } from "../services/auth/loginService.js";
import { registerService } from "../services/auth/registerService.js";
import { refreshTokenService } from "../services/auth/refreshTokenService.js";
import { sendOtp } from "../services/auth/otpService.js";
import { verifyOtpService } from "../services/auth/verifyOtpService.js";
import { resetPasswordService } from "../services/auth/resetPasswordService.js";
import { verifyLoginOtpService } from '../services/auth/verifyLoginOtpService.js'

export const login = async (req, res) => {
  try {

    const { login, password, deviceId } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    const result = await loginService(login, password, deviceId);

    res.status(200).json({
      message: result.message,
      userId: result.userId,
      phone:result.phone
    });

  } catch (error) {

    console.error("Error:", error.message);
    console.error("Request Body:", req.body);

    res.status(400).json({
      message: error.message
    });

  }
};

export const register = async (req, res) => {
    try {

        const tokens = await registerService(req.body);

        res.json(tokens);

    } catch (error) {

        console.error("Error:", error.message);
        console.error("Request Body:", req.body);

        res.status(400).json({
            message: error.message
        });

    }
};

export const refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body;

        const tokens = await refreshTokenService(refreshToken);

        res.json(tokens);

    } catch (error) {

        console.error("Error:", error.message);
        console.error("Request Body:", req.body);

        res.status(403).json({
            message: error.message
        });

    }
};

export const sendOtpC = async (req, res) => {
    try {

        const { identifier, method } = req.body;

        await sendOtp(identifier, method);

        return res.status(200).json({
            message: "OTP sent successfully"
        });

    } catch (error) {

        console.error("Error:", error.message);
        console.error("Request Body:", req.body);

        return res.status(500).json({
            message: "Failed to send OTP"
        });
    }
};


export const verifyOtp = async (req, res) => {

    try {

        const { identifier, otp, method } = req.body;

        await verifyOtpService(identifier, otp, method);

        res.status(200).json({
            message: "OTP verified successfully"
        });

    } catch (error) {

        console.error("Error:", error.message);
        console.error("Request Body:", req.body);

        res.status(400).json({
            message: error.message
        });

    }

};

export const resetPassword = async (req, res) => {

    try {

        const { identifier, password, method } = req.body;

        await resetPasswordService(identifier, password, method);

        res.status(200).json({
            message: "Password reset successful"
        });

    } catch (error) {

        console.error("Error:", error.message);
        console.error("Request Body:", req.body);

        res.status(400).json({
            message: error.message
        });

    }
};

export const verifyLoginOtp = async (req, res) => {
  try {

    const { identifier, otp, deviceId } = req.body;

    console.log("Identifier:", identifier);
    console.log("Entered OTP:", otp);

    if (!identifier || !otp || !deviceId) {
      return res.status(400).json({
        message: "identifier, otp and deviceId are required"
      });
    }

    const result = await verifyLoginOtpService(identifier, otp, deviceId);

    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken
    });

  } catch (error) {

    console.error("Error:", error.message);
    console.error("Request Body:", req.body);

    return res.status(400).json({
      message: error.message
    });

  }
};