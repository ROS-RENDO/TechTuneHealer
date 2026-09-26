import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middleware/auth.js";
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";

const router = Router();

// GET /vehicles
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.userId },
  });
  res.json(vehicles);
});

// GET /vehicles/:id
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params["id"] as string, userId: req.userId },
  });
  if (!vehicle) { res.status(404).json({ message: "Vehicle not found" }); return; }
  res.json(vehicle);
});

// POST /vehicles
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { make, model, year, plateNumber, color } = req.body as {
    make: string;
    model: string;
    year: number;
    plateNumber: string;
    color?: string;
  };
  const vehicle = await prisma.vehicle.create({
    data: { userId: req.userId!, make, model, year, plateNumber, color },
  });
  res.status(201).json(vehicle);
});

// PUT /vehicles/:id
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  const { make, model, year, plateNumber, color } = req.body as {
    make?: string; model?: string; year?: number; plateNumber?: string; color?: string;
  };
  const vehicle = await prisma.vehicle.update({
    where: { id: req.params["id"] as string },
    data: { make, model, year, plateNumber, color },
  });
  res.json(vehicle);
});

// DELETE /vehicles/:id
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  await prisma.vehicle.delete({ where: { id: req.params["id"] as string } });
  res.json({ success: true });
});

export default router;
