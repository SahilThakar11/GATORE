import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Calendar,
  Clock,
  Users,
  Mail,
  HelpCircle,
  CheckCircle,
  MapPin,
  ChevronLeft,
  User,
  LogIn,
  PartyPopper,
  CreditCard,
  Check,
} from "lucide-react";
import {
  useReservationFlow,
  type Game,
  type Venue,
  type CafeTable,
} from "../../hooks/useReservationFlow";
import { useCafeAvailability } from "../../hooks/useCafe";
import { useAuth } from "../../context/AuthContext";
import { useAuthModal } from "../../hooks/useAuthModal";
import { AuthModal } from "../auth/AuthModal";
import { Input } from "../ui/Input";
import { BookingSummary } from "./BookingSummary";
import { AlertBanner } from "../ui/AlertBanner";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import {
  isValidEmail,
  formatCardNumber,
  formatExpiryDate,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
} from "../../utils/validation";
import type { BGGGame } from "../../hooks/useBGG";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  venue: Venue;
  cafeBggIds: string[];
  bggIdToDbId: Record<string, number>;
  /** Tables from the café — passed from CafeDetailPage which already has them */
  cafeTables: CafeTable[];
  /** When set, modal opens in edit mode for this reservation */
  editReservation?: {
    id: number;
    date: string;
    time: string;
    partySize: number;
    tableId: number;
    selectedGame?: Game;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

// TIME_SLOTS are now fetched dynamically from the availability API

// ─── Progress bar ─────────────────────────────────────────────────────────────
// Visible steps shown to user:  When → Games → Details → Payment → Confirm
// Internal steps:                0      1       2          3         4      (5=success)

const PROGRESS_STEPS = ["When", "Games", "Details", "Payment", "Confirm"];

function StepIcon({ label }: { label: string }) {
  if (label === "When") return <Calendar size={16} aria-hidden="true" />;
  if (label === "Payment") return <CreditCard size={16} aria-hidden="true" />;
  if (label === "Confirm") return <Check size={16} aria-hidden="true" />;
  if (label === "Details") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" stroke="currentColor" strokeWidth="0.4"
          d="M3 9a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2z" />
      </svg>
    );
  }
  if (label === "Games") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" strokeWidth="0.4" stroke="currentColor" d="M2.578 8.174a.327.327 0 0 0-.328.326v8c0 .267.143.514.373.648l8.04 4.69a.391.391 0 0 0 .587-.338v-7.75a.99.99 0 0 0-.492-.855L2.742 8.217a.33.33 0 0 0-.164-.043m2.176 2.972a1 1 0 0 1 .389.067c.168.067.27.149.367.234c.192.171.343.372.48.61c.138.238.236.466.287.718c.026.127.046.259.02.438a.89.89 0 0 1-.422.642a.89.89 0 0 1-.768.045a1.2 1.2 0 0 1-.367-.236a2.4 2.4 0 0 1-.48-.607a2.4 2.4 0 0 1-.287-.721a1.2 1.2 0 0 1-.02-.438a.89.89 0 0 1 .422-.642a.8.8 0 0 1 .379-.11m3.25 1.702a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m-3.25 1.5a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m3.25 1.75a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m13.443-7.924a.33.33 0 0 0-.19.043l-8.015 4.678a.99.99 0 0 0-.492.855v7.799a.363.363 0 0 0 .547.312l8.08-4.713a.75.75 0 0 0 .373-.648v-8a.327.327 0 0 0-.303-.326m-5.502 4.707a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066m3.25 1.5a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066M12 1.5a.74.74 0 0 0-.377.102L3.533 6.32a.36.36 0 0 0 0 .623l7.74 4.516a1.44 1.44 0 0 0 1.454 0l7.765-4.531a.343.343 0 0 0 0-.592l-8.115-4.734A.75.75 0 0 0 12 1.5m-.094 4.078h.102c.274 0 .523.03.767.111c.123.041.247.091.39.204a.89.89 0 0 1 .343.685a.89.89 0 0 1-.344.686a1.2 1.2 0 0 1-.389.203a2.4 2.4 0 0 1-.767.111c-.275 0-.523-.03-.768-.111a1.2 1.2 0 0 1-.388-.203a.89.89 0 0 1-.344-.686c0-.338.201-.573.344-.685a1.2 1.2 0 0 1 .388-.204a2.3 2.3 0 0 1 .666-.11" />
      </svg>
    );
  }
  return null;
}

