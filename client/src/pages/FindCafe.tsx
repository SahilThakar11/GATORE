import { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Star,
  ChevronDown,
  Gamepad2,
  Wifi,
  Coffee,
  ParkingCircle,
  Clock,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useCafes, type CafeSummary, formatMinutes } from "../hooks/useCafe";
import { Dropdown } from "../components/ui/Dropdown";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { TertiaryButton } from "../components/ui/TertiaryButton";
import { Input } from "../components/ui/Input";

// ─── Amenity icon map ─────────────────────────────────────────────────────────
// Our DB doesn't have structured amenities yet — derive simple labels from
// what we know (phone = contact, website = online presence). Extend as needed.
const AMENITY_ICONS: Record<string, any> = {
  WiFi: Wifi,
  "Full menu": Coffee,
  "Full bar": Coffee,
  "Café menu": Coffee,
  Snacks: Coffee,
  Parking: ParkingCircle,
};

const TIME_OPTIONS = [
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
];

const PLAYER_OPTIONS = [
  "1 player",
  "2 players",
  "3 players",
  "4 players",
  "5 players",
  "6 players",
  "7 players",
];

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function CafeCardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading café"
      className="bg-warm-100 rounded-[8px] animate-pulse"
      style={{
        padding: "24px 28px",
        boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex gap-4">
        <div className="w-[120px] h-[120px] rounded-[8px] bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-5 bg-gray-100 rounded-full w-20 mt-1" />
        </div>
      </div>
    </div>
  );
}

