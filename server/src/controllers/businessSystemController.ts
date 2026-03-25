import { Response } from "express";
import { AuthRequest } from "../types/express";
import prisma from "../config/prisma";

// ─── Validation helpers ───────────────────────────────────────────────────────

const VALID_DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const VALID_PRICING_TYPES = ["hourly", "flat", "hybrid"];
const VALID_TABLE_TYPES = ["Round", "Square", "Booth", "High-Top"];

function isValidEmail(v: unknown): boolean {
  if (typeof v !== "string" || !v.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isValidUrl(v: unknown): boolean {
  if (!v || typeof v !== "string") return true; // optional
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}

function isValidPhone(v: unknown): boolean {
  if (!v || typeof v !== "string") return true; // optional
  return v.replace(/\D/g, "").length >= 10;
}

function isPositiveNumber(v: unknown): boolean {
  const n = parseFloat(String(v));
  return !isNaN(n) && n > 0;
}

function isNonEmptyString(v: unknown): boolean {
  return typeof v === "string" && v.trim().length > 0;
}



// ─── Helper: get the restaurant linked to the authenticated business user ────
async function getBusinessRestaurant(req: AuthRequest, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { restaurantId: true },
  });

  if (!user?.restaurantId) {
    res.status(404).json({
      success: false,
      message: "No restaurant linked to your account.",
    });
    return null;
  }

  return user.restaurantId;
}

// ═════════════════════════════════════════════════════════════════════════════
//  PROFILE
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: {
        operatingHours: { orderBy: { dayOfWeek: "asc" } },
        tables: { orderBy: { id: "asc" } },
        restaurantGames: {
          include: { game: true },
          orderBy: { id: "asc" },
        },
        _count: { select: { tables: true, restaurantGames: true } },
      },
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error("Get business profile error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve profile." });
  }
};

// GET /api/business-system/setup-prefill
// Returns access-request data so the setup wizard can autofill the form.
export const getSetupPrefill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const accessRequest = await prisma.businessAccessRequest.findFirst({
      where: { userId , status: "approved" },
      orderBy: { createdAt: "desc" },
      select: {
        cafeName: true,
        ownerName: true,
        email: true,
        phone: true,
        city: true,
      },
    });

    if (!accessRequest) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({ success: true, data: accessRequest });
  } catch (error) {
    console.error("Get setup prefill error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve prefill data." });
  }
};

