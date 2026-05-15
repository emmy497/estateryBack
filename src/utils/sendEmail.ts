import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.BREVO_API_KEY;
const senderEmail =
  process.env.BREVO_SENDER_EMAIL ||
  process.env.EMAIL_USER ||
  "emmanuelisrael497@gmail.com";
const senderName = process.env.BREVO_SENDER_NAME || "Estatery";

if (!apiKey) {
  throw new Error("BREVO_API_KEY is not configured. ");
}

const client = new BrevoClient({
  apiKey,
});



export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string,
  recipientName?: string,
): Promise<void> => {
  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: senderName,
    },
    to: [{ email: to, name: recipientName }],
    subject,
    htmlContent,
    textContent:htmlContent,
    replyTo: {
      email: senderEmail,
      name: senderName,
    },
  });
};
