import pool from "../../config/db.js";

export const verifyOtpService = async (email, otp) => {

    const result = await pool.query(
        "SELECT * FROM otp_verifications WHERE email=$1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error("OTP not found");
    }

    const record = result.rows[0];

    if (record.otp != otp) {
        throw new Error("Invalid OTP");
    }

    if (new Date(record.expires_at) < new Date()) {
        throw new Error("OTP expired");
    }

    return true;
};