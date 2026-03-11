import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReservationGame {
  id: number;
  game: {
    id: number;
    name: string;
    imageUrl: string | null;
    category: string | null;
  };
}

export interface Reservation {
  id: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  partySize: number;
  status: string;
  specialRequests: string | null;
  table: {
    id: number;
    name: string;
    restaurant: {
      id: number;
      name: string;
      address: string;
      city: string;
      logoUrl: string | null;
    };
  };
  gameReservations: ReservationGame[];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMyReservations() {
  const { user, accessToken } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = accessToken;
        const res = await fetch(`/api/reservations/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load reservations");
        const json = await res.json();
        if (!cancelled) setReservations(json.data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReservations();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const cancelReservation = useCallback(
    async (id: number) => {
      setCancelling(id);
      try {
        const token = accessToken;
        const res = await fetch(`/api/reservations/${id}/cancel`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Cancel failed");
        setReservations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: "cancelled" } : r)),
        );
      } catch {
        // silently fail
      } finally {
        setCancelling(null);
      }
    },
    [accessToken],
  );

  return { reservations, loading, error, cancelling, cancelReservation };
}
