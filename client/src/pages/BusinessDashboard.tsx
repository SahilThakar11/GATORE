import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  Users,
  Star,
  X,
  Clock,
  CalendarDays,
  TrendingUp,
  Activity,
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import NewReservationModal from "../components/dashboard/NewReservationModal";

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════════════════════════════ */

const STATS = [
  {
    label: "Current Occupancy",
    value: "8/15",
    sub: "Tables occupied",
    extra: "7 tables available",
    accent: "#0d9488",
    icon: CheckCircle2,
    progress: 8 / 15,
  },
  {
    label: "Today's Reservations",
    value: "28",
    sub: null,
    extra: "4 pending confirmation",
    accent: "#0d9488",
    icon: CalendarDays,
  },
  {
    label: "Total Customers",
    value: "28",
    sub: null,
    extra: "156 new this week",
    accent: "#f59e0b",
    icon: Users,
  },
  {
    label: "Avg. Session Time",
    value: "2.5h",
    sub: null,
    extra: "15 min faster turnover",
    accent: "#ef4444",
    icon: Clock,
  },
];

interface Reservation {
  id: string;
  time: string;
  table: string;
  name: string;
  subtitle: string;
  initials: string;
  avatarColor: string;
  guests: number;
  status: "Confirmed" | "Pending";
  verified: boolean;
  hasNote: boolean;
  isVIP: boolean;
  isFavorite: boolean;
  dotColor: string;
  bgColor: string;
}

