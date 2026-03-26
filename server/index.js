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

io.on('connection', (socket) => {
  console.log('User connected to WebRTC signaling:', socket.id);

  socket.on('join-room', (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients === 0) {
      socket.join(roomId);
    } else if (numClients === 1) {
      socket.join(roomId);
      socket.to(roomId).emit('user-connected', socket.id);
    } else {
      socket.emit('room-full'); 
    }
  });

  socket.on('signal', (data) => {
    io.to(data.userToSignal).emit('signal', {
      signal: data.signal,
      callerID: data.callerID
    });
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id);
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
