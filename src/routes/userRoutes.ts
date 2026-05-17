import express from "express";
import {
  updateUserDetails,
  updatePassword,
  updateUserAvatar,
  deleteUserAccount,
  getAllUsers,
  toggleUserStatus,
} from "../controllers/userController";
import { Protect, adminOnly } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

router.get("/", Protect, adminOnly, getAllUsers);
router.patch("/:id/status", Protect, adminOnly, toggleUserStatus);
router.put("/update", Protect, updateUserDetails);
router.put("/update-details", Protect, updateUserDetails);
router.put("/update-password", Protect, updatePassword);
router.put(
  "/update-avatar", 
  Protect,
  upload.single("avatar"),
  updateUserAvatar,
);
router.delete("/delete-account", Protect, deleteUserAccount);

export default router;
