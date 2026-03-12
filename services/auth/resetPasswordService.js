import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

export const resetPasswordService = async (identifier, password, method) => {

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!passwordRegex.test(password)) {
    throw new Error("Password does not meet security requirements");
  }

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    let column;

    if (method === "email") column = "email";
    else if (method === "phone") column = "mobile_number";
    else throw new Error("Invalid reset method");

    const userResult = await client.query(
      `SELECT id, password
       FROM users
       WHERE ${column} = $1
       AND is_active = true
       FOR UPDATE`,
      [identifier]
    );

    if (userResult.rows.length === 0) {
      throw new Error("Invalid request");
    }

    const user = userResult.rows[0];

    const samePassword = await bcrypt.compare(password, user.password);

    if (samePassword) {
      throw new Error("New password must be different");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await client.query(
      `UPDATE users
       SET password=$1
       WHERE id=$2`,
      [hashedPassword, user.id]
    );

    await client.query(
      `UPDATE refresh_tokens
       SET revoked=true
       WHERE user_id=$1`,
      [user.id]
    );

    await client.query(
      `DELETE FROM otp_verifications
       WHERE identifier=$1`,
      [identifier]
    );

    await client.query("COMMIT");

    return { message: "Password reset successful" };

  } catch (error) {

    await client.query("ROLLBACK");
    throw error;

  } finally {

    client.release();

  }

};