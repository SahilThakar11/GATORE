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
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import FloorPlan from "../components/business/FloorPlan";
import { useBusinessDashboard, type DashboardReservation } from "../hooks/useBusinessDashboard";
import { useBusinessSettings, type TableConfig, type HoursConfig } from "../hooks/useBusinessSettings";

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

const TIMELINE_STATUS_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  confirmed: { bg: "bg-blue-50", border: "border-l-blue-500", text: "text-gray-700" },
  pending: { bg: "bg-amber-50", border: "border-l-amber-500", text: "text-gray-700" },
  completed: { bg: "bg-emerald-50", border: "border-l-emerald-500", text: "text-gray-700" },
  cancelled: { bg: "bg-red-50", border: "border-l-red-400", text: "text-gray-400" },
};

const TIMELINE_DOT: Record<string, string> = {
  confirmed: "bg-blue-500",
  pending: "bg-amber-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

function TimelineView({
  reservations,
  tables,
  todayHours,
}: {
  reservations: DashboardReservation[];
  tables: TableConfig[];
  todayHours: HoursConfig | null;
}) {
  // openTime/closeTime are stored in minutes (e.g. 720 = 12:00 PM), convert to hours
  const startHour = todayHours ? Math.floor(todayHours.openTime / 60) : 9;
  const endHour = todayHours ? Math.ceil(todayHours.closeTime / 60) : 22;
  const totalHours = endHour - startHour;
  const hourSlots = Array.from({ length: totalHours }, (_, i) => startHour + i);

  const PX_PER_HOUR = 150;

  // Group reservations by table id
  const reservationsByTable = new Map<number, DashboardReservation[]>();
  reservations.forEach((r) => {
    const key = r.table.id;
    if (!reservationsByTable.has(key)) reservationsByTable.set(key, []);
    reservationsByTable.get(key)!.push(r);
  });

  // Show all tables, sorted by name
  const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  if (todayHours?.isClosed) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Timeline View</h3>
        <p className="text-sm text-gray-400 text-center py-8">The cafe is closed today.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Timeline View</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {todayHours
              ? `Today's hours: ${formatHour(startHour)} – ${formatHour(endHour)}`
              : "Visualize reservation timing and table overlaps"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {[
            { color: "bg-blue-500", label: "Confirmed" },
            { color: "bg-emerald-500", label: "Checked In" },
            { color: "bg-emerald-400", label: "Completed" },
            { color: "bg-red-400", label: "Cancelled" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-xs text-gray-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-max">
        {/* Hour header */}
        <div className="flex">
          <div className="w-28 flex-shrink-0" />
          <div className="flex">
            {hourSlots.map((hour) => (
              <div
                key={hour}
                className="border-l border-gray-200 py-2 text-center text-xs font-medium text-gray-500"
                style={{ width: PX_PER_HOUR }}
              >
                {`${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`}
              </div>
            ))}
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-gray-100">
          {sortedTables.map((table) => {
            const tableRes = reservationsByTable.get(table.id) || [];
            return (
              <div key={table.id} className="flex">
                {/* Table label */}
                <div className="w-28 flex-shrink-0 flex items-center px-4 font-semibold text-gray-700 text-sm bg-white border-r border-gray-100">
                  {table.name}
                </div>
                {/* Time grid + reservation blocks */}
                <div className="flex relative" style={{ height: 64 }}>
                  {hourSlots.map((hour) => (
                    <div
                      key={hour}
                      className="border-l border-gray-100 bg-gray-50/40 hover:bg-gray-50"
                      style={{ width: PX_PER_HOUR, height: 64 }}
                    />
                  ))}
                  {tableRes.map((res) => {
                    const resStart = getHourFloat(res.startTime);
                    const duration = getDurationHours(res.startTime, res.endTime);
                    const leftPx = (resStart - startHour) * PX_PER_HOUR;
                    const widthPx = duration * PX_PER_HOUR;

                    if (leftPx < 0 || resStart >= endHour) return null;

                    const style = TIMELINE_STATUS_STYLE[res.status] || TIMELINE_STATUS_STYLE.pending;
                    const isWalkIn = res.notes?.toLowerCase().includes("walk-in") ||
                      res.specialRequests?.toLowerCase().includes("walk-in");

                    return (
                      <div
                        key={res.id}
                        className={`absolute top-2 bottom-2 rounded-lg border-l-4 ${style.border} ${style.bg} cursor-pointer hover:shadow-md transition-all overflow-hidden`}
                        style={{
                          left: `${leftPx}px`,
                          width: `${Math.max(widthPx, 60)}px`,
                        }}
                      >
                        <div className="px-3 py-1.5 h-full flex flex-col justify-between">
                          <div className="flex items-center gap-2">
                            <p className={`font-semibold text-sm truncate ${style.text}`}>
                              {res.user.name}
                            </p>
                            {isWalkIn && (
                              <span className="bg-teal-100 text-teal-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                                Walk-in
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users size={11} />
                              {res.partySize}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} />
                              {formatTime12(res.startTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {sortedTables.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No tables configured yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   FLOOR PLAN VIEW
   ═══════════════════════════════════════════════════════════════════ */

function FloorPlanView({ tables, reservations }: { tables: TableConfig[]; reservations: DashboardReservation[] }) {
  const [isEditable, setIsEditable] = useState(false);

  // Derive table status from reservations
  const reservedTableIds = new Set(
    reservations
      .filter((r) => r.status === "confirmed" || r.status === "pending")
      .map((r) => r.table.id),
  );

  const floorTables = tables.map((t) => ({
    id: t.id,
    name: t.name,
    size: t.capacity,
    status: (reservedTableIds.has(t.id) ? "Reserved" : "Available") as
      "Available" | "Reserved" | "Occupied" | "Out of Service",
  }));

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
           Edit Layout
          </button>
        </div>
      </div>
      <FloorPlan isEditable={isEditable} tables={floorTables} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   RESERVATION CARD
   ═══════════════════════════════════════════════════════════════════ */

function ReservationCard({
  reservation,
  onStatusChange,
}: {
  reservation: DashboardReservation;
  onStatusChange: (id: number, status: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeStyle = STATUS_BADGE[reservation.status] || STATUS_BADGE.pending;
  const gameName = reservation.gameReservations?.[0]?.game?.name || "—";
  const duration = getDurationHours(reservation.startTime, reservation.endTime);

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
      {/* Collapsed Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_BG[reservation.status] || "bg-gray-400"}`} />
          <div className="w-20 shrink-0">
            <p className="text-sm font-bold text-gray-900">{formatTime12(reservation.startTime)}</p>
            <p className="text-[11px] text-gray-400">{reservation.table.name}</p>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: getAvatarColor(reservation.user.name) }}
          >
            {getInitials(reservation.user.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{reservation.user.name}</p>
            <p className="text-[11px] text-gray-400">{gameName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {reservation.specialRequests && <MessageSquare size={14} className="text-gray-400" />}
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={14} />
            <span className="text-xs font-medium">{reservation.partySize}</span>
          </div>
          {renderActionButtons()}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="border-t border-teal-200 px-6 py-5">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Reservation Details</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{formatDate(reservation.reservationDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>{formatTime12(reservation.startTime)} ({duration.toFixed(1)} hours)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Dice5 size={14} className="text-gray-400" />
                  <span>{gameName}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span>{reservation.user.email}</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Booking Info</p>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400" />
                    <span>ID: {reservation.id}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Booked: {new Date(reservation.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {reservation.specialRequests && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-700">{reservation.specialRequests}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2">
              <button className="border border-teal-400 text-teal-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                Send Reminder
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onStatusChange(reservation.id, "cancelled")}
                className="border border-red-300 text-red-500 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50 bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-100">
                <MoreVertical size={16} />
              </button>
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
  const { fetchTables, fetchHours } = useBusinessSettings();
  const [reservations, setReservations] = useState<DashboardReservation[]>([]);
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [todayHours, setTodayHours] = useState<HoursConfig | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  useEffect(() => {
    Promise.all([
      fetchReservations(todayStr),
      fetchTables(),
      fetchHours(),
    ]).then(([resData, tableData, hoursData]) => {
      setReservations(resData);
      setTables(tableData);
      const match = hoursData.find(
        (h) => h.dayOfWeek.toLowerCase() === todayDayName.toLowerCase(),
      );
      setTodayHours(match ?? null);
      setPageLoading(false);
    });
  }, [fetchReservations, fetchTables, fetchHours, todayStr, todayDayName]);

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
            <TimelineView reservations={reservations} tables={tables} todayHours={todayHours} />
            <FloorPlanView tables={tables} reservations={reservations} />

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
