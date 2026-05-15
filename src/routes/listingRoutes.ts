import express from "express";
import {
  createListingRequest,
  getListingRequests,
  updateListingRequestStatus,
} from "../controllers/listingController";

const router = express.Router();

// CREATE LISTING REQUEST
router.post("/", createListingRequest);

// GET ALL LISTING REQUESTS (for admin)
router.get("/", getListingRequests);

// UPDATE LISTING REQUEST STATUS
router.patch("/:id/status", updateListingRequestStatus);

export default router;
