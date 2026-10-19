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
import subscriptionRoutes from "./routes/subscription.js";
// import turnRoutes from "./routes/turn.js";

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
const socketToRooms = {};
const watchStates = {};

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    console.log(`User ${socket.id} joining room: ${roomId}`);
    socket.join(roomId);
    if (!users[roomId]) {
      users[roomId] = [];
    }
    if (!users[roomId].includes(socket.id)) {
      users[roomId].push(socket.id);
    }
    if (!socketToRooms[socket.id]) {
      socketToRooms[socket.id] = new Set();
    }
    socketToRooms[socket.id].add(roomId);

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

  socket.on("watch-join", ({ roomId }) => {
    const watchRoom = `watch:${roomId}`;
    socket.join(watchRoom);
    if (!socketToRooms[socket.id]) {
      socketToRooms[socket.id] = new Set();
    }
    socketToRooms[socket.id].add(watchRoom);

    if (!watchStates[watchRoom]) {
      watchStates[watchRoom] = {
        time: 0,
        isPlaying: false,
        playbackRate: 1,
        updatedAt: Date.now(),
      };
    }

    const state = watchStates[watchRoom];
    let currentTime = state.time;
    if (state.isPlaying) {
      currentTime += ((Date.now() - state.updatedAt) / 1000) * state.playbackRate;
    }

    socket.emit("watch-state", {
      time: currentTime,
      isPlaying: state.isPlaying,
      playbackRate: state.playbackRate,
    });
  });

  socket.on("watch-play", ({ roomId, time }) => {
    const watchRoom = `watch:${roomId}`;
    if (!watchStates[watchRoom]) return;
    watchStates[watchRoom] = {
      ...watchStates[watchRoom],
      time: Number(time) || 0,
      isPlaying: true,
      updatedAt: Date.now(),
    };
    socket.to(watchRoom).emit("watch-play", { time: watchStates[watchRoom].time });
  });

  socket.on("watch-pause", ({ roomId, time }) => {
    const watchRoom = `watch:${roomId}`;
    if (!watchStates[watchRoom]) return;
    watchStates[watchRoom] = {
      ...watchStates[watchRoom],
      time: Number(time) || 0,
      isPlaying: false,
      updatedAt: Date.now(),
    };
    socket.to(watchRoom).emit("watch-pause", { time: watchStates[watchRoom].time });
  });

  socket.on("watch-seek", ({ roomId, time }) => {
    const watchRoom = `watch:${roomId}`;
    if (!watchStates[watchRoom]) return;
    watchStates[watchRoom].time = Number(time) || 0;
    watchStates[watchRoom].updatedAt = Date.now();
    socket.to(watchRoom).emit("watch-seek", { time: watchStates[watchRoom].time });
  });

  socket.on("watch-rate", ({ roomId, rate }) => {
    const watchRoom = `watch:${roomId}`;
    if (!watchStates[watchRoom]) return;
    const state = watchStates[watchRoom];
    if (state.isPlaying) {
      state.time += ((Date.now() - state.updatedAt) / 1000) * state.playbackRate;
    }
    state.playbackRate = Number(rate) || 1;
    state.updatedAt = Date.now();
    socket.to(watchRoom).emit("watch-rate", { rate: state.playbackRate });
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

  socket.on("disconnecting", () => {
    const rooms = socketToRooms[socket.id];
    if (rooms) {
      for (const roomId of rooms) {
        if (users[roomId]) {
          users[roomId] = users[roomId].filter((id) => id !== socket.id);
          socket.to(roomId).emit("user-disconnected", socket.id);

          if (users[roomId].length === 0) {
            delete users[roomId];
          }
        }
        if (roomId.startsWith("watch:") && io.sockets.adapter.rooms.get(roomId)?.size <= 1) {
          delete watchStates[roomId];
        }
      }
    }
    delete socketToRooms[socket.id];
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
// app.use("/turn", turnRoutes);
app.use("/like", likeRoutes);
app.use("/watch", watchlaterRoutes);
app.use("/history", historyRoutes);
app.use("/comment", commentRoutes);
app.use("/payment", paymentRoutes);
app.use("/subscription", subscriptionRoutes);

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
