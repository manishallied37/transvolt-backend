import { loginService } from "../services/auth/loginService.js";
import { registerService } from "../services/auth/registerService.js";
import { refreshTokenService } from "../services/auth/refreshTokenService.js";
import { sendOtpEmail } from "../services/auth/otpService.js";
import { verifyOtpService } from "../services/auth/verifyOtpService.js";
import { resetPasswordService } from "../services/auth/resetPasswordService.js";

export const login = async (req, res) => {
    try {

        const { login, password, deviceId } = req.body;

        const result = await loginService(login, password, deviceId);

        res.json({
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            expiresIn: 300,
            user: result.user
        });

    } catch (error) {

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

        res.status(403).json({
            message: error.message
        });

    }
};


export const sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        await sendOtpEmail(email);

        res.json({
            message: "OTP sent"
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


export const verifyOtp = async (req, res) => {
    try {

        const { email, otp } = req.body;

        await verifyOtpService(email, otp);

        res.json({
            message: "OTP verified"
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};


export const resetPassword = async (req, res) => {
    try {

        const { email, password } = req.body;

        await resetPasswordService(email, password);

        res.json({
            message: "Password updated. Please login again."
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }
};