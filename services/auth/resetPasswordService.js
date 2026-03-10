import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const resetPasswordService = async (identifier, password, method) => {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        let userQuery;
        let deleteOtpQuery;
        let updateUserQuery;

        if (method === "email") {
            userQuery = "SELECT id,password FROM users WHERE email=$1 FOR UPDATE";
            updateUserQuery = "UPDATE users SET password=$1 WHERE email=$2";
            deleteOtpQuery = "DELETE FROM otp_verifications WHERE email=$1";
        } 
        else if (method === "phone") {
            userQuery = "SELECT id,password FROM users WHERE mobile_number=$1 FOR UPDATE";
            updateUserQuery = "UPDATE users SET password=$1 WHERE mobile_number=$2";
            deleteOtpQuery = "DELETE FROM otp_verifications WHERE phone=$1";
        } 
        else {
            throw new Error("Invalid reset method");
        }

        const userResult = await client.query(userQuery, [identifier]);

        if (userResult.rows.length === 0) {
            throw new Error("Invalid request");
        }

        const userData = userResult.rows[0];

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordRegex.test(password)) {
            throw new Error("Password does not meet security requirements");
        }

        const samePassword = await bcrypt.compare(password, userData.password);

        if (samePassword) {
            throw new Error("New password must be different");
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await client.query(updateUserQuery, [hashedPassword, identifier]);

        const userId = userData.id;

        await client.query(
            "DELETE FROM refresh_tokens WHERE user_id=$1",
            [userId]
        );

        await client.query(deleteOtpQuery, [identifier]);

        await client.query("COMMIT");

        return { message: "Password reset successful" };

    } catch (error) {

        await client.query("ROLLBACK");
        throw error;

    } finally {

        client.release();

    }
};