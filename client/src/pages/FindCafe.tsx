import { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
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

// ─── Types ───────────────────────────────────────────────────────────────────
interface Cafe {
  id: string;
  name: string;
  tagline: string;
  address: string;
  city: string;
  rating: number;
  reviewCount: number;
  gameCount: number;
  openNow: boolean;
  hours: string;
  amenities: string[];
  tags: string[];
  logoSrc?: string;
  timeSlots: string[];
}

// ─── Mock data — replace with GET /api/cafes later ───────────────────────────
const ALL_CAFES: Cafe[] = [
  {
    id: "adventurers-guild",
    name: "Adventurers Guild",
    tagline: "Waterloo's premier board game café & tavern",
    address: "148 University Ave W",
    city: "Waterloo, ON",
    rating: 4.5,
    reviewCount: 125,
    gameCount: 156,
    openNow: true,
    hours: "12pm – 11pm",
    amenities: ["WiFi", "Full menu", "Parking"],
    tags: ["Strategy", "Family", "Party"],
    timeSlots: ["5:30 PM", "6:00 PM", "6:30 PM"],
    logoSrc: "adventures_guild_logo.png",
  },
  {
    id: "galactic-conquest",
    name: "Galactic Conquest",
    tagline: "Where legends gather for epic game nights",
    address: "82 Magic Ave",
    city: "Enchantment City, ON",
    rating: 4.8,
    reviewCount: 200,
    gameCount: 210,
    openNow: true,
    hours: "12pm – 12am",
    amenities: ["WiFi", "Full menu"],
    tags: ["RPG", "Strategy", "Co-op"],
    timeSlots: ["5:00 PM", "5:30 PM", "7:00 PM"],
    logoSrc: "galactic_conquest_logo.png",
  },
  {
    id: "heroic-tabletop",
    name: "Hero's Rest",
    tagline: "A cozy haven for tabletop adventurers",
    address: "22 Hero Way",
    city: "Fantasy Land, ON",
    rating: 4.2,
    reviewCount: 80,
    gameCount: 98,
    openNow: false,
    hours: "2pm – 10pm",
    amenities: ["WiFi", "Snacks"],
    tags: ["Family", "Party", "Puzzle"],
    timeSlots: ["5:15 PM", "6:00 PM", "6:45 PM"],
    logoSrc: "heroic_tabletop_logo.png",
  },
  {
    id: "hive",
    name: "The Hive",
    tagline: "Hoard of games, hoard of fun",
    address: "12 Dragonstone Lane",
    city: "Mythical City, ON",
    rating: 4.6,
    reviewCount: 112,
    gameCount: 175,
    openNow: true,
    hours: "11am – 11pm",
    amenities: ["WiFi", "Full menu", "Parking"],
    tags: ["Strategy", "Tableau", "Card Games"],
    timeSlots: ["5:00 PM", "5:30 PM", "7:00 PM"],
    logoSrc: "hive_logo.png",
  },
  {
    id: "re-roll",
    name: "Re-Roll Café",
    tagline: "Craft beer and board games under one roof",
    address: "55 Brewer's Lane",
    city: "Kitchener, ON",
    rating: 4.4,
    reviewCount: 89,
    gameCount: 132,
    openNow: true,
    hours: "3pm – 12am",
    amenities: ["WiFi", "Full bar", "Parking"],
    tags: ["Party", "Strategy", "Co-op"],
    timeSlots: ["6:00 PM", "6:30 PM", "7:00 PM"],
    logoSrc: "re_roll_logo.png",
  },
  {
    id: "snakes-lattes",
    name: "Snakes & Lattes",
    tagline: "Gentle brews, clever moves",
    address: "9 Chamomile Crescent",
    city: "Cambridge, ON",
    rating: 4.3,
    reviewCount: 61,
    gameCount: 87,
    openNow: false,
    hours: "10am – 9pm",
    amenities: ["WiFi", "Café menu"],
    tags: ["Family", "Puzzle", "Party"],
    timeSlots: ["2:00 PM", "3:30 PM", "5:00 PM"],
    logoSrc: "snakes_lattes_logo.png",
  },
];

const ALL_TAGS = [
  "All",
  ...Array.from(new Set(ALL_CAFES.flatMap((c) => c.tags))),
];
const AMENITY_ICONS: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  "Full menu": Coffee,
  "Full bar": Coffee,
  "Café menu": Coffee,
  Snacks: Coffee,
  Parking: ParkingCircle,
};

