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

    // if (user.device_id !== deviceId) {
    //     return res.status(403).json({ message: "Device mismatch" })
    // }

    const tokens = generateTokens(user)

    res.json(tokens)

};

exports.register = async (req, res) => {

    try {

        const { username, password, deviceId } = req.body;

        if (!username || !password || !deviceId) {
            return res.status(400).json({
                message: "username, password and deviceId required"
            });
        }

        // check existing user
        const userCheck = await pool.query(
            "SELECT id FROM users WHERE username=$1",
            [username]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({
                message: "User already exists"
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user
        const result = await pool.query(
            `INSERT INTO users (username,password,device_id)
       VALUES ($1,$2,$3)
       RETURNING id,username`,
            [username, hashedPassword, deviceId]
        );

        res.status(201).json({
            message: "User registered",
            user: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            message: "Registration failed"
        });

    }

};