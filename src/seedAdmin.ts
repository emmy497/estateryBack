import mongoose from "mongoose";
import User from "./models/User";

import dotenv from "dotenv";


dotenv.config();


const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

const createAdmin = async () => {
  await mongoose.connect(mongoUri);

  const existingAdmin = await User.findOne({ email: "admin@example.com" });

  if (existingAdmin) {
    console.log("Admin already exists");
    process.exit();
  }

  const admin = new User({
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
