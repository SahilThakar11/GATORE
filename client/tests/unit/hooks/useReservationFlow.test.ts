import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useReservationFlow } from "../../../src/hooks/useReservationFlow";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("../../../src/context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../../../src/context/AuthContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockFetch = (ok: boolean, body: object) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: vi.fn().mockResolvedValue(body),
    }),
  );
};

// A valid Luhn card number (Visa test number)
const VALID_CARD = "4532015112830366";

// A future expiry that won't go stale for years
const currentYear = new Date().getFullYear() % 100;
const futureYear = currentYear + 3;
const VALID_EXPIRY = `12/${String(futureYear).padStart(2, "0")}`;

const VALID_PAYMENT = {
  nameOnCard: "John Doe",
  cardNumber: VALID_CARD,
  expiryDate: VALID_EXPIRY,
  cvv: "123",
};

const BOOKING_WITH_TABLE = {
  date: "2026-12-01",
  time: "6:00 PM",
  partySize: 4,
  tableId: 10,
};

const TABLES = [
  { id: 1, name: "T1", capacity: 2, minCapacity: 1, status: "available" },
  { id: 2, name: "T2", capacity: 4, minCapacity: 2, status: "available" },
  { id: 3, name: "T3", capacity: 8, minCapacity: 4, status: "available" },
  { id: 4, name: "T4", capacity: 6, minCapacity: 3, status: "unavailable" },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useReservationFlow", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ accessToken: "test-token" } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ── Initial state ──────────────────────────────────────────────────────────

  describe("initial state", () => {
    it("starts at step 0", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.currentStep).toBe(0);
    });

    it("has null booking, user, guest, payment fields", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.data.booking).toBeNull();
      expect(result.current.data.user).toBeNull();
      expect(result.current.data.guest).toBeNull();
      expect(result.current.data.payment).toBeNull();
    });

    it("has isGuest=false and isAuthenticated=false", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.data.isGuest).toBe(false);
      expect(result.current.data.isAuthenticated).toBe(false);
    });

    it("canProceed is false at step 0 with no booking data", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.canProceed).toBe(false);
    });

    it("is not in edit mode", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.editingReservationId).toBeNull();
    });

    it("submitting is false and submitError is null", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.submitting).toBe(false);
      expect(result.current.submitError).toBeNull();
    });
  });

  // ── updateBooking ──────────────────────────────────────────────────────────

  describe("updateBooking", () => {
    it("creates booking from scratch when booking is null", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01" });
      });
      expect(result.current.data.booking?.date).toBe("2026-12-01");
    });

    it("merges updates into existing booking", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01", partySize: 3 });
      });
      act(() => {
        result.current.updateBooking({ time: "7:00 PM" });
      });
      expect(result.current.data.booking?.date).toBe("2026-12-01");
      expect(result.current.data.booking?.partySize).toBe(3);
      expect(result.current.data.booking?.time).toBe("7:00 PM");
    });

    it("overwrites specific fields without losing others", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01", partySize: 2 });
      });
      act(() => {
        result.current.updateBooking({ partySize: 5 });
      });
      expect(result.current.data.booking?.date).toBe("2026-12-01");
      expect(result.current.data.booking?.partySize).toBe(5);
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────────

  describe("updateUser", () => {
    it("sets user data", () => {
      const { result } = renderHook(() => useReservationFlow());
      const user = { email: "user@example.com", phone: "555-123-4567", name: "Alice" };
      act(() => {
        result.current.updateUser(user);
      });
      expect(result.current.data.user).toEqual(user);
    });

    it("replaces previous user data", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateUser({ email: "old@example.com", phone: "000-000-0000" });
      });
      act(() => {
        result.current.updateUser({ email: "new@example.com", phone: "111-111-1111" });
      });
      expect(result.current.data.user?.email).toBe("new@example.com");
    });
  });

  // ── updateGuest ────────────────────────────────────────────────────────────

  describe("updateGuest", () => {
    it("sets guest data", () => {
      const { result } = renderHook(() => useReservationFlow());
      const guest = { name: "Bob", email: "bob@example.com" };
      act(() => {
        result.current.updateGuest(guest);
      });
      expect(result.current.data.guest).toEqual(guest);
    });
  });

  // ── updatePayment ──────────────────────────────────────────────────────────

  describe("updatePayment", () => {
    it("sets payment data", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updatePayment(VALID_PAYMENT);
      });
      expect(result.current.data.payment).toEqual(VALID_PAYMENT);
    });
  });

  // ── selectGame ─────────────────────────────────────────────────────────────

  describe("selectGame", () => {
    it("sets booking.selectedGame when booking exists", () => {
      const { result } = renderHook(() => useReservationFlow());
      const game = {
        id: "bgg-1",
        name: "Chess",
        image: "",
        complexity: "Easy" as const,
        players: "2",
        duration: "30 min",
        price: 0,
        tags: [],
      };
      act(() => {
        result.current.updateBooking({ date: "2026-12-01" });
      });
      act(() => {
        result.current.selectGame(game);
      });
      expect(result.current.data.booking?.selectedGame).toEqual(game);
    });

    it("clears selectedGame when called with no argument", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01" });
      });
      const game = {
        id: "bgg-1",
        name: "Chess",
        image: "",
        complexity: "Easy" as const,
        players: "2",
        duration: "30 min",
        price: 0,
        tags: [],
      };
      act(() => {
        result.current.selectGame(game);
      });
      act(() => {
        result.current.selectGame(undefined);
      });
      expect(result.current.data.booking?.selectedGame).toBeUndefined();
    });

    it("does not crash when booking is null", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(() => {
        act(() => {
          result.current.selectGame();
        });
      }).not.toThrow();
      expect(result.current.data.booking).toBeNull();
    });
  });

  // ── setAuthentication ──────────────────────────────────────────────────────

  describe("setAuthentication", () => {
    it("sets isAuthenticated=true and isGuest=false", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.setAuthentication(true, false);
      });
      expect(result.current.data.isAuthenticated).toBe(true);
      expect(result.current.data.isGuest).toBe(false);
    });

    it("sets isGuest=true and isAuthenticated=false", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.setAuthentication(false, true);
      });
      expect(result.current.data.isAuthenticated).toBe(false);
      expect(result.current.data.isGuest).toBe(true);
    });
  });

  // ── autoSelectTable ────────────────────────────────────────────────────────

  describe("autoSelectTable", () => {
    it("picks the smallest table that fits the party size", () => {
      const { result } = renderHook(() => useReservationFlow());
      // partySize=4 → T2 (capacity=4, minCapacity=2) fits, T3 (capacity=8) also fits; pick T2
      const id = result.current.autoSelectTable(TABLES, 4);
      expect(id).toBe(2);
    });

    it("picks the smallest fitting table when multiple fit", () => {
      const { result } = renderHook(() => useReservationFlow());
      // partySize=1 → T1 (cap=2,min=1) and T2 (cap=4,min=2 — min>1, excluded)
      const tables = [
        { id: 1, name: "T1", capacity: 2, minCapacity: 1, status: "available" },
        { id: 2, name: "T2", capacity: 4, minCapacity: 2, status: "available" },
        { id: 3, name: "T3", capacity: 6, minCapacity: 1, status: "available" },
      ];
      const id = result.current.autoSelectTable(tables, 1);
      expect(id).toBe(1); // smallest fitting
    });

    it("falls back to largest available table when none fit exactly", () => {
      const { result } = renderHook(() => useReservationFlow());
      // partySize=10 — no table has capacity>=10 with the right minCapacity
      const id = result.current.autoSelectTable(TABLES, 10);
      // Largest available: T3 (capacity=8)
      expect(id).toBe(3);
    });

    it("ignores unavailable tables", () => {
      const { result } = renderHook(() => useReservationFlow());
      const tables = [
        { id: 1, name: "T1", capacity: 6, minCapacity: 1, status: "unavailable" },
        { id: 2, name: "T2", capacity: 4, minCapacity: 1, status: "available" },
      ];
      const id = result.current.autoSelectTable(tables, 3);
      expect(id).toBe(2);
    });

    it("returns null when no available tables", () => {
      const { result } = renderHook(() => useReservationFlow());
      const tables = [
        { id: 1, name: "T1", capacity: 4, minCapacity: 2, status: "unavailable" },
      ];
      const id = result.current.autoSelectTable(tables, 2);
      expect(id).toBeNull();
    });

    it("returns null for empty tables array", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.autoSelectTable([], 2)).toBeNull();
    });
  });

  // ── canProceed ─────────────────────────────────────────────────────────────

  describe("canProceed", () => {
    it("step 0: false when booking fields are missing", () => {
      const { result } = renderHook(() => useReservationFlow());
      expect(result.current.canProceed).toBe(false);
    });

    it("step 0: false when tableId is missing", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01", time: "6:00 PM", partySize: 4 });
      });
      expect(result.current.canProceed).toBe(false);
    });

    it("step 0: true when all booking fields are present", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      expect(result.current.canProceed).toBe(true);
    });

    it("step 1: always true", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
        result.current.goToStep(1);
      });
      expect(result.current.canProceed).toBe(true);
    });

    it("step 2: true when isAuthenticated", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.setAuthentication(true, false);
        result.current.goToStep(2);
      });
      expect(result.current.canProceed).toBe(true);
    });

    it("step 2: true when isGuest with valid name and email", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.setAuthentication(false, true);
        result.current.updateGuest({ name: "Alice", email: "alice@example.com" });
        result.current.goToStep(2);
      });
      expect(result.current.canProceed).toBe(true);
    });

    it("step 2: false when isGuest with invalid email", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.setAuthentication(false, true);
        result.current.updateGuest({ name: "Alice", email: "not-an-email" });
        result.current.goToStep(2);
      });
      expect(result.current.canProceed).toBe(false);
    });

    it("step 2: false when neither authenticated nor guest", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(2);
      });
      expect(result.current.canProceed).toBe(false);
    });

    it("step 3: true with valid payment details", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updatePayment(VALID_PAYMENT);
        result.current.goToStep(3);
      });
      expect(result.current.canProceed).toBe(true);
    });

    it("step 3: false with missing payment details", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(3);
      });
      expect(result.current.canProceed).toBe(false);
    });

    it("step 3: false with invalid card number", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updatePayment({ ...VALID_PAYMENT, cardNumber: "1234567890123456" });
        result.current.goToStep(3);
      });
      expect(result.current.canProceed).toBe(false);
    });

    it("step 4: always true", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(4);
      });
      expect(result.current.canProceed).toBe(true);
    });
  });

  // ── nextStep ───────────────────────────────────────────────────────────────

  describe("nextStep", () => {
    it("advances currentStep when canProceed is true", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(1);
    });

    it("does not advance when canProceed is false", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(0);
    });

    it("skips step 3 (payment) in edit mode", () => {
      const { result } = renderHook(() => useReservationFlow());
      const reservation = {
        id: 42,
        venue: { id: 1, name: "Cafe", logo: "", address: "", city: "", rating: 5, reviewCount: 10 },
        date: "2026-12-01",
        time: "6:00 PM",
        partySize: 2,
        tableId: 5,
      };
      act(() => {
        result.current.initEdit(reservation);
      });
      // Now at step 0 in edit mode; advance to step 2
      act(() => {
        result.current.goToStep(2);
      });
      // From step 2 next should skip 3 and go to 4
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(4);
    });

    it("does not exceed step 5", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(5);
      });
      act(() => {
        result.current.nextStep();
      });
      expect(result.current.currentStep).toBe(5);
    });
  });

  // ── prevStep ───────────────────────────────────────────────────────────────

  describe("prevStep", () => {
    it("goes back one step", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(2);
      });
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(1);
    });

    it("does not go below step 0", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(0);
    });

    it("skips step 3 (payment) in edit mode when going back from step 4", () => {
      const { result } = renderHook(() => useReservationFlow());
      const reservation = {
        id: 42,
        venue: { id: 1, name: "Cafe", logo: "", address: "", city: "", rating: 5, reviewCount: 10 },
        date: "2026-12-01",
        time: "6:00 PM",
        partySize: 2,
        tableId: 5,
      };
      act(() => {
        result.current.initEdit(reservation);
      });
      act(() => {
        result.current.goToStep(4);
      });
      act(() => {
        result.current.prevStep();
      });
      expect(result.current.currentStep).toBe(2);
    });
  });

  // ── reset ──────────────────────────────────────────────────────────────────

  describe("reset", () => {
    it("resets all state to initial values", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
        result.current.setAuthentication(true, false);
        result.current.goToStep(3);
      });
      act(() => {
        result.current.reset();
      });
      expect(result.current.currentStep).toBe(0);
      expect(result.current.data.booking).toBeNull();
      expect(result.current.data.isAuthenticated).toBe(false);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.submitError).toBeNull();
    });
  });

  // ── submitReservation ──────────────────────────────────────────────────────

  describe("submitReservation", () => {
    it("returns false and sets error when tableId is missing", async () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking({ date: "2026-12-01", time: "6:00 PM", partySize: 2 });
      });
      let success: boolean;
      await act(async () => {
        success = await result.current.submitReservation();
      });
      expect(success!).toBe(false);
      expect(result.current.submitError).toBeTruthy();
    });

    it("returns true and clears error on successful POST", async () => {
      mockFetch(true, { message: "Created" });
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      let success: boolean;
      await act(async () => {
        success = await result.current.submitReservation();
      });
      expect(success!).toBe(true);
      expect(result.current.submitError).toBeNull();
      expect(result.current.submitting).toBe(false);
    });

    it("calls POST /api/reservations in non-edit mode", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      await act(async () => {
        await result.current.submitReservation();
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/reservations",
        expect.objectContaining({ method: "POST" }),
      );
    });

    it("returns false and sets error message when API returns error", async () => {
      mockFetch(false, { message: "Table not available" });
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      let success: boolean;
      await act(async () => {
        success = await result.current.submitReservation();
      });
      expect(success!).toBe(false);
      expect(result.current.submitError).toBe("Table not available");
    });

    it("returns false and sets network error message on fetch failure", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network down")));
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      let success: boolean;
      await act(async () => {
        success = await result.current.submitReservation();
      });
      expect(success!).toBe(false);
      expect(result.current.submitError).toBe("Network error. Please try again.");
    });

    it("uses PUT /api/reservations/:id in edit mode", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useReservationFlow());
      const reservation = {
        id: 99,
        venue: { id: 1, name: "Cafe", logo: "", address: "", city: "", rating: 5, reviewCount: 10 },
        date: "2026-12-01",
        time: "6:00 PM",
        partySize: 2,
        tableId: 5,
      };
      act(() => {
        result.current.initEdit(reservation);
      });
      await act(async () => {
        await result.current.submitReservation();
      });
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/reservations/99",
        expect.objectContaining({ method: "PUT" }),
      );
    });

    it("includes Authorization header when accessToken is present and not guest", async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      });
      vi.stubGlobal("fetch", fetchMock);
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      await act(async () => {
        await result.current.submitReservation();
      });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("sets submitting=false after completion", async () => {
      mockFetch(true, {});
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.updateBooking(BOOKING_WITH_TABLE);
      });
      await act(async () => {
        await result.current.submitReservation();
      });
      expect(result.current.submitting).toBe(false);
    });
  });

  // ── initEdit ───────────────────────────────────────────────────────────────

  describe("initEdit", () => {
    const venue = { id: 1, name: "Retro Cafe", logo: "", address: "123 St", city: "Anytown", rating: 4.5, reviewCount: 30 };

    it("sets editingReservationId and enables edit mode", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.initEdit({ id: 7, venue, date: "2026-10-01", time: "5:00 PM", partySize: 3, tableId: 2 });
      });
      expect(result.current.editingReservationId).toBe(7);
      expect(result.current.isEditMode).toBe(true);
    });

    it("pre-fills booking with reservation data", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.initEdit({ id: 7, venue, date: "2026-10-01", time: "5:00 PM", partySize: 3, tableId: 2 });
      });
      expect(result.current.data.booking?.date).toBe("2026-10-01");
      expect(result.current.data.booking?.time).toBe("5:00 PM");
      expect(result.current.data.booking?.partySize).toBe(3);
      expect(result.current.data.booking?.tableId).toBe(2);
    });

    it("sets isAuthenticated=true in data", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.initEdit({ id: 7, venue, date: "2026-10-01", time: "5:00 PM", partySize: 3, tableId: 2 });
      });
      expect(result.current.data.isAuthenticated).toBe(true);
    });

    it("resets currentStep to 0", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.goToStep(3);
      });
      act(() => {
        result.current.initEdit({ id: 7, venue, date: "2026-10-01", time: "5:00 PM", partySize: 3, tableId: 2 });
      });
      expect(result.current.currentStep).toBe(0);
    });

    it("clears submitError", () => {
      const { result } = renderHook(() => useReservationFlow());
      act(() => {
        result.current.initEdit({ id: 7, venue, date: "2026-10-01", time: "5:00 PM", partySize: 3, tableId: 2 });
      });
      expect(result.current.submitError).toBeNull();
    });
  });
});
