import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { sendOtp } from "./otpService.js";
import { DUMMY_HASH } from "../../config/env.js";

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_TIME_MINUTES = 15;

export const login = async (req, res) => {
  try {

    const { login, password, deviceId } = req.body;

    if (!login || !password || !deviceId) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    const result = await loginService(login, password, deviceId);

    return res.status(200).json({
      message: result.message,
      userId: result.userId,
      phone: result.phone
    });

  } catch (error) {

    const statusCode = error.statusCode || 400;

    return res.status(statusCode).json({
      message: error.message
    });

  }
};

export const loginService = async (login, password, deviceId) => {

  const client = await pool.connect();

  try {

    const result = await client.query(
      `SELECT id, username, email, password, is_active,
              failed_login_attempts, account_locked_until,
              mobile_number, device_id
       FROM users
       WHERE LOWER(username)=LOWER($1)
          OR LOWER(email)=LOWER($1)
       LIMIT 1`,
      [login]
    );

    const user = result.rows[0];

    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    if (!user.is_active) {
      const err = new Error("Account disabled");
      err.statusCode = 403;
      throw err;
    }

    if (
      user.account_locked_until &&
      new Date(user.account_locked_until) > new Date()
    ) {
      const err = new Error("Account temporarily locked");
      err.statusCode = 423;
      throw err;
    }

    const validPassword = await bcrypt.compare(password, user.password);

    await client.query("BEGIN");

    if (!validPassword) {

      await client.query(
        `UPDATE users
         SET failed_login_attempts = failed_login_attempts + 1,
             account_locked_until =
               CASE
                 WHEN failed_login_attempts + 1 >= $2
                 THEN NOW() + ($3 * INTERVAL '1 minute')
                 ELSE account_locked_until
               END
         WHERE id = $1`,
        [user.id, MAX_FAILED_ATTEMPTS, LOCK_TIME_MINUTES]
      );

      await client.query("COMMIT");

      const err = new Error("Invalid credentials");
      err.statusCode = 401;
      throw err;
    }

    await client.query(
      `UPDATE users
       SET failed_login_attempts = 0
       WHERE id=$1`,
      [user.id]
    );

    if (!user.mobile_number) {
      const err = new Error("MFA not configured");
      err.statusCode = 403;
      throw err;
    }

    if (user.device_id && user.device_id !== deviceId) {
      const err = new Error("Unrecognized device");
      err.statusCode = 403;
      throw err;
    }

    if (!user.device_id) {
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