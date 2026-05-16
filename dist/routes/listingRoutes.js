"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listingController_1 = require("../controllers/listingController");
const router = express_1.default.Router();
// CREATE LISTING REQUEST
router.post("/", listingController_1.createListingRequest);
// GET ALL LISTING REQUESTS (for admin)
router.get("/", listingController_1.getListingRequests);
// UPDATE LISTING REQUEST STATUS
router.patch("/:id/status", listingController_1.updateListingRequestStatus);
exports.default = router;
