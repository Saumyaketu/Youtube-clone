import express from "express";
import {
  login,
  verifyOTP,
  updateProfile,
  checkDownloadEligibility,
  trackDownload,
  syncWatchTime,
  getProfile,
  getProfileByChannelName,
} from "../controllers/auth.js";
import { verifyAuthToken, requireMatchingUser } from "../middleware/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update/:id", verifyAuthToken, requireMatchingUser, updateProfile);
routes.get("/profile/:id", getProfile);
routes.get("/channel/:channelName", getProfileByChannelName);
routes.get("/check-download/:id", checkDownloadEligibility);
routes.post("/track-download/:id", trackDownload);
routes.post("/sync-watch-time/:id", syncWatchTime);

export default routes;
