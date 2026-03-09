import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const resetPasswordService = async (email, password) => {

    const user = await pool.query(
        "SELECT * FROM users WHERE email=$1",
        [email]
    );

    if (user.rows.length === 0) {
        throw new Error("User not found");
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
        "UPDATE users SET password=$1 WHERE email=$2",
        [hashed, email]
    );

    const userId = user.rows[0].id;

    await pool.query(
        "DELETE FROM refresh_tokens WHERE user_id=$1",
        [userId]
    );

    await pool.query(
        "DELETE FROM otp_verifications WHERE email=$1",
        [email]
    );
};