import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import http from "http";
import User from "../models/User.js";

let io;

// Maps userId (string) -> socketId
const userSocketMap = {};

export const initSocket = (app) => {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  // Authenticate the socket connection using the same JWT used for REST
  io.use((socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie || "";
      const tokenFromCookie = cookieHeader
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const token = socket.handshake.auth?.token || tokenFromCookie;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[Socket] User connected: ${userId} (${socket.id})`);

    if (userId) {
      userSocketMap[userId] = socket.id;
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      User.findByIdAndUpdate(userId, { isOnline: true }).catch((err) =>
        console.error("[Socket] Failed to set isOnline:", err.message)
      );
    }

    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] User disconnected: ${userId} (${socket.id})`);
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      }).catch((err) =>
        console.error("[Socket] Failed to set lastSeen:", err.message)
      );
    });
  });

  return server;
};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId?.toString()];

export const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};
