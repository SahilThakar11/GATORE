import { useState, useEffect } from "react";
import type { BGGGame } from "./useBGG";
import { useAuth } from "../context/AuthContext";

// ─── Curated BGG IDs per preference category ─────────────────────────────────
// Each list contains well-known, highly-rated games in that category.
const CATEGORY_IDS: Record<string, string[]> = {
  strategy: [
    "174430", // Gloomhaven
    "169786", // Scythe
    "167791", // Terraforming Mars
    "233078", // Twilight Imperium
    "182028", // Through the Ages
    "187645", // Star Wars: Rebellion
    "12333", // Twilight Struggle
  ],
  party: [
    "178900", // Codenames
    "128882", // Concept
    "225694", // Decrypto
    "181304", // Mysterium
    "262543", // Wavelength
    "244992", // Just One
    "150658", // Skull
  ],
  card: [
    "68448", // 7 Wonders
    "266192", // Wingspan
    "224517", // Brass: Birmingham
    "161970", // Alchemists
    "205637", // Arkham Horror LCG
    "31260", // Race for the Galaxy
    "103885", // Star Realms
  ],
  puzzle: [
    "230802", // Azul
    "284083", // The Crew
    "172081", // Burgle Bros
    "284435", // So Clover!
    "40765", // Hanabi
    "42215", // Ubongo
    "175640", // Castles of Mad King Ludwig
  ],
  coop: [
    "161936", // Pandemic Legacy
    "224517", // Brass: Birmingham
    "205637", // Arkham Horror LCG
    "174430", // Gloomhaven
    "284083", // The Crew
    "181304", // Mysterium
    "172225", // Spirit Island
  ],
  rpg: [
    "174430", // Gloomhaven
    "205637", // Arkham Horror LCG
    "187645", // Star Wars: Rebellion
    "233078", // Twilight Imperium
    "164153", // Star Wars: X-Wing
    "175154", // Legends of Andor
    "127023", // Kemet
  ],
  educational: [
    "119890", // Stockpile
    "42215", // Ubongo
    "13", // Settlers of Catan
    "128882", // Concept
    "244992", // Just One
    "40765", // Hanabi
    "131357", // Timeline
  ],
  tableau: [
    "266192", // Wingspan
    "167791", // Terraforming Mars
    "220308", // Gaia Project
    "31260", // Race for the Galaxy
    "169786", // Scythe
    "161970", // Alchemists
    "182028", // Through the Ages
  ],
  deduction: [
    "178900", // Codenames
    "181304", // Mysterium
    "225694", // Decrypto
    "284435", // So Clover!
    "150658", // Skull
    "128882", // Concept
    "262543", // Wavelength
  ],
};

// Default popular games (used when user has no preferences)
const POPULAR_IDS = [
  "174430",
  "169786",
  "266192",
  "13",
  "30549",
  "68448",
  "167791",
  "161936",
  "224517",
  "220308",
  "233078",
  "182028",
];

interface UserPreferences {
  gameTypes: string[];
  groupSize: string;
  complexity: string;
}

/**
 * Builds a set of recommended BGG IDs based on user preferences.
 * Picks games from categories the user likes, deduplicates, and caps at 12.
 */
function buildRecommendedIds(prefs: UserPreferences): string[] {
  const ids = new Set<string>();

  // Add games from each preferred category
  for (const type of prefs.gameTypes) {
    const list = CATEGORY_IDS[type];
    if (list) {
      for (const id of list) {
        ids.add(id);
        if (ids.size >= 12) break;
      }
    }
    if (ids.size >= 12) break;
  }

  // If not enough games, pad with popular ones
  if (ids.size < 12) {
    for (const id of POPULAR_IDS) {
      ids.add(id);
      if (ids.size >= 12) break;
    }
  }

  return Array.from(ids);
}

export function useRecommendedGames() {
  const { user, accessToken } = useAuth();
  const [games, setGames] = useState<BGGGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      let idsToFetch = POPULAR_IDS;
      let personalized = false;

      // Try to fetch user preferences if logged in
      if (user) {
        try {
          const token = accessToken;
          const res = await fetch(`/api/auth/preferences`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const json = await res.json();
            const prefs: UserPreferences = json.data;
            if (prefs.gameTypes && prefs.gameTypes.length > 0) {
              idsToFetch = buildRecommendedIds(prefs);
              personalized = true;
            }
          }
        } catch {
          // Fall back to popular
        }
      }

      // Fetch game details from BGG proxy
      try {
        const res = await fetch(`/api/bgg/games?ids=${idsToFetch.join(",")}`);
        if (!res.ok) throw new Error("Failed to fetch games");
        setGames(await res.json());
        setIsPersonalized(personalized);
      } catch {
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [user, accessToken]);

  return { games, loading, isPersonalized };
}
