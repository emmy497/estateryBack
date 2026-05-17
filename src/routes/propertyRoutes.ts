import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  updatePropertyStatus,
  updatePropertyImages,
} from "../controllers/propertyController.js";
import upload from "../middleware/upload.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PROPERTY
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "agentImage", maxCount: 1 },
  ]),
  createProperty,
);
router.get("/", getProperties);

router.patch("/:id/status", Protect, updatePropertyStatus);
router.patch("/:id/images", Protect, upload.array("images", 10), updatePropertyImages);
router.patch("/:id", Protect, updateProperty);

router.get("/:id", getPropertyById);

export default router;
