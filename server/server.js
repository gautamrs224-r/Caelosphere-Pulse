// Fix for a known Node.js + Windows issue where Node's DNS resolver fails
// "querySrv ECONNREFUSED" on mongodb+srv:// URIs even though the OS resolver
// (confirmed working via nslookup AND MongoDB Compass) resolves the same SRV
// record fine. Root cause: Node's DNS resolution path (c-ares) sometimes can't
// query the local/router DNS server for SRV records, while the OS resolver
// falls back differently. Pointing Node at public DNS resolvers directly
// fixes this. Must run before anything else does a DNS lookup.
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import { connectDB } from "./config/db.js";
import { initSocket } from "./socket/socket.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---- Core middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ---- API routes ----
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "ChatSphere API is running" });
});

// ---- Serve frontend in production ----
if (process.env.NODE_ENV === "production") {
  const clientBuildPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = initSocket(app);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`[Server] ChatSphere API running on port ${PORT}`);
  });
});

process.on("unhandledRejection", (err) => {
  console.error("[Unhandled Rejection]", err.message);
});