const PAGE_SIZE = 4;

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Cafe card ────────────────────────────────────────────────────────────────
function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <Link
      to={`/cafe/${cafe.id}`}
      className="group flex flex-col sm:flex-row items-start gap-5 bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200"
    >
      {/* Logo */}
      <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
        {cafe.logoSrc ? (
          <img
            src={cafe.logoSrc}
            alt={cafe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-black text-2xl">
            {cafe.name[0]}
          </div>
        )}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-tight">
              {cafe.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">{cafe.tagline}</p>
          </div>

          {/* Open badge */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
              cafe.openNow
                ? "bg-green-50 text-green-600 border border-green-200"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            }`}
          >
            {cafe.openNow ? "● Open now" : "○ Closed"}
          </span>
        </div>

        {/* Meta row */}
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
              {cafe.rating}
            </span>
            <span className="text-xs text-gray-400">({cafe.reviewCount})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Gamepad2 size={12} />
            <span className="text-xs">{cafe.gameCount} games</span>
          </div>
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span className="text-xs">{cafe.hours}</span>
          </div>
        </div>

        {/* Amenities + tags row */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          {cafe.amenities.map((a) => {
            const Icon = AMENITY_ICONS[a] ?? Wifi;
            return (
              <span
                key={a}
                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg"
              >
                <Icon size={11} className="text-teal-500" />
                {a}
              </span>
            );
          })}
          <span className="text-gray-200 text-xs">·</span>
          {cafe.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#fdf0e8] text-[#b07040] font-medium px-2 py-0.5 rounded-md"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Time slots */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {cafe.timeSlots.map((slot) => (
            <span
              key={slot}
              className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg"
            >
              <Clock size={11} />
              {slot}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FindCafe() {
  const [inputValue, setInputValue] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(inputValue, 300);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [debouncedQuery, activeTag]);

  const filtered = ALL_CAFES.filter((cafe) => {
    const q = debouncedQuery.toLowerCase();
    const matchesQuery =
      !q ||
      cafe.name.toLowerCase().includes(q) ||
      cafe.city.toLowerCase().includes(q) ||
      cafe.tagline.toLowerCase().includes(q) ||
      cafe.tags.some((t) => t.toLowerCase().includes(q));

    const matchesTag = activeTag === "All" || cafe.tags.includes(activeTag);

    return matchesQuery && matchesTag;
  });

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <div className="max-w-4xl mx-auto px-7 py-10">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900">Find a café</h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover board game cafés near you and book your table
          </p>
        </div>

        {/* Search bar */}
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
            placeholder="Search by name, city, or game type..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          {inputValue && (
            <button
              onClick={() => setInputValue("")}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tag filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-full border transition-all ${
                activeTag === tag
                  ? "bg-teal-600 border-teal-600 text-white"
                  : "bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-gray-400 mb-4">
          {filtered.length} café{filtered.length !== 1 ? "s" : ""} found
          {activeTag !== "All" && (
            <>
              {" "}
              · <span className="text-teal-600 font-medium">{activeTag}</span>
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

        {/* Café list */}
        {visible.length > 0 ? (
          <>
            <div className="flex flex-col gap-4">
              {visible.map((cafe) => (
                <CafeCard key={cafe.id} cafe={cafe} />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex flex-col items-center gap-2 mt-8">
                <p className="text-xs text-gray-400">
                  Showing {visible.length} of {filtered.length} cafés
                </p>
                <button
                  onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                  className="flex items-center gap-2 border border-gray-200 bg-white hover:border-teal-400 hover:text-teal-700 text-sm font-semibold text-gray-600 px-6 py-2.5 rounded-lg transition-all"
                >
                  <ChevronDown size={15} />
                  Load more cafés
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
          /* Empty state */
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
                setActiveTag("All");
              }}
              className="mt-4 text-xs text-teal-600 font-medium hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
