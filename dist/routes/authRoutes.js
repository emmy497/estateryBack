"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
// import { Protect } from "../middleware/authMiddleware";
const router = express_1.default.Router();
// Public auth routes
router.post("/signup", authController_1.signupUser);
router.post("/login", authController_1.loginUser);
router.post("/forgot-password", authController_1.sendOtp);
router.post("/verify-otp", authController_1.verifyOtp);
router.post("/verify-email", authController_1.verifyEmail);
router.post("/resend-otp", authController_1.resendSignupOtp);
router.post("/reset-password", authController_1.resetPasswordWithOTP);
// Protected OTP routes (for account settings)
// router.post("/send-otp", Protect, sendPasswordOTP);
exports.default = router;
