import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

const resolveCustomerLocation = (notes?: string | null, customerName?: string | null) => {
  const n = (notes || "").toLowerCase();
  const c = (customerName || "").toLowerCase();

  if (n.includes("camtech") || n.includes("chroy changvar") || c.includes("camtech")) {
    return {
      latitude: 11.6146,
      longitude: 104.9282,
      address: "CamTech University Campus, Chroy Changvar Satellite City, Phnom Penh",
    };
  }
  if (n.includes("tuol kork") || c.includes("dara")) {
    return {
      latitude: 11.5720,
      longitude: 104.8950,
      address: "St 598 near Antenna Tower, Tuol Kork",
    };
  }
  if (n.includes("aeon") || n.includes("sen sok") || c.includes("vannak")) {
    return {
      latitude: 11.5950,
      longitude: 104.8820,
      address: "Aeon Mall Sen Sok, B2 Zone C",
    };
  }
  if (n.includes("sisowath") || n.includes("wat phnom") || n.includes("overheating")) {
    return {
      latitude: 11.5680,
      longitude: 104.9330,
      address: "Preah Sisowath Quay, Wat Phnom Area, Phnom Penh",
    };
  }
  if (n.includes("310") || c.includes("sophea")) {
    return {
      latitude: 11.5450,
      longitude: 104.9220,
      address: "Street 310, Boeung Keng Kang 1, Phnom Penh",
    };
  }
  if (n.includes("brake") || c.includes("sreymom")) {
    return {
      latitude: 11.5530,
      longitude: 104.9180,
      address: "Street 63, Boeung Keng Kang 1, Phnom Penh",
    };
  }
  if (n.includes("tesla") || c.includes("michael")) {
    return {
      latitude: 11.5600,
      longitude: 104.9100,
      address: "Olympic Stadium Area, Phnom Penh",
    };
  }
  return {
    latitude: 11.5621,
    longitude: 104.9160,
    address: "Phnom Penh City Center",
  };
};

const resolveEstimatedPrice = (serviceType: string): number => {
  const s = serviceType.toLowerCase();
  if (s.includes("24/7") || s.includes("roadside") || s.includes("emergency")) return 45;
  if (s.includes("battery") || s.includes("jumpstart")) return 35;
  if (s.includes("brake")) return 65;
  if (s.includes("overheating")) return 55;
  if (s.includes("radiator")) return 85;
  if (s.includes("tesla") || s.includes("voltage")) return 75;
  return 40;
};

const formatBooking = (b: any) => {
  const loc = resolveCustomerLocation(b.notes, b.customer?.name);
  const price = resolveEstimatedPrice(b.serviceType);
  const isEmergency = Boolean(
    b.serviceType?.toLowerCase().includes("emergency") ||
    b.serviceType?.toLowerCase().includes("roadside") ||
    b.notes?.toLowerCase().includes("emergency")
  );

  return {
    ...b,
    status: b.status.toLowerCase(),
    customerName: b.customer?.name || "Customer",
    customerPhone: b.customer?.phone || "+855 12 998 877",
    customerLocation: loc,
    estimatedPrice: price,
    isEmergency,
  };
};

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
    // Normalize status and enrich customerLocation for frontend
    res.json(bookings.map(formatBooking));
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
    // Normalize status and enrich customerLocation for frontend
    res.json(bookings.map(formatBooking));
  } else {
    res.status(403).json({ message: "Forbidden" });
  }
});

// GET /bookings/provider — provider bookings alias
router.get("/provider", authenticate, async (req: AuthRequest, res: Response) => {
  const { userId } = req;
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
  res.json({ bookings: bookings.map(formatBooking) });
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
  res.json(formatBooking(booking));
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

// PUT & PATCH /bookings/:id/status — used by provider to accept/start/complete
const handleStatusUpdate = async (req: AuthRequest, res: Response) => {
  const { status } = req.body as {
    status: string;
  };

  try {
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
    }).catch((e) => console.warn("Failed to create customer notification:", e));

    res.json({ ...booking, status: booking.status.toLowerCase() });
  } catch (err: any) {
    console.warn("Booking status update failed:", err?.message);
    res.status(404).json({ message: "Booking not found or update failed", error: err?.message });
  }
};

router.put("/:id/status", authenticate, handleStatusUpdate);
router.patch("/:id/status", authenticate, handleStatusUpdate);

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
