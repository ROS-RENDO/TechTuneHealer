import type { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../lib/security.js";
import { prisma } from "../lib/prisma.js";

/**
 * Location Gateway – manages real-time mechanic location broadcasting.
 *
 * Events:
 *  Client → Server:
 *    "mechanic:location"  { bookingId, latitude, longitude }   – mechanic sends GPS coords
 *    "customer:watch"     { bookingId }                        – customer subscribes to a booking
 *    "mechanic:arrived"   { bookingId }                        – mechanic signals arrival
 *
 *  Server → Client:
 *    "location:update"    { latitude, longitude, timestamp }   – broadcast to customer room
 *    "mechanic:arrived"   {}                                   – arrival ping to customer room
 *    "error"              { message }                          – auth / authorization failure
 *
 * Security: every connection must present a valid JWT (via `auth.token` handshake),
 * and every event is checked against the booking's real customer/provider membership.
 */
export function registerLocationGateway(io: Server) {
  // ── Handshake auth: require a valid JWT ──────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      next(new Error("unauthorized"));
      return;
    }
    try {
      const decoded = jwt.verify(token, getJwtSecret()) as {
        userId: string;
        role: string;
      };
      socket.data.userId = decoded.userId;
      socket.data.role = decoded.role;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  async function getBookingMembership(bookingId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: {
        customerId: true,
        provider: { select: { userId: true } },
      },
    });
    if (!booking) return null;
    return {
      customerId: booking.customerId,
      providerUserId: booking.provider.userId,
    };
  }

  function isProvider(socket: Socket, providerUserId: string): boolean {
    return socket.data.userId === providerUserId;
  }

  function isPartyToBooking(
    socket: Socket,
    membership: { customerId: string; providerUserId: string }
  ): boolean {
    return (
      socket.data.userId === membership.customerId ||
      socket.data.userId === membership.providerUserId
    );
  }

  function isValidCoord(lat: unknown, lng: unknown): boolean {
    return (
      typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 &&
      typeof lng === "number" && Number.isFinite(lng) && lng >= -180 && lng <= 180
    );
  }

  io.on("connection", (socket: Socket) => {
    console.log(`📡 Socket connected: ${socket.id} (user ${socket.data.userId})`);

    // ── Mechanic broadcasts live GPS ─────────────────────────────────────────
    socket.on(
      "mechanic:location",
      async (payload: { bookingId: string; latitude: number; longitude: number }) => {
        const { bookingId, latitude, longitude } = payload;
        if (!bookingId || !isValidCoord(latitude, longitude)) return;

        try {
          const membership = await getBookingMembership(bookingId);
          if (!membership || !isProvider(socket, membership.providerUserId)) {
            socket.emit("booking:error", { message: "Not authorized for this booking" });
            return;
          }

          // Join the room for this booking (so mechanic is in the room too)
          socket.join(`booking:${bookingId}`);

          // Broadcast to everyone else in the room (the customer)
          socket.to(`booking:${bookingId}`).emit("location:update", {
            latitude,
            longitude,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("mechanic:location error:", error);
        }
      }
    );

    // ── Customer subscribes to a booking room ────────────────────────────────
    socket.on("customer:watch", async (payload: { bookingId: string }) => {
      const { bookingId } = payload;
      if (!bookingId) return;

      try {
        const membership = await getBookingMembership(bookingId);
        if (!membership || !isPartyToBooking(socket, membership)) {
          socket.emit("booking:error", { message: "Not authorized for this booking" });
          return;
        }
        socket.join(`booking:${bookingId}`);
        console.log(`👁  User ${socket.data.userId} watching booking:${bookingId}`);
      } catch (error) {
        console.error("customer:watch error:", error);
      }
    });

    // ── Mechanic signals arrival ─────────────────────────────────────────────
    socket.on("mechanic:arrived", async (payload: { bookingId: string }) => {
      const { bookingId } = payload;
      if (!bookingId) return;

      try {
        const membership = await getBookingMembership(bookingId);
        if (!membership || !isProvider(socket, membership.providerUserId)) {
          socket.emit("booking:error", { message: "Not authorized for this booking" });
          return;
        }
        socket.to(`booking:${bookingId}`).emit("mechanic:arrived", {});
        console.log(`✅ Mechanic arrived for booking:${bookingId}`);
      } catch (error) {
        console.error("mechanic:arrived error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
}
