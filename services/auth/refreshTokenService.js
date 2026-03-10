import pool from "../../config/db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";
import { REFRESH_SECRET } from "../../config/env.js";

export const refreshTokenService = async (refreshToken) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const tokenRecords = await client.query(
            "SELECT * FROM refresh_tokens WHERE revoked=false"
        );

        let tokenRecord = null;

        for (const record of tokenRecords.rows) {
            const match = await bcrypt.compare(refreshToken, record.token_hash);
            if (match) {
                tokenRecord = record;
                break;
            }
        }

        if (!tokenRecord) {
            throw new Error("Invalid refresh token");
        }

        if (new Date(tokenRecord.expires_at) < new Date()) {
            throw new Error("Refresh token expired");
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = {
            id: decoded.id,
            role: decoded.role,
            region: decoded.region,
            depot: decoded.depot
        };

        const tokens = generateTokens(user);

        const hashedRefresh = await bcrypt.hash(tokens.refreshToken, 10);

        await client.query(
            "UPDATE refresh_tokens SET revoked=true WHERE id=$1",
            [tokenRecord.id]
        );

        await client.query(
            `INSERT INTO refresh_tokens 
            (user_id, token, device_id, expires_at, revoked)
            VALUES ($1,$2,$3,NOW() + interval '7 days', false)`,
            [user.id, hashedRefresh, tokenRecord.device_id]
        );

        await client.query("COMMIT");

        return tokens;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
};