import pool from "../../config/db.js";
import { transporter } from "../../utils/mailer.js";
import crypto from "crypto";
import { sendSMS } from "../../utils/sms.js";

const OTP_EXPIRY_MINUTES = 2;
const OTP_COOLDOWN_SECONDS = 30;

export const sendOtp = async (identifier, method) => {

  const client = await pool.connect();

  const otp = crypto.randomInt(100000, 999999).toString();

  const otpHash = crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");

  const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  try {

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT created_at
       FROM otp_verifications
       WHERE identifier = $1
       LIMIT 1`,
      [identifier]
    );

    if (existing.rows.length > 0) {

      const lastOtpTime = new Date(existing.rows[0].created_at);
      const seconds = (Date.now() - lastOtpTime.getTime()) / 1000;

      if (seconds < OTP_COOLDOWN_SECONDS) {
        throw new Error("OTP recently sent. Please try again later.");
      }
    }

    await client.query(
      `INSERT INTO otp_verifications
       (identifier, otp_hash, expires_at, attempts)
       VALUES ($1,$2,$3,0)
       ON CONFLICT (identifier)
       DO UPDATE SET
         otp_hash = EXCLUDED.otp_hash,
         expires_at = EXCLUDED.expires_at,
         attempts = 0,
         created_at = NOW()`,
      [identifier, otpHash, expiry]
    );

    await client.query("COMMIT");

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();

  }

  try {

    if (method === "email") {

      await transporter.sendMail({
        from: '"System Support" <noreply@system.com>',
        to: identifier,
        subject: "Your OTP Code",
        text: 'Hello,\n\nYour OTP for password reset is:\t' + otp + '\n\nThis OTP will expire in 2 minutes.\n\nThis is a system generated email. Please do not reply to this email.\n\nRegards,\nNetradyne FMS Support'
      });

    } else if (method === "phone") {

      const message =
        `Your OTP is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`;

      await sendSMS(identifier, message);

    } else {

      throw new Error("Invalid OTP method");

    }

  } catch (err) {

    await pool.query(
      `DELETE FROM otp_verifications WHERE identifier=$1`,
      [identifier]
    );

    throw new Error("Failed to send OTP. Please try again.");

  }

};