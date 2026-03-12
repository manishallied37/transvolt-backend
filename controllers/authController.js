import { loginService } from "../services/auth/loginService.js";
import { registerService } from "../services/auth/registerService.js";
import { refreshTokenService } from "../services/auth/refreshTokenService.js";
import { sendOtp } from "../services/auth/otpService.js";
import { verifyOtpService } from "../services/auth/verifyOtpService.js";
import { resetPasswordService } from "../services/auth/resetPasswordService.js";
import { verifyLoginOtpService } from "../services/auth/verifyLoginOtpService.js";
import { generateAlert as alertService } from "../services/alerts/alertService.js";
import { logoutService } from "../services/auth/logoutService.js";
import { logoutAllDevicesService } from "../services/auth/logoutFromAllDevices.js"

export const login = async (req, res) => {

  try {

    const { login, password, deviceId } = req.body;

    if (!login || !password) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    const result = await loginService(login, password, deviceId);

    return res.status(200).json(result);

  } catch (error) {

    return res.status(401).json({
      message: error.message
    });

  }

};

export const register = async (req, res) => {

  try {

    const result = await registerService(req.body);

    return res.status(201).json(result);

  } catch (error) {

    return res.status(400).json({
      message: error.message
    });

  }

};

export const refreshToken = async (req, res) => {

  try {

    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required"
      });
    }

    const tokens = await refreshTokenService(refreshToken);

    return res.status(200).json(tokens);

  } catch (error) {

    return res.status(403).json({
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

    return res.status(400).json({
      message: error.message
    });

  }

};

export const verifyOtp = async (req, res) => {

  try {

    const { identifier, otp } = req.body;

    await verifyOtpService(identifier, otp);

    return res.status(200).json({
      message: "OTP verified successfully"
    });

  } catch (error) {

    return res.status(400).json({
      message: error.message
    });

  }

};

export const resetPassword = async (req, res) => {

  try {

    const { identifier, password, method } = req.body;

    await resetPasswordService(identifier, password, method);

    return res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {

    return res.status(400).json({
      message: error.message
    });

  }

};

export const verifyLoginOtp = async (req, res) => {
  try {

    const { identifier, otp, deviceId } = req.body;

    if (!identifier || !otp || !deviceId) {
      return res.status(400).json({
        message: "identifier, otp and deviceId are required"
      });
    }

    const userAgent = req.headers["user-agent"];
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

    const result = await verifyLoginOtpService(
      identifier,
      otp,
      deviceId,
      userAgent,
      ipAddress
    );

    return res.status(200).json({
      message: "Login successful",
      ...result
    });

  } catch (error) {
    return res.status(401).json({
      message: error.message
    });
  }
};

export const generateAlerts = async (req, res) => {

  try {

    const { count = 1, type, overrides = {} } = req.body;

    const result = await alertService(count, type, overrides);

    return res.status(200).json(result);

  } catch (err) {

    return res.status(400).json({
      message: err.message
    });

  }

};

export const logoutController = async (req,res) => {

  try {

    const sessionId = req.user.sessionId

    const result = await logoutService(sessionId)

    return res.status(200).json(result)

  } catch(err) {

    console.error("Logout error:",err)

    return res.status(500).json({
      message:"Logout failed"
    })

  }

};

export const logoutAllDevicesController = async (req,res) => {

  try {

    const userId = req.user.id

    const result = await logoutAllDevicesService(userId)

    return res.status(200).json(result)

  } catch(err){

    console.error("Logout all error:",err)

    return res.status(500).json({
      message:"Logout all devices failed"
    })

  }

};