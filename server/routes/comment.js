import express from "express";
import {
  getAllComment,
  postComment,
  deleteComment,
  editComment,
} from "../controllers/comment.js";

const routes = express.Router();

routes.get("/:videoId", getAllComment);
routes.post("/postComment", postComment);
routes.delete("/deleteComment/:id", deleteComment);
routes.post("/editComment/:id", editComment);

export default routes;
