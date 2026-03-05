const jwt = require("jsonwebtoken")

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

function generateTokens(user) {

    const accessToken = jwt.sign(
        {
            id: user.id,
            role: user.role,
            region: user.region,
            depot: user.depot
        },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    )

    const refreshToken = jwt.sign(
        { id: user.id },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    )

    return { accessToken, refreshToken }
}

module.exports = { generateTokens }