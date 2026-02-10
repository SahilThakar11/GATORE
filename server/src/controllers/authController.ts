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

// Sign Up - Create user and send OTP
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      if (existingUser.emailVerified) {
        res.status(400).json({
          success: false,
          message: "Email already registered. Please sign in.",
        });
        return;
      }

      // User exists but not verified - resend OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpirationTime();

      // Invalidate old OTPs
      await prisma.otpCode.updateMany({
        where: {
          userId: existingUser.id,
          type: "email_verification",
          isUsed: false,
        },
        data: { isUsed: true },
      });

      // Create new OTP
      await prisma.otpCode.create({
        data: {
          code: otp,
          userId: existingUser.id,
          type: "email_verification",
          expiresAt,
        },
      });

      // Send OTP email
      await sendOTPEmail({
        to: email,
        name: existingUser.name,
        otp,
      });

      res.status(200).json({
        success: true,
        message: "Account exists but not verified. New OTP sent to your email.",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        isActive: false,
        emailVerified: false,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    // Store OTP
    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "email_verification",
        expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail({
      to: email,
      name,
      otp,
    });

    res.status(201).json({
      success: true,
      message:
        "Account created successfully. Please check your email for the verification code.",
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during signup. Please try again.",
    });
  }
};

// Verify OTP
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    // Find user
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

    // Find valid OTP
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

    // Check if OTP expired
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

    // Update user as verified and active
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        isActive: true,
      },
    });

    // Generate tokens
    const payload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
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

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists or not
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

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpirationTime();

    // Invalidate old OTPs
    await prisma.otpCode.updateMany({
      where: {
        userId: user.id,
        type: "email_verification",
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Create new OTP
    await prisma.otpCode.create({
      data: {
        code: otp,
        userId: user.id,
        type: "email_verification",
        expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail({
      to: email,
      name: user.name,
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

// Sign In
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
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

    // Check if email is verified
    if (!user.emailVerified) {
      res.status(403).json({
        success: false,
        message:
          "Please verify your email before signing in. Check your inbox for the verification code.",
      });
      return;
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
      return;
    }

    // Check if account is active
    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
      return;
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
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

// Get Current User (Protected Route)
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

// Logout
export const logout = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token from database
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
