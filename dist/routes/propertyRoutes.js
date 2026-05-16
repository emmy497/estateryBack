"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyController_js_1 = require("../controllers/propertyController.js");
const upload_js_1 = __importDefault(require("../middleware/upload.js"));
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = express_1.default.Router();
// CREATE PROPERTY
router.post("/", upload_js_1.default.array("images", 10), propertyController_js_1.createProperty);
router.get("/", propertyController_js_1.getProperties);
router.patch("/:id/status", authMiddleware_js_1.Protect, propertyController_js_1.updatePropertyStatus);
router.patch("/:id/images", authMiddleware_js_1.Protect, upload_js_1.default.array("images", 10), propertyController_js_1.updatePropertyImages);
router.patch("/:id", authMiddleware_js_1.Protect, propertyController_js_1.updateProperty);
router.get("/:id", propertyController_js_1.getPropertyById);
exports.default = router;
