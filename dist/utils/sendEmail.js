"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const brevo_1 = require("@getbrevo/brevo");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.BREVO_API_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL ||
    process.env.EMAIL_USER ||
    "emmanuelisrael497@gmail.com";
const senderName = process.env.BREVO_SENDER_NAME || "Estatery";
if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured. ");
}
const client = new brevo_1.BrevoClient({
    apiKey,
});
const sendEmail = async (to, subject, htmlContent, recipientName) => {
    await client.transactionalEmails.sendTransacEmail({
        sender: {
            email: senderEmail,
            name: senderName,
        },
        to: [{ email: to, name: recipientName }],
        subject,
        htmlContent,
        textContent: htmlContent,
        replyTo: {
            email: senderEmail,
            name: senderName,
        },
    });
};
exports.sendEmail = sendEmail;
