import express from "express";
import {
  getAllHistoryVideo,
  handleHistory,
  handleView,
  removeHistory,
} from "../controllers/history.js";

const routes = express.Router();

routes.get("/:userId", getAllHistoryVideo);
routes.post("/views/:videoId", handleView);
routes.post("/:videoId", handleHistory);
routes.delete("/:id", removeHistory);

export default routes;