// PUT /api/business-system/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const {
      name, tagline, description, address, city, province, postalCode,
      phone, website, contactName, contactEmail, businessType, timezone, logoUrl,
    } = req.body;

    // Validate
    if (contactEmail !== undefined && !isValidEmail(contactEmail)) {
      res.status(400).json({ success: false, message: "Invalid email address." });
      return;
    }
    if (website !== undefined && !isValidUrl(website)) {
      res.status(400).json({ success: false, message: "Website must start with http:// or https://." });
      return;
    }
    if (phone !== undefined && !isValidPhone(phone)) {
      res.status(400).json({ success: false, message: "Phone number must have at least 10 digits." });
      return;
    }
    if (name !== undefined && !isNonEmptyString(name)) {
      res.status(400).json({ success: false, message: "Business name cannot be empty." });
      return;
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(name !== undefined && { name }),
        ...(tagline !== undefined && { tagline }),
        ...(description !== undefined && { description }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(province !== undefined && { province }),
        ...(postalCode !== undefined && { postalCode }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(contactName !== undefined && { contactName }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(businessType !== undefined && { businessType }),
        ...(timezone !== undefined && { timezone }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    res.json({ success: true, message: "Profile updated.", data: updated });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  SETUP WIZARD
// ═════════════════════════════════════════════════════════════════════════════

// POST /api/business-system/setup
export const completeSetup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    // Get or create the restaurant for this user
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { restaurantId: true },
    });

    let restaurantId = user?.restaurantId ?? null;

    if (!restaurantId) {
      // First-time setup: derive the name from the access request so it's never "My Café"
      const accessReq = await prisma.businessAccessRequest.findFirst({
        where: { userId, status: "approved" },
        orderBy: { createdAt: "desc" },
        select: { cafeName: true },
      });
      const initialName = accessReq?.cafeName?.trim() || "My Café";
      const newRestaurant = await prisma.restaurant.create({
        data: { name: initialName },
      });
      await prisma.user.update({
        where: { id: userId },
        data: { restaurantId: newRestaurant.id },
      });
      restaurantId = newRestaurant.id;

    }

    const { profile, tables, hours, pricing, logoUrl } = req.body;

    // ── Validate profile ──
    if (profile) {
      if (profile.contactEmail && !isValidEmail(profile.contactEmail)) {
        res.status(400).json({ success: false, message: "Invalid contact email address." });
        return;
      }
      if (profile.website && !isValidUrl(profile.website)) {
        res.status(400).json({ success: false, message: "Website must start with http:// or https://." });
        return;
      }
      if (profile.phone && !isValidPhone(profile.phone)) {
        res.status(400).json({ success: false, message: "Phone number must have at least 10 digits." });
        return;
      }
    }

    // ── Validate tables ──
    if (tables && Array.isArray(tables)) {
      for (const t of tables) {
        if (!isNonEmptyString(t.name)) {
          res.status(400).json({ success: false, message: "Each table must have a non-empty name." });
          return;
        }
        const cap = parseInt(t.capacity);
        if (isNaN(cap) || cap < 1 || cap > 50) {
          res.status(400).json({ success: false, message: `Table "${t.name}" must have a capacity between 1 and 50.` });
          return;
        }
        if (t.type && !VALID_TABLE_TYPES.includes(t.type)) {
          res.status(400).json({ success: false, message: `Invalid table type "${t.type}". Allowed: ${VALID_TABLE_TYPES.join(", ")}.` });
          return;
        }
      }
    }

    // ── Validate hours ──
    if (hours && Array.isArray(hours)) {
      for (const h of hours) {
        if (!VALID_DAYS.includes(h.dayOfWeek)) {
          res.status(400).json({ success: false, message: `Invalid day "${h.dayOfWeek}".` });
          return;
        }
        if (!h.isClosed) {
          if (typeof h.openTime !== "number" || h.openTime < 0 || h.openTime > 1439 ||
              typeof h.closeTime !== "number" || h.closeTime < 0 || h.closeTime > 1439) {
            res.status(400).json({ success: false, message: `Invalid times for ${h.dayOfWeek}. Times must be minutes (0-1439).` });
            return;
          }
          if (h.closeTime <= h.openTime) {
            res.status(400).json({ success: false, message: `Close time must be after open time for ${h.dayOfWeek}.` });
            return;
          }
        }
      }
    }

    // ── Validate pricing ──
    if (pricing) {
      if (pricing.pricingType && !VALID_PRICING_TYPES.includes(pricing.pricingType)) {
        res.status(400).json({ success: false, message: `Invalid pricingType. Allowed: ${VALID_PRICING_TYPES.join(", ")}.` });
        return;
      }
      if ((pricing.pricingType === "hourly" || pricing.pricingType === "hybrid") &&
          pricing.hourlyRate !== undefined && !isPositiveNumber(pricing.hourlyRate)) {
        res.status(400).json({ success: false, message: "Hourly rate must be a positive number." });
        return;
      }
      if (pricing.enableThreshold && pricing.minSpend !== undefined && !isPositiveNumber(pricing.minSpend)) {
        res.status(400).json({ success: false, message: "Minimum spend must be a positive number." });
        return;
      }
    }

    // 1. Update restaurant profile
    if (profile || logoUrl) {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          ...(profile?.name && { name: profile.name }),
          ...(profile?.contactEmail && { contactEmail: profile.contactEmail }),
          ...(profile?.contactName && { contactName: profile.contactName }),
          ...(profile?.website && { website: profile.website }),
          ...(profile?.businessType && { businessType: profile.businessType }),
          ...(profile?.phone && { phone: profile.phone }),
          ...(profile?.address && { address: profile.address }),
          ...(profile?.city && { city: profile.city }),
          ...(profile?.province && { province: profile.province }),
          ...(profile?.postalCode && { postalCode: profile.postalCode }),
          ...(logoUrl && { logoUrl }),
        },
      });
    }

    // 2. Create tables
    if (tables && Array.isArray(tables) && tables.length > 0) {
      // Remove existing tables first for clean setup
      await prisma.table.deleteMany({ where: { restaurantId } });
      await prisma.table.createMany({
        data: tables.map((t: { name: string; capacity: number; type: string }) => ({
          name: t.name,
          capacity: t.capacity || 4,
          minCapacity: 1,
          type: t.type || "Round",
          status: "available",
          restaurantId,
        })),
      });
    }

    // 3. Set operating hours
    if (hours && Array.isArray(hours)) {
      await prisma.operatingHours.deleteMany({ where: { restaurantId } });
      await prisma.operatingHours.createMany({
        data: hours.map((h: { dayOfWeek: string; openTime: number; closeTime: number; isClosed: boolean }) => ({
          dayOfWeek: h.dayOfWeek,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: h.isClosed,
          restaurantId,
        })),
      });
    }

    // 4. Set pricing
    if (pricing) {
      await prisma.restaurant.update({
        where: { id: restaurantId },
        data: {
          pricingType: pricing.pricingType || "hourly",
          hourlyRate: pricing.hourlyRate ? parseFloat(pricing.hourlyRate) : null,
          coverFee: pricing.coverFee ? parseFloat(pricing.coverFee) : null,
          minSpend: pricing.minSpend ? parseFloat(pricing.minSpend) : null,
          enableThreshold: pricing.enableThreshold ?? false,
        },
      });
    }

    // 5. Mark setup complete
    const restaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { isSetupComplete: true },
    });

    res.json({ success: true, message: "Setup completed!", data: restaurant });
  } catch (error) {
    console.error("Complete setup error:", error);
    res.status(500).json({ success: false, message: "Failed to complete setup." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/dashboard
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    // Total tables
    const totalTables = await prisma.table.count({ where: { restaurantId } });

    // Tables currently occupied (reservations active right now)
    const now = new Date();
    const occupiedTables = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        status: { in: ["confirmed", "pending"] },
        startTime: { lte: now },
        endTime: { gte: now },
      },
      select: { tableId: true },
      distinct: ["tableId"],
    });

    // Today's reservations
    const todayReservations = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        user: { select: { id: true, name: true, email: true } },
        gameReservations: {
          include: { game: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
      orderBy: { startTime: "asc" },
    });

    const pendingCount = todayReservations.filter((r) => r.status === "pending").length;
    const totalCustomersToday = todayReservations.reduce((sum, r) => sum + r.partySize, 0);

    // This week's new unique customers
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekReservations = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        startTime: { gte: startOfWeek },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    // Average session time (last 30 days completed reservations)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const completedRecent = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        status: "completed",
        startTime: { gte: thirtyDaysAgo },
      },
      select: { startTime: true, endTime: true },
    });

    let avgSessionMinutes = 150; // default 2.5h
    if (completedRecent.length > 0) {
      const totalMinutes = completedRecent.reduce((sum, r) => {
        return sum + (r.endTime.getTime() - r.startTime.getTime()) / 60000;
      }, 0);
      avgSessionMinutes = Math.round(totalMinutes / completedRecent.length);
    }

    res.json({
      success: true,
      data: {
        occupancy: {
          occupied: occupiedTables.length,
          total: totalTables,
        },
        todayReservations: {
          total: todayReservations.length,
          pending: pendingCount,
        },
        totalCustomersToday,
        newCustomersThisWeek: weekReservations.length,
        avgSessionMinutes,
        reservations: todayReservations,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve dashboard stats." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  TABLES
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/tables
export const getTables = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const tables = await prisma.table.findMany({
      where: { restaurantId },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data: tables });
  } catch (error) {
    console.error("Get tables error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve tables." });
  }
};