// ─── Cafe Card ────────────────────────────────────────────────────────────────
function CafeCard({ cafe }: { cafe: CafeSummary }) {
  const [hovered, setHovered] = useState(false);
  const now = new Date();
  const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayHours = cafe.operatingHours.find((h) => h.dayOfWeek === todayName);
  const openNow =
    todayHours &&
    !todayHours.isClosed &&
    nowMinutes >= todayHours.openTime &&
    nowMinutes < todayHours.closeTime;

  const hoursLabel = todayHours
    ? todayHours.isClosed
      ? "Closed today"
      : `${formatMinutes(todayHours.openTime)} – ${formatMinutes(todayHours.closeTime)}`
    : "Hours unavailable";

  return (
    <Link
      to={`/cafe/${cafe.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block bg-warm-100 border rounded-[8px] overflow-hidden transition-colors duration-200 p-4 sm:px-7 sm:py-6"
      style={{
        borderColor: hovered ? "#14B8A6" : "#E8D4C4",
        boxShadow: hovered
          ? "0px 8px 24px 0px rgba(0,0,0,0.14)"
          : "0px 2px 8px 0px rgba(0,0,0,0.08)",
        transition: "box-shadow 200ms, border-color 200ms",
      }}
    >
      {/* Teal gradient overlay on hover */}
      <div
        className="absolute inset-x-0 top-0 h-56 rounded-t-[8px] pointer-events-none transition-opacity duration-200"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,184,166,0.10), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative flex items-stretch gap-4">
        {/* Thumbnail */}
        <div
          className="w-[110px] h-[110px] sm:w-[120px] sm:h-[120px] shrink-0 rounded-[8px] overflow-hidden bg-gray-100"
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
            <div
              role="img"
              aria-label={`${cafe.name} logo placeholder`}
              className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl"
            >
              {cafe.name[0]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5 min-w-0">
          <p
            className="text-base font-semibold truncate"
            style={{ color: "#292524" }}
          >
            {cafe.name}
          </p>

          <div className="flex items-center gap-1">
            <MapPin aria-hidden="true" size={13} style={{ color: "#57534E", flexShrink: 0 }} />
            <span
              className="text-sm truncate"
              style={{ color: "#57534E", fontWeight: 400 }}
            >
              {cafe.address}, {cafe.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star
                aria-hidden="true"
                size={13}
                style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }}
              />
              <span
                className="text-sm"
                style={{ color: "#292524", fontWeight: 600 }}
              >
                {Number(cafe.rating).toFixed(1)}
              </span>
              <span
                className="text-sm"
                style={{ color: "#78716C", fontWeight: 400 }}
              >
                ({cafe.reviewCount})
              </span>
            </div>
            <span
              className="text-xs rounded-full"
              style={{
                backgroundColor: "#E8D4C4",
                color: "#292524",
                fontWeight: 500,
                padding: "4px 10px",
              }}
            >
              {cafe._count.restaurantGames} games
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Clock aria-hidden="true" size={13} style={{ color: "#57534E", flexShrink: 0 }} />
            <span
              className="text-sm"
              style={{ color: "#57534E", fontWeight: 400 }}
            >
              {hoursLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

export default function FindCafePage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";

  const [inputValue, setInputValue] = useState(initialQuery);
  const [activeCity, setActiveCity] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("6:00 PM");
  const [players, setPlayers] = useState("4 players");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [searchFocused, setSearchFocused] = useState(false);

  const debouncedQuery = useDebounce(inputValue, 300);

  // Fetch all cafés — no city param so we get everything, then filter client-side
  const { cafes, loading, error } = useCafes();

  // Top 7 cities by café count
  const allCities = [
    "All",
    ...Object.entries(
      cafes.reduce<Record<string, number>>((acc, c) => {
        acc[c.city] = (acc[c.city] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([city]) => city),
  ];

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, activeCity]);

  const filtered = cafes.filter((cafe) => {
    const q = debouncedQuery.toLowerCase();
    const matchesQuery =
      !q ||
      cafe.name.toLowerCase().includes(q) ||
      cafe.city.toLowerCase().includes(q) ||
      cafe.tagline.toLowerCase().includes(q);
    const matchesCity = activeCity === "All" || cafe.city === activeCity;
    return matchesQuery && matchesCity;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      {/* ── Heading ───────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-7 pt-10 pb-6">
        <h1 className="text-3xl font-black text-gray-900">Find a café</h1>
        <p className="text-sm text-gray-500 mt-1">
          Discover board game cafés near you and book your table
        </p>
      </div>

      {/* ── Filter bar — scrolls on mobile, sticky on desktop ────────────── */}
      <div className="sm:sticky sm:top-[104px] sm:z-40 w-full bg-[#faf8f4] border-b border-warm-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-7 py-4 flex flex-col gap-3">
          {/* Row 1 — Search */}
          <div
            className={`flex items-center gap-2 bg-white border px-4 py-3 transition-all ${
              searchFocused || inputValue
                ? "border-teal-500 ring-2 ring-teal-100"
                : "border-warm-300"
            }`}
            style={{ borderRadius: 8 }}
          >
            <Search
              size={17}
              className={`shrink-0 transition-colors ${searchFocused || inputValue ? "text-teal-500" : "text-gray-400"}`}
            />
            <input
              type="text"
              placeholder="Search by café name or city..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              aria-label="Search cafés by name or city"
              className="flex-1 text-base text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
            {inputValue && (
              <button
                onClick={() => setInputValue("")}
                aria-label="Clear search"
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Collapsible — Date / Time / Players / CTA + city pills */}
          {filtersOpen && (
            <>
              {/* Row 2 — Date / Time / Players / CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Date — full width on mobile, flex-1 on desktop */}
                <div className="sm:flex-1">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    aria-label="Select date"
                    className="bg-white border-warm-300 focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                {/* Time + Players — 2-col grid on mobile, inline on desktop */}
                <div className="grid grid-cols-2 sm:contents gap-3">
                  <div className="sm:flex-1 w-full shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)]">
                    <Dropdown
                      trigger="label"
                      triggerIcon={<Clock size={16} />}
                      triggerLabel={time}
                      fullWidth
                      items={TIME_OPTIONS.map((opt) => ({
                        label: opt,
                        onClick: () => setTime(opt),
                      }))}
                    />
                  </div>

                  <div className="sm:flex-1 w-full shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)]">
                    <Dropdown
                      trigger="label"
                      triggerIcon={<Users size={16} />}
                      triggerLabel={players}
                      fullWidth
                      items={PLAYER_OPTIONS.map((opt) => ({
                        label: opt,
                        onClick: () => setPlayers(opt),
                      }))}
                    />
                  </div>
                </div>

                {/* CTA */}
                <PrimaryButton
                  label="Find tables"
                  onClick={() => {}}
                  size="sm"
                />
              </div>

              {/* Divider — or browse by city */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-warm-400" />
                <span className="text-xs text-gray-600">or browse by city</span>
                <div className="flex-1 h-px bg-warm-400" />
              </div>

              {/* City filter pills */}
              <div className="flex gap-2 flex-wrap">
                {allCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => setActiveCity(city)}
                    aria-pressed={activeCity === city}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                      activeCity === city
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600"
                    }`}
                  >
                    {city !== "All" && <MapPin size={11} />}
                    {city}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Toggle — collapse/expand filters */}
          <div className="flex justify-center">
            <TertiaryButton
              label={filtersOpen ? "Hide filters" : "Show filters"}
              leftIcon={filtersOpen ? <EyeOff size={14} /> : <Eye size={14} />}
              onClick={() => setFiltersOpen((v) => !v)}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* ── Results ───────────────────────────────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-7 py-6">
        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-600 mb-4">
            {filtered.length} café{filtered.length !== 1 ? "s" : ""} found
            {activeCity !== "All" && (
              <>
                {" "}
                ·{" "}
                <span className="text-teal-600 font-medium">{activeCity}</span>
              </>
            )}
            {debouncedQuery && (
              <>
                {" "}
                · matching{" "}
                <span className="text-gray-600 font-medium">
                  "{debouncedQuery}"
                </span>
              </>
            )}
          </p>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-10 text-red-400">
            <p className="text-sm font-medium">Failed to load cafés</p>
            <p className="text-xs mt-1">{error}</p>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => (
              <CafeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* List */}
        {!loading && !error && (
          <>
            {visible.length > 0 ? (
              <>
                <div className="flex flex-col gap-4">
                  {visible.map((cafe) => (
                    <CafeCard key={cafe.id} cafe={cafe} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex flex-col items-center gap-2 mt-8">
                    <p className="text-xs text-gray-600">
                      Showing {visible.length} of {filtered.length} cafés
                    </p>
                    <button
                      onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                      className="flex items-center gap-2 border border-gray-200 bg-white hover:border-teal-400 hover:text-teal-700 text-sm font-semibold text-gray-600 px-6 py-2.5 rounded-lg transition-all"
                    >
                      <ChevronDown size={15} /> Load more cafés
                    </button>
                  </div>
                )}

                {!hasMore && filtered.length > PAGE_SIZE && (
                  <p className="text-center text-xs text-gray-600 mt-6">
                    All {filtered.length} cafés shown
                  </p>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-semibold text-gray-500">
                  No cafés found
                </p>
                <p className="text-xs mt-1">
                  Try a different search or clear the filters
                </p>
                <button
                  onClick={() => {
                    setInputValue("");
                    setActiveCity("All");
                  }}
                  className="mt-4 text-xs text-teal-600 font-medium hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
