"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordWithOTP = exports.verifyOtp = exports.sendOtp = exports.loginUser = exports.signupUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
const sendEmail_1 = require("../utils/sendEmail");
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
        const userExists = await User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        const user = new User_1.default({
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
        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            token: generateToken(user._id.toString(), user.role),
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
        const user = await User_1.default.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password || "");
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
        const user = (await User_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        const otp = user.generateOTP();
        await user.save();
        await (0, sendEmail_1.sendEmail)(user.email, "Your OTP Code", `<h2>Your OTP is: ${otp}</h2><p>Expires in 20 minutes</p>`);
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
        const user = (await User_1.default.findOne({ email }).select("+resetOTP +resetOTPExpires"));
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
const resetPasswordWithOTP = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User_1.default.findOne({ email }).select("+password");
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
