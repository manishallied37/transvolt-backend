import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {
  ACCESS_SECRET,
  TOKEN_ISSUER,
  TOKEN_AUDIENCE
} from "../config/env.js";

export const authMiddleware = async (req, res, next) => {

  try {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ message: "Invalid authorization format" });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, ACCESS_SECRET, {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    });

    const session = await pool.query(
      `
      SELECT revoked, expires_at
      FROM sessions
      WHERE id=$1
      `,
      [decoded.sessionId]
    );

    if (!session.rows.length) {
      return res.status(401).json({ message: "Session invalid" });
    }

    if (session.rows[0].revoked) {
      return res.status(401).json({ message: "Session revoked" });
    }

    if (new Date(session.rows[0].expires_at) < new Date()) {
      return res.status(401).json({ message: "Session expired" });
    }

    await pool.query(
      `UPDATE sessions SET last_used_at = NOW() WHERE id=$1`,
      [decoded.sessionId]
    );

    req.user = {
      id: decoded.id,
      role: decoded.role,
      region: decoded.region,
      depot: decoded.depot,
      sessionId: decoded.sessionId
    };

    next();

  } catch (err) {

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });

  }

};