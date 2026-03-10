import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER, EMAIL_HOST } from "../config/env.js";

export const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: 587,
    secure: false,
    family: 4,

    pool: true,
    maxConnections: 5,
    maxMessages: 100,

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    requireTLS: true,

    tls: {
        rejectUnauthorized: true
    },

    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});