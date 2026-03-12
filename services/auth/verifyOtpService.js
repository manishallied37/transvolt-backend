import pool from "../../config/db.js";
import crypto from "crypto";

export const verifyOtpService = async (identifier, otp) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const result = await client.query(
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

    if (result.rows.length === 0) {
      throw new Error("OTP expired or invalid");
    }

    const record = result.rows[0];

    if (record.attempts >= 5) {
      throw new Error("Too many OTP attempts. Request a new OTP.");
    }

    const hashedOtp = crypto
      .createHash("sha256")
      .update(otp.trim())
      .digest("hex");

    const isMatch = crypto.timingSafeEqual(
      Buffer.from(hashedOtp),
      Buffer.from(record.otp_hash)
    );

    if (!isMatch) {

      await client.query(
        `
        UPDATE otp_verifications
        SET attempts = attempts + 1
        WHERE id = $1
        `,
        [record.id]
      );

      await client.query("COMMIT");

      throw new Error("Invalid OTP");
    }

    await client.query(
      `
      DELETE FROM otp_verifications
      WHERE id = $1
      `,
      [record.id]
    );

    await client.query("COMMIT");

    return true;

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();

  }

};