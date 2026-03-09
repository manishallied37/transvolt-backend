import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";

export const registerService = async (data) => {

    const { username, email, password, role, region, depot, deviceId, deviceName } = data;

    const existing = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    );

    if (existing.rows.length > 0) {
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
        `INSERT INTO users (username,email,password,role,region,depot,device_id)
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

    return tokens;
};