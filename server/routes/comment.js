import express from "express";
import {
  getAllComment,
  postComment,
  deleteComment,
  editComment,
  likeComment,
  dislikeComment,
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/:videoId", getAllComment);
routes.post("/postComment", postComment);
routes.delete("/deleteComment/:id", deleteComment);
routes.post("/editComment/:id", editComment);
routes.put("/like/:commentId", likeComment);
routes.put("/dislike/:commentId", dislikeComment);

export default routes;
