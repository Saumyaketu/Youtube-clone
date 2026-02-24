import express from "express";
import {
  login,
  updateProfile,
  checkDownloadEligibility,
  trackDownload,
} from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateProfile);
routes.get("/check-download/:id", checkDownloadEligibility);
routes.post("/track-download/:id", trackDownload);

export default routes;
