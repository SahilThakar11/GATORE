import { Router } from "express";
import {
  getGames,
  getRestaurantsByGame,
} from "../controllers/restaurantController";

const router = Router();

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/games?category=Strategy&q=catan
router.get("/", getGames);

// GET /api/games/:bggId/restaurants?city=Waterloo
// Powers the "Find by Game" page
router.get("/:bggId/restaurants", getRestaurantsByGame);

export default router;
