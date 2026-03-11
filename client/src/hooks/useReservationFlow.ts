import { useState, useCallback } from "react";
import {
  isValidEmail,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
} from "../utils/validation";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Venue {
  id: number;
  name: string;
  logo: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  poster?: string;
}

export interface CafeTable {
  id: number;
  name: string;
  capacity: number;
  minCapacity: number;
  status: string;
}

export interface Game {
  id: string; // bggId
  dbId?: number; // games.id in our DB — for GameReservation row
  name: string;
  image: string;
  complexity: "Easy" | "Medium" | "Hard";
  players: string;
  duration: string;
  price: number;
  tags: string[];
}

export interface BookingDetails {
  venue: Venue;
  date: string; // "YYYY-MM-DD"
  time: string; // "6:00 PM"
  partySize: number;
  tableId: number | null;
  selectedGame?: Game;
}

export interface GuestDetails {
  name: string;
  email: string;
}

export interface UserDetails {
  email: string;
  phone: string;
  name?: string;
}

export interface PaymentDetails {
  nameOnCard: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface ReservationData {
  booking: BookingDetails | null;
  user: UserDetails | null;
  guest: GuestDetails | null;
  payment: PaymentDetails | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}

// ─── Step map ─────────────────────────────────────────────────────────────────
// 0 → When   (date / time / party size)
// 1 → Games  (optional)
// 2 → Auth   (sign in OR guest — skipped when already authenticated)
// 3 → Pay    (UI mock)
// 4 → Confirm
// 5 → Success

export const useReservationFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ReservationData>({
    booking: null,
    user: null,
    guest: null,
    payment: null,
    isGuest: false,
    isAuthenticated: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ─── Updaters ──────────────────────────────────────────────────────────────

  const updateBooking = useCallback((updates: Partial<BookingDetails>) => {
    setData((prev) => ({
      ...prev,
      booking: prev.booking
        ? { ...prev.booking, ...updates }
        : ({
            tableId: null,
            partySize: 2,
            date: "",
            time: "",
            ...updates,
          } as BookingDetails),
    }));
  }, []);

  const updateUser = useCallback((user: UserDetails) => {
    setData((prev) => ({ ...prev, user }));
  }, []);

  const updateGuest = useCallback((guest: GuestDetails) => {
    setData((prev) => ({ ...prev, guest }));
  }, []);

  const updatePayment = useCallback((payment: PaymentDetails) => {
    setData((prev) => ({ ...prev, payment }));
  }, []);

  const selectGame = useCallback((game?: Game) => {
    setData((prev) => ({
      ...prev,
      booking: prev.booking ? { ...prev.booking, selectedGame: game } : null,
    }));
  }, []);

  const setAuthentication = useCallback(
    (isAuthenticated: boolean, isGuest: boolean) => {
      setData((prev) => ({ ...prev, isAuthenticated, isGuest }));
    },
    [],
  );

  /**
   * Auto-picks the best available table for the given party size.
   * Picks the smallest table whose capacity >= partySize.
   * Falls back to the largest table if none fit exactly.
   */
  const autoSelectTable = useCallback(
    (tables: CafeTable[], partySize: number) => {
      const available = tables.filter((t) => t.status === "available");
      if (!available.length) return null;

      // Smallest table that fits
      const fits = available
        .filter((t) => t.capacity >= partySize && t.minCapacity <= partySize)
        .sort((a, b) => a.capacity - b.capacity);

      if (fits.length) return fits[0].id;

      // Fallback: largest table overall
      return available.sort((a, b) => b.capacity - a.capacity)[0].id;
    },
    [],
  );

  // ─── canProceed ────────────────────────────────────────────────────────────

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // When — date + time + partySize + a table must be resolved
        return !!(
          data.booking?.date &&
          data.booking?.time &&
          data.booking?.partySize &&
          data.booking?.tableId // set by the modal before calling nextStep
        );
      case 1: // Games — always optional
        return true;
      case 2: // Auth
        if (data.isAuthenticated) return true;
        if (data.isGuest) {
          return !!(
            data.guest?.name?.trim() &&
            data.guest?.email &&
            isValidEmail(data.guest.email)
          );
        }
        return false;
      case 3: // Payment
        return !!(
          data.payment?.nameOnCard &&
          data.payment?.cardNumber &&
          isValidCardNumber(data.payment.cardNumber) &&
          data.payment?.expiryDate &&
          isValidExpiryDate(data.payment.expiryDate) &&
          data.payment?.cvv &&
          isValidCVV(data.payment.cvv)
        );
      case 4: // Confirm
        return true;
      default:
        return false;
    }
  }, [currentStep, data]);

  // ─── Submit to DB ──────────────────────────────────────────────────────────

  const submitReservation = useCallback(async (): Promise<boolean> => {
    if (!data.booking?.tableId) {
      setSubmitError("No table available for your party size.");
      return false;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { date, time, partySize, tableId, selectedGame } = data.booking;

      // Parse "6:00 PM" → hours/minutes
      const [timePart, meridiem] = time.split(" ");
      let [hours, minutes] = timePart.split(":").map(Number);
      if (meridiem === "PM" && hours !== 12) hours += 12;
      if (meridiem === "AM" && hours === 12) hours = 0;

      // Build proper local Date objects so toISOString() produces correct UTC
      const [year, month, day] = date.split("-").map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes, 0);
      const endDate = new Date(year, month - 1, day, hours + 2, minutes, 0); // +2 hrs

      const accessToken = localStorage.getItem("accessToken");

      const body: Record<string, unknown> = {
        tableId,
        reservationDate: date,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        partySize,
        ...(selectedGame?.dbId ? { gameId: selectedGame.dbId } : {}),
      };

      if (data.isGuest && data.guest) {
        body.guestName = data.guest.name;
        body.guestEmail = data.guest.email;
        body.isGuest = true;
      }

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && !data.isGuest
            ? { Authorization: `Bearer ${accessToken}` }
            : {}),
        },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.message ?? "Failed to create reservation.");
        return false;
      }
      return true;
    } catch {
      setSubmitError("Network error. Please try again.");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  // ─── Navigation ────────────────────────────────────────────────────────────

  const nextStep = useCallback(() => {
    if (canProceed()) setCurrentStep((p) => Math.min(p + 1, 5));
  }, [canProceed]);

  const prevStep = useCallback(() => {
    setCurrentStep((p) => Math.max(p - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setSubmitError(null);
    setData({
      booking: null,
      user: null,
      guest: null,
      payment: null,
      isGuest: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    currentStep,
    data,
    updateBooking,
    updateUser,
    updateGuest,
    updatePayment,
    selectGame,
    setAuthentication,
    autoSelectTable,
    nextStep,
    prevStep,
    goToStep,
    canProceed: canProceed(),
    reset,
    submitting,
    submitError,
    submitReservation,
  };
};
