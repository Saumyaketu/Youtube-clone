import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/video.js";
import likeRoutes from "./routes/like.js";
import watchlaterRoutes from "./routes/watchlater.js";
import historyRoutes from "./routes/history.js";
import commentRoutes from "./routes/comment.js";
import paymentRoutes from "./routes/payment.js";
import path from "path";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.get("/", (req, res) => {
  res.send("Youtube's backend is working");
});

app.use(bodyParser.json());
app.use("/user", authRoutes);
app.use("/video", videoRoutes);
app.use("/like", likeRoutes);
app.use("/watch", watchlaterRoutes);
app.use("/history", historyRoutes);
app.use("/comment", commentRoutes);
app.use("/payment", paymentRoutes);

const PORT = process.env.PORT || 5000;

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  });
