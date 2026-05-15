import express, { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";
import crypto from "crypto";
import dotenv from "dotenv";
import * as Brevo from "@getbrevo/brevo";
import { sendEmail } from "../utils/sendEmail.js";
import { emailTemplate, detailsBox, divider } from "../utils/emailTemplate.js";

dotenv.config();

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}
// Generate JWT
const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });
};

// REGISTER

export const signupUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { fullName, email, password, role } = req.body;

    // check if user exists (email only)
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const user: IUser = new User({
      fullName,
      email,
      role,
    });

    // ensure password is provided (since no googleId flow here)
    if (!password) {
      res.status(400).json({ message: "Password is required" });
      return;
    }

    await user.setPassword(password);

    await user.save();

    try {
      console.log("Sending welcome email to:", user.email);
      await sendEmail(
        user.email,
        "Welcome to Estatery!",
        emailTemplate(`
          <h2 style="margin-top:0;color:#7065F0;">Welcome to Estatery, ${user.fullName}! 🎉</h2>
          <p>We're thrilled to have you on board. Your account has been created successfully.</p>
          ${divider}
          <p style="margin-bottom:6px;">Here's what you can do on Estatery:</p>
          <ul style="padding-left:20px;color:#555;line-height:2;">
            <li>Browse thousands of properties for rent and sale</li>
            <li>Save your favourite listings</li>
            <li>Schedule property tours with ease</li>
            <li>List your own property</li>
          </ul>
          ${divider}
          <p>If you have any questions, our team is always happy to help.</p>
        `),
        user.fullName,
      );
      console.log("Welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error: unknown) {
    const code =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: unknown }).code;

    if (code === 11000) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    console.error("signupUser:", error);

    res.status(500).json({ message: "Server error" });
  }
};
// LOGIN
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token: generateToken(user._id.toString(), user.role),
    });
  } catch (error) {
    console.error("loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Email is required",
      });
      return;
    }

    const user = (await User.findOne({ email }).select(
      "+resetOTP +resetOTPExpires",
    )) as IUser;

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    const otp: string = user.generateOTP();
    await user.save();

    await sendEmail(
      user.email,
      "Reset Your Password – Estatery",
      emailTemplate(`
        <h2 style="margin-top:0;color:#7065F0;">Reset Your Password</h2>
        <p>Hi <strong>${user.fullName || "User"}</strong>,</p>
        <p>We received a request to reset your Estatery password. Use the verification code below to proceed.</p>
        ${divider}
        <p style="margin-bottom:8px;color:#888;font-size:13px;">YOUR VERIFICATION CODE</p>
        <p style="font-size:36px;font-weight:bold;text-align:center;letter-spacing:6px;color:#7065F0;margin:0 0 8px;">
          ${otp}
        </p>
        <p style="text-align:center;font-size:13px;color:#999;margin-top:4px;">Expires in <strong>15 minutes</strong></p>
        ${divider}
        <p style="font-size:13px;color:#888;">
          If you didn’t request a password reset, you can safely ignore this email.
          <strong>Do not share this code with anyone.</strong>
        </p>
      `),
      user.fullName,
    );
    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error: unknown) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};
export const verifyOtp = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, otp }: { email: string; otp: string } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const user = (await User.findOne({ email }).select(
      "+resetOTP +resetOTPExpires",
    )) as IUser | null;

    if (!user || !user.verifyOTP(otp)) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    user.isOTPVerified = true;
    await user.save();

    return res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("verifyOtp:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};

export const resetPasswordWithOTP = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const { email, newPassword } = req.body as {
      email: string;
      newPassword: string;
    };

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isOTPVerified) {
      return res.status(403).json({
        message: "OTP verification required",
      });
    }

    await user.setPassword(newPassword);

    // cleanup
    user.isOTPVerified = false;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;

    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Reset failed",
    });
  }
};