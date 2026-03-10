import pool from "../../config/db.js";
import { transporter } from "../../utils/mailer.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendSMS } from "../../utils/sms.js";

const OTP_EXPIRY_MINUTES = 2;
const OTP_COOLDOWN_SECONDS = 30;

export const sendOtp = async (identifier, method) => {

  const client = await pool.connect();

  let otp;
  let hashedOtp;
  let expiry;

  try {

    otp = crypto.randomInt(100000, 999999).toString();
    hashedOtp = await bcrypt.hash(otp, 10);

    expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await client.query("BEGIN");

    const existing = await client.query(
      `SELECT created_at 
       FROM otp_verifications
       WHERE identifier=$1
       ORDER BY created_at DESC
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
      `DELETE FROM otp_verifications WHERE identifier=$1`,
      [identifier]
    );

    await client.query(
      `INSERT INTO otp_verifications
       (identifier, otp_hash, expires_at, attempts)
       VALUES ($1,$2,$3,0)`,
      [identifier, hashedOtp, expiry]
    );

    await client.query("COMMIT");

  } catch (err) {

    await client.query("ROLLBACK");
    client.release();
    throw err;

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

      const message = `Your OTP is ${otp}. It will expire in ${OTP_EXPIRY_MINUTES} minutes.`;

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

  } finally {

    client.release();

  }
};