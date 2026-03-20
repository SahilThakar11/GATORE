import { Request, Response } from "express";
import prisma from "../config/prisma";

// ─── GET /api/restaurants ─────────────────────────────────────────────────────
// List all restaurants with optional city filter + basic info
export const getRestaurants = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { city } = req.query;

    const restaurants = await prisma.restaurant.findMany({
      where: city
        ? { city: { equals: city as string, mode: "insensitive" } }
        : undefined,
      select: {
        id: true,
        name: true,
        tagline: true,
        city: true,
        province: true,
        address: true,
        phone: true,
        website: true,
        logoUrl: true,
        rating: true,
        reviewCount: true,
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
        _count: {
          select: { restaurantGames: true, tables: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    res.json({
      success: true,
      message: "Restaurants retrieved successfully",
      data: restaurants,
    });
  } catch (error) {
    console.error("Get restaurants error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving restaurants.",
    });
  }
};

// ─── GET /api/restaurants/:id ─────────────────────────────────────────────────
// Full restaurant detail: info + tables + games + hours
export const getRestaurantById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid restaurant ID." });
      return;
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        operatingHours: { orderBy: { dayOfWeek: "asc" } },
        tables: { orderBy: { capacity: "asc" } },
        restaurantGames: {
          where: { status: "available" },
          include: {
            game: {
              select: {
                id: true,
                bggId: true,
                name: true,
                imageUrl: true,
                category: true,
                difficulty: true,
                minPlayers: true,
                maxPlayers: true,
                estimatedPlayTime: true,
                bggRating: true,
                ageRating: true,
              },
            },
          },
        },
        _count: {
          // ← add this
          select: { restaurantGames: true, tables: true },
        },
      },
    });

    if (!restaurant) {
      res
        .status(404)
        .json({ success: false, message: "Restaurant not found." });
      return;
    }

    res.json({
      success: true,
      message: "Restaurant retrieved successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Get restaurant by ID error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving the restaurant.",
    });
  }
};

// ─── GET /api/restaurants/:id/games ──────────────────────────────────────────
// All games available at a specific restaurant
export const getRestaurantGames = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid restaurant ID." });
      return;
    }

    const { category, status = "available" } = req.query;

    const restaurantGames = await prisma.restaurantGame.findMany({
      where: {
        restaurantId: id,
        status: status as string,
        ...(category
          ? {
              game: {
                category: { equals: category as string, mode: "insensitive" },
              },
            }
          : {}),
      },
      include: {
        game: true,
      },
      orderBy: { game: { name: "asc" } },
    });

    if (!restaurantGames.length) {
      // Verify the restaurant even exists
      const exists = await prisma.restaurant.findUnique({
        where: { id },
        select: { id: true },
      });
      if (!exists) {
        res
          .status(404)
          .json({ success: false, message: "Restaurant not found." });
        return;
      }
    }

    res.json({
      success: true,
      message: "Restaurant games retrieved successfully",
      data: restaurantGames.map((rg) => ({ ...rg.game, status: rg.status })),
    });
  } catch (error) {
    console.error("Get restaurant games error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving games.",
    });
  }
};

// ─── GET /api/restaurants/:id/tables ─────────────────────────────────────────
// Available tables — optionally filter by party size
export const getRestaurantTables = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res
        .status(400)
        .json({ success: false, message: "Invalid restaurant ID." });
      return;
    }

    const partySize = req.query.partySize
      ? parseInt(req.query.partySize as string)
      : undefined;

    const tables = await prisma.table.findMany({
      where: {
        restaurantId: id,
        status: "available",
        ...(partySize
          ? {
              capacity: { gte: partySize },
              minCapacity: { lte: partySize },
            }
          : {}),
      },
      orderBy: { capacity: "asc" },
    });

    res.json({
      success: true,
      message: "Tables retrieved successfully",
      data: tables,
    });
  } catch (error) {
    console.error("Get restaurant tables error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving tables.",
    });
  }
};

