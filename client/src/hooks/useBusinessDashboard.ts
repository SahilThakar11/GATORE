import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "/api/business-system";

export interface DashboardReservation {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  status: string;
  specialRequests: string | null;
  notes: string | null;
  createdAt: string;
  table: { id: number; name: string; capacity: number };
  user: { id: number; name: string; email: string };
  gameReservations: {
    game: { id: number; name: string; imageUrl: string | null };
  }[];
}

export interface DashboardStats {
  occupancy: { occupied: number; total: number };
  todayReservations: { total: number; pending: number };
  totalCustomersToday: number;
  newCustomersThisWeek: number;
  avgSessionMinutes: number;
  reservations: DashboardReservation[];
}

export interface BusinessProfile {
  id: number;
  name: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string | null;
  phone: string | null;
  website: string | null;
  contactName: string | null;
  contactEmail: string | null;
  businessType: string | null;
  timezone: string | null;
  pricingType: string;
  hourlyRate: string | null;
  coverFee: string | null;
  minSpend: string | null;
  enableThreshold: boolean;
  isSetupComplete: boolean;
  tables: any[];
  menuItems: any[];
  operatingHours: any[];
  restaurantGames: any[];
  _count: { tables: number; restaurantGames: number; menuItems: number };
}

export function useBusinessDashboard() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    }),
    [accessToken],
  );

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/profile`, { headers: headers() });
      const json = await res.json();
      if (json.success) setProfile(json.data);
      return json.data;
    } catch (err) {
      console.error("Fetch profile error:", err);
    }
  }, [headers]);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/dashboard`, { headers: headers() });
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error("Fetch dashboard error:", err);
    }
  }, [headers]);

  const fetchAll = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchProfile(), fetchDashboard()]);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, fetchProfile, fetchDashboard]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Complete setup wizard
  const completeSetup = useCallback(
    async (data: {
      profile?: Record<string, string>;
      tables?: { name: string; capacity: number; type: string }[];
      hours?: { dayOfWeek: string; openTime: number; closeTime: number; isClosed: boolean }[];
      pricing?: Record<string, any>;
    }) => {
      const res = await fetch(`${BASE_URL}/setup`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchAll();
      }
      return json;
    },
    [headers, fetchAll],
  );

  // Create walk-in reservation
  const createWalkIn = useCallback(
    async (data: {
      customerName: string;
      email?: string;
      phone?: string;
      partySize: number;
      tableId: number;
      specialRequests?: string;
      source?: string;
    }) => {
      const res = await fetch(`${BASE_URL}/reservations`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboard();
      }
      return json;
    },
    [headers, fetchDashboard],
  );

  // Update reservation status
  const updateReservationStatus = useCallback(
    async (id: number, status: string, notes?: string) => {
      const res = await fetch(`${BASE_URL}/reservations/${id}/status`, {
        method: "PATCH",
        headers: headers(),
        body: JSON.stringify({ status, notes }),
      });
      const json = await res.json();
      if (json.success) {
        await fetchDashboard();
      }
      return json;
    },
    [headers, fetchDashboard],
  );

  // Fetch reservations for a specific date
  const fetchReservations = useCallback(
    async (date?: string, status?: string) => {
      const params = new URLSearchParams();
      if (date) params.set("date", date);
      if (status) params.set("status", status);

      const res = await fetch(`${BASE_URL}/reservations?${params}`, {
        headers: headers(),
      });
      const json = await res.json();
      return json.success ? json.data : [];
    },
    [headers],
  );

  return {
    stats,
    profile,
    loading,
    error,
    needsSetup: !profile || !profile.isSetupComplete,
    completeSetup,
    createWalkIn,
    updateReservationStatus,
    fetchReservations,
    refresh: fetchAll,
  };
}
