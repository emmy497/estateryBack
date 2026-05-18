import type { Request, Response } from "express";
import { sendEmail } from "../utils/sendEmail";
import { emailTemplate } from "../utils/emailTemplate";

export const subscribeNewsletter = async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ message: "Please provide a valid email address." });
    return;
  }

  const body = `
    <h2 style="color:#7065F0;margin-top:0;">You're on the list! 🎉</h2>
    <p>Hi there,</p>
    <p>Thank you for subscribing to the <strong>Estatery Newsletter</strong>. You are now officially part of our community!</p>
    <p>As a subscriber, you'll be the <strong>first to know</strong> about:</p>
    <ul style="padding-left:20px;line-height:2;">
      <li>Exclusive <strong>Brekete offer details</strong> and limited-time deals</li>
      <li>New property listings before they go public</li>
      <li>Market updates and real estate tips</li>
      <li>Special promotions for renters, buyers, and landlords</li>
    </ul>
    <p style="margin-top:24px;">We promise — <strong>no spam, ever</strong>. Only the good stuff.</p>
    <p>Stay tuned and keep an eye on your inbox!</p>
  `;

  await sendEmail(email, "Welcome to the Estatery Newsletter!", emailTemplate(body));

  res.status(200).json({ message: "Subscribed successfully! Check your email." });
};
