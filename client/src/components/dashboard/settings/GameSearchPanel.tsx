import { useState, useRef, useCallback } from "react";
import { Search, X, Plus, Check, Users, Clock, Loader2 } from "lucide-react";
import { useBGGSearch, type BGGGame } from "../../../hooks/useBGG";
import type { GameItem } from "../../../hooks/useBusinessSettings";
import { DifficultyDots } from "../../searchGames/DifficultyDots";
import { SecondaryButton } from "../../ui/SecondaryButton";

interface GameSearchPanelProps {
  /** Games already in the library */
  library: GameItem[];
  adding?: Set<string>; // bggIds currently being added
  removing?: Set<number>; // restaurantGameIds currently being removed
  onAdd: (game: BGGGame) => void;
  onRemove: (restaurantGameId: number) => void;
}

export default function GameSearchPanel({
  library,
  adding = new Set(),
  removing = new Set(),
  onAdd,
  onRemove,
}: GameSearchPanelProps) {
  const {
    games,
    loading,
    loadingMore,
    hasMore,
    error,
    search,
    loadMore,
    clear,
  } = useBGGSearch();
  const [query, setQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const libraryBggIds = new Set(library.map((g) => g.bggId));

  const handleQueryChange = useCallback(
    (val: string) => {
      setQuery(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!val.trim()) {
        clear();
        return;
      }
      debounceRef.current = setTimeout(() => search(val.trim()), 500);
    },
    [search, clear],
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Search bar */}
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search BoardGameGeek… (e.g. Catan, Pandemic)"
          className="w-full pl-9 pr-8 py-3 text-sm border border-warm-300 rounded-lg bg-warm-50 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder:text-neutral-500"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              clear();
            }}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 cursor-pointer"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Current library */}
      {library.length > 0 && (
        <div>
          <p className="text-sm font-bold text-neutral-800 mb-3">
            In Your Library ({library.length})
          </p>
          <div className="flex flex-col gap-2">
            {library.map((g) => (
              <div
                key={g.restaurantGameId}
                className="flex items-center gap-3 border border-warm-200 bg-warm-50 rounded-xl px-3 py-2.5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-warm-200 shrink-0">
                  {g.imageUrl ? (
                    <img
                      src={g.imageUrl}
                      alt={g.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-warm-600" aria-hidden="true">
                      ?
                    </div>
                  )}
                </div>
                <p className="flex-1 text-sm font-semibold text-neutral-800 truncate">
                  {g.name}
                </p>
                <button
                  onClick={() => onRemove(g.restaurantGameId)}
                  disabled={removing.has(g.restaurantGameId)}
                  aria-label={`Remove ${g.name} from library`}
                  className="text-neutral-500 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {removing.has(g.restaurantGameId) ? (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <X size={14} aria-hidden="true" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider / prompt */}
      {query ? (
        <p className="text-xs text-neutral-500">
          {loading ? "Searching…" : `Results for "${query}"`}
        </p>
      ) : (
        <p className="text-xs text-neutral-500">
          Start typing to search the BoardGameGeek database
        </p>
      )}

      {/* Search results */}
      {loading && (
        <div className="space-y-3" role="status" aria-label="Loading search results">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-warm-100 rounded-xl animate-pulse"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <p role="alert" className="text-sm text-red-500 text-center py-4">{error}</p>
      )}

      {!loading && games.length > 0 && (
        <div className="flex flex-col gap-3">
          {games.map((game) => {
            const inLibrary = libraryBggIds.has(String(game.id));
            const isAdding = adding.has(String(game.id));

            return (
              <div
                key={game.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 ${
                  inLibrary
                    ? "border-teal-500 bg-warm-100 shadow-sm"
                    : "border-warm-300 bg-warm-50 hover:border-teal-500 hover:shadow-sm"
                }`}
              >
                {/* Image */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-warm-100 border border-warm-200 shrink-0">
                  {game.image ? (
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-600 text-xs" aria-hidden="true">
                      ?
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-800 leading-snug truncate mb-1.5">
                    {game.name}
                  </p>
                  <DifficultyDots
                    difficulty={game.difficulty}
                    dots={game.weightDots}
                    textSizeClass="text-xs"
                  />
                  <div className="flex items-center gap-4 mt-2 text-xs text-neutral-600">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} aria-hidden="true" />
                      {game.players} players
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} aria-hidden="true" />
                      {game.duration}
                    </span>
                  </div>
                  {game.categories?.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-1.5">
                      {game.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add / Added button */}
                <button
                  onClick={() => !inLibrary && onAdd(game)}
                  disabled={inLibrary || isAdding}
                  aria-label={inLibrary ? `${game.name} already in library` : `Add ${game.name} to library`}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:cursor-default mt-1 ${
                    inLibrary
                      ? "bg-teal-100 text-teal-700 text-semibold ring ring-teal-700"
                      : isAdding
                        ? "bg-warm-100 text-warm-500"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {isAdding ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : inLibrary ? (
                    <Check size={13} strokeWidth={4} />
                  ) : (
                    <Plus size={13} strokeWidth={4} />
                  )}
                </button>
              </div>
            );
          })}

          {hasMore && (
            <div className="[&>button]:w-full">
              <SecondaryButton
                label="Load more"
                onClick={loadMore}
                disabled={loadingMore}
                isLoading={loadingMore}
                size="small"
              />
            </div>
          )}
        </div>
      )}

      {!loading && !error && query && games.length === 0 && (
        <p className="text-sm text-neutral-500 text-center py-4">
          No games found for "{query}"
        </p>
      )}
    </div>
  );
}
