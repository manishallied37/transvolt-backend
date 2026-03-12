import dotenv from "dotenv";

dotenv.config();

export const ACCESS_SECRET = process.env.ACCESS_SECRET;
export const REFRESH_SECRET = process.env.REFRESH_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;
export const EMAIL_HOST = process.env.EMAIL_HOST;
export const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
export const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
export const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
export const DUMMY_HASH = process.env.DUMMY_HASH;
export const TOKEN_ISSUER = process.env.TOKEN_ISSUER;
export const TOKEN_AUDIENCE = process.env.TOKEN_AUDIENCE;
export const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL;
export const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL;
export const PORT = process.env.PORT;
export const PG_USERNAME = process.env.PG_USERNAME;
export const PG_HOST = process.env.PG_HOST;
export const PG_DATABASE = process.env.PG_DATABASE;
export const PG_PASS = process.env.PG_PASS;
export const PG_PORT = process.env.PG_PORT;