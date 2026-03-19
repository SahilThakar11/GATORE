import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, ChevronDown, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useBGGSearch, type BGGGame } from "../hooks/useBGG";
import { useCafesByGame, type CafeSummary } from "../hooks/useCafe";
import { useRecommendedGames } from "../hooks/useRecommendedGames";
import { GameCard } from "../components/searchGames/GameCard";
import { SelectedGameBanner } from "../components/searchGames/SelectedGameBanner";
import { GameDetailModal } from "../components/searchGames/GameDetailModal";
import { SecondaryButton } from "../components/ui/SecondaryButton";

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Café result card ─────────────────────────────────────────────────────────
function CafeResultCard({
  cafe,
  gameName,
}: {
  cafe: CafeSummary;
  gameName: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/cafe/${cafe.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block bg-warm-100 border rounded-[8px] overflow-hidden p-4 sm:px-7 sm:py-6"
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
            <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl">
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
            <MapPin
              aria-hidden="true"
              size={13}
              style={{ color: "#57534E", flexShrink: 0 }}
            />
            <span
              className="text-sm truncate"
              style={{ color: "#57534E", fontWeight: 400 }}
            >
              {cafe.address}, {cafe.city}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="sr-only">
                Rating: {Number(cafe.rating).toFixed(1)} ({cafe.reviewCount} reviews)
              </span>
              <Star
                aria-hidden="true"
                size={13}
                style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }}
              />
              <span
                className="text-sm"
                aria-hidden="true"
                style={{ color: "#292524", fontWeight: 600 }}
              >
                {Number(cafe.rating).toFixed(1)}
              </span>
              <span
                className="text-sm"
                aria-hidden="true"
                style={{ color: "#78716C", fontWeight: 400 }}
              >
                ({cafe.reviewCount})
              </span>
            </div>
            {cafe._count && (
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
            )}
          </div>

          <span className="inline-flex self-start items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full mt-0.5">
            ✓ Has <span className="font-bold">{gameName}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function CafeResultSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 animate-pulse flex gap-4">
      <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="h-4 bg-gray-100 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FindByGamePage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedGame, setSelectedGame] = useState<BGGGame | null>(null);
  const [detailGame, setDetailGame] = useState<BGGGame | null>(null);
  const [activeCity, setActiveCity] = useState("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(inputValue, 500);

  const {
    games: recommendedGames,
    loading: recommendedLoading,
    isPersonalized,
  } = useRecommendedGames();
  const {
    games: searchGames,
    query: activeQuery,
    loading: searchLoading,
    loadingMore,
    hasMore,
    totalResults,
    search,
    loadMore,
    clear,
  } = useBGGSearch();

  // Fetch cafés from our DB when a game is selected
  const { cafes: cafesWithGame, loading: cafesLoading } = useCafesByGame(
    selectedGame?.id ?? null,
  );

  // City pills derived from the café results for the selected game
  const cafesCities = [
    "All",
    ...Object.entries(
      cafesWithGame.reduce<Record<string, number>>((acc, c) => {
        acc[c.city] = (acc[c.city] || 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([city]) => city),
  ];

  // Filter café results by selected city
  const filteredCafes = cafesWithGame.filter(
    (cafe) => activeCity === "All" || cafe.city === activeCity,
  );

  // Reset city filter when the selected game changes
  useEffect(() => {
    setActiveCity("All");
  }, [selectedGame?.id]);

  const isSearchMode = activeQuery.trim().length > 0;

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search(debouncedQuery);
    } else if (debouncedQuery.trim().length === 0) {
      clear();
    }
  }, [debouncedQuery]);

  const handleSelectGame = (game: BGGGame) => {
    setSelectedGame(game);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearGame = () => setSelectedGame(null);

  const handleClearSearch = () => {
    setInputValue("");
    clear();
    setSelectedGame(null);
    inputRef.current?.focus();
  };

  const displayGames = isSearchMode ? searchGames : recommendedGames;
  const sectionTitle = isSearchMode
    ? `Results for "${activeQuery}" (${totalResults} games found)`
    : isPersonalized
      ? "Recommended for You"
      : "Popular Games";

  return (
    <>
      <div className="bg-[#faf8f4] min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-7 pt-10 pb-6">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900">Find by game</h1>
            <p className="text-sm text-gray-500 mt-1">
              Search for your favourite board game and discover cafés that have
              it
            </p>
          </div>

          {/* Search bar */}
          <div className="relative mb-8">
            <div
              className={`flex items-center gap-2 bg-white border px-4 py-3 transition-all ${
                searchFocused || inputValue
                  ? "border-teal-500 ring-2 ring-teal-100"
                  : "border-warm-300"
              }`}
              style={{ borderRadius: 8 }}
            >
              {searchLoading ? (
                <Loader2
                  size={17}
                  className="text-teal-500 shrink-0 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Search
                  size={17}
                  className={`shrink-0 transition-colors ${searchFocused || inputValue ? "text-teal-500" : "text-gray-400"}`}
                  aria-hidden="true"
                />
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for a board game..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                aria-label="Search for a board game"
                className="flex-1 text-base text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
              {inputValue && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* Selected game banner */}
          {selectedGame && (
            <div className="mb-6">
              <SelectedGameBanner
                game={selectedGame}
                onClose={handleClearGame}
              />
            </div>
          )}

          {/* Café results from our DB */}
          {selectedGame && (
            <div className="mb-10">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Cafés with{" "}
                    <span className="text-teal-700">{selectedGame.name}</span>
                  </h2>
                  <div className="w-20 h-1 bg-warm-400 mt-1 mb-4 rounded-full" />
                </div>
              </div>

              {/* City filter pills */}
              {!cafesLoading && cafesWithGame.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {cafesCities.map((city) => (
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
                      {city !== "All" && <MapPin size={11} aria-hidden="true" />}
                      {city}
                    </button>
                  ))}
                </div>
              )}

              {cafesLoading ? (
                <div className="flex flex-col gap-3" role="status" aria-label="Loading cafés">
                  {[...Array(3)].map((_, i) => (
                    <CafeResultSkeleton key={i} />
                  ))}
                </div>
              ) : filteredCafes.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {filteredCafes.map((cafe) => (
                    <CafeResultCard
                      key={cafe.id}
                      cafe={cafe}
                      gameName={selectedGame.name}
                    />
                  ))}
                </div>
              ) : cafesWithGame.length > 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-6 text-center text-gray-400">
                  <p className="text-sm font-medium text-gray-500">
                    No cafés in{" "}
                    <span className="text-gray-700 font-bold">
                      {activeCity}
                    </span>{" "}
                    carry {selectedGame.name}.
                  </p>
                  <button
                    onClick={() => setActiveCity("All")}
                    className="mt-3 text-xs text-teal-600 font-medium hover:underline"
                  >
                    Show all cities
                  </button>
                </div>
              ) : (
                <div className="bg-white border border-gray-100 rounded-xl p-6 text-center text-gray-400">
                  <p className="text-sm font-medium text-gray-500">
                    No cafés in our network currently carry{" "}
                    <span className="text-gray-700 font-bold">
                      {selectedGame.name}
                    </span>
                    .
                  </p>
                  <p className="text-xs mt-1">
                    Try a different game or check back later.
                  </p>
                </div>
              )}

              <div className="border-t border-gray-200 mt-10 mb-8" />
            </div>
          )}

          {/* Game grid */}
          <div>
            {/* sr-only live region announces section title changes to screen readers */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {sectionTitle}
            </div>
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {sectionTitle}
                </h2>
                <div className="w-20 h-1 bg-warm-400 mt-1 mb-4 rounded-full" />
              </div>
              {isSearchMode && searchLoading && (
                <div role="status" className="flex items-center gap-1.5 text-xs text-teal-600 mt-1">
                  <Loader2 size={13} className="animate-spin" aria-hidden="true" /> Searching...
                </div>
              )}
            </div>

            {(recommendedLoading && !isSearchMode) ||
            (searchLoading && searchGames.length === 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" role="status" aria-label="Loading games">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-white border border-gray-100 rounded-xl animate-pulse"
                    style={{ animationDelay: `${i * 80}ms` }}
                  />
                ))}
              </div>
            ) : displayGames.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayGames.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onClick={handleSelectGame}
                      selected={selectedGame?.id === game.id}
                      onViewDetails={setDetailGame}
                    />
                  ))}
                </div>

                {isSearchMode && hasMore && (
                  <div className="flex flex-col items-center gap-2 mt-8">
                    <p className="text-xs text-gray-400">
                      Showing {searchGames.length} of {totalResults} games
                    </p>
                    <SecondaryButton
                      label="Load more games"
                      onClick={loadMore}
                      isLoading={loadingMore}
                      size="small"
                      rightIcon={<ChevronDown size={15} />}
                    />
                  </div>
                )}

                {isSearchMode && !hasMore && searchGames.length > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-6">
                    All {totalResults} results loaded
                  </p>
                )}
              </>
            ) : isSearchMode && !searchLoading ? (
              <div className="text-center py-16 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
                <p className="text-sm font-semibold text-gray-500">
                  No games found for "{activeQuery}"
                </p>
                <p className="text-xs mt-1">
                  Try a different spelling or game name
                </p>
                <button
                  onClick={handleClearSearch}
                  className="mt-4 text-xs text-teal-600 font-medium hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <GameDetailModal game={detailGame} onClose={() => setDetailGame(null)} />
    </>
  );
}
