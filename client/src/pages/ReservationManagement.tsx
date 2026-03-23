import { useState } from "react";
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
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import FloorPlan from "../components/business/FloorPlan";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

interface TimelineReservation {
  id: number;
  table: string;
  customerName: string;
  partySize: number;
  startTime: number;
  duration: number;
  status: ReservationStatus;
  badge: string | null;
}

type ReservationStatus = "Confirmed" | "Checked In" | "Completed" | "Cancelled";

interface Reservation {
  id: number;
  customerName: string;
  game: string;
  date: string;
  time: string;
  duration: string;
  table: string;
  status: ReservationStatus;
  partySize: number;
  reservationType: "Online" | "Walk-In";
  bookingTime: string;
  depositPaid: boolean;
  email: string;
  phone: string;
  notes: string;
  previousVisits: number;
  badges: string[];
}

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const TIMELINE_RESERVATIONS: TimelineReservation[] = [
  {
    id: 1,
    table: "Table 3",
    customerName: "Marcus Johnson",
    partySize: 8,
    startTime: 19.5,
    duration: 1.5,
    status: "Confirmed",
    badge: "VIP",
  },
  {
    id: 2,
    table: "Table 5",
    customerName: "David Kim",
    partySize: 2,
    startTime: 21,
    duration: 1,
    status: "Checked In",
    badge: null,
  },
  {
    id: 3,
    table: "Table 7",
    customerName: "Jessica Park",
    partySize: 5,
    startTime: 21,
    duration: 1,
    status: "Checked In",
    badge: "WALK-IN",
  },
  {
    id: 4,
    table: "Table 8",
    customerName: "Sarah Chen",
    partySize: 6,
    startTime: 18,
    duration: 1.5,
    status: "Confirmed",
    badge: null,
  },
  {
    id: 5,
    table: "Table 12",
    customerName: "Tyler",
    partySize: 4,
    startTime: 17.5,
    duration: 1.5,
    status: "Checked In",
    badge: null,
  },
  {
    id: 6,
    table: "Table 15",
    customerName: "Emma Rodriguez",
    partySize: 3,
    startTime: 20,
    duration: 1.5,
    status: "Confirmed",
    badge: "WALK-IN",
  },
];

