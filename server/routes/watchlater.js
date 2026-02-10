import express from "express";
import {
  getAllWatchlaterVideo,
  handleWatchlater,
  getWatchLaterStatus,
} from "../controllers/watchlater.js";

const routes = express.Router();

routes.get("/:userId", getAllWatchlaterVideo);
routes.get("/status/:videoId/:userId", getWatchLaterStatus);
routes.post("/:videoId", handleWatchlater);

export default routes;
