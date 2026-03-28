import { useState, useEffect } from "react";
import {
  MessageSquare,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Dice5,
  Mail,
  Phone,
  Hash,
  History,
  Edit3,
  Loader2,
  Send,
  XCircle,
  Pencil,
  LogIn,
  Flag,
  Search,
  SlidersHorizontal,
  FilterX,
} from "lucide-react";
import { TextButton } from "../components/ui/TextButton";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import FloorPlan from "../components/business/FloorPlan";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { Dropdown } from "../components/ui/Dropdown";
import NewReservationModal from "../components/dashboard/NewReservationModal";
import {
  useBusinessDashboard,
  type DashboardReservation,
} from "../hooks/useBusinessDashboard";

/* ═══════════════════════════════════════════════════════════════════
   STATUS HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function getTimelineBlockStyle(status: string): { background: string; border: string; color: string } {
  switch (status) {
    case "completed": return { background: "#D1FAE5", border: "1.5px solid #059669", color: "#065f46" };
    case "seated":    return { background: "#0f766e", border: "none",                color: "#ffffff" };
    case "cancelled": return { background: "#f5f5f4", border: "1.5px solid #a8a29e", color: "#292524" };
    default:          return { background: "#1d4ed8", border: "none",                color: "#ffffff" }; // confirmed
  }
}

const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  confirmed: {
    bg: "bg-white/80",
    text: "text-blue-700",
    border: "border-blue-300",
  },
  seated: {
    bg: "bg-white/80",
    text: "text-teal-700",
    border: "border-teal-300",
  },
  completed: {
    bg: "bg-white/80",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  cancelled: {
    bg: "bg-white/80",
    text: "text-neutral-600",
    border: "border-neutral-300",
  },
};

const AVATAR_COLORS = [
  "#f59e0b",
  "#8b5cf6",
  "#f97316",
  "#10b981",
  "#14b8a6",
  "#3b82f6",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime12(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDurationHours(start: string, end: string): number {
  return (
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)
  );
}

function getHourFloat(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusCardStyle(status: string): { bg: string; border: string } {
  switch (status) {
    case "completed":
      return { bg: "#D1FAE5", border: "#059669" };
    case "cancelled":
      return { bg: "#f5f5f4", border: "#a8a29e" };
    case "seated":
      return { bg: "#b4fced", border: "#0D9488" };
    default:
      return { bg: "#DBEAFE", border: "#3B82F6" };
  }
}

/* ═══════════════════════════════════════════════════════════════════
   LEGEND ITEM
   ═══════════════════════════════════════════════════════════════════ */

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`${color} w-2.5 h-2.5 rounded-full`}
        aria-hidden="true"
      />
      <span className="text-xs text-neutral-600">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIMELINE VIEW
   ═══════════════════════════════════════════════════════════════════ */

