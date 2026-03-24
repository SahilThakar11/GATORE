import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  XCircle,
  Loader2,
  CalendarX2,
  Pencil,
} from "lucide-react";
import { useMyReservations, type Reservation } from "../hooks/useReservations";
import { ReservationModal } from "../components/reservation/ReservationModal";
import { useCafe, useCafeGames } from "../hooks/useCafe";
import { FilterPill } from "../components/ui/FilterPill";
import { TextButton } from "../components/ui/TextButton";
import type { Venue, CafeTable, Game } from "../hooks/useReservationFlow";

type TabFilter = "all" | "upcoming" | "past" | "cancelled";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    confirmed: "bg-green-50 text-green-600 border-green-200",
    pending: "bg-amber-50 text-amber-600 border-amber-200",
    cancelled: "bg-red-50 text-red-400 border-red-200",
    completed: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return map[status] || "bg-gray-100 text-gray-500 border-gray-200";
}

function isUpcoming(r: Reservation) {
  return (
    new Date(r.startTime) >= new Date() &&
    !["cancelled", "completed"].includes(r.status)
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ReservationSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading reservation"
      className="bg-warm-100 rounded-[8px] animate-pulse"
      style={{
        padding: "20px 24px",
        boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex gap-4">
        <div className="w-24 h-24 rounded-[8px] bg-warm-200 shrink-0" />
        <div className="flex-1 flex flex-col gap-2.5 justify-center">
          <div className="h-4 bg-warm-200 rounded w-1/2" />
          <div className="h-3 bg-warm-200 rounded w-1/3" />
          <div className="h-3 bg-warm-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function ReservationCard({
  reservation,
  onCancel,
  onEdit,
  cancelling,
}: {
  reservation: Reservation;
  onCancel: (id: number) => void;
  onEdit: (reservation: Reservation) => void;
  cancelling: number | null;
}) {
  const cafe = reservation.table.restaurant;
  const upcoming = isUpcoming(reservation);
  const canEdit = reservation.status === "pending" && upcoming;
  const games = reservation.gameReservations;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden bg-warm-100 rounded-[8px] transition-all duration-200 p-5 sm:px-7 sm:py-6"
      style={{
        border: `1px solid ${hovered ? "#14B8A6" : "#E8D4C4"}`,
        boxShadow: hovered
          ? "0px 8px 24px 0px rgba(0,0,0,0.12)"
          : "0px 2px 8px 0px rgba(0,0,0,0.06)",
        transition: "box-shadow 200ms, border-color 200ms",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Warm gradient overlay on hover */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none transition-opacity duration-200"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, rgba(250, 242, 233, 0.9), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative flex flex-col sm:flex-row items-start gap-5">
        {/* Café logo */}
        <Link
          to={`/cafe/${cafe.id}`}
          className="w-24 h-24 rounded-[8px] overflow-hidden shrink-0"
          style={{
            boxShadow:
              "0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)",
          }}
        >
          {cafe.logoUrl ? (
            <img
              src={cafe.logoUrl}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-black text-lg">
              {cafe.name[0]}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <Link
                to={`/cafe/${cafe.id}`}
                className="text-base font-semibold hover:text-teal-700 transition-colors leading-tight"
                style={{ color: "#292524" }}
              >
                {cafe.name}
              </Link>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin size={13} aria-hidden="true" style={{ color: "#57534E", flexShrink: 0 }} />
                <span className="text-xs" style={{ color: "#78716C" }}>
                  {cafe.address}, {cafe.city}
                </span>
              </div>
            </div>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize shrink-0 ${statusBadge(reservation.status)}`}
            >
              {reservation.status}
            </span>
          </div>

          {/* Details */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-3">
            <div className="flex items-center gap-1.5" style={{ color: "#57534E" }}>
              <CalendarDays size={15} aria-hidden="true" />
              <span className="text-xs font-medium">
                {formatDate(reservation.reservationDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#57534E" }}>
              <Clock size={15} aria-hidden="true" />
              <span className="text-xs">
                {formatTime(reservation.startTime)} –{" "}
                {formatTime(reservation.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#57534E" }}>
              <svg
                aria-hidden="true"
                width={15}
                height={15}
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="16" cy="7" r="4.5" />
                <path d="M13 11.5 Q11 15 11.5 19 L20.5 19 Q21 15 19 11.5 Z" />
                <rect x="9" y="19" width="14" height="2.5" rx="1.5" />
                <path d="M7.5 21.5 L6 27.5 L26 27.5 L24.5 21.5 Z" />
              </svg>
              <span className="text-xs">
                {reservation.partySize} guest
                {reservation.partySize !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Games */}
          {games.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <svg
                aria-hidden="true"
                width={15}
                height={15}
                viewBox="0 0 24 24"
                className="text-teal-700 shrink-0"
              >
                <path fill="currentColor" d="M2.578 8.174a.327.327 0 0 0-.328.326v8c0 .267.143.514.373.648l8.04 4.69a.391.391 0 0 0 .587-.338v-7.75a.99.99 0 0 0-.492-.855L2.742 8.217a.33.33 0 0 0-.164-.043m2.176 2.972a1 1 0 0 1 .389.067c.168.067.27.149.367.234c.192.171.343.372.48.61c.138.238.236.466.287.718c.026.127.046.259.02.438a.89.89 0 0 1-.422.642a.89.89 0 0 1-.768.045a1.2 1.2 0 0 1-.367-.236a2.4 2.4 0 0 1-.48-.607a2.4 2.4 0 0 1-.287-.721a1.2 1.2 0 0 1-.02-.438a.89.89 0 0 1 .422-.642a.8.8 0 0 1 .379-.11m3.25 1.702a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m-3.25 1.5a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m3.25 1.75a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m13.443-7.924a.33.33 0 0 0-.19.043l-8.015 4.678a.99.99 0 0 0-.492.855v7.799a.363.363 0 0 0 .547.312l8.08-4.713a.75.75 0 0 0 .373-.648v-8a.327.327 0 0 0-.303-.326m-5.502 4.707a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066m3.25 1.5a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066M12 1.5a.74.74 0 0 0-.377.102L3.533 6.32a.36.36 0 0 0 0 .623l7.74 4.516a1.44 1.44 0 0 0 1.454 0l7.765-4.531a.343.343 0 0 0 0-.592l-8.115-4.734A.75.75 0 0 0 12 1.5m-.094 4.078h.102c.274 0 .523.03.767.111c.123.041.247.091.39.204a.89.89 0 0 1 .343.685a.89.89 0 0 1-.344.686a1.2 1.2 0 0 1-.389.203a2.4 2.4 0 0 1-.767.111c-.275 0-.523-.03-.768-.111a1.2 1.2 0 0 1-.388-.203a.89.89 0 0 1-.344-.686c0-.338.201-.573.344-.685a1.2 1.2 0 0 1 .388-.204a2.3 2.3 0 0 1 .666-.11" strokeWidth="0.4" stroke="currentColor" />
              </svg>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-[8px]"
                style={{ backgroundColor: "#E8D4C4", color: "#292524" }}
              >
                {games.map((g) => g.game.name).join(", ")}
              </span>
            </div>
          )}

          {/* Special requests */}
          {reservation.specialRequests && (
            <p className="text-xs italic mt-2" style={{ color: "#78716C" }}>
              "{reservation.specialRequests}"
            </p>
          )}

          {/* Action buttons */}
          {upcoming && (
            <div className="mt-3 flex items-center gap-4">
              {canEdit && (
                <TextButton
                  label="Edit reservation"
                  size="xs"
                  leftIcon={<Pencil size={12} aria-hidden="true" />}
                  onClick={() => onEdit(reservation)}
                />
              )}
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={cancelling === reservation.id}
                className="flex items-center gap-1.5 text-xs font-medium text-red-400 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelling === reservation.id ? (
                  <>
                    <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle size={13} aria-hidden="true" /> Cancel reservation
                  </>
                )}
              </button>
            </div>
          )}

          {/* Cancel confirmation */}
          {showCancelConfirm && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-[8px] p-4">
              <p className="text-sm font-semibold" style={{ color: "#292524" }}>
                Cancel this reservation?
              </p>
              <p className="text-xs mt-1" style={{ color: "#57534E" }}>
                This action cannot be undone. Your reservation at{" "}
                <span className="font-medium">{cafe.name}</span> will be
                cancelled.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={() => {
                    onCancel(reservation.id);
                    setShowCancelConfirm(false);
                  }}
                  disabled={cancelling === reservation.id}
                  className="px-3 py-1.5 rounded-[8px] bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {cancelling === reservation.id ? "Cancelling..." : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 rounded-[8px] border text-xs font-semibold transition-colors cursor-pointer"
                  style={{
                    borderColor: "#E8D4C4",
                    backgroundColor: "#FFFBF7",
                    color: "#57534E",
                  }}
                >
                  Keep reservation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReservationsPage() {
  const { reservations, loading, error, cancelling, cancelReservation } =
    useMyReservations();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");

  // ─── Edit modal state ───────────────────────────────────────────────────────
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [editCafeId, setEditCafeId] = useState<number | null>(null);

  const { cafe: editCafe } = useCafe(editCafeId ?? undefined);
  const { games: editDbGames } = useCafeGames(editCafeId ?? undefined);

  const editBggIds = editDbGames.map((g) => g.bggId);
  const editBggIdToDbId: Record<string, number> = {};
  editDbGames.forEach((g) => {
    editBggIdToDbId[g.bggId] = g.id;
  });

  const editVenue: Venue | null =
    editCafe && editingReservation
      ? {
          id: editCafe.id,
          name: editCafe.name,
          logo: editCafe.logoUrl ?? "",
          address: editCafe.address,
          city: editCafe.city,
          rating: editCafe.rating,
          reviewCount: editCafe.reviewCount,
          poster: "/images/hero_wood_texture.png",
        }
      : null;

  const editProps = editingReservation
    ? (() => {
        const st = new Date(editingReservation.startTime);
        const timeLabel = st.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
        const dateStr = editingReservation.reservationDate.slice(0, 10);
        const game = editingReservation.gameReservations[0];
        const selectedGame: Game | undefined = game
          ? {
              id: String(game.game.id),
              dbId: game.game.id,
              name: game.game.name,
              image: game.game.imageUrl ?? "",
              complexity: "Medium",
              players: "",
              duration: "",
              price: 3,
              tags: [],
            }
          : undefined;
        return {
          id: editingReservation.id,
          date: dateStr,
          time: timeLabel,
          partySize: editingReservation.partySize,
          tableId: editingReservation.table.id,
          selectedGame,
        };
      })()
    : undefined;

  const handleEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setEditCafeId(reservation.table.restaurant.id);
  };

  const handleEditClose = () => {
    setEditingReservation(null);
    setEditCafeId(null);
    window.location.reload();
  };

  const filtered = reservations.filter((r) => {
    if (activeTab === "upcoming") return isUpcoming(r);
    if (activeTab === "past")
      return (
        new Date(r.startTime) < new Date() && !["cancelled"].includes(r.status)
      );
    if (activeTab === "cancelled") return r.status === "cancelled";
    return true;
  });

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="bg-warm-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-7 pt-10 pb-10">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-neutral-800">
            My Reservations
          </h1>
          <p className="text-sm mt-1 text-neutral-600">
            View and manage your upcoming and past bookings
          </p>
        </div>

        {/* Tab filters */}
        <div className="flex gap-2 flex-wrap mb-5">
          {tabs.map((tab) => (
            <FilterPill
              key={tab.key}
              label={tab.label}
              active={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>

        {/* Count */}
        {!loading && !error && (
          <p className="text-xs mb-4" style={{ color: "#57534E" }}>
            {filtered.length} reservation{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10" style={{ color: "#F87171" }}>
            <p className="text-sm font-medium">Failed to load reservations</p>
            <p className="text-xs mt-1" style={{ color: "#57534E" }}>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[...Array(3)].map((_, i) => (
              <ReservationSkeleton key={i} />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              <div className="flex flex-col gap-4">
                {filtered.map((r) => (
                  <ReservationCard
                    key={r.id}
                    reservation={r}
                    onCancel={cancelReservation}
                    onEdit={handleEdit}
                    cancelling={cancelling}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16" style={{ color: "#A8A29E" }}>
                <CalendarX2
                  size={32}
                  className="mx-auto mb-3"
                  style={{ opacity: 0.3 }}
                  aria-hidden="true"
                />
                <p className="text-sm font-semibold" style={{ color: "#57534E" }}>
                  No reservations found
                </p>
                <p className="text-xs mt-1">
                  {activeTab === "all"
                    ? "You haven't made any reservations yet"
                    : `No ${activeTab} reservations`}
                </p>
                <Link to="/find-a-cafe" className="mt-4" tabIndex={-1}>
                  <TextButton label="Browse cafés" size="small" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit reservation modal */}
      {editVenue && editProps && (
        <ReservationModal
          isOpen={!!editingReservation}
          onClose={handleEditClose}
          venue={editVenue}
          cafeBggIds={editBggIds}
          bggIdToDbId={editBggIdToDbId}
          cafeTables={(editCafe?.tables ?? []) as CafeTable[]}
          editReservation={editProps}
        />
      )}
    </div>
  );
}
