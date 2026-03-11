import { Router } from "express";
import {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  updateReservationStatus,
} from "../controllers/reservationController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// ─── USER ─────────────────────────────────────────────────────────────────────

// POST /api/reservations
router.post("/", createReservation);

// GET /api/reservations/my?status=confirmed
router.get("/my", authenticate, getMyReservations);

// GET /api/reservations/:id
router.get("/:id", authenticate, getReservationById);

// PATCH /api/reservations/:id/cancel
router.patch("/:id/cancel", authenticate, cancelReservation);

// ─── BUSINESS / ADMIN ONLY ────────────────────────────────────────────────────

// PATCH /api/reservations/:id/status
router.patch(
  "/:id/status",
  requireRole("business", "admin") as any,
  updateReservationStatus,
);

export default router;
