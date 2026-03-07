import { Router } from "express";
import {
  getGamesByIds,
  searchGameIds,
  searchGames,
} from "../controllers/bggController";

const router = Router();

// GET /api/bgg/games?ids=174430,169786
router.get("/games", getGamesByIds);

// GET /api/bgg/search-ids?q=catan  — returns IDs only for client-side pagination
router.get("/search-ids", searchGameIds);

// GET /api/bgg/search?q=catan  — returns first 8 full results in one call
router.get("/search", searchGames);

export default router;
