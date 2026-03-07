import { Router } from "express";
import {
  getRestaurants,
  getRestaurantById,
  getRestaurantGames,
  getRestaurantTables,
  getRestaurantAvailability,
  getRestaurantReservations,
} from "../controllers/restaurantController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/restaurants?city=Waterloo
router.get("/", getRestaurants);

// GET /api/restaurants/:id
router.get("/:id", getRestaurantById);

// GET /api/restaurants/:id/games?category=Strategy&status=available
router.get("/:id/games", getRestaurantGames);

// GET /api/restaurants/:id/tables?partySize=4
router.get("/:id/tables", getRestaurantTables);

// GET /api/restaurants/:id/availability?date=2026-03-10&partySize=4
router.get("/:id/availability", getRestaurantAvailability);

// ─── BUSINESS / ADMIN ONLY ────────────────────────────────────────────────────

// GET /api/restaurants/:id/reservations?date=2026-03-10&status=confirmed
router.get(
  "/:id/reservations",
  authenticate,
  requireRole("business", "admin") as any,
  getRestaurantReservations,
);

export default router;
