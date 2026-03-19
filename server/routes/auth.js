import express from "express";
import {
  login,
  verifyOTP,
  updateProfile,
  checkDownloadEligibility,
  trackDownload,
} from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update/:id", updateProfile);
routes.get("/check-download/:id", checkDownloadEligibility);
routes.post("/track-download/:id", trackDownload);

export default routes;
