"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.put("/update", authMiddleware_1.Protect, userController_1.updateUserDetails);
router.put("/update-details", authMiddleware_1.Protect, userController_1.updateUserDetails);
router.put("/update-password", authMiddleware_1.Protect, userController_1.updatePassword);
router.delete("/delete-account", authMiddleware_1.Protect, userController_1.deleteUserAccount);
exports.default = router;
