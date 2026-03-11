import { Router } from "express";
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  updateReservation,
  updateReservationStatus,
} from "../controllers/reservationController";
import {
  authenticate,
  optionalAuthenticate,
  requireRole,
} from "../middleware/auth";

const router = Router();

// ─── USER ─────────────────────────────────────────────────────────────────────

// POST /api/reservations
router.post("/", optionalAuthenticate as any, createReservation);

// GET /api/reservations/my?status=confirmed
router.get("/my", authenticate, getMyReservations);

// GET /api/reservations/:id
router.get("/:id", authenticate, getReservationById);

// PATCH /api/reservations/:id/cancel
router.patch("/:id/cancel", authenticate, cancelReservation);

// PUT /api/reservations/:id
router.put("/:id", authenticate, updateReservation);

// ─── BUSINESS / ADMIN ONLY ────────────────────────────────────────────────────

// PATCH /api/reservations/:id/status
router.patch(
  "/:id/status",
  requireRole("business", "admin") as any,
  updateReservationStatus,
);

export default router;
