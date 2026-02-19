import { Router } from "express";
import {
  signup,
  verifyOTP,
  resendOTP,
  signin,
  getCurrentUser,
  logout,
  guestSignup,
} from "../controllers/authController";
import {
  validateSignup,
  validateGuestSignup,
  validateSignin,
  validateVerifyOTP,
  validateResendOTP,
  handleValidationErrors,
} from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/signup", validateSignup, handleValidationErrors, signup);
router.post("/guest-signup", validateGuestSignup, handleValidationErrors, guestSignup);
router.post(
  "/verify-otp",
  validateVerifyOTP,
  handleValidationErrors,
  verifyOTP,
);
router.post(
  "/resend-otp",
  validateResendOTP,
  handleValidationErrors,
  resendOTP,
);
router.post("/signin", validateSignin, handleValidationErrors, signin);

// Protected routes
router.get("/me", authenticate, getCurrentUser);
router.post("/logout", authenticate, logout);

export default router;