// POST /api/business-system/tables
export const addTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { name, capacity, type } = req.body;

    // Validate
    if (!isNonEmptyString(name)) {
      res.status(400).json({ success: false, message: "Table name is required." });
      return;
    }
    if (name && name.trim().length > 50) {
      res.status(400).json({ success: false, message: "Table name must be 50 characters or less." });
      return;
    }
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap < 1 || cap > 50) {
      res.status(400).json({ success: false, message: "Capacity must be a number between 1 and 50." });
      return;
    }
    if (type && !VALID_TABLE_TYPES.includes(type)) {
      res.status(400).json({ success: false, message: `Invalid table type. Allowed: ${VALID_TABLE_TYPES.join(", ")}.` });
      return;
    }

    const table = await prisma.table.create({
      data: {
        name: name || `Table ${Date.now()}`,
        capacity: parseInt(capacity) || 4,
        minCapacity: 1,
        type: type || "Round",
        status: "available",
        restaurantId,
      },
    });

    res.status(201).json({ success: true, message: "Table added.", data: table });
  } catch (error) {
    console.error("Add table error:", error);
    res.status(500).json({ success: false, message: "Failed to add table." });
  }
};

// DELETE /api/business-system/tables/:id
export const removeTable = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const id = parseInt(req.params.id as string);
    const table = await prisma.table.findFirst({ where: { id, restaurantId } });

    if (!table) {
      res.status(404).json({ success: false, message: "Table not found." });
      return;
    }

    await prisma.table.delete({ where: { id } });
    res.json({ success: true, message: "Table removed." });
  } catch (error) {
    console.error("Remove table error:", error);
    res.status(500).json({ success: false, message: "Failed to remove table." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  OPERATING HOURS
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/hours
export const getHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const hours = await prisma.operatingHours.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json({ success: true, data: hours });
  } catch (error) {
    console.error("Get hours error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve hours." });
  }
};

