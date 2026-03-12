import pool from "../../config/db.js";

export const logoutAllDevicesService = async (userId) => {

  const client = await pool.connect()

  try {

    await client.query("BEGIN")

    await client.query(
      `
      UPDATE sessions
      SET revoked = TRUE
      WHERE user_id = $1
      `,
      [userId]
    )

    await client.query(
      `
      DELETE FROM refresh_tokens
      WHERE user_id = $1
      `,
      [userId]
    )

    await client.query("COMMIT")

    return { message:"Logged out from all devices" }

  } catch(err){

    await client.query("ROLLBACK")
    throw err

  } finally {

    client.release()

  }

};