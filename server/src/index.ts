import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/database";
import prisma from "./config/prisma";
import apiRoutes from "./routes/api";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRoutes);

//Helath check route
app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Test database connection
app.get("/test-db", async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json({ users: result.rows });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
