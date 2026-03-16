import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, ChevronDown, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useBGGSearch, type BGGGame } from "../hooks/useBGG";
import { useCafesByGame, type CafeSummary } from "../hooks/useCafe";
import { useRecommendedGames } from "../hooks/useRecommendedGames";
import { GameCard } from "../components/searchGames/GameCard";
import { SelectedGameBanner } from "../components/searchGames/SelectedGameBanner";
import { GameDetailModal } from "../components/searchGames/GameDetailModal";

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
  return (
    <Link
      to={`/cafe/${cafe.id}`}
      className="group flex items-start gap-4 bg-warm-100 border border-warm-300 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all"
    >
      {/* Logo */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
        {cafe.logoUrl ? (
          <img
            src={cafe.logoUrl}
            alt={cafe.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-black text-lg">
            {cafe.name[0]}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-700 transition-colors truncate">
            {cafe.name}
          </h3>
        </div>

        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
          <div className="flex items-center gap-1 text-gray-400">
            <MapPin size={11} />
            <span className="text-xs">
              {cafe.address}, {cafe.city}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-700">
              {Number(cafe.rating).toFixed(1)}
            </span>
            <span className="text-xs text-gray-400">({cafe.reviewCount})</span>
          </div>
        </div>

        <p className="text-xs text-teal-600 font-medium mt-1.5">
          ✓ Has <span className="font-bold">{gameName}</span> available
        </p>
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
    setTimeout(() => {
      document
        .getElementById("cafe-results")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
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
        <div className="max-w-5xl mx-auto px-7 py-10">
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
              className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3.5 shadow-sm transition-all ${
                inputValue
                  ? "border-teal-400 ring-2 ring-teal-100"
                  : "border-gray-200"
              }`}
            >
              {searchLoading ? (
                <Loader2
                  size={17}
                  className="text-teal-500 shrink-0 animate-spin"
                />
              ) : (
                <Search size={17} className="text-gray-400 shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                placeholder="Search for a board game..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
              />
              {inputValue && (
                <button
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
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
            <div id="cafe-results" className="mb-10">
              <h2 className="text-base font-bold text-gray-700 mb-3">
                Cafés with{" "}
                <span className="text-teal-700">{selectedGame.name}</span>
              </h2>

              {cafesLoading ? (
                <div className="flex flex-col gap-3">
                  {[...Array(3)].map((_, i) => (
                    <CafeResultSkeleton key={i} />
                  ))}
                </div>
              ) : cafesWithGame.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {cafesWithGame.map((cafe) => (
                    <CafeResultCard
                      key={cafe.id}
                      cafe={cafe}
                      gameName={selectedGame.name}
                    />
                  ))}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-700">
                {sectionTitle}
              </h2>
              {isSearchMode && searchLoading && (
                <div className="flex items-center gap-1.5 text-xs text-teal-600">
                  <Loader2 size={13} className="animate-spin" /> Searching...
                </div>
              )}
            </div>

            {(recommendedLoading && !isSearchMode) ||
            (searchLoading && searchGames.length === 0) ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 border border-gray-200 bg-white hover:border-teal-400 hover:text-teal-700 text-sm font-semibold text-gray-600 px-6 py-2.5 rounded-lg transition-all disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />{" "}
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={15} /> Load more games
                        </>
                      )}
                    </button>
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
                <Search size={32} className="mx-auto mb-3 opacity-30" />
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
