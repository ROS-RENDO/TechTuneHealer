import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /reviews/:providerId or /reviews/providers/:providerId/reviews
const getProviderReviewsHandler = async (req: Request, res: Response) => {
  const providerId = (req.params["providerId"] || req.params["id"]) as string;
  const reviews = await prisma.review.findMany({
    where: { providerId },
    include: {
      customer: { select: { name: true, avatar: true } },
      booking: { select: { serviceType: true, vehicle: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
};

router.get("/providers/:providerId/reviews", authenticate, getProviderReviewsHandler);
router.get("/:providerId", authenticate, getProviderReviewsHandler);
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  // If provider requests their own reviews
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (provider) {
    const reviews = await prisma.review.findMany({
      where: { providerId: provider.id },
      include: {
        customer: { select: { name: true, avatar: true } },
        booking: { select: { serviceType: true, vehicle: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
    return;
  }
  res.json([]);
});

// POST /reviews — customer submits review after a completed booking
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { providerId, bookingId, rating, comment } = req.body as {
    providerId: string;
    bookingId: string;
    rating: number;
    comment?: string;
  };

  // Ensure booking belongs to user and is completed
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, customerId: req.userId, status: "COMPLETED" },
  });
  if (!booking) {
    res.status(400).json({ message: "Can only review completed bookings" });
    return;
  }

  const review = await prisma.review.create({
    data: {
      customerId: req.userId!,
      providerId,
      bookingId,
      rating,
      comment,
    },
  });

  // Recalculate provider rating average
  const allReviews = await prisma.review.findMany({ where: { providerId } });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await prisma.serviceProvider.update({
    where: { id: providerId },
    data: { rating: Math.round(avg * 10) / 10, totalReviews: allReviews.length },
  });

  res.status(201).json(review);
});

// POST /reviews/:reviewId/reply — provider replies to review
router.post("/:reviewId/reply", authenticate, async (req: AuthRequest, res: Response) => {
  const { reply } = req.body as { reply: string };
  const review = await prisma.review.update({
    where: { id: req.params["reviewId"] as string },
    data: { reply },
  });
  res.json(review);
});

export default router;
