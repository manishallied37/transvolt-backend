import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ACCESS_SECRET, REFRESH_SECRET } from "../../config/env.js";

export function generateTokens(user) {

    const accessToken = jwt.sign(
        {
            jti: crypto.randomUUID(),
            type: "access",
            id: user.id,
            role: user.role,
            region: user.region,
            depot: user.depot
        },
        ACCESS_SECRET,
        {
            expiresIn: "5m",
            issuer: "auth-service",
            audience: "netradyne-api"
        }
    );

    const refreshToken = jwt.sign(
        {
            jti: crypto.randomUUID(),
            type: "refresh",
            id: user.id
        },
        REFRESH_SECRET,
        {
            expiresIn: "7d",
            issuer: "auth-service",
            audience: "netradyne-api"
        }
    );

    return { accessToken, refreshToken };
}