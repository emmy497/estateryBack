"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tourControllers_js_1 = require("../controllers/tourControllers.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
// USER
router.post("/", authMiddleware_js_1.Protect, tourControllers_js_1.createTourRequest);
// ADMIN
router.get("/", authMiddleware_js_1.Protect, authMiddleware_js_1.adminOnly, tourControllers_js_1.getAllTours);
router.put("/:id", authMiddleware_js_1.Protect, authMiddleware_js_1.adminOnly, tourControllers_js_1.updateTourStatus);
exports.default = router;
