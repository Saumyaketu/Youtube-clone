import express from "express";
import { login, updateProfile } from "../controllers/auth.js";

const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateProfile);

export default routes;
