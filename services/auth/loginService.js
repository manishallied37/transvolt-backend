import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { sendOtp } from "./otpService.js";
import { DUMMY_HASH } from "../../config/env.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

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
      phone: result.phone
    });

  } catch (error) {

    res.status(400).json({
      message: error.message
    });

  }
};

export const loginService = async (login, password, deviceId) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const result = await client.query(
      `SELECT * FROM users 
       WHERE LOWER(username)=LOWER($1)
       OR LOWER(email)=LOWER($1)
       LIMIT 1`,
      [login]
    );

    const user = result.rows[0];

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      throw new Error("Invalid credentials");
    }

    if (!user.is_active) {
      throw new Error("Account disabled");
    }

    if (
      user.account_locked_until &&
      new Date(user.account_locked_until) > new Date()
    ) {
      throw new Error("Account temporarily locked");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {

      await client.query(
        `UPDATE users
         SET failed_login_attempts = failed_login_attempts + 1,
             account_locked_until =
               CASE
                 WHEN failed_login_attempts + 1 >= $2
                 THEN NOW() + INTERVAL '${LOCK_TIME_MINUTES} minutes'
                 ELSE account_locked_until
               END
         WHERE id=$1`,
        [user.id, MAX_FAILED_ATTEMPTS]
      );

      await client.query("COMMIT");

      throw new Error("Invalid credentials");
    }

    await client.query(
      `UPDATE users
       SET failed_login_attempts = 0
       WHERE id=$1`,
      [user.id]
    );

    if (!user.mobile_number) {
      throw new Error("MFA not configured");
    }

    if (user.device_id && user.device_id !== deviceId) {
      throw new Error("Unrecognized device");
    }

    if (!user.device_id && deviceId) {
      await client.query(
        `UPDATE users SET device_id=$1 WHERE id=$2`,
        [deviceId, user.id]
      );
    }

    await client.query("COMMIT");

    await sendOtp(user.mobile_number, "phone");

    return {
      message: "OTP sent to registered mobile number",
      userId: user.id,
      phone: user.mobile_number
    };

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();

  }
};