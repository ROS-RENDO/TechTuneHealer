import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /bookings — customer gets their bookings, provider gets requests to them
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { userRole, userId } = req;

  if (userRole === "CUSTOMER") {
    const bookings = await prisma.booking.findMany({
      where: { customerId: userId },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            address: true,
            lat: true,
            lng: true,
            rating: true,
            user: { select: { name: true, phone: true } },
          },
        },
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // Normalize status to lowercase for frontend
    res.json(bookings.map(b => ({ ...b, status: b.status.toLowerCase() })));
  } else if (userRole === "PROVIDER") {
    const profile = await prisma.serviceProvider.findUnique({
      where: { userId },
    });
    if (!profile) { res.status(404).json({ message: "Provider profile not found" }); return; }
    const bookings = await prisma.booking.findMany({
      where: { providerId: profile.id },
      include: {
        customer: { select: { name: true, phone: true, avatar: true } },
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });
    // Normalize status to lowercase for frontend
    res.json(bookings.map(b => ({ ...b, status: b.status.toLowerCase() })));
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

// GET /bookings/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const booking = await prisma.booking.findUnique({
    where: { id: req.params["id"] as string },
    include: {
      customer: { select: { name: true, phone: true, avatar: true } },
      provider: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      vehicle: true,
      review: true,
    },
  });
  if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }
  res.json({ ...booking, status: booking.status.toLowerCase() });
});

// POST /bookings
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { providerId, serviceType, vehicleId, scheduledDate, scheduledTime, notes } =
    req.body as {
      providerId: string;
      serviceType: string;
      vehicleId: string;
      scheduledDate: string;
      scheduledTime: string;
      notes?: string;
    };

  // Create booking in database

  const booking = await prisma.booking.create({
    data: {
      customerId: req.userId!,
      providerId,
      serviceType,
      ...(vehicleId ? { vehicleId } : {}),
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      ...(notes ? { notes } : {}),
      status: "PENDING",
    },
    include: {
      provider: {
        include: {
          user: { select: { name: true, phone: true } },
        },
      },
      vehicle: true,
    },
  });

  // Create notification for provider
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: providerId },
  });
  if (provider) {
    await prisma.notification.create({
      data: {
        userId: provider.userId,
        type: "NEW_BOOKING",
        title: "New Booking Request",
        body: `You have a new booking request for ${serviceType}`,
      },
    });
  }

  res.status(201).json(booking);
});

// PUT /bookings/:id
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const { notes, scheduledDate, scheduledTime } = req.body as {
    notes?: string;
    scheduledDate?: string;
    scheduledTime?: string;
  };
  const booking = await prisma.booking.update({
    where: { id: req.params["id"] as string },
    data: {
      ...(notes && { notes }),
      ...(scheduledDate && { scheduledDate: new Date(scheduledDate) }),
      ...(scheduledTime && { scheduledTime }),
    },
  });
  res.json(booking);
});

// PUT /bookings/:id/status — used by provider to accept/start/complete
router.put("/:id/status", authenticate, async (req: AuthRequest, res: Response) => {
  const { status } = req.body as {
    status: string;
  };

  const booking = await prisma.booking.update({
    where: { id: req.params["id"] as string },
    data: { status: status.toUpperCase() as "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" },
  });

  // Notify customer of status update
  await prisma.notification.create({
    data: {
      userId: booking.customerId,
      type: "BOOKING_STATUS",
      title: "Booking Update",
      body: `Your booking status has been updated to: ${status}`,
    },
  });

  res.json(booking);
});

// POST /bookings/:id/cancel
router.post("/:id/cancel", authenticate, async (req: AuthRequest, res: Response) => {
  const { reason } = req.body as { reason?: string };
  const booking = await prisma.booking.update({
    where: { id: req.params["id"] as string },
    data: { status: "CANCELLED", cancelReason: reason },
  });
  res.json(booking);
});

export default router;
