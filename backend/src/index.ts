import "dotenv/config";
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/providers.js";
import bookingRoutes from "./routes/bookings.js";
import vehicleRoutes from "./routes/vehicles.js";
import reviewRoutes from "./routes/reviews.js";
import notificationRoutes from "./routes/notifications.js";
import diagnosticsRoutes from "./routes/diagnostics.js";
import chatRoutes from "./routes/chat.js";
import shopRoutes from "./routes/shop.js";
import adminRoutes from "./routes/admin.js";
import { registerLocationGateway } from "./gateways/location.gateway.js";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// CORS — restrict origins via env when a web client is used; default open
// is safe for this API because auth is bearer-token based, not cookies.
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : "*";

// Socket.io (auth is enforced per-connection in the location gateway)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_ORIGINS
      ? process.env.SOCKET_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST"],
  },
});

// Register WebSocket gateway
registerLocationGateway(io);

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const otpSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
const otpVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

// Middleware
app.use(globalLimiter);
app.use(cors({ origin: corsOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/images", express.static("public/images"));

// Stricter limits on auth / OTP endpoints (specific routes first so they win)
app.use("/auth/send-otp", otpSendLimiter);
app.use("/auth/verify-otp", otpVerifyLimiter);
app.use("/auth", authLimiter);

// Health check
app.get("/", (_req, res) => {
  res.json({ message: "🚀 TechTune Healer API is running!" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/providers", providerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/vehicles", vehicleRoutes);
app.use("/reviews", reviewRoutes);
app.use("/notifications", notificationRoutes);
app.use("/diagnostics", diagnosticsRoutes);
app.use("/chat", chatRoutes);
app.use("/shop", shopRoutes);
app.use("/admin", adminRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// JSON error handler (multer upload errors, body-parser errors, etc.)
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err?.name === "MulterError") {
    const code = (err as Error & { code?: string }).code;
    res
      .status(code === "LIMIT_FILE_SIZE" ? 413 : 400)
      .json({ message: err.message });
    return;
  }
  // body-parser and other HTTP errors carry their own status
  const httpErr = err as Error & { statusCode?: number; expose?: boolean };
  if (httpErr.statusCode && httpErr.expose) {
    res.status(httpErr.statusCode).json({ message: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server (using httpServer, not app.listen)
httpServer.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on ws://localhost:${PORT}`);
});
