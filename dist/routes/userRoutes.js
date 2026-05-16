"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
router.get("/", authMiddleware_1.Protect, authMiddleware_1.adminOnly, userController_1.getAllUsers);
router.put("/update", authMiddleware_1.Protect, userController_1.updateUserDetails);
router.put("/update-details", authMiddleware_1.Protect, userController_1.updateUserDetails);
router.put("/update-password", authMiddleware_1.Protect, userController_1.updatePassword);
router.put("/update-avatar", authMiddleware_1.Protect, upload_1.default.single("avatar"), userController_1.updateUserAvatar);
router.delete("/delete-account", authMiddleware_1.Protect, userController_1.deleteUserAccount);
exports.default = router;