// PUT /api/business-system/hours
export const updateHours = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { hours } = req.body;

    if (!Array.isArray(hours)) {
      res.status(400).json({ success: false, message: "Hours must be an array." });
      return;
    }

    // Validate each day entry
    for (const h of hours) {
      if (!VALID_DAYS.includes(h.dayOfWeek)) {
        res.status(400).json({ success: false, message: `Invalid day "${h.dayOfWeek}".` });
        return;
      }
      if (!h.isClosed) {
        if (typeof h.openTime !== "number" || h.openTime < 0 || h.openTime > 1439 ||
            typeof h.closeTime !== "number" || h.closeTime < 0 || h.closeTime > 1439) {
          res.status(400).json({ success: false, message: `Invalid times for ${h.dayOfWeek}. Times must be minutes (0-1439).` });
          return;
        }
        if (h.closeTime <= h.openTime) {
          res.status(400).json({ success: false, message: `Close time must be after open time for ${h.dayOfWeek}.` });
          return;
        }
      }
    }

    // Delete and recreate
    await prisma.operatingHours.deleteMany({ where: { restaurantId } });
    await prisma.operatingHours.createMany({
      data: hours.map((h: { dayOfWeek: string; openTime: number; closeTime: number; isClosed: boolean }) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
        restaurantId,
      })),
    });

    const updated = await prisma.operatingHours.findMany({
      where: { restaurantId },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json({ success: true, message: "Hours updated.", data: updated });
  } catch (error) {
    console.error("Update hours error:", error);
    res.status(500).json({ success: false, message: "Failed to update hours." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  GAME LIBRARY
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/games
export const getGames = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const games = await prisma.restaurantGame.findMany({
      where: { restaurantId },
      include: { game: true },
      orderBy: { id: "asc" },
    });

    res.json({
      success: true,
      data: games.map((rg) => ({ ...rg.game, restaurantGameId: rg.id, status: rg.status })),
    });
  } catch (error) {
    console.error("Get games error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve games." });
  }
};

// POST /api/business-system/games
export const addGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { bggId, name, imageUrl, minPlayers, maxPlayers, estimatedPlayTime, category, difficulty } = req.body;

    if (!bggId || !name) {
      res.status(400).json({ success: false, message: "bggId and name are required." });
      return;
    }

    // Upsert the game into our games table by bggId
    const game = await prisma.game.upsert({
      where: { bggId: String(bggId) },
      update: {
        name,
        ...(imageUrl !== undefined && { imageUrl }),
        ...(minPlayers !== undefined && { minPlayers: parseInt(minPlayers) || 1 }),
        ...(maxPlayers !== undefined && { maxPlayers: parseInt(maxPlayers) || 1 }),
        ...(estimatedPlayTime !== undefined && { estimatedPlayTime: parseInt(estimatedPlayTime) || 60 }),
        ...(category !== undefined && { category }),
        ...(difficulty !== undefined && { difficulty }),
      },
      create: {
        bggId: String(bggId),
        name,
        imageUrl: imageUrl || null,
        minPlayers: parseInt(minPlayers) || 1,
        maxPlayers: parseInt(maxPlayers) || 1,
        estimatedPlayTime: parseInt(estimatedPlayTime) || 60,
        category: category || null,
        difficulty: difficulty || null,
      },
    });

    // Check if already linked to this restaurant
    const existing = await prisma.restaurantGame.findFirst({
      where: { restaurantId, gameId: game.id },
    });

    if (existing) {
      res.status(409).json({ success: false, message: "Game already in library." });
      return;
    }

    const rg = await prisma.restaurantGame.create({
      data: { restaurantId, gameId: game.id, status: "available" },
      include: { game: true },
    });

    res.status(201).json({
      success: true,
      message: "Game added to library.",
      data: { ...rg.game, restaurantGameId: rg.id, status: rg.status },
    });
  } catch (error) {
    console.error("Add game error:", error);
    res.status(500).json({ success: false, message: "Failed to add game." });
  }
};


