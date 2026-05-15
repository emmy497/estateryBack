// middleware/upload.ts

import multer from "multer";

const storage = multer.memoryStorage(); // store in memory

const upload = multer({ storage });

export default upload;
