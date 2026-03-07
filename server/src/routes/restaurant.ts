import Router from "express";
import {
  createReservation,
  getGames,
  getReservations,
  getRestaurant,
  //getReservations,
  //updateReservation,
  //cancelReservation,
} from "../controllers/reservationController";
import { authenticate } from "../middleware/auth";
//import { validateCreateReservation, handleValidationErrors } from "../middleware/validation";

const router = Router();

// Public routes
router.get("/by-id/:id", getRestaurant);
router.post("/reservations", /*validateCreateReservation, handleValidationErrors,*/ createReservation);
router.get("/reservations", getReservations);
router.get("/games", getGames);

// Protected routes (require authentication)
//router.get("/", authenticate, getReservations);
//router.put("/:id", authenticate, validateCreateReservation, handleValidationErrors, updateReservation);
//router.delete("/:id", authenticate, cancelReservation);

export default router;