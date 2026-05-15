"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./models/User"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
}
const createAdmin = async () => {
    await mongoose_1.default.connect(mongoUri);
    const existingAdmin = await User_1.default.findOne({ email: "admin@example.com" });
    if (existingAdmin) {
        console.log("Admin already exists");
        process.exit();
    }
    const admin = new User_1.default({
        fullName: "Super Admin",
        email: "admin@gmail.com",
        role: "admin",
    });
    await admin.setPassword("admin123");
    await admin.save();
    console.log("Admin created");
    process.exit();
};
createAdmin();
