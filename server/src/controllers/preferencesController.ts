import { Request, Response } from "express";
import { AuthRequest } from "../types/express";
import prisma from "../config/prisma";

// ─── POST /api/auth/preferences ──────────────────────────────────────────────
// Save user game preferences (game types, group size, complexity)
export const savePreferences = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { gameTypes, groupSize, complexity } = req.body;

    // Validate inputs
    if (!Array.isArray(gameTypes)) {
      res.status(400).json({
        success: false,
        message: "gameTypes must be an array.",
      });
      return;
    }

    const validGroupSizes = ["any", "duo", "small", "big"];
    const validComplexities = ["any", "light", "medium", "heavy"];

    const finalGroupSize = validGroupSizes.includes(groupSize)
      ? groupSize
      : "any";
    const finalComplexity = validComplexities.includes(complexity)
      ? complexity
      : "any";

    // Upsert — create or update preferences for this user
    const preference = await prisma.userPreference.upsert({
      where: { userId: req.user.userId },
      update: {
        gameTypes: gameTypes.join(","),
        groupSize: finalGroupSize,
        complexity: finalComplexity,
      },
      create: {
        userId: req.user.userId,
        gameTypes: gameTypes.join(","),
        groupSize: finalGroupSize,
        complexity: finalComplexity,
      },
    });

    res.status(200).json({
      success: true,
      message: "Preferences saved successfully.",
      data: {
        gameTypes: preference.gameTypes
          ? preference.gameTypes.split(",")
          : [],
        groupSize: preference.groupSize,
        complexity: preference.complexity,
      },
    });
  } catch (error) {
    console.error("Save preferences error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving preferences.",
    });
  }
};

// ─── GET /api/auth/preferences ───────────────────────────────────────────────
// Get current user's preferences
export const getPreferences = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const preference = await prisma.userPreference.findUnique({
      where: { userId: req.user.userId },
    });

    if (!preference) {
      res.status(200).json({
        success: true,
        data: {
          gameTypes: [],
          groupSize: "any",
          complexity: "any",
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        gameTypes: preference.gameTypes
          ? preference.gameTypes.split(",")
          : [],
        groupSize: preference.groupSize,
        complexity: preference.complexity,
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching preferences.",
    });
  }
};
