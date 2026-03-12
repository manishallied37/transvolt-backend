import pool from "../../config/db.js";
import crypto from "crypto";
import { generateTokens } from "./tokenService.js";

export const verifyLoginOtpService = async (
  identifier,
  otp,
  deviceId,
  userAgent,
  ipAddress
) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    console.log("Identifier sent to DB:", identifier);

    const otpResult = await client.query(
      `
      SELECT id, otp_hash, attempts
      FROM otp_verifications
      WHERE identifier = $1
      AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1
      FOR UPDATE
      `,
      [identifier]
    );

    if (otpResult.rows.length === 0) {
      throw new Error("OTP expired or invalid");
    }

    const record = otpResult.rows[0];

    if (record.attempts >= 5) {
      throw new Error("Too many OTP attempts. Please request a new OTP.");
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    if (hashedOtp !== record.otp_hash) {

      await client.query(
        `
        UPDATE otp_verifications
        SET attempts = attempts + 1
        WHERE id = $1
        `,
        [record.id]
      );

      throw new Error("Invalid OTP");
    }

    const userResult = await client.query(
      `
      SELECT id, username, email, role, region, depot
      FROM users
      WHERE mobile_number = $1
      FOR UPDATE
      `,
      [identifier]
    );

    if (userResult.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];

    const sessionId = crypto.randomUUID();

    await client.query(
      `
      INSERT INTO sessions
      (id, user_id, device_id, ip_address, user_agent, expires_at)
      VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')
      `,
      [sessionId, user.id, deviceId, ipAddress, userAgent]
    );

    const tokens = generateTokens(user, sessionId);

    const hashedRefreshToken = crypto
    .createHash("sha256")
    .update(tokens.refreshToken)
    .digest("hex");

    await client.query(
      `
      INSERT INTO refresh_tokens
      (jti, token, user_id, session_id, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
      `,
      [tokens.refreshJti, hashedRefreshToken, user.id, sessionId]
    );
    await client.query(
      `
      DELETE FROM otp_verifications
      WHERE id = $1
      `,
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