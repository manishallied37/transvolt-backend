import jwt from "jsonwebtoken";
import { ACCESS_SECRET } from "../config/env.js";

export const authMiddleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    console.log("Authorization header:", req.headers.authorization);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    try {

        const decoded = jwt.verify(token, ACCESS_SECRET, {
            issuer: "auth-service",
            audience: "netradyne-api"
        });

        if (decoded.type !== "access") {
            return res.status(401).json({ message: "Invalid token type" });
        }

        req.user = decoded;

        next();

    } catch (err) {

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        return res.status(401).json({ message: "Invalid token" });
    }
};