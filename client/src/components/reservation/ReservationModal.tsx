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
    <div className="flex items-center justify-center gap-0 px-6 py-3 bg-gradient-to-b from-warm-50 to-warm-100 border-b border-gray-100">
      {steps.map((label, idx) => {
        const isCompleted = idx < visibleIndex;
        const isCurrent = idx === visibleIndex;
        const isLast = idx === steps.length - 1;
        return (
          <React.Fragment key={label}>
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? "bg-teal-600 text-white"
                    : isCurrent
                      ? "bg-teal-600 text-white ring-4 ring-teal-100"
                      : "bg-white border-2 border-gray-200 text-gray-400"
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
                  idx + 1
                )}
              </div>
              <span
                className={`text-[10px] font-semibold whitespace-nowrap ${
                  isCurrent
                    ? "text-teal-700"
                    : isCompleted
                      ? "text-teal-500"
                      : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div
                className={`h-0.5 w-8 mb-4 mx-1 transition-all ${idx < visibleIndex ? "bg-teal-500" : "bg-gray-200"}`}
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
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-teal-700 border-2 border-white/30 shrink-0 flex items-center justify-center">
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
                    <p className="text-sm text-gray-400 py-1">
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
                          onClick={() => slot.available && setTime(slot.label)}
                          disabled={!slot.available}
                          className={`flex items-center justify-center text-xs sm:text-sm font-bold px-2 py-3 rounded-lg border transition-all font-['DM_Sans'] cursor-pointer ${
                            !slot.available
                              ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through"
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
                        onClick={() => setPartySize((p) => Math.max(1, p - 1))}
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
                        onClick={() => setPartySize((p) => Math.min(12, p + 1))}
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
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {noTableWarning}
                  </div>
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
                              className={`w-2 h-2 rounded-full ${i < dots ? (active ? "bg-white" : "bg-warm-700") : (active ? "bg-white/30" : "bg-warm-300")}`}
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
                    <p className="text-sm text-red-500 text-center py-4">
                      {gamesError}
                    </p>
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
                          onClick={() => !isReserved && handleGameToggle(game)}
                          disabled={isReserved}
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
                                  isReserved ? "text-gray-400" : "text-gray-900"
                                }`}
                              >
                                {game.name}
                              </p>
                              {isReserved && (
                                <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold shrink-0">
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
                      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-teal-400 transition-all text-left group"
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
                      className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-gray-400 transition-all text-left group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                        <User size={17} className="text-gray-500" />
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
                    <button
                      onClick={() => {
                        setAuthChoice(null);
                        setAuthentication(false, false);
                      }}
                      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ChevronLeft size={15} /> Back
                    </button>
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
                      leftIcon={<Mail className="w-4 h-4" />}
                    />
                    <p className="text-xs text-gray-400">
                      Confirmation will be sent here. No account needed.
                    </p>
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

                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                  Reservation fee: <strong>$6.00</strong>
                  {data.booking?.selectedGame && (
                    <>
                      {" "}
                      + Game: <strong>$3.00</strong>
                    </>
                  )}
                </div>

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
                  <h3 className="text-xl font-bold text-gray-900">
                    Ready to roll? 🎲
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Review your booking before confirming
                  </p>
                </div>

                <BookingSummary booking={data.booking as any} showPricing />

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Confirmation sent to
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User size={13} className="text-teal-500 shrink-0" />
                    <span className="font-medium">
                      {displayName || "Guest"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={13} className="text-teal-500 shrink-0" />
                    <span>{displayEmail}</span>
                  </div>
                </div>

                {submitError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {submitError}
                  </div>
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
                      {isEditMode ? "Reservation updated!" : "You're all set!"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Confirmation sent to{" "}
                      <span className="font-semibold text-gray-700">
                        {displayEmail}
                      </span>
                    </p>
                  </div>
                </div>
                <BookingSummary booking={data.booking as any} showPricing />
                <p className="text-xs text-gray-400">
                  Need to change plans? You can manage your reservation from your profile.
                </p>
              </div>
            )}
            </div>{/* end step-animate */}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-warm-200 bg-warm-50 px-4 py-4">
            {currentStep < 5 ? (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 [&>button]:w-full">
                    <SecondaryButton
                      label={currentStep === 0 ? "Cancel" : "Back"}
                      onClick={currentStep === 0 ? handleClose : prevStep}
                      disabled={submitting}
                      leftIcon={currentStep > 0 ? <ChevronLeft size={16} aria-hidden="true" /> : undefined}
                      size="small"
                    />
                  </div>
                  <div className="flex-1 [&>button]:w-full">
                    <PrimaryButton
                      label={
                        currentStep === 4
                          ? isEditMode ? "Save changes" : "Confirm reservation"
                          : currentStep === 1 && !selectedGameId
                            ? "Skip for now"
                            : "Continue"
                      }
                      onClick={currentStep === 4 ? handleConfirm : nextStep}
                      disabled={!canProceed}
                      isLoading={submitting}
                      size="sm"
                      rightIcon={currentStep === 1 && !!selectedGameId ? <PartyPopper size={15} /> : undefined}
                    />
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400">
                  Powered by{" "}
                  <span className="text-teal-700 font-semibold">GATORE</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="[&>button]:w-full">
                  <PrimaryButton
                    label="Done"
                    onClick={handleClose}
                    size="sm"
                  />
                </div>
                <p className="text-center text-xs text-gray-400">
                  Powered by{" "}
                  <span className="text-teal-700 font-semibold">GATORE</span>
                </p>
              </div>
            )}
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
