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
import { useAuth } from "../context/AuthContext";
import { type BGGGame } from "../hooks/useBGG";
import { GameCard } from "../components/searchGames/GameCard";
import { GameDetailModal } from "../components/searchGames/GameDetailModal";
import { ReservationModal } from "../components/reservation/ReservationModal";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";
import { TertiaryButton } from "../components/ui/TertiaryButton";
import { FilterPill } from "../components/ui/FilterPill";
import { type Venue } from "../hooks/useReservationFlow";
import {
  useCafe,
  useCafeGames,
  useCafeAvailability,
  formatMinutes,
} from "../hooks/useCafe";

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
    (async () => {
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
    })();
    return () => {
      cancelled = true;
    };
  }, [ids.join(",")]);
  return { games, loading, error };
}

const DEFAULT_AMENITIES = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Coffee, label: "Full café menu" },
  { icon: ParkingCircle, label: "Parking nearby" },
];

function GameSkeleton() {
  return (
    <div role="status" aria-label="Loading games" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
    <div role="status" aria-label="Loading café details" className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-16 relative z-10 p-6 animate-pulse">
      {/* Mobile: logo + title row */}
      <div className="sm:hidden">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0 -mt-10" />
          <div className="h-7 bg-gray-100 rounded w-2/3" />
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-10 bg-gray-100 rounded w-36 mt-1" />
        </div>
      </div>
      {/* Tablet + desktop: logo beside info */}
      <div className="hidden sm:flex items-center lg:items-start gap-5">
        <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl bg-gray-100 shrink-0 lg:-mt-10" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div className="flex flex-col gap-2.5">
              <div className="h-7 lg:h-8 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
            <div className="h-10 bg-gray-100 rounded w-36 shrink-0" />
          </div>
        </div>
      </div>
      {/* Amenities bar */}
      <div className="flex gap-6 mt-5 pt-4 border-t border-gray-100">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded w-24" />
        ))}
      </div>
    </div>
  );
}

