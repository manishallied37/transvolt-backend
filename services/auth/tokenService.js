import jwt from "jsonwebtoken";
import crypto from "crypto";

import {
  ACCESS_SECRET,
  REFRESH_SECRET,
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL
} from "../../config/env.js";

export function generateTokens(user, sessionId) {

  const accessJti = crypto.randomUUID();
  const refreshJti = crypto.randomUUID();

  const accessToken = jwt.sign(
    {
      jti: accessJti,
      sessionId: sessionId,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      region: user.region,
      depot: user.depot
    },
    ACCESS_SECRET,
    {
      expiresIn: ACCESS_TOKEN_TTL,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    }
  );

  const refreshToken = jwt.sign(
    {
      jti: refreshJti,
      sessionId: sessionId,
      id: user.id
    },
    REFRESH_SECRET,
    {
      expiresIn: REFRESH_TOKEN_TTL,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE
    }
  );

  return {
    accessToken,
    refreshToken,
    accessJti,
    refreshJti
  };
}