import express from "express";
import {
  getSubscriberCount,
  getSubscriptionStatus,
  getSubscriptionVideos,
  getSubscriptions,
  subscribe,
  unsubscribe,
} from "../controllers/subscription.js";
import {
  requireMatchingUser,
  verifyAuthToken,
} from "../middleware/auth.js";

const routes = express.Router();

routes.post("/:userId/:channelId", verifyAuthToken, requireMatchingUser, subscribe);
routes.delete("/:userId/:channelId", verifyAuthToken, requireMatchingUser, unsubscribe);
routes.get("/:userId/status/:channelId", verifyAuthToken, requireMatchingUser, getSubscriptionStatus);
routes.get("/count/:channelId", getSubscriberCount);
routes.get("/:userId/videos", verifyAuthToken, requireMatchingUser, getSubscriptionVideos);
routes.get("/:userId", verifyAuthToken, requireMatchingUser, getSubscriptions);

export default routes;