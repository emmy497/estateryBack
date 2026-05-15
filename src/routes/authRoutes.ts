import express from "express";
import {
  signupUser,
  loginUser,
  sendOtp,
  verifyOtp, 
  resetPasswordWithOTP
 
} from "../controllers/authController";
// import { Protect } from "../middleware/authMiddleware";

const router = express.Router();

// Public auth routes
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/forgot-password", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPasswordWithOTP);

// Protected OTP routes (for account settings)
// router.post("/send-otp", Protect, sendPasswordOTP);

export default router;
