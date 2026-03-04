import Router from "express";
import {
  createReservation,
  getReservations,
  //getReservations,
  //updateReservation,
  //cancelReservation,
} from "../controllers/reservationController";
import { authenticate } from "../middleware/auth";
//import { validateCreateReservation, handleValidationErrors } from "../middleware/validation";

const router = Router();

// Public routes
router.post("/", /*validateCreateReservation, handleValidationErrors,*/ createReservation);
router.get("/", getReservations);

// Protected routes (require authentication)
//router.get("/", authenticate, getReservations);
//router.put("/:id", authenticate, validateCreateReservation, handleValidationErrors, updateReservation);
//router.delete("/:id", authenticate, cancelReservation);

export default router;