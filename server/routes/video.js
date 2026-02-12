import express from "express";
import {
  getAllVideo,
  uploadVideo,
  getUserVideos,
} from "../controllers/video.js";
import upload from "../fileHelper/fileHelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadVideo);
routes.get("/getall", getAllVideo);
routes.get("/getuservideos/:videochannel", getUserVideos);

export default routes;