const RESERVATIONS: Reservation[] = [
  {
    id: 1,
    customerName: "Tyler",
    game: "Wingspan",
    date: "Feb 18, 2026",
    time: "6:00 PM",
    duration: "2 hours",
    table: "Table 12",
    status: "Confirmed",
    partySize: 4,
    reservationType: "Online",
    bookingTime: "Feb 16, 2026 at 3:45 PM",
    depositPaid: true,
    email: "tyler.martinez@gmail.com",
    phone: "555-123-4567",
    notes:
      "Birthday celebration – please prepare table with decorations if available",
    previousVisits: 7,
    badges: [],
  },
  {
    id: 2,
    customerName: "Sarah Chen",
    game: "Catan",
    date: "Feb 18, 2026",
    time: "6:00 PM",
    duration: "2 hours",
    table: "Table 8",
    status: "Confirmed",
    partySize: 6,
    reservationType: "Online",
    bookingTime: "Feb 17, 2026 at 1:20 PM",
    depositPaid: false,
    email: "sarah.chen@email.com",
    phone: "555-987-6543",
    notes: "-",
    previousVisits: 3,
    badges: [],
  },
  {
    id: 3,
    customerName: "Marcus Johnson",
    game: "Gloomhaven",
    date: "Feb 18, 2026",
    time: "7:30 PM",
    duration: "3 hours",
    table: "Table 3",
    status: "Confirmed",
    partySize: 8,
    reservationType: "Online",
    bookingTime: "Feb 15, 2026 at 10:15 AM",
    depositPaid: true,
    email: "marcus@email.com",
    phone: "555-444-8888",
    notes: "-",
    previousVisits: 12,
    badges: ["VIP"],
  },
  {
    id: 4,
    customerName: "Emma Rodriguez",
    game: "Ticket to Ride",
    date: "Feb 18, 2026",
    time: "8:00 PM",
    duration: "2 hours",
    table: "Table 15",
    status: "Confirmed",
    partySize: 3,
    reservationType: "Walk-In",
    bookingTime: "Feb 18, 2026 at 7:30 PM",
    depositPaid: false,
    email: "emma@email.com",
    phone: "555-555-5555",
    notes: "-",
    previousVisits: 1,
    badges: ["WALK-IN"],
  },
  {
    id: 5,
    customerName: "David Kim",
    game: "Chess",
    date: "Feb 18, 2026",
    time: "9:00 PM",
    duration: "2 hours",
    table: "Table 5",
    status: "Checked In",
    partySize: 2,
    reservationType: "Online",
    bookingTime: "Feb 14, 2026 at 4:00 PM",
    depositPaid: true,
    email: "dk.chess@email.com",
    phone: "555-456-7897",
    notes: "Requested quiet corner table",
    previousVisits: 9,
    badges: [],
  },
  {
    id: 6,
    customerName: "Jessica Park",
    game: "Root",
    date: "Feb 18, 2026",
    time: "9:30 PM",
    duration: "2 hours",
    table: "Table 7",
    status: "Checked In",
    partySize: 5,
    reservationType: "Walk-In",
    bookingTime: "Feb 18, 2026 at 9:00 PM",
    depositPaid: false,
    email: "jpark@email.com",
    phone: "555-222-3333",
    notes: "-",
    previousVisits: 0,
    badges: ["WALK-IN"],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   STATUS HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const STATUS_BG: Record<ReservationStatus, string> = {
  Confirmed: "bg-blue-500",
  "Checked In": "bg-teal-500",
  Completed: "bg-purple-500",
  Cancelled: "bg-red-500",
};

const STATUS_BADGE: Record<
  ReservationStatus,
  { bg: string; text: string; border: string }
> = {
  Confirmed: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  "Checked In": {
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
  },
  Completed: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  Cancelled: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
  },
};

const BADGE_COLORS: Record<string, string> = {
  VIP: "bg-yellow-300 text-yellow-900",
  "WALK-IN": "bg-orange-300 text-orange-900",
};

const AVATAR_COLORS = [
  "#0d9488",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#3b82f6",
  "#10b981",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
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

function formatTime(hour: number): string {
  const h = Math.floor(hour);
  const m = String(Math.round((hour % 1) * 60)).padStart(2, "0");
  const period = h >= 12 ? "PM" : "AM";
  const display = h % 12 || 12;
  return `${display}:${m} ${period}`;
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

function TimelineView() {
  const startHour = 17;
  const endHour = 22;
  const hourSlots = Array.from(
    { length: endHour - startHour },
    (_, i) => startHour + i,
  );

  const tables = Array.from(
    new Set(TIMELINE_RESERVATIONS.map((r) => r.table)),
  ).sort();

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6 overflow-x-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Timeline View</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Visualize reservation timing and table overlaps
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-blue-500" label="Confirmed" />
          <LegendItem color="bg-teal-500" label="Checked In" />
          <LegendItem color="bg-purple-500" label="Completed" />
          <LegendItem color="bg-red-500" label="Cancelled" />
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="min-w-max">
        {/* Time Header */}
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

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {tables.map((table) => {
            const tableReservations = TIMELINE_RESERVATIONS.filter(
              (r) => r.table === table,
            );

            return (
              <div
                key={table}
                className="flex bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="w-24 flex-shrink-0 py-4 px-4 font-medium text-gray-600 text-xs bg-white border-r border-gray-100">
                  {table}
                </div>

                <div className="flex relative">
                  {hourSlots.map((hour) => (
                    <div
                      key={hour}
                      className="w-32 border-l border-gray-100 h-12"
                    />
                  ))}

                  {tableReservations.map((res) => {
                    const leftPx = (res.startTime - startHour) * 128;
                    const widthPx = res.duration * 128;

                    return (
                      <div
                        key={res.id}
                        className="absolute top-1 bottom-1 rounded-lg cursor-pointer hover:shadow-lg transition-all"
                        style={{ left: `${leftPx}px`, width: `${widthPx}px` }}
                      >
                        <div
                          className={`${STATUS_BG[res.status]} text-white rounded-lg px-3 py-1.5 h-full flex flex-col justify-between overflow-hidden`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-semibold text-xs truncate">
                              {res.customerName}
                            </p>
                            {res.badge && (
                              <span
                                className={`${BADGE_COLORS[res.badge] || ""} text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap`}
                              >
                                {res.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-[10px] text-white/80">
                            <span>👥 {res.partySize}</span>
                            <span>{formatTime(res.startTime)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
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
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Floor Plan View</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage table layout and real-time status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LegendItem color="bg-teal-400" label="Available" />
          <LegendItem color="bg-blue-400" label="Reserved" />
          <LegendItem color="bg-purple-400" label="Occupied" />
          <LegendItem color="bg-red-400" label="Out of Service" />
        </div>
      </div>

      {/* Controls */}
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

function ReservationCard({ reservation }: { reservation: Reservation }) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeStyle = STATUS_BADGE[reservation.status];

  const renderActionButtons = () => {
    switch (reservation.status) {
      case "Confirmed":
        return (
          <>
            <button
              className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}
            >
              Confirmed
            </button>
            <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
              ✓ Check In
            </button>
          </>
        );
      case "Checked In":
        return (
          <>
            <button
              className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}
            >
              Checked In
            </button>
            <button className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer">
              ✓ Complete
            </button>
          </>
        );
      case "Completed":
        return (
          <button
            className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}
          >
            Completed
          </button>
        );
      case "Cancelled":
        return (
          <button
            className={`${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border} text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer`}
          >
            Cancelled
          </button>
        );
    }
  };

  return (
    <div className="bg-teal-50/70 border border-teal-200 rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md">
      {/* Collapsed Header */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Time + Avatar + Name */}
        <div className="flex items-center gap-4">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_BG[reservation.status]}`}
          />

          <div className="w-20 shrink-0">
            <p className="text-sm font-bold text-gray-900">
              {reservation.time}
            </p>
            <p className="text-[11px] text-gray-400">{reservation.table}</p>
          </div>

          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
            style={{ backgroundColor: getAvatarColor(reservation.customerName) }}
          >
            {getInitials(reservation.customerName)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {reservation.customerName}
              </p>
              {reservation.badges.map((badge) => (
                <span
                  key={badge}
                  className={`${BADGE_COLORS[badge] || ""} text-[10px] font-bold px-1.5 py-0.5 rounded`}
                >
                  {badge}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-gray-400">{reservation.game}</p>
          </div>
        </div>

        {/* Right: Icons + Status + Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <CheckCircle2
            size={16}
            className={
              reservation.depositPaid ? "text-teal-500" : "text-gray-300"
            }
          />
          {reservation.notes !== "-" && (
            <MessageSquare size={14} className="text-gray-400" />
          )}
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
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-teal-200 px-6 py-5">
          {/* Two-column details grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Reservation Details
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{reservation.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span>
                    {reservation.time} ({reservation.duration})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Dice5 size={14} className="text-gray-400" />
                  <span>{reservation.game}</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Customer History
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <History size={14} className="text-gray-400" />
                  <span>{reservation.previousVisits} previous visits</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Contact Information
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  <span>{reservation.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span>{reservation.phone}</span>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Booking Info
                </p>
                <div className="space-y-1.5 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-gray-400" />
                    <span>ID: {reservation.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-gray-400" />
                    <span>
                      Type:{" "}
                      <span className="text-blue-500 font-medium">
                        {reservation.reservationType}
                      </span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Booked: {reservation.bookingTime}
                  </p>
                  {reservation.depositPaid && (
                    <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <CheckCircle2 size={12} /> Deposit Paid
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {reservation.notes !== "-" && (
            <div className="bg-white rounded-xl border border-gray-200 p-4 mt-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Notes
              </p>
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-700">{reservation.notes}</p>
                <div className="flex items-center gap-1.5 shrink-0 ml-4">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1 rounded hover:bg-gray-50">
                    <Edit3 size={14} />
                  </button>
                  <button className="text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center mt-5">
            <div className="flex items-center gap-2">
              <button className="border border-teal-400 text-teal-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                Modify
              </button>
              <button className="border border-teal-400 text-teal-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                Send Reminder
              </button>
              {reservation.status === "Checked In" && (
                <button className="border border-teal-400 text-teal-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-teal-50 bg-white transition-colors cursor-pointer">
                  Follow Up
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button className="border border-red-300 text-red-500 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50 bg-white transition-colors cursor-pointer">
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
  return (
    <BusinessLayout>
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-gray-900">
            Reservation Management
          </h1>
          <div className="flex items-center gap-2">
            <button className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer">
              Walk‑In
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm border border-gray-200 transition-colors cursor-pointer">
              New Reservation
            </button>
          </div>
        </div>

        <TimelineView />
        <FloorPlanView />

        {/* Upcoming Reservations */}
        <div className="mt-2">
          <div className="flex flex-col gap-3">
            {RESERVATIONS.map((reservation) => (
              <ReservationCard key={reservation.id} reservation={reservation} />
            ))}
          </div>
        </div>

        {/* Footer */}
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
