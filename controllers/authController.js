import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokens } from "../services/tokenService.js";
import { EMAIL_PASS, EMAIL_USER } from "../config/env.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

export const login = async (req, res) => {

    const { login, password, deviceId } = req.body

    const result = await pool.query(
        `SELECT * FROM users 
         WHERE LOWER(username)=LOWER($1)
         OR LOWER(email)=LOWER($1)`,
        [login]
    )

    if (result.rows.length === 0) {
        return res.status(401).json({ message: "User not found" })
    }

    const user = result.rows[0]

    if (!user.is_active) {
        return res.status(403).json({ message: "Account inactive" })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
        return res.status(401).json({ message: "Invalid password" })
    }

    if (user.device_id !== deviceId) {
        return res.status(403).json({ message: "Device mismatch" })
    }

    const tokens = generateTokens(user)

    await pool.query(
        `DELETE FROM refresh_tokens 
         WHERE user_id=$1 AND device_id=$2`,
        [user.id, deviceId]
    )

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
         VALUES ($1,$2,$3,NOW() + interval '7 days')`,
        [user.id, tokens.refreshToken, deviceId]
    )

    res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 300,
        user: {
            id: user.id,
            role: user.role,
            region: user.region,
            depot: user.depot
        }
    })
};


export const refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = {
            id: decoded.id,
            role: decoded.role,
            region: decoded.region,
            depot: decoded.depot
        };

        const tokens = generateTokens(user);

        res.json({
            accessToken: tokens.accessToken,
            expiresIn: 300
        });

    } catch (error) {
        console.error("Refresh error:", error);

        return res.status(403).json({
            message: "Invalid refresh token"
        });
    }
};


export const register = async (req, res) => {

    const { username, email, password, role, region, depot, deviceId, deviceName } = req.body;

    try {

        const existing = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [username]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, email, password, role, region, depot, device_id)
             VALUES ($1,$2,$3,$4,$5,$6,$7)
             RETURNING *`,
            [username, email, hashedPassword, role, region, depot, deviceId]
        );

        const user = result.rows[0];

        await pool.query(
            `INSERT INTO devices (user_id, device_id, device_name)
             VALUES ($1,$2,$3)`,
            [user.id, deviceId, deviceName]
        );

        const tokens = generateTokens(user);

        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
             VALUES ($1,$2,$3,NOW() + interval '7 days')`,
            [user.id, tokens.refreshToken, deviceId]
        );

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 300
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
};

export const sendOtp = async (req, res) => {
    const { email } = req.body;

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiry = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            "DELETE FROM otp_verifications WHERE email=$1",
            [email]
        );

        await pool.query(
            "INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1,$2,$3)",
            [email, otp, expiry]
        );

        await transporter.sendMail({
            from: '"Netradyne FMS Support" <netradyne.noreply@gmail.com>',
            to: email,
            subject: "Password Reset OTP",
            text: 'Hello,\n\nYour OTP for password reset is:\t' + otp + '\n\nThis OTP will expire shortly.\n\nThis is a system generated email. Please do not reply to this email.\n\nRegards,\nNetradyne FMS Support'
        });

        res.json({ message: "OTP sent" });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error in sending OTP"
        });
    }
};

export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {

        const result = await pool.query(
            "SELECT * FROM otp_verifications WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "OTP not found" });
        }

        const record = result.rows[0];

        if (record.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date(record.expires_at) < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        res.json({ message: "OTP verified" });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error in verifying OTP"
        });
    }
};

export const resetPassword = async (req, res) => {
    const { email, password } = req.body;

    try {

        const user = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashed = await bcrypt.hash(password, 10);

        await pool.query(
            "UPDATE users SET password=$1 WHERE email=$2",
            [hashed, email]
        );

        await pool.query(
            "DELETE FROM otp_verifications WHERE email=$1",
            [email]
        );

        res.json({ message: "Password updated" });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Error in resetting password"
        });
    }
};