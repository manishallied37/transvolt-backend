import jwt from "jsonwebtoken";
import { ACCESS_SECRET, REFRESH_SECRET } from "../config/env.js";

export function generateTokens(user) {

    const accessToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
            region: user.region,
            depot: user.depot
        },
        ACCESS_SECRET,
        { expiresIn: "5m" }
    )

    const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    )

    return { accessToken, refreshToken };
}