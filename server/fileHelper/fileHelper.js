"use strict";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const { CloudinaryStorage } = require("multer-storage-cloudinary");

import pkg from "multer-storage-cloudinary";

// 1. Destructure from the default import
const { CloudinaryStorage } = pkg;

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "youtube-clone/videos",
    resource_type: "video",
    allowed_formats: ["mp4", "mkv", "webm"],
  },
});

const upload = multer({ storage: storage });

export default upload;
