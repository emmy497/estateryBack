import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import cors from "cors";
import propertyRoutes from "./routes/propertyRoutes";
import tourRoutes from "./routes/tourRoutes";
import listingRoutes from "./routes/listingRoutes";
import newsletterRoutes from "./routes/newsletterRoutes";
import dns from "dns";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("Overrode Node DNS servers");
} catch (e) {
  console.log("Could not set DNS servers");
}

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Allow frontend origin
app.use(
  cors({
    origin: "*",
    credentials: true, // only if you're using cookies/auth
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/listing-requests", listingRoutes);
app.use("/api/newsletter", newsletterRoutes);

const PORT = Number(process.env.PORT ?? 3002);
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error("MONGO_URI is not set");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set (required for auth tokens)");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("database connected");
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error(
      "Database connection error:",
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  });
