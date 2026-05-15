import { Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";
import cloudinary from "../config/cloudinary";

// UPDATE USER DETAILS
export const updateUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fullName if provided
    if (fullName !== undefined) {
      user.fullName = fullName;
    }

    // Update email if provided and different
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
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
  } catch (error) {
    console.error("updateUserDetails:", error);
    res.status(500).json({ message: "Server error" });
  }
};

//  UPDATE PASSWORD
export const updatePassword = async (req: AuthRequest, res: Response) => {
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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password || "");

    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("updatePassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER AVATAR
export const updateUserAvatar = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const file = req.file;

    // Validate input
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Upload to Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "profile_photos" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(file.buffer);
    });

    // Update user avatar
    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      message: "Profile photo updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("updateUserAvatar:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL USERS (admin)
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: "user" })
      .select("fullName email phoneNumber isActive createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (error) {
    console.error("getAllUsers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER ACCOUNT
export const deleteUserAccount = async (req: AuthRequest, res: Response) => {
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
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return res.status(400).json({ message: "Password is incorrect" });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("deleteUserAccount:", error);
    res.status(500).json({ message: "Server error" });
  }
};
