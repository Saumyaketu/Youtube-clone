import express from "express";
import {
  handleLike,
  handleDislike,
  getAllLikedVideo,
  getLikeStatus,
} from "../controllers/like.js";

const routes = express.Router();

routes.get("/:userId", getAllLikedVideo);
routes.get("/status/:videoId/:userId", getLikeStatus);
routes.post("/like/:videoId", handleLike);
routes.post("/dislike/:videoId", handleDislike);

export default routes;
