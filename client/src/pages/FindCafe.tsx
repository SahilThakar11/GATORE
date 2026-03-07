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
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCafes, type CafeSummary, formatMinutes } from "../hooks/useCafe";

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
    <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
      <div className="flex gap-5">
        <div className="w-16 h-16 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2.5">
          <div className="h-4 bg-gray-100 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="flex gap-2 mt-1">
            <div className="h-7 w-20 bg-gray-100 rounded-lg" />
            <div className="h-7 w-20 bg-gray-100 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Cafe Card ────────────────────────────────────────────────────────────────
function CafeCard({ cafe }: { cafe: CafeSummary }) {
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
      className="group flex flex-col sm:flex-row items-start gap-5 bg-warm-100 border border-warm-300 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200"
    >
      {/* Logo */}
      <div className="w-30 h-30 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
        {cafe.logoUrl ? (
          <img
            src={cafe.logoUrl}
            alt={cafe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-black text-2xl">
            {cafe.name[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-tight">
              {cafe.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{cafe.tagline}</p>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              openNow
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            }`}
          >
            {openNow ? "● Open now" : "○ Closed"}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-2.5">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin size={12} />
            <span className="text-xs">
              {cafe.address}, {cafe.city}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-700">
              {Number(cafe.rating).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({cafe.reviewCount})</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mt-1">
          <Gamepad2 size={12} />
          <span className="text-xs">{cafe._count.restaurantGames} games</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400 mt-1">
          <Clock size={12} />
          <span className="text-xs">{hoursLabel}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 6;

export default function FindCafePage() {
  const [inputValue, setInputValue] = useState("");
  const [activeCity, setActiveCity] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(inputValue, 300);

  // Fetch all cafés — no city param so we get everything, then filter client-side
  const { cafes, loading, error } = useCafes();

  // Derive city list from real data
  const allCities = [
    "All",
    ...Array.from(new Set(cafes.map((c) => c.city))).sort(),
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
      <div className="max-w-4xl mx-auto px-7 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">Find a café</h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover board game cafés near you and book your table
          </p>
        </div>

        {/* Search */}
        <div
          className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3.5 shadow-sm mb-5 transition-all ${
            inputValue
              ? "border-teal-400 ring-2 ring-teal-100"
              : "border-gray-200"
          }`}
        >
          <Search size={17} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by café name or city..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* City filter pills */}
        <div className="flex gap-2 flex-wrap mb-5">
          {allCities.map((city) => (
            <button
              key={city}
              onClick={() => setActiveCity(city)}
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

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-400 mb-4">
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
                    <p className="text-xs text-gray-400">
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
                  <p className="text-center text-xs text-gray-400 mt-6">
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
