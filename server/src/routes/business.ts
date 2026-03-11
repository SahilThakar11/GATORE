import { Router } from "express";
import {
  submitAccessRequest,
  sendOTP,
  verifyOTP,
  resendOTP,
} from "../controllers/businessController";
import {
  validateBusinessAccessRequest,
  handleValidationErrors,
} from "../middleware/validation";
import { body } from "express-validator";

const router = Router();

// POST /api/business/request-access
router.post(
  "/request-access",
  validateBusinessAccessRequest,
  handleValidationErrors,
  submitAccessRequest,
);

// POST /api/business/send-otp
router.post(
  "/send-otp",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ],
  handleValidationErrors,
  sendOTP,
);

// POST /api/business/verify-otp
router.post(
  "/verify-otp",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("otp")
      .trim()
      .notEmpty()
      .withMessage("Verification code is required")
      .isLength({ min: 6, max: 6 })
      .withMessage("Code must be 6 digits")
      .isNumeric()
      .withMessage("Code must contain only numbers"),
  ],
  handleValidationErrors,
  verifyOTP,
);

// POST /api/business/resend-otp
router.post(
  "/resend-otp",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ],
  handleValidationErrors,
  resendOTP,
);

export default router;