const RESERVATIONS: Reservation[] = [
  {
    id: "0001",
    time: "12:00 PM",
    table: "Table 4",
    name: "Sarah Johnson",
    subtitle: "Customer ID: 0001",
    initials: "SJ",
    avatarColor: "#f59e0b",
    guests: 4,
    status: "Confirmed",
    verified: true,
    hasNote: false,
    isVIP: false,
    isFavorite: false,
    dotColor: "#3b82f6",
    bgColor: "#fef9ee",
  },
  {
    id: "0002",
    time: "12:30 PM",
    table: "Table 2",
    name: "Michael Chen",
    subtitle: "Customer ID: 0002",
    initials: "MC",
    avatarColor: "#8b5cf6",
    guests: 2,
    status: "Confirmed",
    verified: true,
    hasNote: true,
    isVIP: false,
    isFavorite: false,
    dotColor: "#3b82f6",
    bgColor: "#fef9ee",
  },
  {
    id: "0003",
    time: "1:00 PM",
    table: "Table 6",
    name: "Tyler",
    subtitle: "Wingspan",
    initials: "T",
    avatarColor: "#f97316",
    guests: 6,
    status: "Pending",
    verified: false,
    hasNote: false,
    isVIP: false,
    isFavorite: true,
    dotColor: "#f97316",
    bgColor: "#fff7ed",
  },
  {
    id: "0004",
    time: "1:30 PM",
    table: "Table 3",
    name: "Sarah Chen",
    subtitle: "Catan",
    initials: "S",
    avatarColor: "#10b981",
    guests: 3,
    status: "Confirmed",
    verified: true,
    hasNote: true,
    isVIP: false,
    isFavorite: false,
    dotColor: "#3b82f6",
    bgColor: "#fef9ee",
  },
  {
    id: "0005",
    time: "2:00 PM",
    table: "Table 1",
    name: "Marcus Johnson",
    subtitle: "Gloomhaven",
    initials: "M",
    avatarColor: "#14b8a6",
    guests: 2,
    status: "Confirmed",
    verified: true,
    hasNote: false,
    isVIP: true,
    isFavorite: true,
    dotColor: "#3b82f6",
    bgColor: "#f0fdf9",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   MINI COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function StatCard({
  stat,
}: {
  stat: (typeof STATS)[0];
}) {
  const Icon = stat.icon;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 min-w-0 flex-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: stat.accent + "15" }}
        >
          <Icon size={16} style={{ color: stat.accent }} />
        </div>
        <span className="text-xs font-medium text-gray-500">{stat.label}</span>
      </div>

      {/* Value */}
      <p className="text-3xl font-black text-gray-900 leading-none">
        {stat.value}
      </p>

      {/* Progress bar (only for occupancy) */}
      {stat.progress !== undefined && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>{stat.sub}</span>
            <span className="font-semibold text-gray-600">
              {stat.value}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stat.progress * 100}%`,
                backgroundColor: stat.accent,
              }}
            />
          </div>
        </div>
      )}

      {/* Mini sparkline placeholder for non-occupancy cards */}
      {stat.progress === undefined && (
        <div className="h-6 flex items-end gap-[2px]">
          {[40, 60, 35, 70, 50, 80, 65, 90, 55, 75].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-t-sm"
              style={{
                height: `${h}%`,
                backgroundColor: stat.accent + "25",
              }}
            />
          ))}
        </div>
      )}

      {/* Extra info */}
      <p className="text-[11px] text-gray-400 leading-tight">{stat.extra}</p>
    </div>
  );
}

function FilterDropdown({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 min-w-[110px]">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <button className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 hover:border-teal-300 transition-colors cursor-pointer">
        <span>{value}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
    </div>
  );
}

function ReservationRow({ r }: { r: Reservation }) {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-150"
      style={{ backgroundColor: r.bgColor }}
    >
      {/* Dot */}
      <div
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: r.dotColor }}
      />

      {/* Time + Table */}
      <div className="w-20 shrink-0">
        <p className="text-sm font-bold text-gray-900">{r.time}</p>
        <p className="text-[11px] text-gray-400">{r.table}</p>
      </div>

      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: r.avatarColor }}
      >
        {r.initials}
      </div>

      {/* Name + Subtitle */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {r.name}
          </p>
          {r.isVIP && (
            <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded uppercase">
              VIP
            </span>
          )}
          {r.isFavorite && <Star size={13} className="text-amber-400 fill-amber-400 shrink-0" />}
        </div>
        <p className="text-[11px] text-gray-400">{r.subtitle}</p>
      </div>

      {/* Icons + Guests + Status */}
      <div className="flex items-center gap-3 shrink-0">
        {r.verified && (
          <CheckCircle2 size={16} className="text-teal-500" />
        )}
        {r.hasNote && (
          <MessageSquare size={14} className="text-gray-400" />
        )}
        <div className="flex items-center gap-1 text-gray-500">
          <Users size={14} />
          <span className="text-sm font-medium">{r.guests}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            r.status === "Confirmed"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {r.status}
        </span>
        <ChevronDown size={16} className="text-gray-300" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function BusinessDashboard() {
  const [showFilter, setShowFilter] = useState(true);
  const [showNewReservation, setShowNewReservation] = useState(false);

  // Current date
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <BusinessLayout>
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-black text-gray-900">{dateStr}</h1>
            <div className="flex items-center gap-5 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock size={13} className="text-teal-600" />
                Peak hours: 6–9 PM
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <Activity size={13} className="text-amber-500" />
                4 reservations pending confirmation
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <TrendingUp size={13} className="text-gray-400" />
                Next reservation in 25 minutes
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNewReservation(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shrink-0 cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Quick Book
          </button>
        </div>

        {/* ── Stat Cards ───────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          {STATS.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* ── Upcoming Reservations ─────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mt-8 p-6">
          {/* Title row */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Upcoming Reservations
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Next reservations for today
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-700 transition-colors cursor-pointer">
                <Search size={15} />
                Search
              </button>
              <button
                onClick={() => setShowFilter((v) => !v)}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-teal-700 transition-colors cursor-pointer"
              >
                <SlidersHorizontal size={15} />
                Filter
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showFilter ? "rotate-180" : ""}`}
                />
              </button>
              <button
                onClick={() => setShowNewReservation(true)}
                className="flex items-center gap-2 border-2 border-teal-600 text-teal-700 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer"
              >
                <Plus size={15} />
                New Reservation
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          {showFilter && (
            <div className="bg-gray-50/70 border border-gray-100 rounded-xl p-4 mt-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Filter Reservations
                </span>
                <button
                  onClick={() => setShowFilter(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-end gap-3">
                <FilterDropdown label="Status" value="Available" />
                <FilterDropdown label="Table" value="1" />
                <FilterDropdown label="Guests" value="4" />
                <FilterDropdown label="Source" value="Online" />
                <FilterDropdown label="Time" value="6:00PM - 8:00PM" />
              </div>
            </div>
          )}

          {/* Reservation List */}
          <div className="flex flex-col gap-3 mt-2">
            {RESERVATIONS.map((r) => (
              <ReservationRow key={r.id} r={r} />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing 5 of 28 reservations
            </p>
            <button className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer">
              View all reservations →
            </button>
          </div>
        </div>
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservation}
        onClose={() => setShowNewReservation(false)}
      />
    </BusinessLayout>
  );
}
