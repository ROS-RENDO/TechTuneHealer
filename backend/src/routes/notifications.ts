import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /notifications
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json(notifications);
});

// POST /notifications/:id/read
router.post("/:id/read", authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.notification.update({
    where: { id: req.params["id"] as string },
    data: { read: true },
  });
  res.json({ success: true });
});

// POST /notifications/read-all
router.post("/read-all", authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true },
  });
  res.json({ success: true });
});

export default router;
