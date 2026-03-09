import pool from "../../config/db.js";
import { transporter } from "../../utils/mailer.js";

export const sendOtpEmail = async (email) => {

    const expiry = new Date(Date.now() + 2 * 60 * 1000);
    const otp = Math.floor(100000 + Math.random() * 900000);

    await pool.query(
        "DELETE FROM otp_verifications WHERE email=$1",
        [email]
    );

    await pool.query(
        "INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1,$2,$3)",
        [email, otp, expiry]
    );

    await transporter.sendMail({
        from: '"Netradyne FMS Support" <netradyne.noreply@gmail.com>',
        to: email,
        subject: "Password Reset OTP",
        text: 'Hello,\n\nYour OTP for password reset is:\t' + otp + '\n\nThis OTP will expire in 2 minutes.\n\nThis is a system generated email. Please do not reply to this email.\n\nRegards,\nNetradyne FMS Support'
    });
};