// DELETE /api/business-system/games/:id
export const removeGame = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const id = parseInt(req.params.id as string);
    const rg = await prisma.restaurantGame.findFirst({ where: { id, restaurantId } });

    if (!rg) {
      res.status(404).json({ success: false, message: "Game not found in library." });
      return;
    }

    await prisma.restaurantGame.delete({ where: { id } });
    res.json({ success: true, message: "Game removed from library." });
  } catch (error) {
    console.error("Remove game error:", error);
    res.status(500).json({ success: false, message: "Failed to remove game." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  MENU
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/menu
// ═════════════════════════════════════════════════════════════════════════════
//  PRICING
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/pricing
export const getPricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        pricingType: true,
        hourlyRate: true,
        coverFee: true,
        minSpend: true,
        enableThreshold: true,
      },
    });

    res.json({ success: true, data: restaurant });
  } catch (error) {
    console.error("Get pricing error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve pricing." });
  }
};

// PUT /api/business-system/pricing
export const updatePricing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { pricingType, hourlyRate, coverFee, minSpend, enableThreshold } = req.body;

    // Validate
    if (pricingType !== undefined && !VALID_PRICING_TYPES.includes(pricingType)) {
      res.status(400).json({ success: false, message: `Invalid pricingType. Allowed: ${VALID_PRICING_TYPES.join(", ")}.` });
      return;
    }
    if ((pricingType === "hourly" || pricingType === "hybrid") && hourlyRate !== undefined) {
      if (!isPositiveNumber(hourlyRate)) {
        res.status(400).json({ success: false, message: "Hourly rate must be a positive number." });
        return;
      }
    }
    if (hourlyRate !== undefined && hourlyRate !== null && !isPositiveNumber(hourlyRate)) {
      res.status(400).json({ success: false, message: "Hourly rate must be a positive number." });
      return;
    }
    if (coverFee !== undefined && coverFee !== null && !isPositiveNumber(coverFee)) {
      res.status(400).json({ success: false, message: "Cover fee must be a positive number." });
      return;
    }
    if (enableThreshold && minSpend !== undefined && minSpend !== null && !isPositiveNumber(minSpend)) {
      res.status(400).json({ success: false, message: "Minimum spend must be a positive number." });
      return;
    }

    const updated = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(pricingType !== undefined && { pricingType }),
        ...(hourlyRate !== undefined && { hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null }),
        ...(coverFee !== undefined && { coverFee: coverFee ? parseFloat(coverFee) : null }),
        ...(minSpend !== undefined && { minSpend: minSpend ? parseFloat(minSpend) : null }),
        ...(enableThreshold !== undefined && { enableThreshold }),
      },
      select: {
        pricingType: true,
        hourlyRate: true,
        coverFee: true,
        minSpend: true,
        enableThreshold: true,
      },
    });

    res.json({ success: true, message: "Pricing updated.", data: updated });
  } catch (error) {
    console.error("Update pricing error:", error);
    res.status(500).json({ success: false, message: "Failed to update pricing." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  RESERVATIONS (for business dashboard)
// ═════════════════════════════════════════════════════════════════════════════

// GET /api/business-system/reservations?date=YYYY-MM-DD&status=confirmed
export const getReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { date, status } = req.query;

    let dateFilter = {};
    if (date) {
      const [year, month, day] = (date as string).split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      dateFilter = { startTime: { gte: startOfDay, lte: endOfDay } };
    }

    const reservations = await prisma.reservation.findMany({
      where: {
        table: { restaurantId },
        ...dateFilter,
        ...(status ? { status: status as string } : {}),
      },
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        user: { select: { id: true, name: true, email: true, isGuest: true } },
        gameReservations: {
          include: { game: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
      orderBy: [{ startTime: "asc" }],
    });

    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error("Get business reservations error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve reservations." });
  }
};

// POST /api/business-system/reservations (walk-in / manual booking)
export const createWalkInReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const { customerName, email, phone, partySize, tableId, specialRequests, source } = req.body;

    if (!customerName || !partySize || !tableId) {
      res.status(400).json({
        success: false,
        message: "customerName, partySize, and tableId are required.",
      });
      return;
    }

    // Verify the table belongs to this restaurant
    const table = await prisma.table.findFirst({
      where: { id: parseInt(tableId), restaurantId },
    });

    if (!table) {
      res.status(404).json({ success: false, message: "Table not found." });
      return;
    }

    // Find or create guest user
    let guestUser = email
      ? await prisma.user.findFirst({ where: { email, isGuest: true } })
      : null;

    if (!guestUser) {
      guestUser = await prisma.user.create({
        data: {
          name: customerName,
          email: email || `walkin-${Date.now()}@gatore.local`,
          password: "",
          isGuest: true,
          isActive: true,
          role: "user",
          authProvider: "guest",
        },
      });
    }

    // Create reservation starting now, 2 hours duration
    const now = new Date();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const reservation = await prisma.reservation.create({
      data: {
        reservationDate: now,
        startTime: now,
        endTime,
        partySize: parseInt(partySize),
        status: "confirmed",
        specialRequests: specialRequests || null,
        notes: source ? `Source: ${source}${phone ? `, Phone: ${phone}` : ""}` : null,
        userId: guestUser.id,
        tableId: parseInt(tableId),
      },
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation created.",
      data: reservation,
    });
  } catch (error) {
    console.error("Create walk-in reservation error:", error);
    res.status(500).json({ success: false, message: "Failed to create reservation." });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  ACCOUNT DELETION
// ═════════════════════════════════════════════════════════════════════════════

// DELETE /api/business-system/account
export const deleteBusinessAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { restaurantId: true },
    });

    if (!user?.restaurantId) {
      res.status(404).json({ success: false, message: "No restaurant linked to your account." });
      return;
    }

    const restaurantId = user.restaurantId;

    // 1. Delete GameReservations (child of Reservation, which has no cascade from Table)
    await prisma.gameReservation.deleteMany({
      where: { reservation: { table: { restaurantId } } },
    });

    // 2. Delete Reservations for this restaurant's tables
    await prisma.reservation.deleteMany({
      where: { table: { restaurantId } },
    });

    // 3. Delete the Restaurant (cascades: OperatingHours, Table, MenuItem, RestaurantGame)
    await prisma.restaurant.delete({ where: { id: restaurantId } });

    // 4. Delete all BusinessAccessRequests for this user
    await prisma.businessAccessRequest.deleteMany({ where: { userId } });

    // 5. Demote the user back to regular user (no hard delete — safer for audit trail)
    await prisma.user.update({
      where: { id: userId },
      data: {
        restaurantId: null,
        role: "user",
        isActive: true,
      },
    });

    res.json({ success: true, message: "Business account deleted successfully." });
  } catch (error) {
    console.error("Delete business account error:", error);
    res.status(500).json({ success: false, message: "Failed to delete business account." });
  }
};

// PATCH /api/business-system/reservations/:id/status
export const updateReservationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const restaurantId = await getBusinessRestaurant(req, res);
    if (!restaurantId) return;

    const id = parseInt(req.params.id as string);
    const { status, notes } = req.body;

    const allowed = ["pending", "confirmed", "cancelled", "completed"];
    if (!allowed.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowed.join(", ")}`,
      });
      return;
    }

    // Verify the reservation belongs to this restaurant
    const reservation = await prisma.reservation.findFirst({
      where: { id, table: { restaurantId } },
    });

    if (!reservation) {
      res.status(404).json({ success: false, message: "Reservation not found." });
      return;
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        table: { select: { id: true, name: true, capacity: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error("Update reservation status error:", error);
    res.status(500).json({ success: false, message: "Failed to update reservation." });
  }
};
