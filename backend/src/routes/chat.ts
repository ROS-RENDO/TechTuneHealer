import { Router } from "express";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import type { Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

// In-memory chat store (keyed by bookingId)
const chatStore: Record<string, ChatMessage[]> = {};

// Helper: seed realistic initial customer greeting if thread is empty
function ensureThreadInitialized(bookingId: string, customerName?: string, serviceType?: string, notes?: string) {
  if (!chatStore[bookingId] || chatStore[bookingId].length === 0) {
    const cust = customerName || "Motorist";
    const greetingText = notes
      ? `Hello! ${notes}`
      : `Hello, I requested ${serviceType || "emergency assistance"} for my vehicle. Are you able to assist?`;

    chatStore[bookingId] = [
      {
        id: `msg-init-${bookingId}`,
        senderId: "customer",
        senderName: cust,
        text: greetingText,
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
      {
        id: `msg-ack-${bookingId}`,
        senderId: "provider",
        senderName: "Speedy Auto Fix",
        text: "Hello! We received your dispatch request. A certified technician is assigned and preparing tools.",
        createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ];
  }
}

// ─── GET /chat/threads ──────────────────────────────────────────────────────
// Returns all active dispatch chat channels with latest message preview
router.get("/threads", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        provider: { select: { id: true, businessName: true } },
        vehicle: { select: { make: true, model: true, plateNumber: true } },
      },
    });

    const threads = bookings.map((b) => {
      ensureThreadInitialized(b.id, b.customer.name, b.serviceType, b.notes || undefined);
      const msgs = chatStore[b.id] || [];
      const lastMsg = msgs[msgs.length - 1];

      return {
        bookingId: b.id,
        serviceType: b.serviceType,
        status: b.status,
        customerName: b.customer.name,
        customerPhone: b.customer.phone,
        providerName: b.provider.businessName,
        vehicleInfo: b.vehicle ? `${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.plateNumber})` : "Vehicle",
        lastMessage: lastMsg?.text || "No messages yet",
        lastMessageTime: lastMsg?.createdAt || b.createdAt,
        messageCount: msgs.length,
      };
    });

    res.json(threads);
  } catch (error) {
    console.error("Error fetching chat threads:", error);
    res.status(500).json({ message: "Error fetching chat threads" });
  }
});

// ─── GET /chat/:bookingId ───────────────────────────────────────────────────
// Fetch all messages for a specific booking
router.get("/:bookingId", authenticate, async (req: AuthRequest, res: Response) => {
  const bookingId = req.params["bookingId"] as string;

  if (!chatStore[bookingId] || chatStore[bookingId].length === 0) {
    // Look up booking context to auto-populate greeting
    try {
      const b = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { customer: { select: { name: true } } },
      });
      if (b) {
        ensureThreadInitialized(bookingId, b.customer?.name, b.serviceType, b.notes || undefined);
      }
    } catch {}
  }

  const messages = chatStore[bookingId] ?? [];
  res.json(messages);
});

// ─── POST /chat/:bookingId ──────────────────────────────────────────────────
// Send a message
router.post("/:bookingId", authenticate, async (req: AuthRequest, res: Response) => {
  const bookingId = req.params["bookingId"] as string;
  const { text, senderName, senderRole } = req.body as {
    text: string;
    senderName?: string;
    senderRole?: string;
  };

  if (!text?.trim()) {
    res.status(400).json({ message: "Message text required" });
    return;
  }

  const message: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    senderId: req.userId || senderRole || "provider",
    senderName: senderName || "Speedy Auto Fix",
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  if (!chatStore[bookingId]) chatStore[bookingId] = [];
  chatStore[bookingId].push(message);

  res.status(201).json(message);
});

export default router;
