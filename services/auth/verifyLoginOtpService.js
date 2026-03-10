import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";

export const verifyLoginOtpService = async (identifier, otp, deviceId) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const otpResult = await client.query(
            `SELECT * FROM otp_verifications
            WHERE identifier=$1
            AND expires_at > NOW()
            ORDER BY created_at DESC
            FOR UPDATE`,
            [identifier]
        );

        if (otpResult.rows.length === 0) {
            throw new Error("Invalid OTP");
        }

        const record = otpResult.rows[0];

        if (new Date(record.expires_at) < new Date()) {
            throw new Error("OTP expired");
        }

        if (record.attempts >= 5) {
            throw new Error("Too many OTP attempts");
        }

        const validOtp = await bcrypt.compare(otp.trim(), record.otp_hash);

        if (!validOtp) {

            await client.query(
                "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id=$1",
                [record.id]
            );

            throw new Error("Invalid OTP");
        }

        const userResult = await client.query(
            `SELECT id,username,email,role,region,depot
             FROM users
             WHERE mobile_number=$1
             FOR UPDATE`,
            [identifier]
        );

        if (userResult.rows.length === 0) {
            throw new Error("Invalid request");
        }

        const user = userResult.rows[0];

        const tokens = generateTokens(user);

        await client.query(
            `DELETE FROM refresh_tokens
             WHERE user_id=$1 AND device_id=$2`,
            [user.id, deviceId]
        );

        const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);

        await client.query(
            `INSERT INTO refresh_tokens
             (user_id, token, device_id, expires_at)
             VALUES ($1,$2,$3,NOW() + interval '7 days')`,
            [user.id, refreshHash, deviceId]
        );

        await client.query(
            "DELETE FROM otp_verifications WHERE id=$1",
            [record.id]
        );

        await client.query("COMMIT");

        return { user, tokens };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
    }
};