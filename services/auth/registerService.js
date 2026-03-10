import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import { generateTokens } from "./tokenService.js";

export const registerService = async (data) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const {
            username,
            email,
            password,
            role,
            region,
            depot,
            deviceId,
            deviceName,
            mobile_number
        } = data;

        if (!deviceId) {
            throw new Error("Device ID required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error("Invalid email format");
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            throw new Error("Password does not meet security requirements");
        }

        const existing = await client.query(
            `SELECT id FROM users
             WHERE LOWER(username)=LOWER($1)
             OR LOWER(email)=LOWER($2)
             OR mobile_number=$3`,
            [username, email, mobile_number]
        );

        if (existing.rows.length > 0) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await client.query(
            `INSERT INTO users
            (username,email,password,role,region,depot,device_id,mobile_number)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
            RETURNING id,username,email,role,region,depot`,
            [
                username,
                email,
                hashedPassword,
                role,
                region,
                depot,
                deviceId,
                mobile_number
            ]
        );

        const user = result.rows[0];

        await client.query(
            `INSERT INTO devices (user_id, device_id, device_name)
             VALUES ($1,$2,$3)
             ON CONFLICT (user_id, device_id) DO NOTHING`,
            [user.id, deviceId, deviceName]
        );

        const tokens = generateTokens(user);

        const refreshHash = await bcrypt.hash(tokens.refreshToken, 10);

        await client.query(
            `INSERT INTO refresh_tokens
            (user_id, token, device_id, expires_at)
            VALUES ($1,$2,$3,NOW() + interval '7 days')`,
            [user.id, refreshHash, deviceId]
        );

        await client.query("COMMIT");

        return {
            user,
            tokens
        };

    } catch (err) {

        await client.query("ROLLBACK");
        throw err;

    } finally {

        client.release();
    }
};