import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Wifi,
  Coffee,
  ParkingCircle,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useReservationFlow } from "../hooks/useReservationFlow";
import { useAuth } from "../context/AuthContext";
import { type BGGGame } from "../hooks/useBGG";
import { GameCard } from "../components/searchGames/GameCard";
import { GameDetailModal } from "../components/searchGames/GameDetailModal";
import {
  useCafe,
  useCafeGames,
  useCafeAvailability,
  formatMinutes,
} from "../hooks/useCafe";

// ─── Hook: fetch full BGG data for a list of bggIds ──────────────────────────
function useBGGGamesByIds(ids: string[]) {
  const [games, setGames] = useState<BGGGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ids.length) {
      setGames([]);
      return;
    }
    let cancelled = false;
    const fetchGames = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/bgg/games?ids=${ids.join(",")}`);
        if (!res.ok) throw new Error(`BGG fetch failed (${res.status})`);
        const data: BGGGame[] = await res.json();
        if (!cancelled) setGames(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load game details");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchGames();
    return () => {
      cancelled = true;
    };
  }, [ids.join(",")]);

  return { games, loading, error };
}

// ─── Amenity icons ────────────────────────────────────────────────────────────
const DEFAULT_AMENITIES = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Coffee, label: "Full café menu" },
  { icon: ParkingCircle, label: "Parking nearby" },
];

// ─── Skeletons ────────────────────────────────────────────────────────────────
function GameSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-32 bg-gray-100 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-16 relative z-10 p-6 animate-pulse">
      <div className="flex items-start gap-5">
        <div className="w-40 h-40 rounded-xl bg-gray-100 -mt-10 shrink-0" />
        <div className="flex-1 flex flex-col gap-3 mt-2">
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CafeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const reservation = useReservationFlow();

  const todayStr = new Date().toISOString().split("T")[0];

  const { cafe, loading: cafeLoading, error: cafeError } = useCafe(id);

  // Step 1: get bggIds from our DB
  const { games: dbGames, loading: dbGamesLoading } = useCafeGames(id);

  // Step 2: extract bggIds once DB games are loaded
  const bggIds = dbGames.map((g) => g.bggId);

  // Step 3: fetch rich BGG data (images, categories, ratings) using those IDs
  const {
    games,
    loading: bggLoading,
    error: gamesError,
  } = useBGGGamesByIds(bggIds);

  const { availability, loading: availLoading } = useCafeAvailability(
    id,
    todayStr,
  );

  // Combined loading state — show skeleton until both fetches complete
  const gamesLoading = dbGamesLoading || bggLoading;

  const [gameQuery, setGameQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [detailGame, setDetailGame] = useState<BGGGame | null>(null);

  // Category pills derived from real BGG categories
  const allCategories = [
    "All",
    ...Array.from(
      new Set(games.flatMap((g) => g.categories).filter(Boolean)),
    ).sort(),
  ];

  const filteredGames = games.filter((g) => {
    const matchesQuery = g.name.toLowerCase().includes(gameQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || g.categories.includes(activeCategory);
    return matchesQuery && matchesCategory;
  });

  // Operating hours display
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const formattedHours =
    cafe?.operatingHours.reduce(
      (acc, h) => {
        const label = h.isClosed
          ? "Closed"
          : `${formatMinutes(h.openTime)} – ${formatMinutes(h.closeTime)}`;
        acc[h.dayOfWeek] = label;
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {};

  // Available time slots
  const availableSlots =
    availability?.slots
      .filter((s) => s.available)
      .map((s) => {
        const d = new Date(s.time);
        return d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        });
      }) ?? [];

  const handleReserveClick = () => {
    // TODO: open reservation modal with cafe.id pre-filled
  };

  // ─── Error state ───────────────────────────────────────────────────────────
  if (cafeError && !cafeLoading) {
    return (
      <div className="bg-[#faf8f4] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Café not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-sm text-teal-600 hover:underline"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      {/* ─── Hero banner ──────────────────────────────────────────────────── */}
      <div
        className="w-full h-52 relative"
        style={{
          backgroundImage: "url('/images/hero_wood_texture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-7 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors z-10"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-7">
        {/* ─── Identity card ────────────────────────────────────────────── */}
        {cafeLoading ? (
          <DetailSkeleton />
        ) : cafe ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-16 relative z-10 p-6">
            <div className="flex items-start gap-5">
              {/* Logo */}
              <div className="w-40 h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 -mt-10 shadow-sm">
                {cafe.logoUrl ? (
                  <img
                    src={cafe.logoUrl}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white text-2xl font-black">
                    {cafe.name[0]}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900">
                      {cafe.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {cafe.tagline}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                        <span className="text-sm font-bold text-gray-700">
                          {Number(cafe.rating).toFixed(1)}
                        </span>
                        <span className="text-sm text-gray-400">
                          ({cafe.reviewCount} reviews)
                        </span>
                      </div>
                      <span className="text-gray-200">·</span>
                      {/* Use dbGames.length — accurate count from our DB */}
                      <span className="text-xs bg-[#f5ede0] text-[#a07850] px-2.5 py-1 rounded-full font-semibold">
                        {dbGamesLoading ? "…" : dbGames.length} games
                      </span>
                      <span className="text-gray-200">·</span>
                      <div className="flex items-center gap-1 text-gray-400">
                        <MapPin size={12} />
                        <span className="text-xs">
                          {cafe.address}, {cafe.city}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
              {DEFAULT_AMENITIES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-gray-500"
                >
                  <Icon size={14} className="text-teal-500" />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── Main content ─────────────────────────────────────────────── */}
        <div className="flex gap-8 mt-8 pb-16">
          {/* Left column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* About */}
            {cafe && (
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  About
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {cafe.description}
                </p>
              </div>
            )}

            {/* Available time slots */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Available today
                </h2>
                <div className="flex items-center gap-1 text-teal-600">
                  <Clock size={14} />
                  <span className="text-xs font-medium">Walk-ins welcome</span>
                </div>
              </div>

              {availLoading ? (
                <div className="flex gap-2 flex-wrap">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={handleReserveClick}
                      className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2.5 rounded-xl hover:bg-teal-100 hover:border-teal-300 transition-all"
                    >
                      <Clock size={13} />
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No available slots for today.
                </p>
              )}
            </div>

            {/* ─── Game library (BGG-powered) ───────────────────────────── */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Game library{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    ({gamesLoading ? "…" : games.length} games)
                  </span>
                </h2>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={gameQuery}
                  onChange={(e) => setGameQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-[#faf8f4] focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

              {/* Category pills — from real BGG categories */}
              {!gamesLoading && allCategories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-5">
                  {allCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                        activeCategory === cat
                          ? "bg-teal-600 border-teal-600 text-white"
                          : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {gamesLoading && <GameSkeleton />}

              {gamesError && !gamesLoading && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm font-medium text-gray-500">
                    Failed to load games
                  </p>
                  <p className="text-xs mt-1">{gamesError}</p>
                </div>
              )}

              {!gamesLoading &&
                !gamesError &&
                (filteredGames.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onClick={() => {}}
                        onViewDetails={setDetailGame}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-400">
                    <Search size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium text-gray-500">
                      No games match your search
                    </p>
                    <button
                      onClick={() => {
                        setGameQuery("");
                        setActiveCategory("All");
                      }}
                      className="mt-2 text-xs text-teal-600 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 shrink-0 flex flex-col gap-5">
            {/* CTA */}
            <div className="bg-teal-700 rounded-xl p-5 text-center flex flex-col gap-3 sticky top-24">
              <p className="text-white font-bold text-base">Ready to play?</p>
              <p className="text-teal-200 text-xs leading-relaxed">
                Reserve your table and request games in advance — we'll have
                everything ready when you arrive.
              </p>
              <button
                onClick={handleReserveClick}
                className="w-full bg-white text-teal-700 hover:bg-teal-50 text-sm font-bold py-3 rounded-lg transition-colors cursor-pointer"
              >
                Reserve a Game
              </button>
              {!isAuthenticated && (
                <p className="text-teal-300 text-xs">
                  You'll need to sign in or use guest checkout to reserve.
                </p>
              )}
            </div>

            {/* Hours */}
            {cafe && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={14} className="text-teal-500" /> Hours
                </h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(formattedHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center justify-between"
                    >
                      <span
                        className={`text-xs ${day === todayName ? "font-bold text-teal-700" : "text-gray-500"}`}
                      >
                        {day}
                      </span>
                      <span
                        className={`text-xs font-semibold ${day === todayName ? "text-teal-700" : "text-gray-700"}`}
                      >
                        {hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            {cafe && (
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  Contact
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <MapPin size={14} className="text-teal-500 shrink-0" />
                    <span className="text-xs text-gray-600 leading-snug">
                      {cafe.address}, {cafe.city}, {cafe.province}{" "}
                      {cafe.postalCode}
                    </span>
                  </div>
                  {cafe.phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-teal-500 shrink-0" />
                      <span className="text-xs text-gray-600">
                        {cafe.phone}
                      </span>
                    </div>
                  )}
                  {cafe.website && (
                    <div className="flex items-center gap-2.5">
                      <Globe size={14} className="text-teal-500 shrink-0" />
                      <a
                        href={
                          cafe.website.startsWith("http")
                            ? cafe.website
                            : `https://${cafe.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-teal-600 hover:underline"
                      >
                        {cafe.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <GameDetailModal game={detailGame} onClose={() => setDetailGame(null)} />
    </div>
  );
}