function ProgressBar({
  currentStep,
  skipPayment,
}: {
  currentStep: number;
  skipPayment?: boolean;
}) {
  if (currentStep >= 5) return null; // hidden on success screen
  const steps = skipPayment
    ? PROGRESS_STEPS.filter((s) => s !== "Payment")
    : PROGRESS_STEPS;
  // Map internal step index to visible index
  const visibleIndex =
    skipPayment && currentStep > 3 ? currentStep - 1 : currentStep;
  return (
    <div className="flex items-center px-6 py-3 bg-gradient-to-b from-warm-50 to-warm-100 border-b border-warm-200">
      {steps.map((label, idx) => {
        const isCompleted = idx < visibleIndex;
        const isCurrent = idx === visibleIndex;
        const isLast = idx === steps.length - 1;
        return (
          <React.Fragment key={label}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-teal-600 text-white"
                    : isCurrent
                      ? "bg-teal-600 text-white ring-4 ring-warm-200"
                      : "bg-white border-2 border-warm-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <StepIcon label={label} />
                )}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  isCurrent
                    ? "text-teal-700"
                    : isCompleted
                      ? "text-teal-600"
                      : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector line — flex-1 fills available space, mt-3.5 aligns to circle centre */}
            {!isLast && (
              <div
                className={`flex-1 h-0.5 self-start mt-3.5 mx-1 transition-all ${idx < visibleIndex ? "bg-teal-500" : "bg-warm-300"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Game skeleton ────────────────────────────────────────────────────────────

function GameSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-24 bg-gray-100 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Helper: BGGGame → Game ───────────────────────────────────────────────────

function bggToGame(g: BGGGame, bggIdToDbId: Record<string, number>): Game {
  const weight = (g as any).weight ?? 0;
  const complexity: Game["complexity"] =
    weight >= 3.5 ? "Hard" : weight >= 2 ? "Medium" : "Easy";
  return {
    id: String(g.id),
    dbId: bggIdToDbId[String(g.id)],
    name: g.name,
    image: g.image,
    complexity,
    players: g.players,
    duration: g.duration,
    price: 3,
    tags: g.categories?.slice(0, 2) ?? [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  venue,
  cafeBggIds,
  bggIdToDbId,
  cafeTables,
  editReservation,
}) => {
  const { user, isAuthenticated } = useAuth();
  const authModal = useAuthModal();

  const {
    currentStep,
    data,
    updateBooking,
    updateGuest,
    updatePayment,
    selectGame,
    setAuthentication,
    autoSelectTable,
    nextStep,
    prevStep,
    canProceed,
    reset,
    submitting,
    submitError,
    submitReservation,
    initEdit,
    isEditMode,
  } = useReservationFlow();

  // ─── Local state ───────────────────────────────────────────────────────────
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(2);

  const [games, setGames] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [gamesError, setGamesError] = useState<string | null>(null);
  const [selectedGameId, setSelectedGameId] = useState<string | undefined>();
  const [complexityFilter, setComplexityFilter] = useState<
    Game["complexity"] | null
  >(null);

  // ─── Fetch real availability for selected date ───────────────────────────
  const { availability: modalAvailability, loading: availLoading } =
    useCafeAvailability(venue.id, date || null, partySize);

  // Build time slot objects from availability API (all slots, not just available)
  const allTimeSlots = (modalAvailability?.slots ?? []).map((s) => {
    const d = new Date(s.time);
    return {
      label: d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      available: s.available,
      reservedGameIds: s.reservedGameIds ?? [],
    };
  });

  // Find reserved game IDs for the currently selected time slot
  const selectedSlotData = allTimeSlots.find((s) => s.label === time);
  const reservedGameIdsForSlot = selectedSlotData?.reservedGameIds ?? [];

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestEmailError, setGuestEmailError] = useState("");

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [showCvvInfo, setShowCvvInfo] = useState(false);

  // "signin" | "guest" | null (not yet chosen)
  const [authChoice, setAuthChoice] = useState<"signin" | "guest" | null>(null);

  // ─── Init on open ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    if (editReservation) {
      // Edit mode — pre-fill from the existing reservation
      initEdit({ ...editReservation, venue });
      setDate(editReservation.date);
      setTime(editReservation.time);
      setPartySize(editReservation.partySize);
      if (editReservation.selectedGame) {
        setSelectedGameId(editReservation.selectedGame.id);
      }
    } else {
      // New reservation
      if (isAuthenticated && user) setAuthentication(true, false);
      updateBooking({ venue, partySize: 2, tableId: null });
    }

    // If user signed in via the overlay auth modal, update reservation flow
    if (isAuthenticated && user) {
      setAuthentication(true, false);
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    isOpen,
    isAuthenticated,
    user,
    updateBooking,
    setAuthentication,
    venue,
    editReservation,
  ]); // Added dependencies for correctness

  // ─── Fetch BGG games ───────────────────────────────────────────────────────

  useEffect(() => {
    if (!isOpen || !cafeBggIds.length) return;
    let cancelled = false;
    (async () => {
      setGamesLoading(true);
      setGamesError(null);
      try {
        const res = await fetch(`/api/bgg/games?ids=${cafeBggIds.join(",")}`);
        if (!res.ok) throw new Error(`Failed (${res.status})`);
        const raw: BGGGame[] = await res.json();
        if (!cancelled) setGames(raw.map((g) => bggToGame(g, bggIdToDbId)));
      } catch (e: any) {
        if (!cancelled) setGamesError(e?.message ?? "Could not load games");
      } finally {
        if (!cancelled) setGamesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, cafeBggIds.join(",")]);

  // ─── Sync step-0 fields + auto-pick table ─────────────────────────────────

  useEffect(() => {
    if (!date && !time) return;
    const tableId = autoSelectTable(cafeTables, partySize);
    updateBooking({ date, time, partySize, tableId });
  }, [date, time, partySize]);

  // ─── Sync guest ───────────────────────────────────────────────────────────

  useEffect(() => {
    updateGuest({ name: guestName, email: guestEmail });
    if (guestEmail && !isValidEmail(guestEmail)) {
      setGuestEmailError("Please enter a valid email");
    } else {
      setGuestEmailError("");
    }
  }, [guestName, guestEmail]);

  // ─── Sync payment ─────────────────────────────────────────────────────────

  useEffect(() => {
    updatePayment({ nameOnCard, cardNumber, expiryDate, cvv });
  }, [nameOnCard, cardNumber, expiryDate, cvv]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleClose = () => {
    reset();
    setDate("");
    setTime("");
    setPartySize(2);
    setSelectedGameId(undefined);
    setComplexityFilter(null);
    setGuestName("");
    setGuestEmail("");
    setGuestEmailError("");
    setNameOnCard("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");
    setAuthChoice(null);
    onClose();
  };

  const handleGameToggle = (game: Game) => {
    if (selectedGameId === game.id) {
      setSelectedGameId(undefined);
      selectGame(undefined);
    } else {
      setSelectedGameId(game.id);
      selectGame(game);
    }
  };

  const handleGuestChoice = () => {
    setAuthChoice("guest");
    setAuthentication(false, true);
  };

  const handleSignInChoice = () => {
    // Open auth modal as overlay — do NOT close the reservation modal
    authModal.open("signin");
  };

  const handleConfirm = async () => {
    const ok = await submitReservation();
    if (ok) nextStep(); // → step 5 success
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const filteredGames = complexityFilter
    ? games.filter((g) => g.complexity === complexityFilter)
    : games;

  const displayName =
    isAuthenticated && user ? user.name : (data.guest?.name ?? "");
  const displayEmail =
    isAuthenticated && user ? user.email : (data.guest?.email ?? "");

  const tableId = data.booking?.tableId;
  const noTableWarning =
    !tableId && date && time
      ? "No table is available for your party size at this venue."
      : null;

  if (!isOpen) {
    return (
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        auth={authModal}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col font-['DM_Sans']">
          {/* ── Header ── */}
          <div
            className="px-6 py-4 text-white flex items-center gap-4 relative bg-teal-800"
            style={
              venue.poster
                ? {
                    backgroundImage: `url(${venue.poster})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : {}
            }
          >
            <div className="absolute inset-0 bg-black/45 rounded-t-2xl" />
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-teal-700 border border-white/30 shrink-0 flex items-center justify-center">
                {venue.logo ? (
                  <img
                    src={venue.logo}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xl font-black">
                    {venue.name[0]}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">
                  {isEditMode ? "Edit reservation at" : "Reserving at"}
                </p>
                <h2 className="text-lg font-black text-white truncate">
                  {venue.name}
                </h2>
                <p className="text-white/90 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {venue.address}, {venue.city}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close"
              className="relative w-7 h-7 rounded-full bg-white border border-teal-700 text-teal-700 hover:bg-teal-50 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>

          {/* ── Progress bar ── */}
          <ProgressBar currentStep={currentStep} skipPayment={isEditMode} />
          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto">
            <div key={currentStep} className="step-animate">
              {/* ─── STEP 0: WHEN ─────────────────────────────────────────── */}
              {currentStep === 0 && (
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      When are you visiting?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Choose a date, time, and party size
                    </p>
                  </div>

                  <Input
                    ref={dateInputRef}
                    type="date"
                    label="Date"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      setTime(""); // clear time — new date may have different slots
                    }}
                    min={new Date().toISOString().split("T")[0]}
                    className="hide-calendar-indicator"
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => dateInputRef.current?.showPicker()}
                        className="text-gray-400 hover:text-teal-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    }
                  />

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Time
                    </label>
                    <div className="bg-warm-100 rounded-xl p-3">
                      {!date ? (
                        <p className="text-sm text-gray-600 py-1">
                          Select a date to see available times
                        </p>
                      ) : availLoading ? (
                        <div className="grid grid-cols-4 gap-2">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="h-12 bg-gray-100 rounded-lg animate-pulse"
                              style={{ animationDelay: `${i * 60}ms` }}
                            />
                          ))}
                        </div>
                      ) : allTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {allTimeSlots.map((slot) => (
                            <button
                              key={slot.label}
                              onClick={() =>
                                slot.available && setTime(slot.label)
                              }
                              disabled={!slot.available}
                              className={`flex items-center justify-center text-xs sm:text-sm font-bold px-2 py-3 rounded-lg border transition-all font-['DM_Sans'] cursor-pointer ${
                                !slot.available
                                  ? "bg-red-50 border-red-200 text-red-600 cursor-not-allowed line-through"
                                  : time === slot.label
                                    ? "bg-teal-600 border-teal-600 text-white shadow-sm shadow-teal-800/30"
                                    : "bg-white border-warm-300 text-gray-600 hover:border-teal-300"
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 py-1">
                          No available time slots for this date
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Party size
                    </label>
                    <div className="bg-warm-100 rounded-xl p-3">
                      <div className="flex items-center gap-3 w-full">
                        <button
                          onClick={() =>
                            setPartySize((p) => Math.max(1, p - 1))
                          }
                          className="w-11 h-11 rounded-lg bg-white border-2 border-warm-300 hover:border-warm-400 text-teal-800 transition-all font-bold text-lg flex items-center justify-center shrink-0 leading-none cursor-pointer"
                        >
                          −
                        </button>
                        <div className="flex items-center justify-center gap-1 flex-1 min-w-0">
                          {[...Array(Math.min(partySize, 8))].map((_, i) => (
                            <img
                              key={i}
                              src="/icons/pawn.svg"
                              alt=""
                              aria-hidden="true"
                              className="w-5 h-5 object-contain shrink-0"
                              style={{
                                filter:
                                  "brightness(0) saturate(100%) invert(39%) sepia(64%) saturate(398%) hue-rotate(145deg) brightness(94%) contrast(94%)",
                              }}
                            />
                          ))}
                          {partySize > 8 && (
                            <span className="text-sm font-bold text-teal-700 ml-0.5">
                              +{partySize - 8}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setPartySize((p) => Math.min(12, p + 1))
                          }
                          className="w-11 h-11 rounded-lg bg-white border-2 border-warm-300 hover:border-warm-400 text-teal-800 transition-all font-bold text-lg flex items-center justify-center shrink-0 leading-none cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <p className="text-center text-sm font-semibold text-gray-700 mt-1">
                      {partySize} {partySize === 1 ? "guest" : "guests"}
                    </p>
                  </div>

                  {/* No table warning */}
                  {noTableWarning && (
                    <AlertBanner variant="error" title={noTableWarning} />
                  )}
                </div>
              )}

              {/* ─── STEP 1: GAMES ────────────────────────────────────────── */}
              {currentStep === 1 && (
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Reserve a game?
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                      We'll have it ready at your table
                      <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                        +$3
                      </span>
                    </p>
                  </div>

                  {/* Complexity filter */}
                  <div className="flex gap-2">
                    {(["Easy", "Medium", "Hard"] as const).map((level) => {
                      const dots = { Easy: 1, Medium: 2, Hard: 3 }[level];
                      const active = complexityFilter === level;
                      return (
                        <button
                          key={level}
                          onClick={() =>
                            setComplexityFilter(active ? null : level)
                          }
                          className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border transition-all cursor-pointer ${
                            active
                              ? "bg-teal-600 border-teal-600 text-white"
                              : "bg-white border-warm-300 text-gray-800 hover:border-teal-300"
                          }`}
                        >
                          <span className="flex gap-1">
                            {[...Array(3)].map((_, i) => (
                              <span
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < dots ? (active ? "bg-white" : "bg-warm-700") : active ? "bg-white/30" : "bg-warm-300"}`}
                              />
                            ))}
                          </span>
                          {level}
                        </button>
                      );
                    })}
                  </div>

                  {/* Game list */}
                  <div className="space-y-3 max-h-[320px] sm:max-h-[460px] overflow-y-auto pr-1">
                    {gamesLoading && <GameSkeleton />}
                    {gamesError && (
                      <AlertBanner
                        variant="error"
                        title="Couldn't load games"
                        description={gamesError}
                      />
                    )}
                    {!gamesLoading &&
                      !gamesError &&
                      filteredGames.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                          No games for that filter
                        </p>
                      )}
                    {!gamesLoading &&
                      !gamesError &&
                      filteredGames.map((game) => {
                        const isSelected = selectedGameId === game.id;
                        const isReserved =
                          !!game.dbId &&
                          reservedGameIdsForSlot.includes(game.dbId);
                        const dots = { Easy: 1, Medium: 2, Hard: 3 }[
                          game.complexity
                        ];
                        return (
                          <button
                            key={game.id}
                            onClick={() =>
                              !isReserved && handleGameToggle(game)
                            }
                            disabled={isReserved}
                            aria-label={isReserved ? `${game.name} — already reserved for this time slot` : game.name}
                            className={`w-full flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 text-left ${
                              isReserved
                                ? "border-red-200 bg-red-50 opacity-70 cursor-not-allowed"
                                : isSelected
                                  ? "border-teal-600 bg-teal-50 shadow-sm cursor-pointer"
                                  : "border-warm-300 bg-warm-50 hover:border-teal-500 hover:shadow-sm cursor-pointer"
                            }`}
                          >
                            <div className="relative w-20 h-20 shrink-0">
                              <img
                                src={game.image}
                                alt={game.name}
                                className={`w-full h-full rounded-lg object-cover border border-gray-100 ${
                                  isReserved ? "grayscale" : ""
                                }`}
                              />
                              {isSelected && (
                                <div className="absolute inset-0 rounded-lg bg-teal-900/50 flex items-center justify-center">
                                  <div className="w-9 h-9 rounded-full bg-teal-600 shadow-lg flex items-center justify-center">
                                    <svg
                                      className="w-5 h-5 text-white"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth={3}
                                    >
                                      <path d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p
                                  className={`font-bold text-sm leading-snug ${
                                    isReserved
                                      ? "text-gray-400"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {game.name}
                                </p>
                                {isReserved && (
                                  <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
                                    Reserved
                                  </span>
                                )}
                              </div>
                              {!isReserved && (
                                <div className="flex items-center gap-1.5 mb-2">
                                  {[...Array(3)].map((_, i) => (
                                    <span
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${i < dots ? "bg-warm-700" : "bg-warm-300"}`}
                                    />
                                  ))}
                                  <span className="text-xs text-gray-800 font-semibold ml-0.5">
                                    {game.complexity}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                                <span className="flex items-center gap-1.5">
                                  <Users size={13} />
                                  {game.players}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock size={13} />
                                  {game.duration} min
                                </span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {game.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="text-xs bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* ─── STEP 2: DETAILS / AUTH ───────────────────────────────── */}
              {currentStep === 2 && (
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Your details
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Sign in for the best experience, or continue as guest
                    </p>
                  </div>

                  {isAuthenticated && user ? (
                    /* Already signed in */
                    <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {user.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <CheckCircle
                        size={18}
                        className="text-teal-600 ml-auto shrink-0"
                      />
                    </div>
                  ) : authChoice === null ? (
                    /* Choose path */
                    <div className="space-y-3">
                      <button
                        onClick={handleSignInChoice}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-warm-300 bg-warm-50 hover:border-teal-400 transition-all text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                          <LogIn size={17} className="text-teal-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            Sign in to my account
                          </p>
                          <p className="text-xs text-gray-500">
                            Access your booking history & preferences
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={handleGuestChoice}
                        className="w-full flex items-center gap-3 p-4 rounded-xl border border-warm-300 bg-warm-50 hover:border-warm-400 transition-all text-left group cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-warm-100 border border-warm-300 flex items-center justify-center group-hover:bg-warm-200 transition-colors">
                          <User size={17} className="text-neutral-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                            Continue as guest
                          </p>
                          <p className="text-xs text-gray-500">
                            Just your name &amp; email for confirmation
                          </p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    /* Guest form */
                    <div className="space-y-4">
                      <Input
                        type="text"
                        label="Your name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="Jane Smith"
                        leftIcon={<User className="w-4 h-4" />}
                      />
                      <Input
                        type="email"
                        label="Email address"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="you@example.com"
                        error={guestEmailError}
                        helperText="Confirmation will be sent here. No account needed."
                        leftIcon={<Mail className="w-4 h-4" />}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ─── STEP 3: PAYMENT ──────────────────────────────────────── */}
              {currentStep === 3 && (
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Secure &amp; encrypted
                    </p>
                  </div>

                  <AlertBanner
                    variant="warning"
                    title={
                      <>
                        Reservation fee: <strong>$6.00</strong>
                        {data.booking?.selectedGame && (
                          <>
                            {" "}
                            + Game: <strong>$3.00</strong>
                          </>
                        )}
                      </>
                    }
                  />

                  <Input
                    type="text"
                    label="Name on card"
                    value={nameOnCard}
                    onChange={(e) => setNameOnCard(e.target.value)}
                    placeholder="Jane Smith"
                  />
                  <Input
                    type="text"
                    label="Card number"
                    value={cardNumber}
                    onChange={(e) =>
                      setCardNumber(formatCardNumber(e.target.value))
                    }
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    error={
                      cardNumber && !isValidCardNumber(cardNumber)
                        ? "Invalid card number"
                        : ""
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="text"
                      label="Expiry (MM/YY)"
                      value={expiryDate}
                      onChange={(e) =>
                        setExpiryDate(formatExpiryDate(e.target.value))
                      }
                      placeholder="12/27"
                      maxLength={5}
                      error={
                        expiryDate && !isValidExpiryDate(expiryDate)
                          ? "Invalid date"
                          : ""
                      }
                    />
                    <div className="relative">
                      <Input
                        type="text"
                        label={
                          <span className="flex items-center gap-1">
                            CVV
                            <button
                              type="button"
                              onMouseEnter={() => setShowCvvInfo(true)}
                              onMouseLeave={() => setShowCvvInfo(false)}
                              onFocus={() => setShowCvvInfo(true)}
                              onBlur={() => setShowCvvInfo(false)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <HelpCircle className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        }
                        value={cvv}
                        onChange={(e) =>
                          /^\d{0,4}$/.test(e.target.value) &&
                          setCvv(e.target.value)
                        }
                        placeholder="123"
                        maxLength={4}
                        error={cvv && !isValidCVV(cvv) ? "Invalid CVV" : ""}
                      />
                      {showCvvInfo && (
                        <div className="absolute top-full right-0 mt-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-20 w-48">
                          3-digit code on the back of your card
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ─── STEP 4: CONFIRM ──────────────────────────────────────── */}
              {currentStep === 4 && data.booking && (
                <div className="p-6 space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      Ready to roll?
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="44"
                        height="33"
                        viewBox="0 0 41 31"
                        fill="none"
                      >
                        <g
                          clipPath="url(#clip0_dice_confirm)"
                          stroke="#292524"
                          strokeWidth="0.1"
                          strokeLinejoin="round"
                        >
                          <path
                            d="M36.2806 18.8576C35.7791 19.2991 35.2403 19.6559 34.5521 19.7364C31.5932 19.5477 28.3145 19.9899 25.3928 19.74C24.6487 19.6759 23.9612 19.2756 23.5112 18.6931C22.2965 16.2781 20.5723 13.9564 19.3848 11.5486C18.9706 10.7097 18.8275 10.0253 19.1523 9.10585C20.6661 6.69515 21.9202 3.81586 23.5141 1.4835C23.9369 0.864627 24.7632 0.146761 25.5358 0.0776806C28.3331 -0.172291 31.5023 0.270678 34.3389 0.0798171C35.1896 0.257859 35.842 0.659522 36.3356 1.36813C37.9095 3.62784 39.0914 6.45444 40.6374 8.76543C41.0745 9.73825 41.1496 10.4148 40.6825 11.3798C39.472 13.8809 37.6033 16.3828 36.2813 18.8561L36.2806 18.8576ZM25.4114 0.59614C25.0315 0.669493 25.098 1.09252 25.249 1.36671L29.4498 8.57955C29.9249 9.2027 30.538 9.56519 31.3306 9.62715C33.9984 9.83724 36.938 9.46264 39.6344 9.62715C40.1781 9.58157 40.3741 9.38786 40.1087 8.86371L35.8642 1.55258C35.4922 1.04409 34.7553 0.631036 34.1257 0.576911L25.4114 0.595427V0.59614ZM24.3332 1.44932C24.1952 1.46214 24.0142 1.64873 23.9412 1.76766C22.7064 4.12066 21.1397 6.37824 19.9099 8.72199C19.0392 10.3813 19.6817 11.0116 20.4822 12.4495C21.5975 14.4542 22.8423 16.392 23.9405 18.4082L24.3955 18.7386C24.5836 18.7337 24.8154 18.342 24.9163 18.1917C26.4008 15.9776 27.5497 13.3425 29.0213 11.0971C29.3103 10.4668 29.3118 9.71048 29.0213 9.07665C27.5497 6.8326 26.4015 4.1933 24.9163 1.98202C24.7983 1.80683 24.5815 1.42582 24.3332 1.44861V1.44932ZM31.4251 10.214C30.744 10.3101 30.1087 10.6477 29.7074 11.2103C28.4633 13.574 26.8035 15.8679 25.6088 18.2401C25.3756 18.7023 25.0673 19.1745 25.8213 19.2421C28.5713 19.4893 31.6919 19.0506 34.4813 19.2393C35.1202 19.1346 35.6467 18.8006 36.0502 18.3085C37.2843 15.8857 39.0721 13.5192 40.2525 11.0971C40.5186 10.5515 40.598 10.2546 39.8497 10.1919C37.1641 9.96757 34.1451 10.3493 31.4251 10.2147V10.214Z"
                            fill="#292524"
                          />
                          <path
                            d="M24.3334 1.44922C24.5816 1.42643 24.7984 1.80744 24.9164 1.98264C26.4016 4.19392 27.5498 6.83322 29.0214 9.07726C29.3119 9.71038 29.3104 10.4674 29.0214 11.0977C27.5498 13.3432 26.4009 15.9789 24.9164 18.1923C24.8155 18.3426 24.5845 18.7343 24.3956 18.7393L23.9406 18.4088C22.8424 16.3927 21.5984 14.4548 20.4823 12.4501C19.6818 11.0122 19.0393 10.3812 19.91 8.7226C21.1398 6.37885 22.7065 4.12128 23.9413 1.76827C24.0143 1.64934 24.1953 1.46275 24.3334 1.44993V1.44922ZM24.3405 8.56949C23.1587 8.67916 23.2044 11.5328 24.3334 11.5983C25.6175 11.6731 25.5374 8.45839 24.3405 8.56949Z"
                            fill="white"
                          />
                          <path
                            d="M25.4113 0.596153L34.1257 0.577637C34.7553 0.631762 35.4928 1.04482 35.8641 1.55331L40.1086 8.86443C40.3733 9.38788 40.178 9.5823 39.6343 9.62788C36.938 9.46266 33.9976 9.83797 31.3306 9.62788C30.5386 9.56521 29.9248 9.20343 29.4498 8.58028L25.2489 1.36743C25.098 1.09325 25.0314 0.670219 25.4113 0.596865V0.596153ZM27.0618 1.16518C26.7513 1.19509 26.4143 1.34535 26.3642 1.68933C26.1639 3.0688 29.1965 4.06085 29.1486 2.68779C29.1207 1.89301 27.7829 1.09467 27.0618 1.16446V1.16518ZM33.7057 1.17657C33.1019 1.19438 32.8337 1.49277 32.9603 2.09527C33.1806 3.14216 35.8591 4.10928 35.6559 2.54536C35.5601 1.80613 34.4068 1.15663 33.7057 1.17728V1.17657ZM29.8154 7.00995C28.7301 8.09102 32.2413 9.9861 32.4295 8.43072C32.5496 7.43297 30.4678 6.36045 29.8154 7.00995ZM36.7155 6.86395C36.1667 6.97576 36.1467 7.49137 36.3241 7.9322C36.6697 8.79037 38.7894 9.52034 38.9483 8.51618C39.1035 7.53339 37.5926 6.68448 36.7155 6.86395Z"
                            fill="white"
                          />
                          <path
                            d="M31.4251 10.214C34.1451 10.3486 37.1634 9.96688 39.8498 10.1912C40.5981 10.2539 40.5187 10.5509 40.2526 11.0964C39.0721 13.5185 37.2843 15.8857 36.0502 18.3078C35.6475 18.7999 35.1209 19.1339 34.4814 19.2386C31.692 19.0499 28.5714 19.4886 25.8213 19.2415C25.0666 19.1738 25.3756 18.7016 25.6089 18.2394C26.8043 15.8672 28.4641 13.5733 29.7074 11.2096C30.1088 10.647 30.7441 10.3094 31.4251 10.2133V10.214ZM31.4938 10.8528C30.8085 10.9604 29.5436 11.8691 29.9478 12.6425C30.3084 13.3319 31.531 12.8704 32.0068 12.5029C32.9311 11.7893 32.9075 10.6299 31.4931 10.8528H31.4938ZM36.8315 11.5016C36.4452 11.9047 36.1604 12.7522 36.8758 12.938C37.7443 13.1638 39.2066 12.4125 39.173 11.4404C39.1344 10.3173 37.3516 10.9596 36.8315 11.5016ZM33.8482 15.1543C34.1845 14.8175 34.545 14.1459 34.0142 13.7934C32.9447 13.0819 30.7212 14.9421 31.7614 15.6799C32.3359 16.0873 33.414 15.5895 33.8482 15.155V15.1543ZM28.8411 18.0749C29.1788 17.7737 29.6101 17.0765 29.1909 16.6712C28.3074 15.8188 25.8407 17.6298 26.7528 18.4574C27.2786 18.9345 28.3882 18.4794 28.8411 18.0749ZM35.7841 16.6947C35.0895 15.8864 32.6277 17.2666 33.238 18.3406C33.8318 19.3867 36.6369 17.6868 35.7841 16.6947Z"
                            fill="white"
                          />
                          <path
                            d="M24.3404 8.56967C25.5373 8.45929 25.6174 11.6733 24.3333 11.5985C23.2037 11.533 23.1579 8.67864 24.3404 8.56967Z"
                            fill="#292524"
                          />
                          <path
                            d="M33.7058 1.17649C34.4069 1.15584 35.5602 1.80534 35.656 2.54457C35.8585 4.10849 33.18 3.14137 32.9604 2.09448C32.8338 1.49198 33.102 1.19359 33.7058 1.17578V1.17649Z"
                            fill="#292524"
                          />
                          <path
                            d="M27.0618 1.16524C27.7829 1.09473 29.1207 1.89308 29.1486 2.68857C29.1965 4.06092 26.1639 3.06887 26.3642 1.69011C26.4143 1.34613 26.7513 1.19586 27.0618 1.16595V1.16524Z"
                            fill="#292524"
                          />
                          <path
                            d="M29.8154 7.01003C30.4671 6.36053 32.5497 7.43306 32.4295 8.43081C32.2413 9.98618 28.7301 8.0911 29.8154 7.01003Z"
                            fill="#292524"
                          />
                          <path
                            d="M36.7156 6.86396C37.5927 6.6845 39.1044 7.5334 38.9484 8.5162C38.7896 9.52035 36.6706 8.79038 36.3243 7.93222C36.1469 7.49139 36.1662 6.97577 36.7156 6.86396Z"
                            fill="#292524"
                          />
                          <path
                            d="M28.8412 18.0749C28.3876 18.4794 27.2787 18.9345 26.7529 18.4573C25.8407 17.6305 28.3075 15.8187 29.191 16.6712C29.6102 17.0764 29.1788 17.7729 28.8412 18.0749Z"
                            fill="#292524"
                          />
                          <path
                            d="M35.7841 16.6947C36.6369 17.6868 33.8318 19.3867 33.238 18.3405C32.6285 17.2666 35.0895 15.8864 35.7841 16.6947Z"
                            fill="#292524"
                          />
                          <path
                            d="M33.8481 15.1542C33.4138 15.5886 32.3364 16.0864 31.7612 15.6791C30.7203 14.9413 32.9445 13.0818 34.0141 13.7925C34.5449 14.1451 34.1843 14.8166 33.8481 15.1535V15.1542Z"
                            fill="#292524"
                          />
                          <path
                            d="M31.4939 10.8527C32.9082 10.6298 32.9311 11.7892 32.0075 12.5028C31.5318 12.8703 30.3091 13.3318 29.9486 12.6424C29.5437 11.869 30.8092 10.9602 31.4946 10.8527H31.4939Z"
                            fill="#292524"
                          />
                          <path
                            d="M36.8313 11.5016C37.3514 10.9596 39.1342 10.3172 39.1728 11.4403C39.2064 12.4124 37.7434 13.1638 36.8757 12.938C36.1602 12.7521 36.445 11.9047 36.8313 11.5016Z"
                            fill="#292524"
                          />
                          <path
                            d="M18.0325 13.4998C19.4161 14.8017 21.6368 16.1947 21.2633 18.3305C20.3955 21.0061 20.1623 24.2586 19.2587 26.8751C18.9418 27.7923 18.3631 28.2709 17.4731 28.5871C14.8447 29.5208 11.9687 30.1532 9.30099 30.9921C8.55124 31.042 7.7736 30.8611 7.18696 30.3853C5.25608 28.3578 2.8473 26.5866 0.924285 24.584C-0.502953 23.097 0.0464798 22.1698 0.4421 20.4648C0.964348 18.2137 1.45726 15.9547 2.03317 13.7163C2.22704 13.2171 2.76574 12.6146 3.23147 12.3454C5.91926 11.5186 8.65784 10.4646 11.3936 9.788C12.7349 9.45613 13.6085 9.45613 14.7009 10.372C15.8012 11.295 16.9687 12.4999 18.0325 13.5005V13.4998ZM12.0381 10.1384L3.80738 12.6324C2.94889 12.9864 2.61622 13.5596 2.37155 14.4078C1.62181 17.0115 1.21188 19.8161 0.495756 22.4404C0.485025 22.9845 0.793365 22.9318 1.19328 22.8499C3.78448 22.3158 6.49588 21.0645 9.10497 20.4691C9.81394 20.2341 10.3691 19.6914 10.6188 18.9849C11.0001 16.3513 12.2542 13.3738 12.5339 10.7793C12.584 10.3179 12.5869 10.0836 12.0381 10.1377V10.1384ZM15.4571 11.7906C14.9177 11.2957 14.3947 10.7822 13.8403 10.3022C13.6271 10.2139 13.3881 10.2374 13.2779 10.4525L11.2841 18.8653C11.1196 20.1743 11.7513 20.697 12.5876 21.5196C14.3711 23.2743 16.3084 24.8917 18.0984 26.645C18.8402 27.172 18.9003 26.1487 19.0291 25.6487C19.668 23.1796 20.1258 20.6578 20.7625 18.1873C20.8856 17.4602 20.6366 16.7879 20.2081 16.2118C18.5877 14.7789 17.0496 13.252 15.4571 11.7899V11.7906ZM12.5954 22.3307C11.6561 21.4847 11.1703 20.7874 9.73596 20.9555C6.9008 21.835 4.00054 22.5757 1.2176 23.5848C0.876352 23.9659 1.7842 24.6574 2.0718 24.9373C3.93687 26.7533 5.93142 28.4717 7.85372 30.2201C8.31731 30.4637 8.84456 30.5342 9.36466 30.4843L17.8873 27.8593C18.0454 27.7133 18.0418 27.4327 17.8873 27.2817C16.1052 25.6551 14.3875 23.9438 12.5954 22.3307Z"
                            fill="#292524"
                          />
                          <path
                            d="M12.0381 10.1383C12.5868 10.0842 12.584 10.3185 12.5339 10.7799C12.2542 13.3744 10.9993 16.352 10.6187 18.9856C10.3691 19.692 9.8139 20.2347 9.10493 20.4697C6.49656 21.0651 3.78516 22.3157 1.19324 22.8505C0.793331 22.9331 0.485705 22.9851 0.495721 22.441C1.21256 19.8167 1.62249 17.0121 2.37152 14.4084C2.61547 13.5603 2.94885 12.9862 3.80734 12.633L12.0381 10.139V10.1383ZM7.59757 15.4133C6.73694 14.5573 4.54994 16.859 5.5372 17.6417C6.47581 18.3859 8.3974 16.2081 7.59757 15.4133Z"
                            fill="white"
                          />
                          <path
                            d="M12.5954 22.3306C14.3875 23.9437 16.1059 25.655 17.8873 27.2816C18.0411 27.4333 18.0447 27.7132 17.8873 27.8592L9.36465 30.4842C8.84455 30.5341 8.31729 30.4636 7.85371 30.22C5.93141 28.4717 3.93614 26.7532 2.07179 24.9372C1.78419 24.6573 0.877055 23.9651 1.21759 23.5848C4.00052 22.5756 6.90079 21.835 9.73595 20.9554C11.1711 20.7881 11.6561 21.4846 12.5954 22.3306ZM5.37768 25.0568C5.57442 24.8375 5.55868 24.6032 5.45209 24.3496C5.02356 23.3326 2.49388 23.1332 2.54324 24.2535C2.58545 25.2149 4.761 25.7448 5.37768 25.0568ZM14.3239 26.0923C13.9905 26.1486 13.6363 26.3936 13.622 26.7532C13.5748 27.9354 16.4758 28.4603 16.5645 27.2489C16.6353 26.2839 15.0657 25.9677 14.3239 26.0916V26.0923Z"
                            fill="white"
                          />
                          <path
                            d="M15.457 11.7905C17.0495 13.2526 18.5876 14.7795 20.208 16.2124C20.6365 16.7885 20.8855 17.4608 20.7624 18.1879C20.125 20.6584 19.6679 23.1802 19.029 25.6493C18.8995 26.1493 18.8401 27.1719 18.0983 26.6456C16.3083 24.8923 14.371 23.2749 12.5875 21.5202C11.7512 20.6976 11.1195 20.1749 11.284 18.8659L13.2778 10.453C13.388 10.238 13.627 10.2152 13.8402 10.3028C14.3946 10.7828 14.9176 11.2963 15.457 11.7912V11.7905ZM14.0369 11.6324C12.5789 11.8233 13.9053 15.4297 15.0556 14.4291C15.8097 13.7732 15.0206 11.5035 14.0369 11.6324ZM15.6823 17.0449C14.4976 17.198 15.1544 20.1086 16.3555 19.984C16.998 19.9178 17.0509 19.0062 16.9722 18.5084C16.8935 18.0106 16.304 16.9644 15.6823 17.0449ZM18.0375 22.7529C17.7263 22.4666 17.2269 22.3178 16.9271 22.7016C16.3412 23.4516 16.9679 25.4079 17.9688 25.4136C19.0412 25.42 18.6341 23.302 18.0375 22.7529Z"
                            fill="white"
                          />
                          <path
                            d="M7.59768 15.4135C8.39751 16.2083 6.47592 18.3868 5.53731 17.6419C4.54933 16.8585 6.73633 14.5575 7.59768 15.4135Z"
                            fill="#292524"
                          />
                          <path
                            d="M5.37764 25.0569C4.76096 25.7448 2.5854 25.215 2.54319 24.2535C2.49383 23.1333 5.02423 23.3327 5.45204 24.3497C5.55864 24.6025 5.57437 24.8375 5.37764 25.0569Z"
                            fill="#292524"
                          />
                          <path
                            d="M14.324 26.0925C15.0658 25.9679 16.6354 26.2848 16.5646 27.2498C16.4759 28.4604 13.5749 27.9356 13.6222 26.7541C13.6365 26.3937 13.9906 26.1487 14.324 26.0932V26.0925Z"
                            fill="#292524"
                          />
                          <path
                            d="M18.0374 22.7531C18.6341 23.3022 19.0411 25.4202 17.9687 25.4138C16.9679 25.4081 16.3412 23.4517 16.9271 22.7018C17.2269 22.318 17.7262 22.4668 18.0374 22.7531Z"
                            fill="#292524"
                          />
                          <path
                            d="M14.037 11.6325C15.0207 11.5036 15.8105 13.774 15.0558 14.4292C13.9054 15.4298 12.579 11.8226 14.037 11.6325Z"
                            fill="#292524"
                          />
                          <path
                            d="M15.6823 17.045C16.304 16.9645 16.8899 17.9879 16.9722 18.5085C17.0545 19.0291 16.998 19.9179 16.3555 19.9841C15.1536 20.1088 14.4969 17.1974 15.6823 17.045Z"
                            fill="#292524"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_dice_confirm">
                            <rect width="41" height="31" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Review your booking before confirming
                    </p>
                  </div>

                  <BookingSummary booking={data.booking as any} showPricing />

                  <div className="bg-warm-50 rounded-xl p-4 border border-warm-200 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Confirmation will be sent to
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User size={16} className="text-teal-600 shrink-0" />
                      <span className="font-medium">
                        {displayName || "Guest"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-teal-600 shrink-0" />
                      <span>{displayEmail}</span>
                    </div>
                  </div>

                  {submitError && (
                    <AlertBanner
                      variant="error"
                      title="Booking failed"
                      description={submitError}
                    />
                  )}
                </div>
              )}

              {/* ─── STEP 5: SUCCESS ──────────────────────────────────────── */}
              {currentStep === 5 && data.booking && (
                <div className="p-6 space-y-5 text-center">
                  <div className="pt-4 space-y-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 ring-8 ring-teal-50">
                      <CheckCircle size={40} className="text-teal-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-gray-900">
                        {isEditMode
                          ? "Reservation updated!"
                          : "You're all set!"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Confirmation will be sent to{" "}
                        <span className="font-semibold text-gray-700">
                          {displayEmail}
                        </span>
                      </p>
                    </div>
                  </div>
                  <BookingSummary booking={data.booking as any} showPricing />
                  <p className="text-xs text-gray-400">
                    Need to change plans? You can manage your reservation from
                    your profile.
                  </p>
                </div>
              )}
            </div>
            {/* end step-animate */}
          </div>

          {/* ── Footer ── */}
          <div>
            {/* Buttons */}
            <div className="bg-warm-50 border-y border-warm-300 px-4 py-4">
              {currentStep < 5 ? (
                <div className="flex gap-3">
                  <div className="flex-1 [&_button]:w-full">
                    <div className="sm:hidden">
                      <SecondaryButton
                        label={currentStep === 0 ? "Cancel" : "Back"}
                        onClick={
                          currentStep === 0
                            ? handleClose
                            : currentStep === 2 && authChoice !== null
                              ? () => { setAuthChoice(null); setAuthentication(false, false); }
                              : prevStep
                        }
                        disabled={submitting}
                        leftIcon={currentStep > 0 ? <ChevronLeft size={16} aria-hidden="true" /> : undefined}
                        size="small"
                      />
                    </div>
                    <div className="hidden sm:block">
                      <SecondaryButton
                        label={currentStep === 0 ? "Cancel" : "Back"}
                        onClick={
                          currentStep === 0
                            ? handleClose
                            : currentStep === 2 && authChoice !== null
                              ? () => { setAuthChoice(null); setAuthentication(false, false); }
                              : prevStep
                        }
                        disabled={submitting}
                        leftIcon={currentStep > 0 ? <ChevronLeft size={16} aria-hidden="true" /> : undefined}
                        size="medium"
                      />
                    </div>
                  </div>
                  <div className="flex-1 [&_button]:w-full">
                    <div className="sm:hidden">
                      <PrimaryButton
                        label={
                          currentStep === 4
                            ? isEditMode ? "Save changes" : "Confirm"
                            : currentStep === 1 && !selectedGameId ? "Skip" : "Continue"
                        }
                        onClick={currentStep === 4 ? handleConfirm : nextStep}
                        disabled={!canProceed}
                        isLoading={submitting}
                        size="sm"
                        rightIcon={currentStep === 1 && !!selectedGameId ? <PartyPopper size={15} /> : undefined}
                      />
                    </div>
                    <div className="hidden sm:block">
                      <PrimaryButton
                        label={
                          currentStep === 4
                            ? isEditMode ? "Save changes" : "Confirm reservation"
                            : currentStep === 1 && !selectedGameId ? "Skip for now" : "Continue"
                        }
                        onClick={currentStep === 4 ? handleConfirm : nextStep}
                        disabled={!canProceed}
                        isLoading={submitting}
                        size="md"
                        rightIcon={currentStep === 1 && !!selectedGameId ? <PartyPopper size={15} /> : undefined}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="[&_button]:w-full">
                  <div className="sm:hidden">
                    <PrimaryButton label="Done" onClick={handleClose} size="sm" />
                  </div>
                  <div className="hidden sm:block">
                    <PrimaryButton label="Done" onClick={handleClose} size="md" />
                  </div>
                </div>
              )}
            </div>
            {/* Powered by */}
            <div className="bg-white px-4 py-2">
              <p className="text-center text-xs text-gray-400">
                Powered by{" "}
                <span className="text-teal-700 font-semibold">GATORE</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth modal overlay — renders on top of reservation modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        auth={authModal}
      />
    </>
  );
};
