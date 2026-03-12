import pool from "../../config/db.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "./tokenService.js";
import { REFRESH_SECRET } from "../../config/env.js";
import crypto from "crypto";

export const refreshTokenService = async (refreshToken) => {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    const { id, sessionId, jti } = decoded;

    const tokenRow = await client.query(
      `
      SELECT *
      FROM refresh_tokens
      WHERE jti = $1
      FOR UPDATE
      `,
      [jti]
    );

    if (!tokenRow.rows.length) {
      throw new Error("Invalid refresh token");
    }

    const tokenRecord = tokenRow.rows[0];

    if (tokenRecord.revoked) {
      throw new Error("Refresh token revoked");
    }

    if (new Date(tokenRecord.expires_at) < new Date()) {
      throw new Error("Refresh token expired");
    }

    const session = await client.query(
      `
      SELECT revoked, expires_at
      FROM sessions
      WHERE id=$1
      `,
      [sessionId]
    );

    if (!session.rows.length) {
      throw new Error("Session not found");
    }

    if (session.rows[0].revoked) {
      throw new Error("Session revoked");
    }

    if (new Date(session.rows[0].expires_at) < new Date()) {
      throw new Error("Session expired");
    }

    await client.query(
      `
      DELETE FROM refresh_tokens
      WHERE jti=$1
      `,
      [jti]
    );

    const user = { id };

    const newTokens = generateTokens(user, sessionId);

    const hashedToken = crypto
      .createHash("sha256")
      .update(newTokens.refreshToken)
      .digest("hex");

    await client.query(
      `
      INSERT INTO refresh_tokens
      (jti, token, user_id, session_id, expires_at)
      VALUES ($1,$2,$3,$4,NOW() + INTERVAL '7 days')
      `,
      [
        newTokens.refreshJti,
        hashedToken,
        user.id,
        sessionId
      ]
    );

    await client.query("COMMIT");

    return newTokens;

  } catch (err) {

    await client.query("ROLLBACK");
    throw err;

  } finally {

    client.release();

  }

};
