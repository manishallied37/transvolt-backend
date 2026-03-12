import { Pool } from "pg";
import { PG_USERNAME, PG_HOST, PG_DATABASE, PG_PASS, PG_PORT } from "../config/env.js";

const pool = new Pool({
    user: PG_USERNAME,
    host: PG_HOST,
    database: PG_DATABASE,
    password: PG_PASS,
    port: PG_PORT
});

export default pool;