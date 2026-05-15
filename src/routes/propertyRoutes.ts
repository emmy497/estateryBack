import express from "express";
import {
  createProperty,
  getProperties,
  getPropertyById,
  updateProperty,
  updatePropertyStatus,
} from "../controllers/propertyController.js";
import upload from "../middleware/upload.js";
import { Protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// CREATE PROPERTY
router.post("/", upload.array("images", 10), createProperty);
router.get("/", getProperties);

router.patch("/:id/status", Protect, updatePropertyStatus);
router.patch("/:id", Protect, updateProperty);

router.get("/:id", getPropertyById);

export default router;
