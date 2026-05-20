"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithOTP = exports.resendSignupOtp = exports.verifyEmail = exports.verifyOtp = exports.sendOtp = exports.loginUser = exports.signupUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_js_1 = __importDefault(require("../models/User.js"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_js_1 = require("../utils/sendEmail.js");
const emailTemplate_js_1 = require("../utils/emailTemplate.js");
dotenv_1.default.config();
// Generate JWT
const generateToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};
// REGISTER
const signupUser = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;
        // check if user exists (email only)
        const userExists = await User_js_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const user = new User_js_1.default({
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
        // Generate OTP for email verification
        const otp = user.generateOTP();
        await user.save();
        try {
            console.log("Sending welcome email to:", user.email);
            await (0, sendEmail_js_1.sendEmail)(user.email, "Welcome to Estatery – Verify Your Email", (0, emailTemplate_js_1.emailTemplate)(`
          <h2 style="margin-top:0;color:#7065F0;">Welcome to Estatery, ${user.fullName}! 🎉</h2>
          <p>We're thrilled to have you on board. To get started, please verify your email address using the code below.</p>
          ${emailTemplate_js_1.divider}
          <p style="margin-bottom:8px;color:#888;font-size:13px;">YOUR VERIFICATION CODE</p>
          <p style="font-size:36px;font-weight:bold;text-align:center;letter-spacing:6px;color:#7065F0;margin:0 0 8px;">
            ${otp}
          </p>
          <p style="text-align:center;font-size:13px;color:#999;margin-top:4px;">Expires in <strong>15 minutes</strong></p>
          ${emailTemplate_js_1.divider}
          <p style="margin-bottom:6px;">Here's what you can do on Estatery:</p>
          <ul style="padding-left:20px;color:#555;line-height:2;">
            <li>Browse thousands of properties for rent and sale</li>
            <li>Save your favourite listings</li>
            <li>Schedule property tours with ease</li>
            <li>List your own property</li>
          </ul>
          ${emailTemplate_js_1.divider}
          <p style="font-size:13px;color:#888;">If you didn't create this account, you can safely ignore this email.</p>
        `), user.fullName);
            console.log("Welcome email sent to:", user.email);
        }
        catch (emailError) {
            console.error("Welcome email failed:", emailError);
        }
        res.status(201).json({
            message: "Account created. Please check your email for the verification code.",
            email: user.email,
        });
    }
    catch (error) {
        const code = typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code;
        if (code === 11000) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        console.error("signupUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.signupUser = signupUser;
// LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_js_1.default.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password || "");
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!user.isEmailVerified && user.role !== "admin") {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }
        res.json({
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar ?? null,
            },
            token: generateToken(user._id.toString(), user.role),
        });
    }
    catch (error) {
        console.error("loginUser:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.loginUser = loginUser;
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Email is required",
            });
            return;
        }
        const user = (await User_js_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const otp = user.generateOTP();
        await user.save();
        await (0, sendEmail_js_1.sendEmail)(user.email, "Reset Your Password – Estatery", (0, emailTemplate_js_1.emailTemplate)(`
        <h2 style="margin-top:0;color:#7065F0;">Reset Your Password</h2>
        <p>Hi <strong>${user.fullName || "User"}</strong>,</p>
        <p>We received a request to reset your Estatery password. Use the verification code below to proceed.</p>
        ${emailTemplate_js_1.divider}
        <p style="margin-bottom:8px;color:#888;font-size:13px;">YOUR VERIFICATION CODE</p>
        <p style="font-size:36px;font-weight:bold;text-align:center;letter-spacing:6px;color:#7065F0;margin:0 0 8px;">
          ${otp}
        </p>
        <p style="text-align:center;font-size:13px;color:#999;margin-top:4px;">Expires in <strong>15 minutes</strong></p>
        ${emailTemplate_js_1.divider}
        <p style="font-size:13px;color:#888;">
          If you didn’t request a password reset, you can safely ignore this email.
          <strong>Do not share this code with anyone.</strong>
        </p>
      `), user.fullName);
        res.json({
            success: true,
            message: "OTP sent successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
            });
        }
        const user = (await User_js_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
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
    }
    catch (error) {
        console.error("verifyOtp:", error);
        return res.status(500).json({ message: "Verification failed" });
    }
};
exports.verifyOtp = verifyOtp;
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const user = (await User_js_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
        if (!user || !user.verifyOTP(otp)) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.isEmailVerified = true;
        user.isOTPVerified = true;
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();
        return res.json({ success: true, message: "Email verified successfully" });
    }
    catch (error) {
        console.error("verifyEmail:", error);
        return res.status(500).json({ message: "Verification failed" });
    }
};
exports.verifyEmail = verifyEmail;
const resendSignupOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const user = (await User_js_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const otp = user.generateOTP();
        await user.save();
        await (0, sendEmail_js_1.sendEmail)(user.email, "Your New Verification Code – Estatery", (0, emailTemplate_js_1.emailTemplate)(`
        <h2 style="margin-top:0;color:#7065F0;">New Verification Code</h2>
        <p>Hi <strong>${user.fullName}</strong>,</p>
        <p>Here is your new email verification code:</p>
        ${emailTemplate_js_1.divider}
        <p style="margin-bottom:8px;color:#888;font-size:13px;">YOUR VERIFICATION CODE</p>
        <p style="font-size:36px;font-weight:bold;text-align:center;letter-spacing:6px;color:#7065F0;margin:0 0 8px;">
          ${otp}
        </p>
        <p style="text-align:center;font-size:13px;color:#999;margin-top:4px;">Expires in <strong>15 minutes</strong></p>
        ${emailTemplate_js_1.divider}
        <p style="font-size:13px;color:#888;">If you didn't request this, please ignore this email.</p>
      `), user.fullName);
        res.json({ success: true, message: "Verification code resent" });
    }
    catch (error) {
        console.error("resendSignupOtp:", error);
        res.status(500).json({ message: "Failed to resend code" });
    }
};
exports.resendSignupOtp = resendSignupOtp;
const resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User_js_1.default.findOne({ email }).select("+password");
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
    }
    catch (error) {
        return res.status(500).json({
            message: "Reset failed",
        });
    }
};
exports.resetPasswordWithOTP = resetPasswordWithOTP;
