"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = exports.updatePassword = exports.updateUserDetails = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const User_1 = __importDefault(require("../models/User"));
// UPDATE USER DETAILS
const updateUserDetails = async (req, res) => {
    try {
        const { fullName, email } = req.body;
        const userId = req.user?.id;
        // Validate input
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Find user by ID
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Update fullName if provided
        if (fullName !== undefined) {
            user.fullName = fullName;
        }
        // Update email if provided and different
        if (email && email !== user.email) {
            const emailExists = await User_1.default.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }
        await user.save();
        res.status(200).json({
            message: "User details updated successfully",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("updateUserDetails:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updateUserDetails = updateUserDetails;
//  UPDATE PASSWORD
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.user?.id;
        // Validate input
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Please provide current password and new password",
            });
        }
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .json({ message: "New password and confirm password do not match" });
        }
        // Check if new password is different from current password
        if (currentPassword === newPassword) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }
        // Check if new password is strong enough (minimum 8 characters)
        if (newPassword.length < 6) {
            return res
                .status(400)
                .json({ message: "Password must be at least 6 characters long" });
        }
        // Find user
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify current password
        const isMatch = await bcrypt_1.default.compare(currentPassword, user.password || "");
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        // Hash new password
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(newPassword, salt);
        // Update password
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        console.error("updatePassword:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.updatePassword = updatePassword;
// DELETE USER ACCOUNT
const deleteUserAccount = async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.user?.id;
        // Validate input
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!password) {
            return res.status(400).json({
                message: "Please provide your password to delete your account",
            });
        }
        // Find user
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Verify password
        const isMatch = await bcrypt_1.default.compare(password, user.password || "");
        if (!isMatch) {
            return res.status(400).json({ message: "Password is incorrect" });
        }
        // Delete user
        await User_1.default.findByIdAndDelete(userId);
        res.status(200).json({
            message: "User account deleted successfully",
        });
    }
    catch (error) {
        console.error("deleteUserAccount:", error);
        res.status(500).json({ message: "Server error" });
    }
};
exports.deleteUserAccount = deleteUserAccount;
