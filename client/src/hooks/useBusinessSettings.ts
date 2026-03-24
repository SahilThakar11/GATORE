import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "/api/business-system";

// ── Types ────────────────────────────────────────────────────────────────────

export interface TableConfig {
  id: number;
  name: string;
  capacity: number;
  type: string;
  status: string;
}

export interface HoursConfig {
  id?: number;
  dayOfWeek: string;
  openTime: number;
  closeTime: number;
  isClosed: boolean;
}

export interface GameItem {
  id: number;
  restaurantGameId: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  bggId: string;
  status: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: string;
  category: string;
}

export interface PricingConfig {
  pricingType: string;
  hourlyRate: string | null;
  coverFee: string | null;
  minSpend: string | null;
  enableThreshold: boolean;
}

// ── Time conversion helpers ──────────────────────────────────────────────────

const TIME_MAP: Record<string, number> = {
  "6:00 AM": 360, "7:00 AM": 420, "8:00 AM": 480, "9:00 AM": 540,
  "10:00 AM": 600, "11:00 AM": 660, "12:00 PM": 720, "1:00 PM": 780,
  "2:00 PM": 840, "3:00 PM": 900, "4:00 PM": 960, "5:00 PM": 1020,
  "6:00 PM": 1080, "7:00 PM": 1140, "8:00 PM": 1200, "9:00 PM": 1260,
  "10:00 PM": 1320, "11:00 PM": 1380, "12:00 AM": 1440,
};

const REVERSE_TIME_MAP: Record<number, string> = Object.fromEntries(
  Object.entries(TIME_MAP).map(([k, v]) => [v, k]),
);

export function timeStringToMinutes(time: string): number {
  return TIME_MAP[time] ?? 600;
}

export function minutesToTimeString(minutes: number): string {
  return REVERSE_TIME_MAP[minutes] ?? "10:00 AM";
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBusinessSettings() {
  const { accessToken } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken],
  );

  // ── Profile ────────────────────────────────────────────────────────────────

  const updateProfile = useCallback(
    async (data: Record<string, string | null | boolean>) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/profile`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) setError(json.message);
        return json;
      } catch {
        setError("Failed to update profile.");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [headers],
  );

  // ── Tables ─────────────────────────────────────────────────────────────────

  const fetchTables = useCallback(async (): Promise<TableConfig[]> => {
    const res = await fetch(`${BASE_URL}/tables`, { headers: headers() });
    const json = await res.json();
    return json.success ? json.data : [];
  }, [headers]);

  const addTable = useCallback(
    async (data: { name: string; capacity: number; type: string }) => {
      const res = await fetch(`${BASE_URL}/tables`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    [headers],
  );

  const removeTable = useCallback(
    async (id: number) => {
      const res = await fetch(`${BASE_URL}/tables/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      return res.json();
    },
    [headers],
  );

  // ── Hours ──────────────────────────────────────────────────────────────────

  const fetchHours = useCallback(async (): Promise<HoursConfig[]> => {
    const res = await fetch(`${BASE_URL}/hours`, { headers: headers() });
    const json = await res.json();
    return json.success ? json.data : [];
  }, [headers]);

  const updateHours = useCallback(
    async (hours: HoursConfig[]) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/hours`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify({ hours }),
        });
        const json = await res.json();
        if (!json.success) setError(json.message);
        return json;
      } catch {
        setError("Failed to update hours.");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [headers],
  );

  // ── Games ──────────────────────────────────────────────────────────────────

  const fetchGames = useCallback(async (): Promise<GameItem[]> => {
    const res = await fetch(`${BASE_URL}/games`, { headers: headers() });
    const json = await res.json();
    return json.success ? json.data : [];
  }, [headers]);

  const addGame = useCallback(
    async (gameId: number) => {
      const res = await fetch(`${BASE_URL}/games`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ gameId }),
      });
      return res.json();
    },
    [headers],
  );

  const removeGame = useCallback(
    async (restaurantGameId: number) => {
      const res = await fetch(`${BASE_URL}/games/${restaurantGameId}`, {
        method: "DELETE",
        headers: headers(),
      });
      return res.json();
    },
    [headers],
  );

  // ── Menu ───────────────────────────────────────────────────────────────────

  const fetchMenu = useCallback(async (): Promise<MenuItem[]> => {
    const res = await fetch(`${BASE_URL}/menu`, { headers: headers() });
    const json = await res.json();
    return json.success ? json.data : [];
  }, [headers]);

  const addMenuItem = useCallback(
    async (data: { name: string; description?: string; price: string; category?: string }) => {
      const res = await fetch(`${BASE_URL}/menu`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    [headers],
  );

  const removeMenuItem = useCallback(
    async (id: number) => {
      const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: "DELETE",
        headers: headers(),
      });
      return res.json();
    },
    [headers],
  );

  // ── Pricing ────────────────────────────────────────────────────────────────

  const fetchPricing = useCallback(async (): Promise<PricingConfig | null> => {
    const res = await fetch(`${BASE_URL}/pricing`, { headers: headers() });
    const json = await res.json();
    return json.success ? json.data : null;
  }, [headers]);

  const updatePricing = useCallback(
    async (data: Partial<PricingConfig>) => {
      setSaving(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/pricing`, {
          method: "PUT",
          headers: headers(),
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) setError(json.message);
        return json;
      } catch {
        setError("Failed to update pricing.");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [headers],
  );

  const deleteAccount = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/account`, {
        method: "DELETE",
        headers: headers(),
      });
      const json = await res.json();
      if (!json.success) setError(json.message);
      return json;
    } catch {
      setError("Failed to delete account.");
      return { success: false };
    } finally {
      setSaving(false);
    }
  }, [headers]);

  return {
    saving,
    error,
    // Profile
    updateProfile,
    // Tables
    fetchTables,
    addTable,
    removeTable,
    // Hours
    fetchHours,
    updateHours,
    // Games
    fetchGames,
    addGame,
    removeGame,
    // Menu
    fetchMenu,
    addMenuItem,
    removeMenuItem,
    // Pricing
    fetchPricing,
    updatePricing,
    // Account
    deleteAccount,
  };
}
