import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

export interface IUser extends Document {
  fullName: string;
  avatar?: string | null;
  email: string;
  phoneNumber?: string;
  googleId?: string;
  password?: string;
  role: "user" | "admin";
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  resetOTP?: string;
  resetOTPExpires?: Date;
  isOTPVerified: boolean;

  setPassword(password: string): Promise<void>;
  verifyPassword(password: string): Promise<boolean>;
  generateOTP(): string;
  verifyOTP(otp: string): boolean;
}

const userSchema = new Schema<IUser>(
  {
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
      required: function (this: IUser) {
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
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function (
  this: IUser,
  password: string,
): Promise<void> {
  const saltRounds = 12;
  this.password = await bcrypt.hash(password, saltRounds);
};

userSchema.methods.verifyPassword = async function (
  this: IUser,
  password: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc: any, ret: any) => {
    delete ret.password;
    return ret;
  },
});

// generate OTP
userSchema.methods.generateOTP = function (this: IUser): string {
  const otp = crypto.randomInt(100000, 1000000).toString();

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  this.resetOTP = hashedOTP;
  this.resetOTPExpires = new Date(Date.now() + 20 * 60 * 1000);

  return otp;
};

// verify OTP
userSchema.methods.verifyOTP = function (this: IUser, otp: string): boolean {
  if (!this.resetOTP || !this.resetOTPExpires) return false;

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
  const isValid = this.resetOTP === hashedOTP;
  const isExpired = Date.now() > this.resetOTPExpires.getTime();

  return isValid && !isExpired;
};

export default mongoose.model<IUser>("User", userSchema);
