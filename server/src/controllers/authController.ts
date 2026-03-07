import { Request, Response } from "express";
import { AuthRequest } from "../types/express";
import prisma from "../config/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateOTP, getOTPExpirationTime, isOTPExpired } from "../utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpirationDate,
} from "../utils/jwt";
import { sendOTPEmail } from "../services/emailService";
import { getGoogleUserInfo } from "../utils/google";

// Guest Sign Up - Create guest user
export const guestSignup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;
    // Create guest user

    // Check if Guest user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email, isGuest: true },
    });

    if (existingUser) {
      res.status(201).json({
        success: true,
        message: "Email already registered",
        data: {
          user: existingUser,
        },
      });
      return;
    }

    const user = await prisma.user.create({
      data: {
        name: "Guest User",
        email,
        isGuest: true,
        emailVerified: false,
        isActive: true,
        password: "GuestPassword123!", // This password won't be used for authentication, but is required by the schema
      },
    });

    res.status(201).json({
      success: true,
      message: "Guest user created successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Guest signup error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during guest signup. Please try again.",
    });
  }
};

// ─── Signup Init ────────────────────────────────────────────────────────────
// Step 1 — email only, creates placeholder user and sends OTP

export const signupInit = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        // Email verified but password never set — resume from password step
        if (existingUser.password === "") {
          res.status(200).json({
            success: true,
            message: "resume_password",
            data: { email: existingUser.email },
          });
          return;
        }

        // Fully registered — tell them to sign in
        res.status(400).json({
          success: false,
          message: "Email already registered. Please sign in.",
        });
        return;
      }

      // Exists but not verified — invalidate old OTPs and resend
      const otp = generateOTP();
      const expiresAt = getOTPExpirationTime();

      await prisma.otpCode.updateMany({
        where: {
          userId: existingUser.id,
          type: "email_verification",
          isUsed: false,
        },
        data: { isUsed: true },
      });

      await prisma.otpCode.create({
        data: {
          code: otp,
          userId: existingUser.id,
          type: "email_verification",
          expiresAt,
        },
      });

      await sendOTPEmail({
        to: email,
        name: existingUser.name ?? "there",
        otp,
      });

      res.status(200).json({
        success: true,
        message: "OTP resent to your email.",
      });
      return;
    }

    // Brand new user — create placeholder, no name/password yet
    const user = await prisma.user.create({
      data: {
        email,
        name: "",
        password: "",
        isActive: false,
        emailVerified: false,
        authProvider: "email",
      },
    });

    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "email_verification",
        expiresAt,
      },
    });

    await sendOTPEmail({
      to: email,
      name: "there",
      otp,
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email.",
      data: { email: user.email },
    });
  } catch (error) {
    console.error("Signup init error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// ─── Verify OTP ─────────────────────────────────────────────────────────────
// Step 2 — verifies OTP, marks email as verified, returns JWT

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: "Email already verified. Please sign in.",
      });
      return;
    }

    const otpRecord = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: otp,
        type: "email_verification",
        isUsed: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "Invalid OTP code",
      });
      return;
    }

    if (isOTPExpired(otpRecord.expiresAt)) {
      res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
      return;
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Mark user as verified and active
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isActive: true,
      },
    });

    const payload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: updatedUser.id,
        expiresAt: getRefreshTokenExpirationDate(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during verification. Please try again.",
    });
  }
};

// ─── Resend OTP ──────────────────────────────────────────────────────────────

export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a new OTP has been sent.",
      });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({
        success: false,
        message: "Email already verified. Please sign in.",
      });
      return;
    }

    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    await prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: "email_verification",
        isUsed: false,
      },
      data: { isUsed: true },
    });

    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "email_verification",
        expiresAt,
      },
    });

    await sendOTPEmail({
      to: email,
      name: user.name ?? "there",
      otp,
    });

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// ─── Signup Complete ─────────────────────────────────────────────────────────
// Step 3 — sets password after OTP is verified

export const signupComplete = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message: "Email not verified. Please complete OTP verification first.",
      });
      return;
    }

    if (user.password !== "") {
      res.status(400).json({
        success: false,
        message: "Password already set.",
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, name },
    });

    res.status(200).json({
      success: true,
      message: "Password set successfully.",
    });
  } catch (error) {
    console.error("Signup complete error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// ─── Sign In ─────────────────────────────────────────────────────────────────

export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message:
          "Please verify your email before signing in. Check your inbox for the verification code.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message:
          "Your account has been deactivated or does not exist. Please contact support.",
      });
      return;
    }

    // Block Google-only users from password signin
    if (user.authProvider === "google" && user.password === "") {
      res.status(403).json({
        success: false,
        message:
          "This account uses Google sign in. Please continue with Google.",
      });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

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
    console.error("Signin error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during sign in. Please try again.",
    });
  }
};

// ─── Google Auth ─────────────────────────────────────────────────────────────

export const googleAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: "Google token is required",
      });
      return;
    }

    const googleUser = await getGoogleUserInfo(token);

    if (!googleUser.email_verified) {
      res.status(400).json({
        success: false,
        message: "Google email is not verified",
      });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          password: "",
          googleId: googleUser.sub,
          authProvider: "google",
          emailVerified: true,
          isActive: true,
        },
      });
    } else if (!user.googleId) {
      // Existing email user — link Google account
      user = await prisma.user.update({
        where: { email: googleUser.email },
        data: {
          googleId: googleUser.sub,
          authProvider: "google",
          emailVerified: true,
          isActive: true,
        },
      });
    }

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
      message: "Signed in with Google successfully",
      data: {
        isNewUser,
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
    console.error("Google auth error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during Google sign in. Please try again.",
    });
  }
};

// Save name/phone after Google signup — no password involved
export const saveProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, name } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message: "Email not verified.",
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { name },
    });

    res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      },
    });
  } catch (error) {
    console.error("Save profile error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// ─── Get Current User ────────────────────────────────────────────────────────

export const getCurrentUser = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

// ─── Logout ──────────────────────────────────────────────────────────────────

export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during logout.",
    });
  }
};
