import dotenv from "dotenv";

dotenv.config();

export const ACCESS_SECRET = process.env.ACCESS_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;
