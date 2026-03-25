import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import {
  getProfile,
  getSetupPrefill,
  updateProfile,
  completeSetup,
  getDashboardStats,
  getTables,
  addTable,
  removeTable,
  getHours,
  updateHours,
  getGames,
  addGame,
  removeGame,
  getPricing,
  updatePricing,
  getReservations,
  createWalkInReservation,
  updateReservationStatus,
  deleteBusinessAccount,
} from "../controllers/businessSystemController";

const router = Router();

// All routes require authentication + business role
router.use(authenticate as any, authorize("business", "admin") as any);

// ── Profile ──────────────────────────────────────────────────────────────────
router.get("/profile", getProfile as any);
router.put("/profile", updateProfile as any);

// ── Setup Wizard ─────────────────────────────────────────────────────────────
router.get("/setup-prefill", getSetupPrefill as any);
router.post("/setup", completeSetup as any);

// ── Dashboard ────────────────────────────────────────────────────────────────
router.get("/dashboard", getDashboardStats as any);

// ── Tables ───────────────────────────────────────────────────────────────────
router.get("/tables", getTables as any);
router.post("/tables", addTable as any);
router.delete("/tables/:id", removeTable as any);

// ── Operating Hours ──────────────────────────────────────────────────────────
router.get("/hours", getHours as any);
router.put("/hours", updateHours as any);

// ── Game Library ─────────────────────────────────────────────────────────────
router.get("/games", getGames as any);
router.post("/games", addGame as any);
router.delete("/games/:id", removeGame as any);

// ── Pricing ──────────────────────────────────────────────────────────────────
router.get("/pricing", getPricing as any);
router.put("/pricing", updatePricing as any);

// ── Reservations ─────────────────────────────────────────────────────────────
router.get("/reservations", getReservations as any);
router.post("/reservations", createWalkInReservation as any);
router.patch("/reservations/:id/status", updateReservationStatus as any);

// ── Account Deletion ─────────────────────────────────────────────────────────
router.delete("/account", deleteBusinessAccount as any);

export default router;