function TimelineView({
  reservations,
}: {
  reservations: DashboardReservation[];
}) {
  const startHour = 17;
  const endHour = 23;
  const hourSlots = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );

  const tableMap = new Map<string, DashboardReservation[]>();
  reservations.forEach((r) => {
    const key = r.table.name;
    if (!tableMap.has(key)) tableMap.set(key, []);
    tableMap.get(key)!.push(r);
  });
  const tables = Array.from(tableMap.keys()).sort();

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-sm p-6 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-neutral-800">Timeline View</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Visualize reservation timing and table overlaps
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-blue-500" label="Confirmed" />
          <LegendItem color="bg-teal-600" label="Seated" />
          <LegendItem color="bg-emerald-600" label="Completed" />
          <LegendItem color="bg-neutral-400" label="Cancelled" />
        </div>
      </div>

      <div className="min-w-max">
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          <div className="flex">
            {hourSlots.map((hour) => (
              <div
                key={hour}
                className="w-32 border-l border-warm-200 px-2 py-2 text-center text-xs font-medium text-neutral-600"
              >
                {`${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-warm-100">
          {tables.map((tableName) => {
            const tableRes = tableMap.get(tableName) || [];
            return (
              <div
                key={tableName}
                className="flex bg-warm-50/50 hover:bg-warm-50 transition-colors"
              >
                <div className="w-24 flex-shrink-0 py-4 px-4 font-semibold text-neutral-700 text-sm bg-white border-r border-warm-200 flex items-center">
                  {tableName}
                </div>
                <div className="flex relative">
                  {hourSlots.map((hour) => (
                    <div
                      key={hour}
                      className="w-32 border-l border-warm-100 h-14"
                    />
                  ))}
                  {tableRes.map((res) => {
                    const resStart = getHourFloat(res.startTime);
                    const duration = getDurationHours(
                      res.startTime,
                      res.endTime,
                    );
                    const leftPx = (resStart - startHour) * 128;
                    const widthPx = duration * 128;
                    if (leftPx < 0 || resStart >= endHour) return null;
                    return (
                      <div
                        key={res.id}
                        className="absolute top-1 bottom-1 rounded-lg cursor-pointer hover:shadow-lg transition-all"
                        style={{
                          left: `${leftPx}px`,
                          width: `${Math.max(widthPx, 48)}px`,
                        }}
                        aria-label={`${res.user.name}, party of ${res.partySize}, ${formatTime12(res.startTime)}, ${statusLabel(res.status)}`}
                      >
                        <div
                          className="rounded-lg px-2.5 py-1.5 h-full flex flex-col justify-between overflow-hidden"
                          style={getTimelineBlockStyle(res.status)}
                        >
                          <p className="font-semibold text-sm leading-tight truncate">
                            {res.user.name}
                          </p>
                          <div className="flex items-center gap-2 text-xs opacity-80">
                            <Users size={11} aria-hidden="true" />
                            <span>{res.partySize}</span>
                            <span>·</span>
                            <span>{formatTime12(res.startTime)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {tables.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-6">
              No reservations to display
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOOR PLAN VIEW
   ═══════════════════════════════════════════════════════════════════ */

const TIME_FILTER_OPTIONS = ["All Times", "Lunch", "Dinner"];

const OOS_STORAGE_KEY = "gatore_floorplan_oos";

function loadOosTables(): number[] {
  try {
    const saved = localStorage.getItem(OOS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveOosTables(ids: number[]) {
  try {
    localStorage.setItem(OOS_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

function FloorPlanView({
  profileTables,
  reservations,
}: {
  profileTables: { id: number; name: string; capacity: number; type?: string }[];
  reservations: DashboardReservation[];
}) {
  const [isEditable, setIsEditable] = useState(false);
  const [timeFilter, setTimeFilter] = useState("All Times");
  const [oosTables, setOosTables] = useState<number[]>(loadOosTables);

  const handleStatusChange = (tableId: number, status: "Available" | "Out of Service") => {
    setOosTables((prev) => {
      const next =
        status === "Out of Service"
          ? prev.includes(tableId) ? prev : [...prev, tableId]
          : prev.filter((id) => id !== tableId);
      saveOosTables(next);
      return next;
    });
  };

  // Derive live status for each table from today's reservations.
  // Priority: OOS override > seated > confirmed > available
  const statusMap = new Map<number, string>();
  reservations.forEach((r) => {
    const current = statusMap.get(r.table.id);
    if (r.status === "seated") statusMap.set(r.table.id, "seated");
    else if (r.status === "confirmed" && current !== "seated") statusMap.set(r.table.id, "confirmed");
  });

  const floorPlanTables = profileTables.map((t) => {
    if (oosTables.includes(t.id)) {
      return {
        id: t.id, name: t.name, capacity: t.capacity, type: t.type ?? "Square",
        status: "Out of Service" as "Available" | "Confirmed" | "Seated" | "Out of Service",
      };
    }
    const live = statusMap.get(t.id);
    return {
      id: t.id,
      name: t.name,
      capacity: t.capacity,
      type: t.type ?? "Square",
      status: (live === "seated" ? "Seated" : live === "confirmed" ? "Confirmed" : "Available") as
        "Available" | "Confirmed" | "Seated" | "Out of Service",
    };
  });

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-neutral-800">
            Floor Plan View
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage table layout and real-time status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-teal-400" label="Available" />
          <LegendItem color="bg-blue-400" label="Confirmed" />
          <LegendItem color="bg-teal-600" label="Seated" />
          <LegendItem color="bg-neutral-400" label="Out of Service" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-medium">
            Time Filter:
          </span>
          <Dropdown
            trigger="label"
            triggerLabel={timeFilter}
            triggerAriaLabel={`Time filter: ${timeFilter}`}
            items={TIME_FILTER_OPTIONS.map((opt) => ({
              label: opt,
              onClick: () => setTimeFilter(opt),
            }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`inline-flex items-center gap-2 text-sm px-4 py-3 border rounded-lg font-semibold transition-colors cursor-pointer ${
              isEditable
                ? "bg-teal-700 text-white border-teal-700"
                : "text-teal-700 border-teal-700 bg-white hover:bg-teal-50"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <Edit3 size={13} aria-hidden="true" />
            Edit Layout
          </button>
          <SecondaryButton label="Export" size="small" />
          <SecondaryButton label="Import" size="small" />
        </div>
      </div>
      <FloorPlan isEditable={isEditable} tables={floorPlanTables} onStatusChange={handleStatusChange} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RESERVATION CARD
   ═══════════════════════════════════════════════════════════════════ */

function ReservationCard({
  reservation,
  onStatusChange,
  phone,
  previousVisits = 0,
  noShows = 0,
  source = "Walk-in",
}: {
  reservation: DashboardReservation;
  onStatusChange: (id: number, status: string) => void;
  phone?: string;
  previousVisits?: number;
  noShows?: number;
  source?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeStyle = STATUS_BADGE[reservation.status] || STATUS_BADGE.confirmed;
  const cardStyle = getStatusCardStyle(reservation.status);
  const gameName = reservation.gameReservations?.[0]?.game?.name;
  const duration = getDurationHours(reservation.startTime, reservation.endTime);
  const notes = reservation.specialRequests || reservation.notes;

  const renderActionButtons = () => {
    switch (reservation.status) {
      case "confirmed":
        return (
          <>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              Confirmed
            </span>
            <span onClick={(e) => e.stopPropagation()}>
              <PrimaryButton
                label="Check In"
                size="xs"
                rightIcon={<LogIn size={12} aria-hidden="true" />}
                onClick={() => onStatusChange(reservation.id, "seated")}
              />
            </span>
          </>
        );
      case "seated":
        return (
          <>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              Seated
            </span>
            <span onClick={(e) => e.stopPropagation()}>
              <PrimaryButton
                label="Complete"
                size="xs"
                rightIcon={<Flag size={12} aria-hidden="true" />}
                onClick={() => onStatusChange(reservation.id, "completed")}
              />
            </span>
          </>
        );
      default:
        return (
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {statusLabel(reservation.status)}
          </span>
        );
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden transition-shadow duration-150 hover:shadow-sm"
      style={{ border: `1.5px solid ${cardStyle.border}` }}
    >
      {/* ── Header row ── */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-800"
        style={{ backgroundColor: cardStyle.bg }}
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
        aria-label={`${reservation.user.name} reservation — ${isOpen ? "collapse" : "expand"} details`}
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
          style={{ backgroundColor: cardStyle.border }}
          aria-hidden="true"
        />

        <div className="w-20 shrink-0">
          <p className="text-sm font-bold text-neutral-800">
            {formatTime12(reservation.startTime)}
          </p>
          <p className="text-xs text-neutral-600">{reservation.table.name}</p>
        </div>

        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
          style={{ backgroundColor: getAvatarColor(reservation.user.name) }}
          aria-hidden="true"
        >
          {getInitials(reservation.user.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800 truncate">
            {reservation.user.name}
          </p>
          <p className="text-xs text-neutral-600">
            {gameName ?? <span className="italic">No game selected</span>}
          </p>
        </div>

        <div
          className="flex items-center gap-3 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {reservation.specialRequests && (
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
            <span className="text-sm font-medium">{reservation.partySize}</span>
          </div>
          {renderActionButtons()}
        </div>

        <span className="text-neutral-600 shrink-0" aria-hidden="true">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {/* ── Expanded section ── */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div
          className="border-t px-5 py-5"
          style={{
            borderColor: cardStyle.border,
            backgroundColor: cardStyle.bg,
          }}
        >
          <div className="grid grid-cols-2 gap-8">
            {/* LEFT — Reservation Details + Customer History */}
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
                  <span>{formatDate(reservation.reservationDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock
                    size={14}
                    className="text-neutral-500"
                    aria-hidden="true"
                  />
                  <span>
                    {formatTime12(reservation.startTime)}{" "}
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

              <div className="mt-5">
                <p className="text-xs font-bold text-neutral-600 uppercase tracking-wider mb-2">
                  Customer History
                </p>
                <div className="space-y-1.5 text-sm text-neutral-700">
                  <div className="flex items-center gap-2">
                    <History
                      size={14}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    <span>
                      {previousVisits} previous visit
                      {previousVisits !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {noShows > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle
                        size={14}
                        className="text-red-500"
                        aria-hidden="true"
                      />
                      <span className="text-red-700">
                        {noShows} no-show{noShows !== 1 ? "s" : ""}
                      </span>
                    </div>
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
                  <span>{reservation.user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
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
                    <span>Reservation ID: {reservation.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash
                      size={14}
                      className="text-neutral-500"
                      aria-hidden="true"
                    />
                    <span>Source: {source}</span>
                  </div>
                  <p className="text-xs text-neutral-600">
                    Booked:{" "}
                    {new Date(reservation.createdAt).toLocaleString("en-US", {
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
              <button
                type="button"
                aria-label="Edit notes"
                className="text-neutral-500 hover:text-teal-600 transition-colors cursor-pointer p-1 rounded hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-teal-700 focus-visible:outline-offset-1"
              >
                <Pencil size={13} aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              {notes || (
                <span className="text-neutral-600 italic">
                  No notes added yet
                </span>
              )}
            </p>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex items-center gap-2">
              <SecondaryButton
                label="Modify"
                size="xs"
                leftIcon={<Edit3 size={13} aria-hidden="true" />}
              />
              <SecondaryButton
                label="Send Reminder"
                size="xs"
                leftIcon={<Send size={13} aria-hidden="true" />}
              />
            </div>
            <div className="flex items-center gap-2">
              {reservation.status !== "cancelled" &&
                reservation.status !== "completed" &&
                reservation.status !== "seated" && (
                  <button
                    type="button"
                    onClick={() => onStatusChange(reservation.id, "cancelled")}
                    className="inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg border border-red-600 text-red-700 bg-white hover:bg-red-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-red-700 focus-visible:outline-offset-1"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <XCircle size={13} aria-hidden="true" />
                    Cancel
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

function FilterSelect({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
      <span className="text-xs font-semibold text-neutral-600" aria-hidden="true">{label}</span>
      <Dropdown
        trigger="label"
        triggerLabel={value}
        triggerAriaLabel={`${label}: ${value}`}
        fullWidth
        items={options.map((opt) => ({ label: opt, onClick: () => onChange(opt) }))}
        triggerClassName="bg-white"
      />
    </div>
  );
}

const ReservationManagement = () => {
  const { fetchReservations, updateReservationStatus, profile, createWalkIn } =
    useBusinessDashboard();
  const [reservations, setReservations] = useState<DashboardReservation[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [showNewReservation, setShowNewReservation] = useState(false);
  const [modalDefaultSource, setModalDefaultSource] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterTable, setFilterTable] = useState("All");
  const [filterGuests, setFilterGuests] = useState("Any");
  const [filterSource, setFilterSource] = useState("All");
  const [filterTime, setFilterTime] = useState("All Day");

  const d = new Date();
  const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const filteredReservations = reservations.filter((r) => {
    if (filterStatus !== "All" && r.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (filterTable !== "All" && r.table.name !== filterTable) return false;
    if (filterGuests !== "Any") {
      if (filterGuests === "1–2" && r.partySize > 2) return false;
      if (filterGuests === "3–4" && (r.partySize < 3 || r.partySize > 4)) return false;
      if (filterGuests === "5+" && r.partySize < 5) return false;
    }
    if (filterSource !== "All") {
      const { source } = parseBookingNotes(r.notes);
      if (!source || source.toLowerCase() !== filterSource.toLowerCase()) return false;
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
    filterStatus !== "All" || filterTable !== "All" ||
    filterGuests !== "Any" || filterSource !== "All" || filterTime !== "All Day";

  useEffect(() => {
    fetchReservations(todayStr).then((data) => {
      setReservations(data);
      setPageLoading(false);
    });
  }, [fetchReservations, todayStr]);

  const handleStatusChange = async (id: number, status: string) => {
    const result = await updateReservationStatus(id, status);
    if (result.success) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    }
  };

  return (
    <BusinessLayout>
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <h1 className="text-2xl font-bold text-neutral-800">
            Reservation Management
          </h1>
          <div className="flex items-center gap-2">
            <PrimaryButton
              label="Walk-In"
              onClick={() => { setModalDefaultSource("Walk-in"); setShowNewReservation(true); }}
            />
            <SecondaryButton
              label="New Reservation"
              onClick={() => { setModalDefaultSource(""); setShowNewReservation(true); }}
            />
          </div>
        </div>

        {pageLoading ? (
          <div
            className="flex items-center justify-center py-20"
            role="status"
            aria-label="Loading reservations"
          >
            <Loader2
              size={32}
              className="animate-spin text-teal-600"
              aria-hidden="true"
            />
          </div>
        ) : (
          <>
            <TimelineView reservations={reservations} />
            <FloorPlanView
              profileTables={profile?.tables ?? []}
              reservations={reservations}
            />

            {/* ── Reservations List ── */}
            <div className="bg-white border border-warm-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-bold text-neutral-800">Today's Reservations</h2>
                  <p className="text-xs text-neutral-600 mt-0.5">
                    {filteredReservations.length !== reservations.length
                      ? `${filteredReservations.length} of ${reservations.length} reservations`
                      : `${reservations.length} reservation${reservations.length !== 1 ? "s" : ""} today`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <TextButton
                    label="Filter"
                    size="small"
                    aria-expanded={showFilter}
                    leftIcon={<SlidersHorizontal size={15} aria-hidden="true" />}
                    rightIcon={
                      <ChevronDown size={13} aria-hidden="true" style={{ transition: "transform 200ms", transform: showFilter ? "rotate(180deg)" : "rotate(0deg)" }} />
                    }
                    onClick={() => setShowFilter((v) => !v)}
                  />
                </div>
              </div>

              {showFilter && (
                <div className="bg-warm-50 border border-warm-200 rounded-xl p-4 mt-3 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Filter Reservations</span>
                    {filtersActive && (
                      <button
                        onClick={() => { setFilterStatus("All"); setFilterTable("All"); setFilterGuests("Any"); setFilterSource("All"); setFilterTime("All Day"); }}
                        aria-label="Clear filters"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer transition-colors"
                      >
                        <FilterX size={14} aria-hidden="true" />
                        Clear filters
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap items-end gap-3">
                    <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus}
                      options={["All", "Confirmed", "Seated", "Completed", "Cancelled"]} />
                    <FilterSelect label="Table" value={filterTable} onChange={setFilterTable}
                      options={["All", ...Array.from(new Set(reservations.map((r) => r.table.name)))]} />
                    <FilterSelect label="Guests" value={filterGuests} onChange={setFilterGuests}
                      options={["Any", "1–2", "3–4", "5+"]} />
                    <FilterSelect label="Source" value={filterSource} onChange={setFilterSource}
                      options={["All", "Walk-in", "Phone", "Online", "Email"]} />
                    <FilterSelect label="Time" value={filterTime} onChange={setFilterTime}
                      options={["All Day", "Morning", "Afternoon", "Evening"]} />
                  </div>
                </div>
              )}

              <div role="list" className="flex flex-col gap-3">
                {filteredReservations.length === 0 && (
                  <p className="text-sm text-neutral-500 text-center py-8">
                    {reservations.length === 0 ? "No reservations for today." : "No reservations match the current filters."}
                  </p>
                )}
                {filteredReservations.map((reservation) => (
                  <div role="listitem" key={reservation.id}>
                    <ReservationCard
                      reservation={reservation}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <NewReservationModal
        isOpen={showNewReservation}
        onClose={() => setShowNewReservation(false)}
        defaultSource={modalDefaultSource}
        tables={profile?.tables ?? []}
        games={(profile?.restaurantGames ?? []).map((rg: any) => ({
          id: rg.game.id,
          name: rg.game.name,
        }))}
        onCreateWalkIn={async (data) => {
          const result = await createWalkIn(data);
          if (result.success) {
            setShowNewReservation(false);
            fetchReservations(todayStr).then((data) => setReservations(data));
          }
          return result;
        }}
      />
    </BusinessLayout>
  );
};

export { ReservationManagement, ReservationCard };
