"use strict";
// controllers/uploadController.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImages = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadImages = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }
        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                cloudinary_1.default.uploader
                    .upload_stream({ folder: "properties" }, (error, result) => {
                    if (error)
                        reject(error);
                    else
                        resolve(result);
                })
                    .end(file.buffer);
            });
        });
        const results = await Promise.all(uploadPromises);
        const imageUrls = results.map((r) => r.secure_url);
        res.json({ images: imageUrls });
    }
    catch (error) {
        res.status(500).json({ message: "Upload failed", error });
    }
};
exports.uploadImages = uploadImages;
