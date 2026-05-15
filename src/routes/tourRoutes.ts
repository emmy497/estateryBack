import express from "express";
import {
  createTourRequest,
  getAllTours,
  updateTourStatus,
} from "../controllers/tourControllers.js";

import { Protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER
router.post("/", Protect, createTourRequest);

// ADMIN
router.get("/", Protect, adminOnly, getAllTours);
router.put("/:id", Protect, adminOnly, updateTourStatus);

export default router;
