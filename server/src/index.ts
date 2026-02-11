import "dotenv/config";

import express, { Application, Request, Response } from "express";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimiter";
import authRoutes from "./routes/auth";
import prisma from "./config/prisma";

const app: Application = express();
const PORT = process.env.PORT;

// Middleware
app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173" ||
      "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Gatore API is running!",
    timestamp: new Date().toISOString(),
  });
});

// Test database connection
app.get("/api/health", async (req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      success: true,
      message: "Database connected",
      data: { users: userCount },
    });
  } catch (error) {
    console.error("DB ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
