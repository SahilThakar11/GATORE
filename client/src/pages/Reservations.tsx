import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  Gamepad2,
  XCircle,
  Loader2,
  CalendarX2,
  Pencil,
} from "lucide-react";
import { useMyReservations, type Reservation } from "../hooks/useReservations";
import { ReservationModal } from "../components/reservation/ReservationModal";
import { useCafe, useCafeGames } from "../hooks/useCafe";
import { FilterPill } from "../components/ui/FilterPill";
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
        <div className="w-16 h-16 rounded-[8px] bg-warm-200 shrink-0" />
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
      className="bg-warm-100 rounded-[8px] transition-all duration-200 p-5 sm:px-7 sm:py-6"
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
      <div className="flex flex-col sm:flex-row items-start gap-5">
        {/* Café logo */}
        <Link
          to={`/cafe/${cafe.id}`}
          className="w-16 h-16 rounded-[8px] overflow-hidden shrink-0"
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
                <MapPin size={11} aria-hidden="true" style={{ color: "#78716C", flexShrink: 0 }} />
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
              <CalendarDays size={13} aria-hidden="true" />
              <span className="text-xs font-medium">
                {formatDate(reservation.reservationDate)}
              </span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#57534E" }}>
              <Clock size={13} aria-hidden="true" />
              <span className="text-xs">
                {formatTime(reservation.startTime)} –{" "}
                {formatTime(reservation.endTime)}
              </span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#57534E" }}>
              <Users size={13} aria-hidden="true" />
              <span className="text-xs">
                {reservation.partySize} guest
                {reservation.partySize !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Games */}
          {games.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <Gamepad2 size={13} aria-hidden="true" className="text-teal-700 shrink-0" />
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
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
                <button
                  onClick={() => onEdit(reservation)}
                  className="flex items-center gap-1.5 text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors cursor-pointer"
                >
                  <Pencil size={13} aria-hidden="true" /> Edit reservation
                </button>
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
                  className="px-3 py-1.5 rounded-[6px] bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {cancelling === reservation.id ? "Cancelling..." : "Yes, cancel"}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-3 py-1.5 rounded-[6px] border text-xs font-semibold transition-colors cursor-pointer"
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
          <h1 className="text-3xl font-black" style={{ color: "#292524" }}>
            My Reservations
          </h1>
          <p className="text-sm mt-1" style={{ color: "#57534E" }}>
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
                <Link
                  to="/find-a-cafe"
                  className="mt-4 inline-block text-xs text-teal-700 font-medium hover:underline"
                >
                  Browse cafés
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
