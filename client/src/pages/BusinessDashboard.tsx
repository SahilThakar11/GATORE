import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronDown,
  CheckCircle2,
  MessageSquare,
  Users,
  X,
  Clock,
  CalendarDays,
  TrendingUp,
  Activity,
  Loader2,
} from "lucide-react";
import BusinessLayout from "../components/dashboard/BusinessLayout";
import NewReservationModal from "../components/dashboard/NewReservationModal";
import { Button } from "../components/ui/Button";
import { useBusinessDashboard, type DashboardReservation } from "../hooks/useBusinessDashboard";

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

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

const AVATAR_COLORS = ["#f59e0b", "#8b5cf6", "#f97316", "#10b981", "#14b8a6", "#3b82f6"];
function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
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
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 min-w-0 flex-1 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + "15" }}
        >
          <Icon size={16} style={{ color: accent }} />
        </div>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>

      <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>

      {progress !== undefined && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Tables occupied</span>
            <span className="font-semibold text-gray-600">{value}</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress * 100}%`, backgroundColor: accent }}
            />
          </div>
        </div>
      )}

      {progress === undefined && (
        <div className="h-6 flex items-end gap-[2px]">
          {[40, 60, 35, 70, 50, 80, 65, 90, 55, 75].map((h, i) => (
            <div
              key={i}
              className="w-full rounded-t-sm"
              style={{ height: `${h}%`, backgroundColor: accent + "25" }}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-tight">{extra}</p>
    </div>
  );
}

function FilterDropdown({ label, value }: { label: string; value: string }) {
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

function ReservationRow({ r }: { r: DashboardReservation }) {
  const gameName = r.gameReservations?.[0]?.game?.name;
  const isPending = r.status === "pending";
  const dotColor = isPending ? "#f97316" : "#3b82f6";
  const bgColor = isPending ? "#fff7ed" : "#fef9ee";

  return (
    <div
      className="flex items-center gap-4 px-5 py-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow duration-150"
      style={{ backgroundColor: bgColor }}
    >
      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: dotColor }} />

      <div className="w-20 shrink-0">
        <p className="text-sm font-bold text-gray-900">{formatTime(r.startTime)}</p>
        <p className="text-[11px] text-gray-400">{r.table.name}</p>
      </div>

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold"
        style={{ backgroundColor: getAvatarColor(r.user.name) }}
      >
        {getInitials(r.user.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{r.user.name}</p>
        </div>
        <p className="text-[11px] text-gray-400">
          {gameName || `Customer ID: ${r.user.id}`}
        </p>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {r.status === "confirmed" && <CheckCircle2 size={16} className="text-teal-500" />}
        {r.specialRequests && <MessageSquare size={14} className="text-gray-400" />}
        <div className="flex items-center gap-1 text-gray-500">
          <Users size={14} />
          <span className="text-sm font-medium">{r.partySize}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            r.status === "confirmed"
              ? "bg-teal-50 text-teal-700 border-teal-200"
              : r.status === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
          }`}
        >
          {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
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

  const { stats, profile, loading, createWalkIn } = useBusinessDashboard();

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

  return (
    <BusinessLayout>
      <div className="max-w-[1100px] mx-auto px-8 py-8">
        {/* ── Loading ────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        )}

        {!loading && (
          <>
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
                    {todayRes.pending} reservations pending confirmation
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500">
                    <TrendingUp size={13} className="text-gray-400" />
                    {occupancy.total - occupancy.occupied} tables available
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowNewReservation(true)}
                className="flex items-center gap-2 px-5 py-2.5 shrink-0 bg-teal-700"
              >
                <Plus size={16} />
                Quick Book
              </Button>
            </div>

            {/* ── Stat Cards ───────────────────────────────────────── */}
            <div className="grid grid-cols-4 gap-4 mt-8">
              <StatCard
                label="Current Occupancy"
                value={`${occupancy.occupied}/${occupancy.total}`}
                extra={`${occupancy.total - occupancy.occupied} tables available`}
                accent="#0d9488"
                icon={CheckCircle2}
                progress={occupancy.total > 0 ? occupancy.occupied / occupancy.total : 0}
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
                accent="#f59e0b"
                icon={Users}
              />
              <StatCard
                label="Avg. Session Time"
                value={`${((stats?.avgSessionMinutes ?? 150) / 60).toFixed(1)}h`}
                extra="Based on last 30 days"
                accent="#ef4444"
                icon={Clock}
              />
            </div>

            {/* ── Upcoming Reservations ─────────────────────────────── */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mt-8 p-6">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Upcoming Reservations</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Next reservations for today</p>
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
                    <FilterDropdown label="Status" value="All" />
                    <FilterDropdown label="Table" value="All" />
                    <FilterDropdown label="Guests" value="Any" />
                    <FilterDropdown label="Source" value="All" />
                    <FilterDropdown label="Time" value="All Day" />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-2">
                {reservations.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No reservations for today yet.
                  </p>
                )}
                {reservations.map((r) => (
                  <ReservationRow key={r.id} r={r} />
                ))}
              </div>

              {reservations.length > 0 && (
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Showing {reservations.length} of {todayRes.total} reservations
                  </p>
                  <button className="text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer">
                    View all reservations →
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={showNewReservation}
        onClose={() => setShowNewReservation(false)}
        tables={profile?.tables ?? []}
        onCreateWalkIn={async (data) => {
          const result = await createWalkIn(data);
          if (result.success) setShowNewReservation(false);
          return result;
        }}
      />

    </BusinessLayout>
  );
}
