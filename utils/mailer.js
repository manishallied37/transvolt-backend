import nodemailer from "nodemailer";
import { EMAIL_PASS, EMAIL_USER, EMAIL_HOST } from "../config/env.js";

export const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: 587,
    secure: false,
    family: 4,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});