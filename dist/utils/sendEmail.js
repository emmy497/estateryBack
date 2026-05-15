"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const brevo_1 = require("@getbrevo/brevo");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const client = new brevo_1.BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});
const sendEmail = async (to, subject, htmlContent) => {
    await client.transactionalEmails.sendTransacEmail({
        sender: {
            email: "emmanuelisrael497@gmail.com",
            name: "estatery",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
    });
};
exports.sendEmail = sendEmail;
