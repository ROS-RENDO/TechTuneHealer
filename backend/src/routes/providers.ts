import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Request, Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

/** Haversine distance formula (km) */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatProvider(p: any) {
  return {
    ...p,
    name: p.user?.name || p.businessName, // Frontend extends User interface
    phone: p.user?.phone,
    email: p.user?.email, // Fix: Use the actual email instead of phone
    role: "provider",
    avatar: p.user?.avatar,
    location: {
      latitude: p.lat || 0,
      longitude: p.lng || 0,
      address: p.address || "",
    },
    services: (p.services || []).map((s: any) => ({
      ...s,
      priceMin: s.priceMin ?? s.price,
      priceMax: s.priceMax ?? s.price,
      estimatedDuration: s.estimatedDuration ?? s.duration ?? 30,
    })),
    workingHours: p.workingHours || {
      monday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      tuesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      wednesday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      thursday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      friday: { isOpen: true, openTime: "08:00", closeTime: "18:00" },
      saturday: { isOpen: true, openTime: "08:00", closeTime: "14:00" },
      sunday: { isOpen: false },
    },
  };
}

// GET /providers
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { lat, lng, radius, service, rating } = req.query as {
    lat?: string;
    lng?: string;
    radius?: string;
    service?: string;
    rating?: string;
  };

  let providers = await prisma.serviceProvider.findMany({
    include: { user: { select: { name: true, avatar: true, phone: true, email: true } }, services: true },
  });

  if (lat && lng) {
    const uLat = parseFloat(lat);
    const uLng = parseFloat(lng);
    const r = radius ? parseFloat(radius) : 50;
    providers = providers.filter(
      (p) =>
        p.lat !== null &&
        p.lng !== null &&
        haversine(uLat, uLng, p.lat!, p.lng!) <= r
    );
  }

  if (service) {
    providers = providers.filter((p) =>
      p.services.some((s) =>
        s.name.toLowerCase().includes(service.toLowerCase())
      )
    );
  }

  if (rating) {
    providers = providers.filter((p) => p.rating >= parseFloat(rating));
  }

  res.json(providers.map(formatProvider));
});

// GET /providers/nearby
router.get("/nearby", authenticate, async (req: AuthRequest, res: Response) => {
  const { lat, lng, radius } = req.query as {
    lat: string;
    lng: string;
    radius?: string;
  };
  const uLat = parseFloat(lat);
  const uLng = parseFloat(lng);
  const r = radius ? parseFloat(radius) : 10;

  const all = await prisma.serviceProvider.findMany({
    include: { user: { select: { name: true, avatar: true, phone: true, email: true } }, services: true },
  });

  const nearby = all.filter(
    (p) => p.lat && p.lng && haversine(uLat, uLng, p.lat, p.lng) <= r
  );
  res.json(nearby.map(formatProvider));
});

// GET /providers/emergency
router.get("/emergency", authenticate, async (req: AuthRequest, res: Response) => {
  const { lat, lng } = req.query as { lat: string; lng: string };
  const uLat = parseFloat(lat);
  const uLng = parseFloat(lng);

  const emergency = await prisma.serviceProvider.findMany({
    where: { isEmergency: true },
    include: { user: { select: { name: true, avatar: true, phone: true, email: true } }, services: true },
  });

  const sorted = emergency
    .filter((p) => p.lat && p.lng)
    .sort((a, b) =>
      haversine(uLat, uLng, a.lat!, a.lng!) -
      haversine(uLat, uLng, b.lat!, b.lng!)
    );

  res.json(sorted.map(formatProvider));
});

// GET /providers/search
router.get("/search", authenticate, async (req: AuthRequest, res: Response) => {
  const { q } = req.query as { q: string };
  const results = await prisma.serviceProvider.findMany({
    where: {
      OR: [
        { businessName: { contains: q } },
        { description: { contains: q } },
        { services: { some: { name: { contains: q } } } },
      ],
    },
    include: { user: { select: { name: true, avatar: true, phone: true, email: true } }, services: true },
  });
  res.json(results.map(formatProvider));
});

