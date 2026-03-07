import { useEffect } from "react";
import {
  X,
  Star,
  Users,
  Clock,
  Baby,
  Shield,
  Hash,
  Layers,
  ExternalLink,
} from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame | null;
  onClose: () => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: "bg-pink-50 text-pink-700 border-pink-100",
  Party: "bg-purple-50 text-purple-700 border-purple-100",
  Cooperative: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Abstract: "bg-blue-50 text-blue-700 border-blue-100",
  Thematic: "bg-rose-50 text-rose-700 border-rose-100",
  Family: "bg-green-50 text-green-700 border-green-100",
  Wargame: "bg-orange-50 text-orange-700 border-orange-100",
};

function categoryColor(cat: string) {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (cat.toLowerCase().includes(key.toLowerCase()))
      return CATEGORY_COLORS[key];
  }
  return "bg-gray-50 text-gray-600 border-gray-100";
}

export function GameDetailModal({ game, onClose }: Props) {
  // Lock body scroll
  useEffect(() => {
    if (game) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [game]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!game) return null;

  // Trim description to a readable length
  const description = game.description
    ? game.description.length > 600
      ? game.description.slice(0, 600).trimEnd() + "…"
      : game.description
    : "No description available.";

  const stats = [
    { icon: Users, label: "Players", value: `${game.players} players` },
    { icon: Clock, label: "Duration", value: game.duration },
    { icon: Shield, label: "Difficulty", value: game.difficulty ?? "Unknown" },
    ...(game.age ? [{ icon: Baby, label: "Min. Age", value: game.age }] : []),
    ...(game.rating
      ? [{ icon: Star, label: "BGG Rating", value: String(game.rating) }]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Header image band ───────────────────────────────────────── */}
        <div className="relative h-36 bg-teal-800 shrink-0 overflow-hidden">
          {/* Blurred bg from game image */}
          {game.image && (
            <img
              src={game.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-teal-900/60 to-teal-800/90" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
          >
            <X size={14} className="text-white" />
          </button>

          {/* Game image + title */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 px-5 pb-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 shadow-lg mb-1">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-teal-600 flex items-center justify-center text-white font-black text-xl">
                  {game.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-lg font-black text-white leading-tight truncate">
                {game.name}
              </h2>
              {game.rating && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={12} className="text-amber-300 fill-amber-300" />
                  <span className="text-sm font-bold text-white">
                    {game.rating}
                  </span>
                  <span className="text-xs text-teal-300">
                    on BoardGameGeek
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-[#faf8f4] border border-gray-100 rounded-xl px-3 py-3 flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Icon size={12} className="text-teal-500 shrink-0" />
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    {label}
                  </span>
                </div>
                {label === "Difficulty" ? (
                  <DifficultyDots
                    difficulty={game.difficulty}
                    dots={game.weightDots}
                  />
                ) : label === "BGG Rating" ? (
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-gray-800">
                      {value}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-gray-800 leading-tight">
                    {value}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              About this game
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Categories */}
          {game.categories.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Hash size={11} /> Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((cat) => (
                  <span
                    key={cat}
                    className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${categoryColor(cat)}`}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Footer row */}
          <div className="flex items-center justify-between gap-3">
            <a
              href={`https://boardgamegeek.com/boardgame/${game.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-teal-600 transition-colors"
            >
              <Layers size={12} />
              View on BoardGameGeek
              <ExternalLink size={11} />
            </a>

            <button
              onClick={onClose}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
