import React, { useState, useEffect } from "react";
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
    <div className="flex items-center justify-center gap-0 px-6 py-3 bg-[#faf8f4] border-b border-gray-100">
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
                className={`h-0.5 w-8 mb-4 mx-1 transition-all ${idx < currentStep ? "bg-teal-500" : "bg-gray-200"}`}
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

        <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
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
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-teal-700 border-2 border-white/30 shrink-0 flex items-center justify-center">
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
                  {isEditMode ? "Edit reservation at" : "Reserve at"}
                </p>
                <h2 className="text-base font-black text-white truncate">
                  {venue.name}
                </h2>
                <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5">
                  <MapPin size={10} />
                  {venue.address}, {venue.city}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="relative w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={15} className="text-white" />
            </button>
          </div>

          {/* ── Progress bar ── */}
          <ProgressBar currentStep={currentStep} skipPayment={isEditMode} />
          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto">
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
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime(""); // clear time — new date may have different slots
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  leftIcon={<Calendar className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Time
                  </label>
                  {!date ? (
                    <p className="text-sm text-gray-400">
                      Select a date to see available times
                    </p>
                  ) : availLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="h-10 bg-gray-100 rounded-lg animate-pulse"
                          style={{ animationDelay: `${i * 60}ms` }}
                        />
                      ))}
                    </div>
                  ) : allTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {allTimeSlots.map((slot) => (
                        <button
                          key={slot.label}
                          onClick={() => slot.available && setTime(slot.label)}
                          disabled={!slot.available}
                          className={`flex items-center justify-center gap-1 text-xs font-semibold px-2 py-2.5 rounded-lg border transition-all ${
                            !slot.available
                              ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through"
                              : time === slot.label
                                ? "bg-teal-600 border-teal-600 text-white shadow-sm"
                                : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                          }`}
                        >
                          <Clock size={10} />
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No available time slots for this date
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Party size
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setPartySize((p) => Math.max(1, p - 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700 transition-all font-bold text-lg flex items-center justify-center"
                    >
                      −
                    </button>
                    <div className="flex items-center gap-1.5">
                      {[...Array(Math.min(partySize, 6))].map((_, i) => (
                        <Users key={i} size={16} className="text-teal-600" />
                      ))}
                      {partySize > 6 && (
                        <span className="text-sm font-bold text-teal-700">
                          +{partySize - 6}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setPartySize((p) => Math.min(12, p + 1))}
                      className="w-9 h-9 rounded-full border-2 border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-700 transition-all font-bold text-lg flex items-center justify-center"
                    >
                      +
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      {partySize} {partySize === 1 ? "guest" : "guests"}
                    </span>
                  </div>
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
                        className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-full border transition-all ${
                          active
                            ? "bg-teal-600 border-teal-600 text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                        }`}
                      >
                        <span className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <span
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${i < dots ? (active ? "bg-white" : "bg-amber-700") : "bg-gray-300"}`}
                            />
                          ))}
                        </span>
                        {level}
                      </button>
                    );
                  })}
                </div>

                {/* Game list */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
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
                          className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                            isReserved
                              ? "border-red-200 bg-red-50 opacity-70 cursor-not-allowed"
                              : isSelected
                                ? "border-teal-500 bg-teal-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <img
                            src={game.image}
                            alt={game.name}
                            className={`w-16 h-16 rounded-lg object-cover shrink-0 ${
                              isReserved ? "grayscale" : ""
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p
                                className={`font-semibold text-sm leading-tight ${
                                  isReserved ? "text-gray-400" : "text-gray-900"
                                }`}
                              >
                                {game.name}
                              </p>
                              <div className="flex items-center gap-1 shrink-0">
                                {isReserved ? (
                                  <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                                    Reserved
                                  </span>
                                ) : (
                                  <>
                                    {[...Array(3)].map((_, i) => (
                                      <span
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full ${i < dots ? "bg-amber-700" : "bg-gray-200"}`}
                                      />
                                    ))}
                                    <span className="text-xs text-gray-400 ml-1">
                                      {game.complexity}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5">
                              <span className="flex items-center gap-1">
                                <Users size={10} />
                                {game.players}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={10} />
                                {game.duration} min
                              </span>
                            </div>
                            <div className="flex gap-1.5 flex-wrap">
                              {game.tags.map((t) => (
                                <span
                                  key={t}
                                  className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2 py-0.5 rounded-full font-medium"
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

                <button
                  onClick={() => {
                    setSelectedGameId(undefined);
                    selectGame(undefined);
                    nextStep();
                  }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors"
                >
                  Skip — I'll browse when I arrive
                </button>
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
                <div className="pt-2 space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100">
                    <CheckCircle size={34} className="text-teal-600" />
                  </div>
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
                <BookingSummary booking={data.booking as any} showPricing />
                <p className="text-xs text-gray-400">
                  Need to cancel? Contact the café directly.
                </p>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="border-t border-gray-100 bg-white px-6 py-4">
            {currentStep < 5 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={currentStep === 0 ? handleClose : prevStep}
                    disabled={submitting}
                    className="px-4 py-3 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-gray-300 transition-all disabled:opacity-50"
                  >
                    {currentStep === 0 ? "Cancel" : "Back"}
                  </button>
                  <button
                    onClick={currentStep === 4 ? handleConfirm : nextStep}
                    disabled={!canProceed || submitting}
                    className="px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-white transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        Confirming…
                      </>
                    ) : currentStep === 4 ? (
                      isEditMode ? (
                        "Save changes"
                      ) : (
                        "Confirm reservation"
                      )
                    ) : (
                      "Continue"
                    )}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400">
                  Powered by{" "}
                  <span className="text-teal-700 font-semibold">GATORE</span>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-sm font-bold text-white transition-all"
                >
                  Done
                </button>
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
