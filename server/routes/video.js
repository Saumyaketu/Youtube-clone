import express from "express";
import { getAllVideo, uploadVideo } from "../controllers/video.js";
import upload from "../fileHelper/fileHelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadVideo);
routes.get("/getall", getAllVideo);

export default routes;
