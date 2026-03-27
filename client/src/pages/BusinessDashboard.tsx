import { useState, useId } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  SlidersHorizontal,
  FilterX,
  Plus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  LogIn,
  Flag,
  MessageSquare,
  Users,
  Clock,
  CalendarDays,
  TrendingUp,
  Activity,
  Loader2,
  Calendar,
  Mail,
  Hash,
  XCircle,
  Trash2,
  Dice5,
  Edit3,
  Send,
  Pencil,
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import NewReservationModal from "../components/dashboard/NewReservationModal";
import EditReservationModal from "../components/dashboard/EditReservationModal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Dropdown } from "../components/ui/Dropdown";
import { TextButton } from "../components/ui/TextButton";
import {
  useBusinessDashboard,
  type DashboardReservation,
} from "../hooks/useBusinessDashboard";

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function parseBookingNotes(notes: string | null) {
  if (!notes) return { source: null, phone: null };
  const source = notes.match(/Source:\s*([^,]+)/)?.[1]?.trim() ?? null;
  const phone = notes.match(/Phone:\s*(.+)/)?.[1]?.trim() ?? null;
  return { source, phone };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#f59e0b",
  "#8b5cf6",
  "#f97316",
  "#10b981",
  "#14b8a6",
  "#3b82f6",
];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ═══════════════════════════════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({
  label,
  value,
  extra,
  accent,
  icon: Icon,
  progress,
}: {
  label: string;
  value: string;
  extra: string;
  accent: string;
  icon: React.ElementType;
  progress?: number;
}) {
  return (
    <div className="bg-white border border-warm-200 rounded-2xl p-5 flex flex-col gap-3 min-w-0 flex-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + "15" }}
        >
          <Icon size={16} style={{ color: accent }} aria-hidden="true" />
        </div>
        <span className="text-xs font-medium text-neutral-600">{label}</span>
      </div>

      <p className="text-3xl font-extrabold text-neutral-800 leading-none">
        {value}
      </p>

      {progress !== undefined && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <span>Tables occupied</span>
            <span className="font-semibold">{value}</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
            className="w-full h-2 bg-warm-100 rounded-full overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%`, backgroundColor: accent }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {progress === undefined && (
        <div className="h-6 flex items-end gap-[2px]" aria-hidden="true">
          {[40, 60, 35, 70, 50, 80, 65, 90, 55, 75].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-t-sm"
              style={{ height: `${h}%`, backgroundColor: accent + "25" }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-600 leading-tight">{extra}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
      <span
        className="text-xs font-semibold text-neutral-600"
        aria-hidden="true"
      >
        {label}
      </span>
      <Dropdown
        trigger="label"
        triggerLabel={value}
        triggerAriaLabel={`${label}: ${value}`}
        fullWidth
        items={options.map((opt) => ({
          label: opt,
          onClick: () => onChange(opt),
        }))}
        triggerClassName="bg-white !text-sm"
      />
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case "completed":
      return {
        bg: "#D1FAE5",
        border: "#059669",
        dot: "#059669",
        badgeClass: "bg-white/80 text-emerald-700 border-emerald-300",
      };
    case "seated":
      return {
        bg: "#b4fced",
        border: "#0D9488",
        dot: "#0D9488",
        badgeClass: "bg-white/80 text-teal-700 border-teal-300",
      };
    default:
      return {
        bg: "#DBEAFE",
        border: "#3B82F6",
        dot: "#3B82F6",
        badgeClass: "bg-white/80 text-blue-700 border-blue-300",
      };
  }
}

function ReservationRow({
  r,
  onSaveNotes,
  onUpdateStatus,
  onModify,
  onDelete,
}: {
  r: DashboardReservation;
  onSaveNotes: (id: number, status: string, notes: string) => Promise<void>;
  onUpdateStatus: (id: number, status: string) => Promise<void>;
  onModify: (r: DashboardReservation) => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const expandedId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState(r.specialRequests ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const gameName = r.gameReservations?.[0]?.game?.name;
  const statusStyle = getStatusStyle(r.status);
  const { source, phone } = parseBookingNotes(r.notes);
  const duration =
    (new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) /
    (1000 * 60 * 60);

  return (
    <div
      role="listitem"
      className="rounded-xl overflow-hidden transition-shadow duration-150 hover:shadow-sm"
      style={{ border: `1.5px solid ${statusStyle.border}` }}
    >
      {/* ── Header row ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
        style={{ backgroundColor: statusStyle.bg }}
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
        aria-controls={expandedId}
        aria-label={`${r.user.name} reservation — ${isOpen ? "collapse" : "expand"} details`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen((v) => !v);
          }
        }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: statusStyle.dot }}
          aria-hidden="true"
        />

        <div className="w-20 shrink-0">
          <p className="text-sm font-bold text-neutral-800">
            {formatTime(r.startTime)}
          </p>
          <p className="text-xs text-neutral-700">{r.table.name}</p>
        </div>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ backgroundColor: getAvatarColor(r.user.name) }}
          aria-hidden="true"
        >
          {getInitials(r.user.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800 truncate">
            {r.user.name}
          </p>
          <p className="text-xs text-neutral-700">
            {gameName ?? <span className="italic">No game selected</span>}
          </p>
        </div>

        <div
          className="flex items-center gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {r.status === "confirmed" && (
            <CheckCircle2
              size={16}
              className="text-teal-500"
              aria-hidden="true"
            />
          )}
          {r.specialRequests && (
            <>
              <MessageSquare
                size={14}
                className="text-neutral-600"
                aria-hidden="true"
              />
              <span className="sr-only">Has special requests</span>
            </>
          )}
          <div className="flex items-center gap-1 text-neutral-700">
            <Users size={14} aria-hidden="true" />
            <span className="text-sm font-medium">{r.partySize}</span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyle.badgeClass}`}
          >
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
          {(r.status === "confirmed" || r.status === "pending") && (
            <span onClick={(e) => e.stopPropagation()}>
              <PrimaryButton
                label="Check In"
                size="xs"
                isLoading={updatingStatus}
                rightIcon={<LogIn size={12} aria-hidden="true" />}
                onClick={async () => {
                  setUpdatingStatus(true);
                  await onUpdateStatus(r.id, "seated");
                  setUpdatingStatus(false);
                }}
              />
            </span>
          )}
          {r.status === "seated" && (
            <span onClick={(e) => e.stopPropagation()}>
              <PrimaryButton
                label="Complete"
                size="xs"
                isLoading={updatingStatus}
                rightIcon={<Flag size={12} aria-hidden="true" />}
                onClick={async () => {
                  setUpdatingStatus(true);
                  await onUpdateStatus(r.id, "completed");
                  setUpdatingStatus(false);
                }}
              />
            </span>
          )}
        </div>

        <span className="text-neutral-600 shrink-0" aria-hidden="true">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* ── Expanded section ── */}
      <div
        id={expandedId}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className="border-t px-5 py-5"
          style={{
            borderColor: statusStyle.border,
            backgroundColor: statusStyle.bg,
          }}
        >
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT — Reservation Details */}
            <div>
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">
                Reservation Details
              </p>
              <div className="space-y-2 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  <span>
                    {new Date(r.reservationDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  <span>
                    {formatTime(r.startTime)}{" "}
                    <span className="text-neutral-600">
                      ({duration.toFixed(1)} hours)
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Dice5
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  {gameName ? (
                    <span>{gameName}</span>
                  ) : (
                    <span className="text-neutral-600 italic">
                      No game selected
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT — Contact + Booking Info */}
            <div>
              <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-3">
                Contact Information
              </p>
              <div className="space-y-2 text-sm text-neutral-700">
                <div className="flex items-center gap-2">
                  <Mail
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  <span>{r.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  {phone ? (
                    <span>{phone}</span>
                  ) : (
                    <span className="text-neutral-600 italic">
                      No phone on file
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-5">
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  Booking Info
                </p>
                <div className="space-y-1.5 text-sm text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Hash
                      size={14}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    <span>Reservation ID: {r.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash
                      size={14}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    <span>Customer ID: {r.user.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash
                      size={14}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    <span>
                      Type:{" "}
                      {source ?? (
                        <span className="text-neutral-600 italic">—</span>
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Booked:{" "}
                    {new Date(r.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-neutral-200 p-4 mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare
                  size={14}
                  className="text-neutral-500"
                  aria-hidden="true"
                />
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                  Notes
                </p>
              </div>
              {!editingNotes && (
                <button
                  type="button"
                  aria-label="Edit notes"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingNotes(true);
                  }}
                  className="text-neutral-500 hover:text-teal-600 transition-colors cursor-pointer p-1 rounded hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-1"
                >
                  <Pencil size={13} aria-hidden="true" />
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  rows={3}
                  autoFocus
                  aria-label="Reservation notes"
                  className="w-full px-3 py-2 border border-warm-200 rounded-lg text-sm text-neutral-700 placeholder:text-neutral-500 bg-warm-50 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Add notes about this reservation..."
                />
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setNotesText(r.specialRequests ?? "");
                      setEditingNotes(false);
                    }}
                    className="text-xs text-neutral-600 hover:text-neutral-800 px-3 py-1.5 rounded-lg hover:bg-warm-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={async () => {
                      setSavingNotes(true);
                      await onSaveNotes(r.id, r.status, notesText);
                      setSavingNotes(false);
                      setEditingNotes(false);
                    }}
                    className="text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-1"
                  >
                    {savingNotes ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                {notesText || (
                  <span className="text-neutral-600 italic">
                    No notes added yet
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-2">
              <SecondaryButton
                label="Modify"
                size="xs"
                leftIcon={<Edit3 size={13} aria-hidden="true" />}
                onClick={() => onModify(r)}
              />
              <SecondaryButton
                label="Send Reminder"
                size="xs"
                leftIcon={<Send size={13} aria-hidden="true" />}
              />
            </div>
            <div className="flex items-center gap-2">
              {r.status === "completed" ? (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={async () => {
                    setUpdatingStatus(true);
                    await onDelete(r.id);
                    setUpdatingStatus(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border border-red-600 text-red-700 bg-white hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-red-700 focus-visible:outline-offset-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Trash2 size={13} aria-hidden="true" />
                  {updatingStatus ? "Deleting…" : "Delete"}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={async () => {
                    setUpdatingStatus(true);
                    await onUpdateStatus(r.id, "cancelled");
                    setUpdatingStatus(false);
                  }}
                  className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border border-red-600 text-red-700 bg-white hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-red-700 focus-visible:outline-offset-1"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  <XCircle size={13} aria-hidden="true" />
                  {updatingStatus ? "Cancelling…" : "Cancel"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const [showFilter, setShowFilter] = useState(true);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [editingReservation, setEditingReservation] =
    useState<DashboardReservation | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTable, setFilterTable] = useState("All");
  const [filterGuests, setFilterGuests] = useState("Any");
  const [filterSource, setFilterSource] = useState("All");
  const [filterTime, setFilterTime] = useState("All Day");

  const {
    stats,
    profile,
    loading,
    createWalkIn,
    updateReservation,
    updateReservationNotes,
    updateReservationStatus,
    deleteReservation,
  } = useBusinessDashboard();

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const occupancy = stats?.occupancy ?? { occupied: 0, total: 0 };
  const todayRes = stats?.todayReservations ?? { total: 0, pending: 0 };
  const reservations = stats?.reservations ?? [];

  const filteredReservations = reservations.filter((r) => {
    if (
      filterStatus !== "All" &&
      r.status.toLowerCase() !== filterStatus.toLowerCase()
    )
      return false;
    if (filterTable !== "All" && r.table.name !== filterTable) return false;
    if (filterGuests !== "Any") {
      if (filterGuests === "1–2" && r.partySize > 2) return false;
      if (filterGuests === "3–4" && (r.partySize < 3 || r.partySize > 4))
        return false;
      if (filterGuests === "5+" && r.partySize < 5) return false;
    }
    if (filterSource !== "All") {
      const { source } = parseBookingNotes(r.notes);
      if (!source || source.toLowerCase() !== filterSource.toLowerCase())
        return false;
    }
    if (filterTime !== "All Day") {
      const hour = new Date(r.startTime).getHours();
      if (filterTime === "Morning" && hour >= 12) return false;
      if (filterTime === "Afternoon" && (hour < 12 || hour >= 17)) return false;
      if (filterTime === "Evening" && hour < 17) return false;
    }
    return true;
  });

  const filtersActive =
    filterStatus !== "All" ||
    filterTable !== "All" ||
    filterGuests !== "Any" ||
    filterSource !== "All" ||
    filterTime !== "All Day";

  return (
    <BusinessLayout>
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* ── Loading ────────────────────────────────────────── */}
        {loading && (
          <div
            className="flex items-center justify-center py-20"
            role="status"
            aria-label="Loading dashboard"
          >
            <Loader2
              size={32}
              className="animate-spin text-teal-600"
              aria-hidden="true"
            />
          </div>
        )}

        {!loading && (
          <>
            {/* ── Header ───────────────────────────────────────────── */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-2xl font-bold text-neutral-800">
                  {dateStr}
                </h1>
                <div className="flex items-center gap-5 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Clock
                      size={13}
                      className="text-teal-600"
                      aria-hidden="true"
                    />
                    Peak hours: 6–9 PM
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Activity
                      size={13}
                      className="text-amber-500"
                      aria-hidden="true"
                    />
                    {todayRes.pending} reservations pending confirmation
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <TrendingUp
                      size={13}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    {occupancy.total - occupancy.occupied} tables available
                  </span>
                </div>
              </div>
              <PrimaryButton
                label="Quick Book"
                onClick={() => setShowNewReservation(true)}
                rightIcon={<Plus size={16} aria-hidden="true" />}
              />
            </div>

            {/* ── Stat Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <StatCard
                label="Current Occupancy"
                value={`${occupancy.occupied}/${occupancy.total}`}
                extra={`${occupancy.total - occupancy.occupied} tables available`}
                accent="#1c5fb1"
                icon={CheckCircle2}
                progress={
                  occupancy.total > 0 ? occupancy.occupied / occupancy.total : 0
                }
              />
              <StatCard
                label="Today's Reservations"
                value={String(todayRes.total)}
                extra={`${todayRes.pending} pending confirmation`}
                accent="#0d9488"
                icon={CalendarDays}
              />
              <StatCard
                label="Total Customers"
                value={String(stats?.totalCustomersToday ?? 0)}
                extra={`${stats?.newCustomersThisWeek ?? 0} new this week`}
                accent="#5307af"
                icon={Users}
              />
              <StatCard
                label="Avg. Session Time"
                value={`${((stats?.avgSessionMinutes ?? 150) / 60).toFixed(1)}h`}
                extra="Based on last 30 days"
                accent="#1e7e21"
                icon={Clock}
              />
            </div>

            {/* ── Upcoming Reservations ─────────────────────────────── */}
            <section
              aria-labelledby="reservations-heading"
              className="bg-white border border-warm-200 rounded-2xl shadow-sm mt-8 p-6"
            >
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2
                    id="reservations-heading"
                    className="text-lg font-bold text-neutral-800"
                  >
                    Upcoming Reservations
                  </h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    Next reservations for today
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <TextButton
                    label="Search"
                    size="small"
                    leftIcon={<Search size={15} aria-hidden="true" />}
                  />
                  <TextButton
                    label="Filter"
                    size="small"
                    aria-expanded={showFilter}
                    leftIcon={
                      <SlidersHorizontal size={15} aria-hidden="true" />
                    }
                    rightIcon={
                      <ChevronDown
                        size={13}
                        aria-hidden="true"
                        style={{
                          transition: "transform 200ms",
                          transform: showFilter
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    }
                    onClick={() => setShowFilter((v) => !v)}
                  />
                  <SecondaryButton
                    label="New Reservation"
                    onClick={() => setShowNewReservation(true)}
                    leftIcon={<Plus size={15} aria-hidden="true" />}
                    size="small"
                  />
                </div>
              </div>

              {showFilter && (
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 mt-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                      Filter Reservations
                    </span>
                    <button
                      onClick={() => {
                        setFilterStatus("All");
                        setFilterTable("All");
                        setFilterGuests("Any");
                        setFilterSource("All");
                        setFilterTime("All Day");
                      }}
                      aria-label="Clear filters"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                    >
                      <FilterX size={14} aria-hidden="true" />
                      Clear filters
                    </button>
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <FilterSelect
                      label="Status"
                      value={filterStatus}
                      onChange={setFilterStatus}
                      options={[
                        "All",
                        "Confirmed",
                        "Pending",
                        "Seated",
                        "Completed",
                        "Cancelled",
                      ]}
                    />
                    <FilterSelect
                      label="Table"
                      value={filterTable}
                      onChange={setFilterTable}
                      options={[
                        "All",
                        ...Array.from(
                          new Set(reservations.map((r) => r.table.name)),
                        ),
                      ]}
                    />
                    <FilterSelect
                      label="Guests"
                      value={filterGuests}
                      onChange={setFilterGuests}
                      options={["Any", "1–2", "3–4", "5+"]}
                    />
                    <FilterSelect
                      label="Source"
                      value={filterSource}
                      onChange={setFilterSource}
                      options={["All", "Walk-in", "Phone", "Online", "Email"]}
                    />
                    <FilterSelect
                      label="Time"
                      value={filterTime}
                      onChange={setFilterTime}
                      options={["All Day", "Morning", "Afternoon", "Evening"]}
                    />
                  </div>
                </div>
              )}

              <div role="list" className="flex flex-col gap-3 mt-2">
                {filteredReservations.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-8">
                    {filtersActive
                      ? "No reservations match the current filters."
                      : "No reservations for today yet."}
                  </p>
                )}
                {filteredReservations.map((r) => (
                  <ReservationRow
                    key={r.id}
                    r={r}
                    onSaveNotes={async (id, status, notes) => {
                      await updateReservationNotes(id, status, notes);
                    }}
                    onUpdateStatus={async (id, status) => {
                      await updateReservationStatus(id, status);
                    }}
                    onModify={(res) => setEditingReservation(res)}
                    onDelete={async (id) => {
                      await deleteReservation(id);
                    }}
                  />
                ))}
              </div>

              {reservations.length > 0 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-warm-200">
                  <p className="text-xs text-neutral-600">
                    {filtersActive
                      ? `Showing ${filteredReservations.length} of ${reservations.length} reservations`
                      : `Showing ${reservations.length} of ${todayRes.total} reservations`}
                  </p>
                  <div className="flex items-center gap-3">
                    {filtersActive && (
                      <TextButton
                        label="Clear filters"
                        size="xs"
                        onClick={() => {
                          setFilterStatus("All");
                          setFilterTable("All");
                          setFilterGuests("Any");
                          setFilterSource("All");
                          setFilterTime("All Day");
                        }}
                      />
                    )}
                    <TextButton
                      label="View all reservations →"
                      size="xs"
                      onClick={() => navigate("/dashboard/reservations")}
                    />
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservation}
        onClose={() => setShowNewReservation(false)}
        tables={profile?.tables ?? []}
        games={(profile?.restaurantGames ?? []).map((rg: any) => ({
          id: rg.game.id,
          name: rg.game.name,
        }))}
        onCreateWalkIn={async (data) => {
          const result = await createWalkIn(data);
          if (result.success) setShowNewReservation(false);
          return result;
        }}
      />

      {editingReservation && (
        <EditReservationModal
          isOpen={!!editingReservation}
          onClose={() => setEditingReservation(null)}
          reservation={editingReservation}
          tables={profile?.tables ?? []}
          games={(profile?.restaurantGames ?? []).map((rg: any) => ({
            id: rg.game.id,
            name: rg.game.name,
          }))}
          onSave={async (id, data) => {
            const result = await updateReservation(id, data);
            if (result.success) setEditingReservation(null);
            return result;
          }}
        />
      )}
    </BusinessLayout>
  );
}