export default function CafeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const todayStr = new Date().toISOString().split("T")[0];

  const { cafe, loading: cafeLoading, error: cafeError } = useCafe(id);
  const { games: dbGames, loading: dbGamesLoading } = useCafeGames(id);

  const cafeBggIds = dbGames.map((g) => g.bggId);
  const bggIdToDbId: Record<string, number> = {};
  dbGames.forEach((g) => {
    bggIdToDbId[g.bggId] = g.id;
  });

  const {
    games,
    loading: bggLoading,
    error: gamesError,
  } = useBGGGamesByIds(cafeBggIds);
  const { availability, loading: availLoading } = useCafeAvailability(
    id,
    todayStr,
  );
  const gamesLoading = dbGamesLoading || bggLoading;

  const [reservationOpen, setReservationOpen] = useState(false);
  const [gameQuery, setGameQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [detailGame, setDetailGame] = useState<BGGGame | null>(null);

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

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const formattedHours =
    cafe?.operatingHours.reduce(
      (acc, h) => {
        acc[h.dayOfWeek] = h.isClosed
          ? "Closed"
          : `${formatMinutes(h.openTime)} – ${formatMinutes(h.closeTime)}`;
        return acc;
      },
      {} as Record<string, string>,
    ) ?? {};

  const allSlots =
    availability?.slots.map((s) => {
      const d = new Date(s.time);
      return {
        label: d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        available: s.available,
      };
    }) ?? [];

  const venueForModal: Venue | null = cafe
    ? {
        id: cafe.id,
        name: cafe.name,
        logo: cafe.logoUrl ?? "",
        address: cafe.address,
        city: cafe.city,
        rating: Number(cafe.rating),
        reviewCount: cafe.reviewCount,
        poster: "/images/hero_wood_texture.png",
      }
    : null;

  if (cafeError && !cafeLoading) {
    return (
      <div className="bg-warm-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Café not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-3 text-sm text-teal-700 hover:underline inline-flex items-center gap-1"
          >
            <ChevronLeft size={14} aria-hidden="true" /> Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-warm-50 min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white text-teal-700 font-semibold px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      <div
        className="w-full h-40 sm:h-52 relative"
        style={{
          backgroundImage: "url('/images/hero_wood_texture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute top-6 left-4 sm:left-7 z-10">
          <SecondaryButton
            label="Back"
            size="small"
            onClick={() => navigate(-1)}
            leftIcon={<ChevronLeft size={16} />}
          />
        </div>
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-7">
        {cafeLoading ? (
          <DetailSkeleton />
        ) : cafe ? (
          <div className="bg-warm-100 rounded-2xl border border-warm-200 shadow-md -mt-16 relative z-10 p-6">
            {/* ── Mobile layout: logo + title row, rest stacked below ── */}
            <div className="sm:hidden">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 -mt-10" style={{ boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)" }}>
                  {cafe.logoUrl ? (
                    <img
                      src={cafe.logoUrl}
                      alt={cafe.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div role="img" aria-label={cafe.name} className="w-full h-full bg-teal-700 flex items-center justify-center text-white text-2xl font-black">
                      {cafe.name[0]}
                    </div>
                  )}
                </div>
                <h1 className="text-xl font-black text-gray-900 leading-tight">
                  {cafe.name}
                </h1>
              </div>
              <div className="mt-3 flex flex-col gap-2">
                <p className="text-sm text-gray-500">{cafe.tagline}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Star size={13} aria-hidden="true" style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }} />
                    <span className="sr-only">Rating:</span>
                    <span className="text-sm font-semibold" style={{ color: "#292524" }}>
                      {Number(cafe.rating).toFixed(1)}
                    </span>
                    <span className="text-sm" style={{ color: "#292524", fontWeight: 400 }}>
                      ({cafe.reviewCount} reviews)
                    </span>
                  </div>
                  <span aria-hidden="true" className="text-gray-200">·</span>
                  <span className="text-xs rounded-full font-medium" style={{ backgroundColor: "#E8D4C4", color: "#292524", padding: "4px 10px" }}>
                    {dbGamesLoading ? "…" : dbGames.length} games
                  </span>
                  <span aria-hidden="true" className="text-gray-200">·</span>
                  <div className="flex items-center gap-1">
                    <MapPin size={13} aria-hidden="true" style={{ color: "#57534E", flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: "#57534E", fontWeight: 400 }}>
                      {cafe.address}, {cafe.city}
                    </span>
                  </div>
                </div>
                <div className="mt-1 self-start">
                  <PrimaryButton
                    label="Reserve a table"
                    size="sm"
                    onClick={() => setReservationOpen(true)}
                  />
                </div>
              </div>
            </div>

            {/* ── Desktop layout: logo beside all info ── */}
            <div className="hidden sm:flex items-center lg:items-start gap-5">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 lg:-mt-10" style={{ boxShadow: "0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)" }}>
                {cafe.logoUrl ? (
                  <img
                    src={cafe.logoUrl}
                    alt={cafe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div role="img" aria-label={cafe.name} className="w-full h-full bg-teal-700 flex items-center justify-center text-white text-2xl font-black">
                    {cafe.name[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
                      {cafe.name}
                    </h1>
                    <p className="text-sm lg:text-base text-gray-500 mt-0.5">
                      {cafe.tagline}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Star size={13} aria-hidden="true" style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }} />
                        <span className="sr-only">Rating:</span>
                        <span className="text-sm lg:text-base font-semibold" style={{ color: "#292524" }}>
                          {Number(cafe.rating).toFixed(1)}
                        </span>
                        <span className="text-sm lg:text-base" style={{ color: "#292524", fontWeight: 400 }}>
                          ({cafe.reviewCount} reviews)
                        </span>
                      </div>
                      <span aria-hidden="true" className="text-gray-200">·</span>
                      <span className="text-xs lg:text-sm rounded-full font-medium" style={{ backgroundColor: "#E8D4C4", color: "#292524", padding: "4px 10px" }}>
                        {dbGamesLoading ? "…" : dbGames.length} games
                      </span>
                      <span aria-hidden="true" className="text-gray-200">·</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={13} aria-hidden="true" style={{ color: "#57534E", flexShrink: 0 }} />
                        <span className="text-sm lg:text-base" style={{ color: "#57534E", fontWeight: 400 }}>
                          {cafe.address}, {cafe.city}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 self-start">
                    <PrimaryButton
                      label="Reserve a table"
                      size="sm"
                      onClick={() => setReservationOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center flex-wrap gap-4 mt-5 pt-4 border-t border-warm-200">
              {DEFAULT_AMENITIES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-gray-500"
                >
                  <Icon size={18} className="text-teal-700" aria-hidden="true" />
                  <span className="text-xs lg:text-sm font-medium">{label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col xl:flex-row gap-8 mt-2 xl:mt-8 pb-16">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {cafe && (
              <div className="bg-white rounded-xl border border-warm-200 p-6">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                  About
                </h2>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {cafe.description}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-warm-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Available today
                </h2>
                <div className="flex items-center gap-1 text-teal-700">
                  <Clock size={14} aria-hidden="true" />
                  <span className="text-xs sm:text-sm font-medium">Walk-ins welcome</span>
                </div>
              </div>
              {availLoading ? (
                <div role="status" aria-label="Loading availability" className="flex gap-2 flex-wrap">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : allSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allSlots.map((slot) => (
                    <button
                      key={slot.label}
                      onClick={() => slot.available && setReservationOpen(true)}
                      disabled={!slot.available}
                      aria-label={slot.available ? `Reserve table at ${slot.label}` : `${slot.label} — unavailable`}
                      className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all ${
                        slot.available
                          ? "text-teal-700 bg-teal-50 border border-teal-100 hover:bg-teal-100 hover:border-teal-300 cursor-pointer"
                          : "text-red-400 bg-red-50 border border-red-100 cursor-not-allowed line-through"
                      }`}
                    >
                      <Clock size={13} aria-hidden="true" />
                      {slot.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  No available slots for today.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-warm-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Game library{" "}
                  <span className="text-gray-600 font-normal text-sm sm:text-base">
                    ({gamesLoading ? "…" : games.length} games)
                  </span>
                </h2>
              </div>
              <div className="relative mb-4">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <label htmlFor="game-search" className="sr-only">Search games</label>
                <input
                  id="game-search"
                  type="text"
                  placeholder="Search games..."
                  value={gameQuery}
                  onChange={(e) => setGameQuery(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 border border-warm-200 rounded-lg text-sm sm:text-base text-gray-700 bg-warm-50 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
              {!gamesLoading && allCategories.length > 1 && (
                <div className="flex gap-2 flex-wrap mb-5">
                  {allCategories.map((cat) => (
                    <FilterPill
                      key={cat}
                      label={cat}
                      active={activeCategory === cat}
                      onClick={() => setActiveCategory(cat)}
                    />
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        onClick={() => {}}
                        onViewDetails={setDetailGame}
                        selectable={false}
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
                      className="mt-2 text-xs text-teal-700 font-medium hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="w-full xl:w-72 xl:shrink-0 flex flex-col gap-5">
            <div className="bg-warm-100 border border-warm-200 rounded-xl p-5 text-center flex flex-col gap-3 xl:order-last">
              <p className="text-gray-900 font-bold text-base sm:text-lg">Ready to play?</p>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Reserve your table and request games in advance — we'll have
                everything ready when you arrive.
              </p>
              <SecondaryButton
                label="Reserve a table"
                size="small"
                onClick={() => setReservationOpen(true)}
              />
              {!isAuthenticated && (
                <TertiaryButton
                  label="Sign in or continue as guest"
                  size="small"
                  onClick={() => setReservationOpen(true)}
                />
              )}
            </div>

            {cafe && (
              <div className="flex flex-col md:flex-row xl:flex-col gap-5">
                <div className="flex-1 bg-warm-100 rounded-xl border border-warm-200 p-5">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={18} className="text-teal-700" aria-hidden="true" /> Hours
                  </h3>
                  <div className="flex flex-col gap-2">
                    {Object.entries(formattedHours).map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between"
                      >
                        <span
                          className={`text-xs sm:text-sm ${day === todayName ? "font-bold text-teal-700" : "text-gray-500"}`}
                        >
                          {day}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-semibold ${day === todayName ? "text-teal-700" : "text-gray-700"}`}
                        >
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 bg-warm-100 rounded-xl border border-warm-200 p-5">
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
                    Contact
                  </h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                      <MapPin size={18} className="text-teal-700 shrink-0" aria-hidden="true" />
                      <span className="text-xs sm:text-sm text-gray-600 leading-snug">
                        {cafe.address}, {cafe.city}, {cafe.province}{" "}
                        {cafe.postalCode}
                      </span>
                    </div>
                    {cafe.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone size={18} className="text-teal-700 shrink-0" aria-hidden="true" />
                        <a
                          href={`tel:${cafe.phone}`}
                          className="text-xs sm:text-sm text-teal-700 hover:underline"
                        >
                          {cafe.phone}
                        </a>
                      </div>
                    )}
                    {cafe.website && (
                      <div className="flex items-center gap-2.5">
                        <Globe size={18} className="text-teal-700 shrink-0" aria-hidden="true" />
                        <a
                          href={
                            cafe.website.startsWith("http")
                              ? cafe.website
                              : `https://${cafe.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm text-teal-700 hover:underline"
                        >
                          {cafe.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <GameDetailModal game={detailGame} onClose={() => setDetailGame(null)} />

      {venueForModal && (
        <ReservationModal
          isOpen={reservationOpen}
          onClose={() => setReservationOpen(false)}
          venue={venueForModal}
          cafeBggIds={cafeBggIds}
          cafeTables={cafe?.tables ?? []}
          bggIdToDbId={bggIdToDbId}
        />
      )}
    </div>
  );
}
