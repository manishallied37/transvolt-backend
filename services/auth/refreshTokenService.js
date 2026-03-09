import pool from "../../config/db.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "./tokenService.js";
import { REFRESH_SECRET } from "../../config/env.js";

export const refreshTokenService = async (refreshToken) => {

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const dbToken = await pool.query(
        "SELECT * FROM refresh_tokens WHERE token=$1",
        [refreshToken]
    );

    if (dbToken.rows.length === 0) {
        throw new Error("Invalid refresh token");
    }

    const tokenRecord = dbToken.rows[0];

    if (new Date(tokenRecord.expires_at) < new Date()) {
        throw new Error("Refresh token expired");
    }

    const user = {
        id: decoded.id,
        role: decoded.role,
        region: decoded.region,
        depot: decoded.depot
    };

    const tokens = generateTokens(user);

    await pool.query(
        "DELETE FROM refresh_tokens WHERE token=$1",
        [refreshToken]
    );

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
         VALUES ($1,$2,$3,NOW() + interval '7 days')`,
        [user.id, tokens.refreshToken, tokenRecord.device_id]
    );

    return tokens;
};