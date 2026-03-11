import { Request, Response } from "express";
import prisma from "../config/prisma";
import { generateOTP, getOTPExpirationTime, isOTPExpired } from "../utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpirationDate,
} from "../utils/jwt";
import { sendBusinessOTPEmail } from "../services/emailService";

// ─── POST /api/business/request-access ───────────────────────────────────────
// Public: café owner submits an application to join the platform
export const submitAccessRequest = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { cafeName, ownerName, email, phone, city, message } = req.body;

    // Check for an existing pending request with the same email
    const existing = await prisma.businessAccessRequest.findFirst({
      where: {
        email: email.toLowerCase(),
        status: "pending",
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message:
          "A pending request already exists for this email. We'll be in touch within 48 hours.",
      });
      return;
    }

    const accessRequest = await prisma.businessAccessRequest.create({
      data: {
        cafeName,
        ownerName,
        email: email.toLowerCase(),
        phone: phone || null,
        city,
        message: message || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Access request submitted successfully",
      data: {
        id: accessRequest.id,
        cafeName: accessRequest.cafeName,
        email: accessRequest.email,
        status: accessRequest.status,
        createdAt: accessRequest.createdAt,
      },
    });
  } catch (error) {
    console.error("Submit access request error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while submitting your request.",
    });
  }
};

// ─── POST /api/business/send-otp ─────────────────────────────────────────────
// Check if email has an approved access request, then send OTP
export const sendOTP = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if there's an approved access request for this email
    const accessRequest = await prisma.businessAccessRequest.findFirst({
      where: { email: normalizedEmail, status: "approved" },
    });

    if (!accessRequest) {
      // Check if there's a pending request
      const pendingRequest = await prisma.businessAccessRequest.findFirst({
        where: { email: normalizedEmail, status: "pending" },
      });

      if (pendingRequest) {
        res.status(403).json({
          success: false,
          message:
            "Your access request is still under review. We'll notify you within 48 hours.",
        });
        return;
      }

      // No request at all
      res.status(404).json({
        success: false,
        message:
          "No approved business account found for this email. Please request access first.",
      });
      return;
    }

    // Find the business user (created by admin on approval)
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user || user.role !== "business") {
      res.status(403).json({
        success: false,
        message:
          "Your business account has not been set up yet. Please wait for admin approval.",
      });
      return;
    }


    // Invalidate any existing unused OTPs for this user
    await prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: "business_login",
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate and save OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "business_login",
        expiresAt,
      },
    });

    // Send OTP email
    await sendBusinessOTPEmail({
      to: normalizedEmail,
      name: user.name || "there",
      otp,
    });

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("Business send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while sending the verification code.",
    });
  }
};

// ─── POST /api/business/verify-otp ───────────────────────────────────────────
// Verify OTP and return JWT tokens for the business user
export const verifyOTP = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: otp,
        type: "business_login",
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check and try again.",
      });
      return;
    }

    if (isOTPExpired(otpRecord.expiresAt)) {
      res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new one.",
      });
      return;
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpirationDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Signed in successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Business verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during verification.",
    });
  }
};

// ─── POST /api/business/resend-otp ───────────────────────────────────────────
// Resend OTP — same access-request check as send-otp
export const resendOTP = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // Verify approved access request still exists
    const accessRequest = await prisma.businessAccessRequest.findFirst({
      where: { email: normalizedEmail, status: "approved" },
    });

    if (!accessRequest) {
      res.status(403).json({
        success: false,
        message: "No approved business account found for this email.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found. Please try signing in again.",
      });
      return;
    }

    // Invalidate existing OTPs
    await prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: "business_login",
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate and send new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "business_login",
        expiresAt,
      },
    });

    await sendBusinessOTPEmail({
      to: normalizedEmail,
      name: user.name || "there",
      otp,
    });

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Business resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resending the code.",
    });
  }
};