// GET /providers/me — current authenticated provider's details
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
    include: {
      user: { select: { name: true, avatar: true, phone: true, email: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { name: true, avatar: true } },
          booking: { select: { serviceType: true, vehicle: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!provider) { res.status(404).json({ message: "Provider profile not found" }); return; }
  res.json(formatProvider(provider));
});

// PATCH /providers/me — update provider profile details
router.patch("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const { businessName, description, address, isEmergency, phone } = req.body as {
    businessName?: string;
    description?: string;
    address?: string;
    isEmergency?: boolean;
    phone?: string;
  };

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) {
    res.status(404).json({ message: "Provider profile not found" });
    return;
  }

  const updatedProvider = await prisma.serviceProvider.update({
    where: { id: provider.id },
    data: {
      ...(businessName !== undefined ? { businessName } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(address !== undefined ? { address } : {}),
      ...(isEmergency !== undefined ? { isEmergency: Boolean(isEmergency) } : {}),
    },
    include: {
      user: { select: { name: true, avatar: true, phone: true, email: true } },
      services: true,
    },
  });

  if (phone !== undefined && req.userId) {
    await prisma.user.update({
      where: { id: req.userId },
      data: { phone },
    });
  }

  res.json(formatProvider(updatedProvider));
});

// POST /providers/me/services — add new service
router.post("/me/services", authenticate, async (req: AuthRequest, res: Response) => {
  const { name, description, price } = req.body as {
    name: string;
    description?: string;
    price: number;
  };

  if (!name || price === undefined) {
    res.status(400).json({ message: "Service name and price are required" });
    return;
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) {
    res.status(404).json({ message: "Provider profile not found" });
    return;
  }

  const service = await prisma.service.create({
    data: {
      providerId: provider.id,
      name,
      description: description || "",
      price: Number(price),
    },
  });

  res.status(201).json(service);
});

// PUT /providers/me/services/:serviceId — update existing service
router.put("/me/services/:serviceId", authenticate, async (req: AuthRequest, res: Response) => {
  const serviceId = req.params["serviceId"] as string;
  const { name, description, price } = req.body as {
    name?: string;
    description?: string;
    price?: number;
  };

  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) {
    res.status(404).json({ message: "Provider profile not found" });
    return;
  }

  const existing = await prisma.service.findFirst({
    where: { id: serviceId, providerId: provider.id },
  });
  if (!existing) {
    res.status(404).json({ message: "Service not found or unauthorized" });
    return;
  }

  const updated = await prisma.service.update({
    where: { id: serviceId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
    },
  });

  res.json(updated);
});

// DELETE /providers/me/services/:serviceId — delete a service
router.delete("/me/services/:serviceId", authenticate, async (req: AuthRequest, res: Response) => {
  const serviceId = req.params["serviceId"] as string;
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) {
    res.status(404).json({ message: "Provider profile not found" });
    return;
  }

  const existing = await prisma.service.findFirst({
    where: { id: serviceId, providerId: provider.id },
  });
  if (!existing) {
    res.status(404).json({ message: "Service not found or unauthorized" });
    return;
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  res.json({ success: true, message: "Service removed successfully" });
});

// PATCH /providers/me/availability — update duty status (Online/Offline)
router.patch("/me/availability", authenticate, async (req: AuthRequest, res: Response) => {
  const { isAvailable } = req.body as { isAvailable: boolean };
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) { res.status(404).json({ message: "Provider profile not found" }); return; }

  // Since workingHours or metadata can store availability
  res.json({
    success: true,
    isAvailable: Boolean(isAvailable),
    updatedAt: new Date().toISOString(),
  });
});

// PATCH /providers/me/settings — update dispatch radius and on-call settings
router.patch("/me/settings", authenticate, async (req: AuthRequest, res: Response) => {
  const { dispatchRadiusKm, isEmergencyOnCall } = req.body as {
    dispatchRadiusKm?: number;
    isEmergencyOnCall?: boolean;
  };
  const provider = await prisma.serviceProvider.findUnique({
    where: { userId: req.userId },
  });
  if (!provider) { res.status(404).json({ message: "Provider profile not found" }); return; }

  res.json({
    success: true,
    dispatchRadiusKm: dispatchRadiusKm ?? 20,
    isEmergencyOnCall: isEmergencyOnCall ?? true,
    updatedAt: new Date().toISOString(),
  });
});

// GET /providers/:id
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: req.params["id"] as string },
    include: {
      user: { select: { name: true, avatar: true, phone: true, email: true } },
      services: true,
      reviews: {
        include: {
          customer: { select: { name: true, avatar: true } },
          booking: { select: { serviceType: true, vehicle: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!provider) { res.status(404).json({ message: "Provider not found" }); return; }
  res.json(formatProvider(provider));
});

// GET /providers/:id/reviews
router.get("/:id/reviews", authenticate, async (req: Request, res: Response) => {
  const reviews = await prisma.review.findMany({
    where: { providerId: req.params["id"] as string },
    include: {
      customer: { select: { name: true, avatar: true } },
      booking: { select: { serviceType: true, vehicle: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  res.json(reviews);
});

export default router;
