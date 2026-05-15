// routes/uploadRoutes.ts

import express from "express";
import upload from "../middleware/upload";
import { uploadImages } from "../controllers/uploadController";

const router = express.Router();

router.post("/upload", upload.array("images", 10), uploadImages);

export default router;
