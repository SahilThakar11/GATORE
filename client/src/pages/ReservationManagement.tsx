import { useState, useEffect } from "react";
import {
  CheckCircle2,
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
  BookOpen,
  History,
  Edit3,
  Trash2,
  MoreVertical,
  Loader2,
  Send,
  XCircle,
  Pencil,
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import FloorPlan from "../components/business/FloorPlan";
import { useBusinessDashboard, type DashboardReservation } from "../hooks/useBusinessDashboard";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";

/* ═══════════════════════════════════════════════════════════════════
   STATUS HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const STATUS_BG: Record<string, string> = {
  confirmed: "bg-blue-500",
  pending: "bg-amber-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
};

const STATUS_BADGE: Record<string, { bg: string; text: string; border: string }> = {
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  completed: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  cancelled: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const AVATAR_COLORS = ["#0d9488", "#f59e0b", "#8b5cf6", "#ef4444", "#3b82f6", "#10b981"];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
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

function formatHour(hour: number): string {
  const h = Math.floor(hour);
  const m = String(Math.round((hour % 1) * 60)).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:${m} ${period}`;
}

function getDurationHours(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

function getHourFloat(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/* ═══════════════════════════════════════════════════════════════════
   LEGEND ITEM
   ═══════════════════════════════════════════════════════════════════ */

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`${color} w-2.5 h-2.5 rounded-full`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TIMELINE VIEW
   ═══════════════════════════════════════════════════════════════════ */

function TimelineView({ reservations }: { reservations: DashboardReservation[] }) {
  const startHour = 17;
  const endHour = 23;
  const hourSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Group by table
  const tableMap = new Map<string, DashboardReservation[]>();
  reservations.forEach((r) => {
    const key = r.table.name;
    if (!tableMap.has(key)) tableMap.set(key, []);
    tableMap.get(key)!.push(r);
  });
  const tables = Array.from(tableMap.keys()).sort();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Timeline View</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Visualize reservation timing and table overlaps
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-blue-500" label="Confirmed" />
          <LegendItem color="bg-amber-500" label="Pending" />
          <LegendItem color="bg-purple-500" label="Completed" />
          <LegendItem color="bg-red-500" label="Cancelled" />
        </div>
      </div>

      <div className="min-w-max">
        <div className="flex">
          <div className="w-24 flex-shrink-0" />
          <div className="flex">
            {hourSlots.map((hour) => (
              <div
                key={hour}
                className="w-32 border-l border-gray-200 px-2 py-2 text-center text-xs font-medium text-gray-500"
              >
                {`${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {tables.map((tableName) => {
            const tableRes = tableMap.get(tableName) || [];
            return (
              <div key={tableName} className="flex bg-gray-50/50 hover:bg-gray-50 transition-colors">
                <div className="w-24 flex-shrink-0 py-4 px-4 font-medium text-gray-600 text-xs bg-white border-r border-gray-100">
                  {tableName}
                </div>
                <div className="flex relative">
                  {hourSlots.map((hour) => (
                    <div key={hour} className="w-32 border-l border-gray-100 h-12" />
                  ))}
                  {tableRes.map((res) => {
                    const resStart = getHourFloat(res.startTime);
                    const duration = getDurationHours(res.startTime, res.endTime);
                    const leftPx = (resStart - startHour) * 128;
                    const widthPx = duration * 128;

                    if (leftPx < 0 || resStart >= endHour) return null;

                    return (
                      <div
                        key={res.id}
                        className="absolute top-1 bottom-1 rounded-lg cursor-pointer hover:shadow-lg transition-all"
                        style={{ left: `${leftPx}px`, width: `${Math.max(widthPx, 40)}px` }}
                      >
                        <div
                          className={`${STATUS_BG[res.status] || "bg-gray-400"} text-white rounded-lg px-3 py-1.5 h-full flex flex-col justify-between overflow-hidden`}
                        >
                          <p className="font-semibold text-xs truncate">{res.user.name}</p>
                          <div className="flex gap-3 text-[10px] text-white/80">
                            <span>👥 {res.partySize}</span>
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
            <p className="text-sm text-gray-400 text-center py-6">No reservations to display</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOOR PLAN VIEW
   ═══════════════════════════════════════════════════════════════════ */

function FloorPlanView() {
  const [isEditable, setIsEditable] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Floor Plan View</h3>
          <p className="text-xs text-gray-400 mt-0.5">Manage table layout and real-time status</p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-teal-400" label="Available" />
          <LegendItem color="bg-blue-400" label="Reserved" />
          <LegendItem color="bg-purple-400" label="Occupied" />
          <LegendItem color="bg-red-400" label="Out of Service" />
        </div>
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">Time Filter:</span>
          <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-colors">
            <option>All Times</option>
            <option>Lunch</option>
            <option>Dinner</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditable(!isEditable)}
            className={`text-sm px-4 py-2 border rounded-lg font-medium transition-colors cursor-pointer ${
              isEditable
                ? "bg-teal-600 text-white border-teal-600"
                : "text-teal-600 border-teal-300 hover:bg-teal-50"
            }`}
          >
            ✏️ Edit Layout
          </button>
          <button className="text-sm text-teal-600 hover:bg-teal-50 px-4 py-2 border border-teal-300 rounded-lg font-medium transition-colors cursor-pointer">
            Export
          </button>
          <button className="text-sm text-teal-600 hover:bg-teal-50 px-4 py-2 border border-teal-300 rounded-lg font-medium transition-colors cursor-pointer">
            Import
          </button>
        </div>
      </div>
      <FloorPlan isEditable={isEditable} />
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
  const badgeStyle = STATUS_BADGE[reservation.status] || STATUS_BADGE.pending;
  const gameName = reservation.gameReservations?.[0]?.game?.name;
  const duration = getDurationHours(reservation.startTime, reservation.endTime);
  const notes = reservation.specialRequests || reservation.notes;

  const renderActionButtons = () => {
    switch (reservation.status) {
      case "confirmed":
        return (
          <>
            <button className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}>
              Confirmed
            </button>
            <button
              onClick={() => onStatusChange(reservation.id, "completed")}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✓ Check In
            </button>
          </>
        );
      case "pending":
        return (
          <>
            <button className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}>
              Pending
            </button>
            <button
              onClick={() => onStatusChange(reservation.id, "confirmed")}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              ✓ Confirm
            </button>
          </>
        );
      default:
        return (
          <button className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}>
            {statusLabel(reservation.status)}
          </button>
        );
    }
  };

  return (
    <div className="bg-teal-50/70 border border-teal-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* ── Collapsed Header ──────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
        onClick={() => setIsOpen((v) => !v)}
        role="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Collapse reservation details" : "Expand reservation details"}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen((v) => !v); } }}
      >
        <div className="flex items-center gap-4">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_BG[reservation.status] || "bg-neutral-400"}`}
            aria-hidden="true"
          />
          <div className="w-20 shrink-0">
            <p className="text-sm font-bold text-neutral-800">{formatTime12(reservation.startTime)}</p>
            <p className="text-xs text-neutral-600">{reservation.table.name}</p>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: getAvatarColor(reservation.user.name) }}
            aria-hidden="true"
          >
            {getInitials(reservation.user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 truncate">{reservation.user.name}</p>
            <p className="text-xs text-neutral-600">{gameName ?? "No game selected"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
          {reservation.specialRequests && (
            <MessageSquare size={14} className="text-neutral-500" aria-label="Has special requests" />
          )}
          <div className="flex items-center gap-1 text-neutral-500">
            <Users size={14} aria-hidden="true" />
            <span className="text-xs font-medium">{reservation.partySize}</span>
          </div>
          {renderActionButtons()}
          <span className="text-neutral-500 p-1" aria-hidden="true">
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </span>
        </div>
      </div>

      {/* ── Expanded Details ──────────────────────────────────────── */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-teal-200" style={{ backgroundColor: "#eff6ff" }}>
          <div className="px-6 py-5">

            {/* Two-column grid */}
            <div className="grid grid-cols-2 gap-8">

              {/* LEFT — Reservation Details + Customer History */}
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Reservation Details</p>
                <div className="space-y-2 text-sm text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-neutral-400" aria-hidden="true" />
                    <span>{formatDate(reservation.reservationDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-neutral-400" aria-hidden="true" />
                    <span>{formatTime12(reservation.startTime)} <span className="text-neutral-500">({duration.toFixed(1)} hours)</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dice5 size={14} className="text-neutral-400" aria-hidden="true" />
                    <span>{gameName ?? <span className="text-neutral-400 italic">No game selected</span>}</span>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Customer History</p>
                  <div className="space-y-1.5 text-sm text-neutral-700">
                    <div className="flex items-center gap-2">
                      <History size={14} className="text-neutral-400" aria-hidden="true" />
                      {previousVisits !== undefined
                        ? <span>{previousVisits} previous visit{previousVisits !== 1 ? "s" : ""}</span>
                        : <span className="text-neutral-400 italic">No visit history</span>}
                    </div>
                    {noShows !== undefined && noShows > 0 && (
                      <div className="flex items-center gap-2">
                        <XCircle size={14} className="text-red-400" aria-hidden="true" />
                        <span className="text-red-600">{noShows} no-show{noShows !== 1 ? "s" : ""}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT — Contact Information + Booking Info */}
              <div>
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3">Contact Information</p>
                <div className="space-y-2 text-sm text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-neutral-400" aria-hidden="true" />
                    <span>{reservation.user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-neutral-400" aria-hidden="true" />
                    {phone
                      ? <span>{phone}</span>
                      : <span className="text-neutral-400 italic">No phone on file</span>}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Booking Info</p>
                  <div className="space-y-1.5 text-sm text-neutral-700">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-neutral-400" aria-hidden="true" />
                      <span>ID: {reservation.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-neutral-400" aria-hidden="true" />
                      {source
                        ? <span>{source}</span>
                        : <span className="text-neutral-400 italic">Source unknown</span>}
                    </div>
                    <p className="text-xs text-neutral-500">
                      Booked: {new Date(reservation.createdAt).toLocaleString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                        hour: "numeric", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes — full width */}
            <div className="bg-white rounded-xl border border-blue-100 p-4 mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-neutral-400" aria-hidden="true" />
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Notes</p>
                </div>
                <button
                  aria-label="Edit notes"
                  className="text-neutral-400 hover:text-teal-600 transition-colors cursor-pointer p-1 rounded hover:bg-teal-50"
                >
                  <Pencil size={13} aria-hidden="true" />
                </button>
              </div>
              <p className="text-sm text-neutral-600">
                {notes || <span className="text-neutral-400 italic">No notes added yet</span>}
              </p>
            </div>

            {/* Footer actions — full width */}
            <div className="flex items-center justify-between mt-5">
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 border border-teal-300 text-teal-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                  <Edit3 size={13} aria-hidden="true" />
                  Modify
                </button>
                <button className="flex items-center gap-1.5 border border-teal-300 text-teal-700 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                  <Send size={13} aria-hidden="true" />
                  Send Reminder
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onStatusChange(reservation.id, "cancelled")}
                  className="flex items-center gap-1.5 border border-red-300 text-red-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50 bg-white transition-colors cursor-pointer"
                >
                  <XCircle size={13} aria-hidden="true" />
                  Cancel
                </button>
                <button
                  aria-label="More options"
                  className="text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer p-2 rounded-lg hover:bg-white/60"
                >
                  <MoreVertical size={16} aria-hidden="true" />
                </button>
              </div>
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

const ReservationManagement = () => {
  const { fetchReservations, updateReservationStatus, loading } = useBusinessDashboard();
  const [reservations, setReservations] = useState<DashboardReservation[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">Reservation Management</h1>
          <div className="flex items-center gap-2">
            <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer">
              Walk‑In
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-colors cursor-pointer">
              New Reservation
            </button>
          </div>
        </div>

        {pageLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : (
          <>
            <TimelineView reservations={reservations} />
            <FloorPlanView />

            <div className="mt-2">
              <div className="flex flex-col gap-3">
                {reservations.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No reservations for today.
                  </p>
                )}
                {reservations.map((reservation) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-center mt-8">
          <p className="text-xs text-gray-400">
            Powered by <span className="font-bold text-teal-600">GATORE</span>
          </p>
        </div>
      </div>
    </BusinessLayout>
  );
};

export { ReservationManagement, ReservationCard };
