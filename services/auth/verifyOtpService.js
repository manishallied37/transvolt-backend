import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const verifyOtpService = async (identifier, otp, method) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const result = await client.query(
            `SELECT * FROM otp_verifications
            WHERE identifier=$1
            AND expires_at > NOW()
            ORDER BY created_at DESC
            FOR UPDATE`,
            [identifier]
        );

        if (result.rows.length === 0) {
            throw new Error("Invalid OTP");
        }

        const record = result.rows[0];

        if (new Date(record.expires_at) < new Date()) {
            throw new Error("OTP expired");
        }

        if (record.attempts >= 5) {
            throw new Error("Too many OTP attempts");
        }

        const isValid = await bcrypt.compare(otp.trim(), record.otp_hash);

        if (!isValid) {

            await client.query(
                `UPDATE otp_verifications 
                 SET attempts = attempts + 1 
                 WHERE id=$1`,
                [record.id]
            );

            throw new Error("Invalid OTP");
        }

        await client.query(
            `DELETE FROM otp_verifications WHERE id=$1`,
            [record.id]
        );

        await client.query("COMMIT");

        return true;

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();
    }
};