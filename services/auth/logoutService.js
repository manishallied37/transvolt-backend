import pool from "../../config/db.js";

export const logoutService = async (sessionId) => {

  const client = await pool.connect()

  try {

    await client.query("BEGIN")

    await client.query(
      `
      UPDATE sessions
      SET revoked = TRUE
      WHERE id = $1
      `,
      [sessionId]
    )

    await client.query(
      `
      DELETE FROM refresh_tokens
      WHERE session_id = $1
      `,
      [sessionId]
    )

    await client.query("COMMIT")

    return { message: "Logged out successfully" }

  } catch (err) {

    await client.query("ROLLBACK")
    throw err

  } finally {

    client.release()

  }

};