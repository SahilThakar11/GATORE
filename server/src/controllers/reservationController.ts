import { Request, Response } from "express";
import prisma from "../config/prisma";

// ─── POST /api/reservations ───────────────────────────────────────────────────
// Create a new reservation — called at the end of ReservationModal step 4
export const createReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      reservationDate,
      startTime,
      endTime,
      partySize,
      tableId,
      gameIds, // number[] — BGG game IDs the user picked in step 3
      specialRequests,
    } = req.body;

    const userId = (req as any).user?.id; // set by auth middleware

    if (!reservationDate || !startTime || !endTime || !partySize || !tableId) {
      res.status(400).json({
        success: false,
        message:
          "reservationDate, startTime, endTime, partySize, and tableId are required.",
      });
      return;
    }

    const parsedDate = new Date(reservationDate);
    const parsedStart = new Date(startTime);
    const parsedEnd = new Date(endTime);

    if (parsedEnd <= parsedStart) {
      res.status(400).json({
        success: false,
        message: "endTime must be after startTime.",
      });
      return;
    }

    // Conflict check — same table, overlapping time, active reservation
    const conflict = await prisma.reservation.findFirst({
      where: {
        tableId: parseInt(tableId),
        status: { in: ["pending", "confirmed"] },
        startTime: { lt: parsedEnd },
        endTime: { gt: parsedStart },
      },
    });

    if (conflict) {
      res.status(409).json({
        success: false,
        message: "This table is already reserved for the selected time slot.",
      });
      return;
    }

    // Validate that the table actually exists and fits the party
    const table = await prisma.table.findUnique({
      where: { id: parseInt(tableId) },
    });

    if (!table) {
      res.status(404).json({ success: false, message: "Table not found." });
      return;
    }

    if (partySize > table.capacity || partySize < table.minCapacity) {
      res.status(400).json({
        success: false,
        message: `Party size must be between ${table.minCapacity} and ${table.capacity} for this table.`,
      });
      return;
    }

    // Resolve internal game IDs from the global catalog if gameIds provided
    let resolvedGameIds: number[] = [];
    if (Array.isArray(gameIds) && gameIds.length > 0) {
      const games = await prisma.game.findMany({
        where: { id: { in: gameIds.map(Number) } },
        select: { id: true },
      });
      resolvedGameIds = games.map((g) => g.id);
    }

    const reservation = await prisma.reservation.create({
      data: {
        reservationDate: parsedDate,
        startTime: parsedStart,
        endTime: parsedEnd,
        partySize: parseInt(partySize),
        status: "pending",
        specialRequests: specialRequests || null,
        userId: parseInt(userId),
        tableId: parseInt(tableId),
        ...(resolvedGameIds.length > 0
          ? {
              gameReservations: {
                create: resolvedGameIds.map((gameId) => ({ gameId })),
              },
            }
          : {}),
      },
      include: {
        table: {
          include: {
            restaurant: { select: { id: true, name: true, address: true } },
          },
        },
        gameReservations: {
          include: {
            game: { select: { id: true, name: true, imageUrl: true } },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Create reservation error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the reservation.",
    });
  }
};

// ─── GET /api/reservations/my ─────────────────────────────────────────────────
// Logged-in user's own reservations
export const getMyReservations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { status } = req.query;

    const reservations = await prisma.reservation.findMany({
      where: {
        userId: parseInt(userId as string),
        ...(status ? { status: status as string } : {}),
      },
      include: {
        table: {
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                logoUrl: true,
              },
            },
          },
        },
        gameReservations: {
          include: {
            game: {
              select: { id: true, name: true, imageUrl: true, category: true },
            },
          },
        },
      },
      orderBy: { reservationDate: "desc" },
    });

    res.json({
      success: true,
      message: "Reservations retrieved successfully",
      data: reservations,
    });
  } catch (error) {
    console.error("Get my reservations error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving your reservations.",
    });
  }
};

// ─── GET /api/reservations/:id ────────────────────────────────────────────────
// Single reservation detail — user can only view their own; staff/business sees any
export const getReservationById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid reservation ID." });
      return;
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: {
          include: {
            restaurant: {
              select: { id: true, name: true, address: true, phone: true },
            },
          },
        },
        user: { select: { id: true, name: true, email: true } },
        gameReservations: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
                minPlayers: true,
                maxPlayers: true,
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
      return;
    }

    // Regular users can only see their own reservation
    if (userRole === "user" && reservation.userId !== parseInt(userId)) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    res.json({
      success: true,
      message: "Reservation retrieved successfully",
      data: reservation,
    });
  } catch (error) {
    console.error("Get reservation by ID error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the reservation.",
    });
  }
};

// ─── PATCH /api/reservations/:id/cancel ──────────────────────────────────────
// User cancels their own reservation
export const cancelReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const userId = (req as any).user?.id;

    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid reservation ID." });
      return;
    }

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true, startTime: true },
    });

    if (!reservation) {
      res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
      return;
    }

    if (reservation.userId !== parseInt(userId)) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    if (["cancelled", "completed"].includes(reservation.status)) {
      res.status(400).json({
        success: false,
        message: `Reservation is already ${reservation.status}.`,
      });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.json({
      success: true,
      message: "Reservation cancelled successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Cancel reservation error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while cancelling the reservation.",
    });
  }
};

// ─── GET /api/restaurants/:id/reservations ───────────────────────────────────
// Business/admin: all reservations for a specific restaurant on a given date
export const getRestaurantReservations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const restaurantId = parseInt(req.params.id as string);
    const { date, status } = req.query;

    if (isNaN(restaurantId)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid restaurant ID." });
      return;
    }

    const whereDate = date
      ? (() => {
          const d = new Date(date as string);
          const start = new Date(d);
          start.setHours(0, 0, 0, 0);
          const end = new Date(d);
          end.setHours(23, 59, 59, 999);
          return { gte: start, lte: end };
        })()
      : undefined;

    const reservations = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        ...(whereDate ? { reservationDate: whereDate } : {}),
        ...(status ? { status: status as string } : {}),
      },
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        user: { select: { id: true, name: true, email: true } },
        gameReservations: {
          include: { game: { select: { id: true, name: true } } },
        },
      },
      orderBy: [{ reservationDate: "asc" }, { startTime: "asc" }],
    });

    res.json({
      success: true,
      message: "Reservations retrieved successfully",
      data: reservations,
    });
  } catch (error) {
    console.error("Get restaurant reservations error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving reservations.",
    });
  }
};

// ─── PATCH /api/reservations/:id/status ──────────────────────────────────────
// Business/admin: confirm, complete, or no-show a reservation
export const updateReservationStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { status, notes } = req.body;
    const userRole = (req as any).user?.role;

    if (!["business", "admin"].includes(userRole)) {
      res.status(403).json({ success: false, message: "Access denied." });
      return;
    }

    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
      return;
    }

    const reservation = await prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      res
        .status(404)
        .json({ success: false, message: "Reservation not found." });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("Update reservation status error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the reservation.",
    });
  }
};
