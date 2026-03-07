import { Router } from "express";
import {
  signupInit,
  signupComplete,
  verifyOTP,
  resendOTP,
  signin,
  getCurrentUser,
  logout,
  guestSignup,
  googleAuth,
  saveProfile,
} from "../controllers/authController";
import {
  validateGuestSignup,
  validateSignin,
  validateVerifyOTP,
  validateResendOTP,
  validateSignupInit,
  validateSignupComplete,
  handleValidationErrors,
} from "../middleware/validation";
import { authenticate } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/signup", validateSignupInit, handleValidationErrors, signupInit);
router.post(
  "/signup/complete",
  validateSignupComplete,
  handleValidationErrors,
  signupComplete,
);
router.post("/signup/profile", saveProfile);

router.post(
  "/guest-signup",
  validateGuestSignup,
  handleValidationErrors,
  guestSignup,
);
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

// Google OAuth route
router.post("/google", googleAuth);

export default router;