// ─── GET /api/restaurants/:id/availability ───────────────────────────────────
// Returns available time slots for a given date + party size
// Used by ReservationModal step 1 to populate time picker
export const getRestaurantAvailability = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = parseInt(req.params.id as string);
    const { date, partySize } = req.query;

    if (isNaN(id) || !date) {
      res.status(400).json({
        success: false,
        message: "Restaurant ID and date are required.",
      });
      return;
    }

    // Parse "YYYY-MM-DD" into components to avoid UTC-midnight shift
    const [year, month, day] = (date as string).split("-").map(Number);
    const targetDate = new Date(year, month - 1, day); // local midnight
    const dayOfWeek = targetDate.toLocaleDateString("en-US", {
      weekday: "long",
    }); // e.g. "Saturday"

    // Get operating hours for that day
    const hours = await prisma.operatingHours.findFirst({
      where: { restaurantId: id, dayOfWeek },
    });

    if (!hours || hours.isClosed) {
      res.json({
        success: true,
        message: "Restaurant is closed on this day.",
        data: { isOpen: false, slots: [] },
      });
      return;
    }

    // Get all tables that fit the party size
    const tables = await prisma.table.findMany({
      where: {
        restaurantId: id,
        status: "available",
        ...(partySize
          ? {
              capacity: { gte: parseInt(partySize as string) },
              minCapacity: { lte: parseInt(partySize as string) },
            }
          : {}),
      },
      select: { id: true },
    });

    if (!tables.length) {
      res.json({
        success: true,
        message: "No tables available for this party size.",
        data: { isOpen: true, slots: [] },
      });
      return;
    }

    const tableIds = tables.map((t) => t.id);

    // Get existing reservations on that date for those tables
    // Use startTime/endTime overlap instead of reservationDate to avoid
    // timezone inconsistencies with how reservationDate was stored
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        tableId: { in: tableIds },
        status: { in: ["pending", "confirmed"] },
        startTime: { lt: endOfDay },
        endTime: { gt: startOfDay },
      },
      select: {
        tableId: true,
        startTime: true,
        endTime: true,
        gameReservations: { select: { gameId: true } },
      },
    });

    // DEBUG: Log found reservations
    console.log(`[Availability] Date: ${date}, Tables: ${tableIds.join(",")}, Found ${existingReservations.length} reservations`);
    existingReservations.forEach((r) => {
      console.log(`  → table=${r.tableId} start=${r.startTime.toISOString()} end=${r.endTime.toISOString()} games=${r.gameReservations.map(g => g.gameId).join(",") || "none"}`);
    });

    // Build 1-hour slots between open/close time
    const SLOT_DURATION = 60; // minutes
    const slots: {
      time: string;
      available: boolean;
      reservedGameIds: number[];
    }[] = [];

    for (
      let t = hours.openTime;
      t + SLOT_DURATION <= hours.closeTime;
      t += SLOT_DURATION
    ) {
      const slotHour = Math.floor(t / 60);
      const slotMin = t % 60;
      const slotStart = new Date(year, month - 1, day, slotHour, slotMin, 0, 0);
      const slotEnd = new Date(year, month - 1, day, slotHour, slotMin + SLOT_DURATION, 0, 0);

      // A slot is available if at least one table has no conflicting reservation
      const conflictingReservations = existingReservations.filter(
        (r) => r.startTime < slotEnd && r.endTime > slotStart,
      );

      const hasAvailableTable = tableIds.some((tableId) => {
        return !conflictingReservations.some((r) => r.tableId === tableId);
      });

      // Collect game IDs reserved during this slot
      const reservedGameIds = [
        ...new Set(
          conflictingReservations.flatMap((r) =>
            r.gameReservations.map((gr) => gr.gameId),
          ),
        ),
      ];

      // Return as ISO string (this preserves the correct local time intent)
      slots.push({
        time: slotStart.toISOString(),
        available: hasAvailableTable,
        reservedGameIds,
      });
    }

    res.json({
      success: true,
      message: "Availability retrieved successfully",
      data: {
        isOpen: true,
        openTime: hours.openTime,
        closeTime: hours.closeTime,
        slots,
      },
    });
  } catch (error) {
    console.error("Get availability error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving availability.",
    });
  }
};

// ─── GET /api/games ───────────────────────────────────────────────────────────
// Browse the global game catalog (all games across all cafés)
export const getGames = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, q } = req.query;

    const games = await prisma.game.findMany({
      where: {
        ...(category
          ? { category: { equals: category as string, mode: "insensitive" } }
          : {}),
        ...(q ? { name: { contains: q as string, mode: "insensitive" } } : {}),
      },
      include: {
        _count: { select: { restaurantGames: true } }, // how many cafés carry it
      },
      orderBy: { bggRating: "desc" },
    });

    res.json({
      success: true,
      message: "Games retrieved successfully",
      data: games,
    });
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving games.",
    });
  }
};

// ─── GET /api/games/:bggId/restaurants ───────────────────────────────────────
// "Which cafés near me carry Catan?" — find by game page
export const getRestaurantsByGame = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bggId } = req.params;
    const { city } = req.query;

    const game = await prisma.game.findUnique({
      where: { bggId: bggId as string },
      include: {
        restaurantGames: {
          where: { status: "available" },
          include: {
            restaurant: {
              select: {
                id: true,
                name: true,
                tagline: true,
                city: true,
                address: true,
                logoUrl: true,
                rating: true,
                reviewCount: true,
              },
            },
          },
          ...(city
            ? {
                where: {
                  status: "available",
                  restaurant: {
                    city: { equals: city as string, mode: "insensitive" },
                  },
                },
              }
            : {}),
        },
      },
    });

    if (!game) {
      res
        .status(404)
        .json({ success: false, message: "Game not found in catalog." });
      return;
    }

    res.json({
      success: true,
      message: "Restaurants carrying this game retrieved successfully",
      data: {
        game: {
          id: game.id,
          bggId: game.bggId,
          name: game.name,
          imageUrl: game.imageUrl,
          category: game.category,
          bggRating: game.bggRating,
        },
        restaurants: game.restaurantGames.map((rg) => rg.restaurant),
      },
    });
  } catch (error) {
    console.error("Get restaurants by game error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving restaurants.",
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
