import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter
const transporter = nodemailer.createTransport({
  // ADD A HOST
  host: "smtp-relay.brevo.com",
  // PORT
  port: 587,
  // AUTH
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export default transporter;
