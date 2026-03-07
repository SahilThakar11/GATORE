import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, ChevronDown } from "lucide-react";
import { useBGGPopular, useBGGSearch, type BGGGame } from "../hooks/useBGG";
import { GameCard } from "../components/searchGames/GameCard";
import { SelectedGameBanner } from "../components/searchGames/SelectedGameBanner";
import { CafeResultCard } from "../components/searchGames/CafeResultCard";
import { GameDetailModal } from "../components/searchGames/GameDetailModal";

const ALL_CAFES = [
  {
    id: "adventurers-guild",
    name: "Adventurers Guild",
    address: "148 University St., Waterloo",
    rating: 4.5,
    reviewCount: 125,
    timeSlots: ["5:30 PM", "6:00 PM", "6:30 PM"],
  },
  {
    id: "mystic-tavern",
    name: "Mystic Tavern",
    address: "82 Magic Ave., Enchantment City",
    rating: 4.8,
    reviewCount: 200,
    timeSlots: ["5:00 PM", "5:30 PM", "7:00 PM"],
  },
  {
    id: "heroic-tabletop",
    name: "Hero's Rest",
    address: "22 Hero Way, Fantasy Land",
    rating: 4.2,
    reviewCount: 80,
    timeSlots: ["5:15 PM", "6:00 PM", "6:45 PM"],
  },
  {
    id: "galactic-conquest",
    name: "The Wyvern's Hoard",
    address: "12 Dragonstone Lane, Mythical City",
    rating: 4.6,
    reviewCount: 112,
    timeSlots: ["5:00 PM", "5:30 PM", "7:00 PM"],
  },
];

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function FindByGamePage() {
  const [inputValue, setInputValue] = useState("");
  const [selectedGame, setSelectedGame] = useState<BGGGame | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [detailGame, setDetailGame] = useState<BGGGame | null>(null);

  const debouncedQuery = useDebounce(inputValue, 500);

  const { games: popularGames, loading: popularLoading } = useBGGPopular();
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

  const isSearchMode = activeQuery.trim().length > 0;

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search(debouncedQuery);
    } else if (debouncedQuery.trim().length === 0) {
      clear();
    }
  }, [debouncedQuery]);

  const handleSelectGame = (game: BGGGame) => {
    setSelectedGame(game);
    // Scroll to café results
    setTimeout(() => {
      document.getElementById("cafe-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleClearGame = () => {
    setSelectedGame(null);
  };

  const handleClearSearch = () => {
    setInputValue("");
    clear();
    setSelectedGame(null);
    inputRef.current?.focus();
  };

  const displayGames = isSearchMode ? searchGames : popularGames;
  const sectionTitle = isSearchMode
    ? `Results for "${activeQuery}" (${totalResults} games found)`
    : "Popular Games";

  return (
    <>
      <div className="bg-[#faf8f4] min-h-screen">
        <div className="max-w-5xl mx-auto px-7 py-10">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="text-3xl font-black text-gray-900">Find by game</h1>
            <p className="text-sm text-gray-500 mt-1">
              Search for your favorite board game and discover cafés that have
              it
            </p>
          </div>

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
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* ─── Selected game banner ──────────────────────────────────────── */}
          {selectedGame && (
            <div className="mb-6">
              <SelectedGameBanner
                game={selectedGame}
                onClose={handleClearGame}
              />
            </div>
          )}

          {/* ─── Café results ──────────────────────────────────────────────── */}
          {selectedGame && (
            <div id="cafe-results" className="mb-10">
              <h2 className="text-base font-bold text-gray-700 mb-3">
                Cafés with{" "}
                <span className="text-teal-700">{selectedGame.name}</span>
              </h2>
              <div className="flex flex-col gap-3">
                {ALL_CAFES.map((cafe) => (
                  <CafeResultCard
                    key={cafe.id}
                    cafe={cafe}
                    gameName={selectedGame.name}
                  />
                ))}
              </div>

              {/* Divider before game grid */}
              <div className="border-t border-gray-200 mt-10 mb-8" />
            </div>
          )}

          {/* ─── Game grid ─────────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-gray-700">
                {sectionTitle}
              </h2>
              {isSearchMode && searchLoading && (
                <div className="flex items-center gap-1.5 text-xs text-teal-600">
                  <Loader2 size={13} className="animate-spin" />
                  Searching...
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {(popularLoading && !isSearchMode) ||
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

                {/* Load more — only shown in search mode */}
                {isSearchMode && hasMore && (
                  <div className="flex flex-col items-center gap-2 mt-8">
                    <p className="text-xs text-gray-400">
                      Showing {searchGames.length} of {totalResults} games
                    </p>
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 border border-gray-200 bg-white hover:border-teal-400 hover:text-teal-700 text-sm font-semibold text-gray-600 px-6 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <ChevronDown size={15} />
                          Load more games
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* All loaded message */}
                {isSearchMode && !hasMore && searchGames.length > 0 && (
                  <p className="text-center text-xs text-gray-400 mt-6">
                    All {totalResults} results loaded
                  </p>
                )}
              </>
            ) : isSearchMode && !searchLoading ? (
              /* Empty search state */
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
