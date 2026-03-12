import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";

export const registerService = async (data) => {

  const {
    username,
    email,
    password,
    role,
    region,
    depot,
    deviceId,
    deviceName,
    mobile_number
  } = data;

  if (!deviceId) {
    throw new Error("Device ID required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Invalid email format");
  }

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error("Password does not meet security requirements");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const result = await client.query(
      `INSERT INTO users
       (username,email,password,role,region,depot,device_id,mobile_number)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING id,username,email,role,region,depot`,
      [
        username.toLowerCase(),
        email.toLowerCase(),
        hashedPassword,
        role,
        region,
        depot,
        deviceId,
        mobile_number
      ]
    );

    const user = result.rows[0];

    await client.query(
      `INSERT INTO devices (user_id, device_id, device_name)
       VALUES ($1,$2,$3)
       ON CONFLICT (user_id, device_id) DO NOTHING`,
      [user.id, deviceId, deviceName || "Unknown Device"]
    );

    const tokens = generateTokens(user);

    const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);

    await client.query(
      `INSERT INTO refresh_tokens
       (user_id, jti, token, device_id, expires_at, revoked)
       VALUES ($1,$2,$3,$4,NOW() + INTERVAL '7 days', false)`,
      [user.id, tokens.jti, refreshHash, deviceId]
    );

    await client.query("COMMIT");

    return {
      user,
      tokens
    };

  } catch (err) {

    await client.query("ROLLBACK");

    if (err.code === "23505") {
      throw new Error("User already exists");
    }

    throw err;

  } finally {

    client.release();

  }

};