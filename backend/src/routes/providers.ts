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

// GET /providers/:id
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  const provider = await prisma.serviceProvider.findUnique({
    where: { id: req.params["id"] as string },
    include: {
      user: { select: { name: true, avatar: true, phone: true, email: true } },
      services: true,
      reviews: {
        include: { customer: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
  if (!provider) { res.status(404).json({ message: "Provider not found" }); return; }
  res.json(formatProvider(provider));
});

export default router;
