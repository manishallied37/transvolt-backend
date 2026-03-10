import twilio from "twilio";
import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } from "../config/env.js";

const client = twilio(
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN
);

const phoneRegex = /^\+[1-9]\d{7,14}$/;

export const sendSMS = async (phone, message) => {

  if (!phoneRegex.test(phone)) {
    throw new Error("Invalid phone number format");
  }

  try {

    const response = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phone
    });

    console.log("SMS sent successfully");

    return response.sid;

  } catch (error) {

    console.error("Twilio SMS failed:", error.message);

    throw new Error("SMS delivery failed");
  }
};