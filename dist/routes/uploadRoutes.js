"use strict";
// routes/uploadRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const upload_1 = __importDefault(require("../middleware/upload"));
const uploadController_1 = require("../controllers/uploadController");
const router = express_1.default.Router();
router.post("/upload", upload_1.default.array("images", 10), uploadController_1.uploadImages);
exports.default = router;
