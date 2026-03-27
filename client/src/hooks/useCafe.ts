import { useState, useEffect, useCallback } from "react";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface OperatingHours {
  dayOfWeek: string;
  openTime: number; // minutes since midnight
  closeTime: number;
  isClosed: boolean;
}

export interface CafeGame {
  id: number;
  bggId: string;
  name: string;
  imageUrl: string | null;
  category: string | null;
  difficulty: string | null;
  minPlayers: number;
  maxPlayers: number;
  estimatedPlayTime: number;
  bggRating: number | null;
  ageRating: string | null;
  status: string; // per-restaurant status from RestaurantGame
}

export interface Table {
  id: number;
  name: string;
  capacity: number;
  minCapacity: number;
  status: string;
  description: string | null;
}

export interface CafeSummary {
  id: number;
  name: string;
  tagline: string;
  city: string;
  province: string;
  address: string;
  phone: string | null;
  website: string | null;
  logoUrl: string | null;
  rating: number;
  reviewCount: number;
  operatingHours: OperatingHours[];
  _count: { restaurantGames: number; tables: number };
}

export interface CafeDetail extends CafeSummary {
  description: string;
  postalCode: string | null;
  tables: Table[];
  restaurantGames: { game: CafeGame; status: string }[];
}

export interface TimeSlot {
  time: string; // ISO string
  available: boolean;
  reservedGameIds: number[];
}

export interface AvailabilityResult {
  isOpen: boolean;
  openTime?: number;
  closeTime?: number;
  slots: TimeSlot[];
}

// ─── Utility: minutes-since-midnight → "h:mm AM/PM" ─────────────────────────
export function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── 1. useCafes — list all cafés, optional city filter ──────────────────────
// Used by: FindACafePage, FeaturedCafes

export function useCafes(city?: string) {
  const [cafes, setCafes] = useState<CafeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    // CHLOE: Local workaround — retries once after a short delay if the first fetch
    // fails. This handles the case where a mid-render auth state change (logout)
    // disrupts an in-flight fetch and causes a spurious "failed to load café" error.
    const fetchCafes = async (attempt = 0) => {
      setLoading(true);
      setError(null);
      try {
        const params = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`/api/restaurant${params}`);
        if (!res.ok) throw new Error(`Failed to fetch cafés (${res.status})`);
        const result = await res.json();
        if (!cancelled) setCafes(result.data);
      } catch (e: any) {
        if (!cancelled && attempt === 0) {
          // First failure — retry once after a short delay, keep loading spinner up
          setTimeout(() => { if (!cancelled) fetchCafes(1); }, 1500);
          return;
        }
        if (!cancelled) setError(e?.message ?? "Failed to load cafés");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCafes();
    return () => {
      cancelled = true;
    };
  }, [city]);

  return { cafes, loading, error };
}

// ─── 2. useCafe — single café detail by numeric DB id ────────────────────────
// Used by: CafeDetailPage

export function useCafe(id: string | number | undefined) {
  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchCafe = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/restaurant/${id}`);
        if (!res.ok) throw new Error(`Café not found (${res.status})`);
        const result = await res.json();
        if (!cancelled) setCafe(result.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load café");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCafe();
    return () => {
      cancelled = true;
    };
  }, [String(id)]);

  return { cafe, loading, error };
}

// ─── 3. useCafeGames — games for a café from our own DB ──────────────────────
// Used by: CafeDetailPage game library section
// Replaces the old useCafeGames that was hitting /api/bgg/games

export function useCafeGames(restaurantId: string | number | undefined) {
  const [games, setGames] = useState<CafeGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = useCallback(
    async (category?: string) => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = category
          ? `?category=${encodeURIComponent(category)}`
          : "";
        const res = await fetch(
          `/api/restaurant/${restaurantId}/games${params}`,
        );
        if (!res.ok) throw new Error(`Failed to fetch games (${res.status})`);
        const result = await res.json();
        setGames(result.data);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load games");
      } finally {
        setLoading(false);
      }
    },
    [String(restaurantId)],
  );

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  return { games, loading, error, refetch: fetchGames };
}

// ─── 4. useCafeAvailability — time slots for a given date + party size ───────
// Used by: CafeDetailPage "Available today" section + ReservationModal step 1

export function useCafeAvailability(
  restaurantId: string | number | undefined,
  date: string | null, // "YYYY-MM-DD"
  partySize?: number,
) {
  const [availability, setAvailability] = useState<AvailabilityResult | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId || !date) {
      setAvailability(null);
      return;
    }
    let cancelled = false;
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ date });
        if (partySize) params.set("partySize", String(partySize));
        const res = await fetch(
          `/api/restaurant/${restaurantId}/availability?${params}`,
        );
        if (!res.ok)
          throw new Error(`Failed to fetch availability (${res.status})`);
        const result = await res.json();
        if (!cancelled) setAvailability(result.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load availability");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAvailability();
    return () => {
      cancelled = true;
    };
  }, [String(restaurantId), date, partySize]);

  return { availability, loading, error };
}

// ─── 5. useCafesByGame — cafés that carry a given BGG game ───────────────────
// Used by: FindByGamePage when a game is selected

export function useCafesByGame(bggId: string | null, city?: string) {
  const [cafes, setCafes] = useState<CafeSummary[]>([]);
  const [gameName, setGameName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bggId) {
      setCafes([]);
      setGameName("");
      return;
    }
    let cancelled = false;
    const fetchCafes = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = city ? `?city=${encodeURIComponent(city)}` : "";
        const res = await fetch(`/api/games/${bggId}/restaurants${params}`);
        if (!res.ok) throw new Error(`Failed to fetch cafés (${res.status})`);
        const result = await res.json();
        if (!cancelled) {
          setCafes(result.data.restaurants);
          setGameName(result.data.game.name);
        }
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message ?? "Failed to load cafés for this game");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchCafes();
    return () => {
      cancelled = true;
    };
  }, [bggId, city]);

  return { cafes, gameName, loading, error };
}
