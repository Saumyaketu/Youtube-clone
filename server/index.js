import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import videoRoutes from "./routes/video.js";
import likeRoutes from "./routes/like.js";
import watchlaterRoutes from "./routes/watchlater.js";
import historyRoutes from "./routes/history.js";
import commentRoutes from "./routes/comment.js";
import paymentRoutes from "./routes/payment.js";
import turnRoutes from "./routes/turn.js";

dotenv.config();
const app = express();

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const users = {};
const socketToRoom = {};

io.on("connection", (socket) => {
  console.log("User connected to WebRTC signaling:", socket.id);

  socket.on("join-room", (roomId) => {
    if (users[roomId]) {
      users[roomId].push(socket.id);
    } else {
      users[roomId] = [socket.id];
    }
    socketToRoom[socket.id] = roomId;

    const usersInThisRoom = users[roomId].filter((id) => id !== socket.id);

    socket.emit("all-users", usersInThisRoom);
  });

  socket.on("video-play", (roomId) => {
    socket.to(roomId).emit("sync-play");
  });

  socket.on("video-pause", (roomId) => {
    socket.to(roomId).emit("sync-pause");
  });

  socket.on("video-seek", ({ roomId, time }) => {
    socket.to(roomId).emit("sync-seek", time);
  });

  socket.on("sending-signal", (payload) => {
    io.to(payload.userToSignal).emit("user-joined", {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on("returning-signal", (payload) => {
    io.to(payload.callerID).emit("receiving-returned-signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomId = socketToRoom[socket.id];
    let room = users[roomId];
    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomId] = room;
      socket.to(roomId).emit("user-disconnected", socket.id);
    }
    console.log("User disconnected:", socket.id);
  });
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));

app.get("/", (req, res) => {
  res.send("Youtube's backend is working with WebRTC Signaling.");
});

app.use("/user", authRoutes);
app.use("/video", videoRoutes);
app.use("/turn", turnRoutes);
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
    httpServer.listen(PORT, () => {
      console.log(`Express and Socket.io Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Mongodb connection error:", error);
  });
