import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";

export const loginService = async (login, password, deviceId) => {

    const result = await pool.query(
        `SELECT * FROM users 
         WHERE LOWER(username)=LOWER($1)
         OR LOWER(email)=LOWER($1)`,
        [login]
    );

    if (result.rows.length === 0) {
        throw new Error("User not found");
    }

    const user = result.rows[0];

    if (!user.is_active) {
        throw new Error("Account inactive");
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
        throw new Error("Invalid password");
    }

    if (user.device_id !== deviceId) {
        throw new Error("Device mismatch");
    }

    const tokens = generateTokens(user);

    await pool.query(
        `DELETE FROM refresh_tokens 
         WHERE user_id=$1 AND device_id=$2`,
        [user.id, deviceId]
    );

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
         VALUES ($1,$2,$3,NOW() + interval '7 days')`,
        [user.id, tokens.refreshToken, deviceId]
    );

    return { user, tokens };
};