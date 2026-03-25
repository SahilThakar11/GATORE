import { useState, useRef, useCallback } from "react";
import { Search, X, Plus, Check, Users, Clock, Loader2 } from "lucide-react";
import { useBGGSearch, type BGGGame } from "../../../hooks/useBGG";
import type { GameItem } from "../../../hooks/useBusinessSettings";

interface GameSearchPanelProps {
  /** Games already in the library */
  library: GameItem[];
  adding?: Set<string>; // bggIds currently being added
  removing?: Set<number>; // restaurantGameIds currently being removed
  onAdd: (game: BGGGame) => void;
  onRemove: (restaurantGameId: number) => void;
}

/** Convert a BGG players string like "2–5" to min/max numbers */
function parsePlayers(players: string): [number, number] {
  const parts = players.replace("–", "-").split("-").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  const n = parseInt(players);
  return [isNaN(n) ? 1 : n, isNaN(n) ? 1 : n];
}

function parseDuration(duration: string): number {
  const m = duration.match(/(\d+)/);
  return m ? parseInt(m[1]) : 60;
}

function complexityDots(weightDots: number) {
  const count = Math.min(weightDots, 3);
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-2 h-2 rounded-full ${i < count ? "bg-amber-500" : "bg-gray-200"}`}
        />
      ))}
      <span className="text-xs text-gray-500 ml-0.5">
        {["Easy", "Medium", "Hard"][Math.min(count - 1, 2)] ?? "Easy"}
      </span>
    </div>
  );
}

export default function GameSearchPanel({
  library,
  adding = new Set(),
  removing = new Set(),
  onAdd,
  onRemove,
}: GameSearchPanelProps) {
  const { games, loading, loadingMore, hasMore, search, loadMore, clear } = useBGGSearch();
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
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search BoardGameGeek… (e.g. Catan, Pandemic)"
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); clear(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Current library */}
      {library.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            In Your Library ({library.length})
          </p>
          <div className="flex flex-col gap-2">
            {library.map((g) => (
              <div
                key={g.restaurantGameId}
                className="flex items-center gap-3 border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                  {g.imageUrl ? (
                    <img src={g.imageUrl} alt={g.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">?</div>
                  )}
                </div>
                <p className="flex-1 text-sm font-semibold text-gray-800 truncate">{g.name}</p>
                <button
                  onClick={() => onRemove(g.restaurantGameId)}
                  disabled={removing.has(g.restaurantGameId)}
                  className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40 shrink-0"
                >
                  {removing.has(g.restaurantGameId)
                    ? <Loader2 size={14} className="animate-spin" />
                    : <X size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider / prompt */}
      {query ? (
        <p className="text-xs text-gray-400">
          {loading ? "Searching…" : `Results for "${query}"`}
        </p>
      ) : (
        <p className="text-xs text-gray-400">
          Start typing to search the BoardGameGeek database
        </p>
      )}

      {/* Search results */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {!loading && games.length > 0 && (
        <div className="flex flex-col gap-3">
          {games.map((game) => {
            const inLibrary = libraryBggIds.has(String(game.id));
            const isAdding = adding.has(String(game.id));
            const [min, max] = parsePlayers(game.players);
            const dur = parseDuration(game.duration);

            return (
              <div
                key={game.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                  inLibrary
                    ? "border-teal-300 bg-teal-50/40"
                    : "border-gray-200 bg-white hover:border-teal-200"
                }`}
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {game.image ? (
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">?</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-snug truncate">{game.name}</p>
                  <div className="mt-1 mb-1.5">{complexityDots(game.weightDots)}</div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {min === max ? min : `${min}–${max}`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {dur} min
                    </span>
                  </div>
                  {game.categories?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1.5">
                      {game.categories.slice(0, 2).map((cat) => (
                        <span key={cat} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
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
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:cursor-default ${
                    inLibrary
                      ? "bg-teal-100 text-teal-600"
                      : isAdding
                        ? "bg-gray-100 text-gray-400"
                        : "bg-teal-600 text-white hover:bg-teal-700"
                  }`}
                >
                  {isAdding ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : inLibrary ? (
                    <Check size={13} />
                  ) : (
                    <Plus size={13} />
                  )}
                </button>
              </div>
            );
          })}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-2.5 text-sm font-medium text-teal-600 border border-teal-200 rounded-xl hover:bg-teal-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}

      {!loading && query && games.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No games found for "{query}"</p>
      )}
    </div>
  );
}
