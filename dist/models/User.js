"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const userSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    avatar: { type: String, default: null },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    googleId: { type: String, index: true },
    password: {
        type: String,
        select: false,
        required: function () {
            return !this.googleId;
        },
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    resetOTP: { type: String, select: false },
    resetOTPExpires: { type: Date, select: false },
    isOTPVerified: { type: Boolean, default: false },
}, { timestamps: true });
userSchema.methods.setPassword = async function (password) {
    const saltRounds = 12;
    this.password = await bcrypt_1.default.hash(password, saltRounds);
};
userSchema.methods.verifyPassword = async function (password) {
    if (!this.password)
        return false;
    return bcrypt_1.default.compare(password, this.password);
};
userSchema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
        delete ret.password;
        return ret;
    },
});
// generate OTP
userSchema.methods.generateOTP = function () {
    const otp = crypto_1.default.randomInt(100000, 1000000).toString();
    const hashedOTP = crypto_1.default.createHash("sha256").update(otp).digest("hex");
    this.resetOTP = hashedOTP;
    this.resetOTPExpires = new Date(Date.now() + 20 * 60 * 1000);
    return otp;
};
// verify OTP
userSchema.methods.verifyOTP = function (otp) {
    if (!this.resetOTP || !this.resetOTPExpires)
        return false;
    const hashedOTP = crypto_1.default.createHash("sha256").update(otp).digest("hex");
    const isValid = this.resetOTP === hashedOTP;
    const isExpired = Date.now() > this.resetOTPExpires.getTime();
    return isValid && !isExpired;
};
exports.default = mongoose_1.default.model("User", userSchema);
