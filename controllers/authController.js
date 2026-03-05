const pool = require("../config/db")
const bcrypt = require("bcryptjs")
const { generateTokens } = require("../services/tokenService")

exports.login = async (req, res) => {

    const { username, password, deviceId } = req.body

    const result = await pool.query(
        "SELECT * FROM users WHERE username=$1",
        [username]
    )

    if (result.rows.length === 0) {
        return res.status(401).json({ message: "User not found" })
    }

    const user = result.rows[0]

    if (!user.is_active) {
        return res.status(403).json({ message: "Account inactive" })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
        return res.status(401).json({ message: "Invalid password" })
    }

    if (user.device_id !== deviceId) {
        return res.status(403).json({ message: "Device mismatch" })
    }

    const tokens = generateTokens(user)

    await pool.query(
        `DELETE FROM refresh_tokens 
         WHERE user_id=$1 AND device_id=$2`,
        [user.id, deviceId]
    )

    await pool.query(
        `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
         VALUES ($1,$2,$3,NOW() + interval '7 days')`,
        [user.id, tokens.refreshToken, deviceId]
    )

    res.json({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: 900,
        user: {
            id: user.id,
            role: user.role,
            region: user.region,
            depot: user.depot
        }
    })

};


exports.refreshToken = async (req, res) => {
    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token missing" });
        }

        const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

        const user = {
            id: decoded.id,
            role: decoded.role,
            region: decoded.region,
            depot: decoded.depot
        };

        const tokens = generateTokens(user);

        res.json({
            accessToken: tokens.accessToken,
            expiresIn: 900
        });

    } catch (error) {
        console.error("Refresh error:", error);

        return res.status(403).json({
            message: "Invalid refresh token"
        });
    }
};


exports.register = async (req, res) => {

    const { username, password, role, region, depot, deviceId, deviceName } = req.body;

    try {

        const existing = await pool.query(
            "SELECT * FROM users WHERE username=$1",
            [username]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (username, password, role, region, depot, device_id)
             VALUES ($1,$2,$3,$4,$5)
             RETURNING *`,
            [username, hashedPassword, role, region, depot, deviceId]
        );

        const user = result.rows[0];

        await pool.query(
            `INSERT INTO devices (user_id, device_id, device_name)
             VALUES ($1,$2,$3)`,
            [user.id, deviceId, deviceName]
        );

        const tokens = generateTokens(user);

        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, device_id, expires_at)
             VALUES ($1,$2,$3,NOW() + interval '7 days')`,
            [user.id, tokens.refreshToken, deviceId]
        );

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: 900
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
};