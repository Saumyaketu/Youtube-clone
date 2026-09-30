import express from "express";
import {
  getAllVideo,
  uploadVideo,
  getUserVideos,
  updateVideo,
} from "../controllers/video.js";
import upload from "../fileHelper/fileHelper.js";
import { verifyAuthToken } from "../middleware/auth.js";

const routes = express.Router();

const uploadVideoFile = (req, res, next) => {
  upload.single("file")(req, res, (error) => {
    if (error) {
      console.error("Video upload middleware error:", error);
      return res.status(400).json({
        message: error.message || "Video upload failed",
      });
    }

    return next();
  });
};

routes.post("/upload", verifyAuthToken, uploadVideoFile, uploadVideo);
routes.patch("/:id", verifyAuthToken, updateVideo);
routes.get("/getall", getAllVideo);
routes.get("/getuservideos/:videochannel", getUserVideos);

export default routes;
