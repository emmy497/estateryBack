// controllers/uploadController.ts

import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";

export const uploadImages = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "properties" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(file.buffer);
      });
    });

    const results: any = await Promise.all(uploadPromises);

    const imageUrls = results.map((r: any) => r.secure_url);

    res.json({ images: imageUrls });
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};
