import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "../lib/prisma.js";
import { getJwtSecret } from "../lib/security.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import type { Request, Response } from "express";

const router = Router();
const JWT_SECRET = getJwtSecret();

// In-memory OTP store (expiry + attempt cap). Use Redis in production.
interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
}
const otpStore = new Map<string, OtpRecord>();
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;

function otpMatches(stored: string, supplied: string): boolean {
  const a = createHash("sha256").update(stored).digest();
  const b = createHash("sha256").update(supplied).digest();
  return timingSafeEqual(a, b);
}

// POST /auth/register
router.post("/register", async (req: Request, res: Response) => {
  const { name, email, phone, password, role } = req.body as {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: "CUSTOMER" | "PROVIDER";
  };

  if (!name || !email || !password || !role) {
    res.status(400).json({ message: "Name, email, password, and role are required" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ message: "Email already registered" });
    return;
  }

  const upperRole = role.toUpperCase() as "CUSTOMER" | "PROVIDER";
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, phone, password: hashed, role: upperRole },
  });

  if (upperRole === "PROVIDER") {
    // Automatically create a blank ServiceProvider record so the provider can be queried/updated
    await prisma.serviceProvider.create({
      data: {
        userId: user.id,
        businessName: name, // Default to their name initially
      }
    });
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.status(201).json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone ?? undefined, role: user.role.toLowerCase() },
    token,
  });
});

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone ?? undefined, role: user.role.toLowerCase(), avatar: user.avatar },
    token,
  });
});

// POST /auth/send-otp
router.post("/send-otp", (req: Request, res: Response) => {
  const { phone } = req.body as { phone: string };
  if (!phone || typeof phone !== "string") {
    res.status(400).json({ message: "Phone number is required" });
    return;
  }

  const now = Date.now();
  const existing = otpStore.get(phone);
  if (existing && now < existing.expiresAt) {
    const waitMs = Math.ceil((existing.expiresAt - now) / 1000);
    res.status(429).json({ message: `Please wait ${waitMs}s before requesting another code` });
    return;
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { code: otp, expiresAt: now + OTP_TTL_MS, attempts: 0 });
  // In production: send via Twilio / Firebase
  console.log(`OTP for ${phone}: ${otp}`);
  res.json({ sent: true });
});

// POST /auth/verify-otp
router.post("/verify-otp", (req: Request, res: Response) => {
  const { phone, otp } = req.body as { phone: string; otp: string };

  const record = otpStore.get(phone);
  if (!record) {
    res.status(400).json({ verified: false, message: "No OTP sent for this number or code expired" });
    return;
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    res.status(400).json({ verified: false, message: "OTP expired, please request a new one" });
    return;
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    otpStore.delete(phone);
    res.status(429).json({ verified: false, message: "Too many failed attempts, please request a new code" });
    return;
  }

  record.attempts += 1;
  if (!otpMatches(record.code, otp)) {
    res.status(400).json({ verified: false, message: "Invalid OTP" });
    return;
  }

  otpStore.delete(phone);
  res.json({ verified: true });
});

// POST /auth/logout
router.post("/logout", authenticate, (_req: AuthRequest, res: Response) => {
  // JWT is stateless; client just discards the token
  res.json({ success: true });
});

// GET /auth/profile
router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, createdAt: true },
  });
  if (!user) { res.status(404).json({ message: "User not found" }); return; }
  res.json({ ...user, role: user.role.toLowerCase() });
});

// PUT /auth/profile
router.put("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  const { name, avatar } = req.body as { name?: string; avatar?: string };
  const user = await prisma.user.update({
    where: { id: req.userId },
    data: { name, avatar },
    select: { id: true, name: true, email: true, phone: true, role: true, avatar: true },
  });
  res.json({ ...user, role: user.role.toLowerCase() });
});

export default router;
