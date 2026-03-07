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

// All reservation routes require a logged-in user
router.use(authenticate);

// ─── USER ─────────────────────────────────────────────────────────────────────

// POST /api/reservations
router.post("/", createReservation);

// GET /api/reservations/my?status=confirmed
router.get("/my", getMyReservations);

// GET /api/reservations/:id
router.get("/:id", getReservationById);

// PATCH /api/reservations/:id/cancel
router.patch("/:id/cancel", cancelReservation);

// ─── BUSINESS / ADMIN ONLY ────────────────────────────────────────────────────

// PATCH /api/reservations/:id/status
router.patch(
  "/:id/status",
  requireRole("business", "admin") as any,
  updateReservationStatus,
);

export default router;
