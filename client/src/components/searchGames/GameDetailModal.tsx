import { useEffect, useRef } from "react";
import {
  X,
  Star,
  Users,
  Clock,
  UserRound,
  Layers,
  ExternalLink,
  Pencil,
  Building2,
} from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: "bg-pink-50 text-pink-700 border-pink-100",
  Party: "bg-purple-50 text-purple-700 border-purple-100",
  Cooperative: "bg-yellow-50 text-yellow-700 border-yellow-100",
  Abstract: "bg-blue-50 text-blue-700 border-blue-100",
  Thematic: "bg-rose-50 text-rose-700 border-rose-100",
  Family: "bg-green-50 text-green-700 border-green-100",
  Wargame: "bg-orange-50 text-orange-700 border-orange-100",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function categoryColor(cat: string) {
  for (const key of Object.keys(CATEGORY_COLORS)) {
    if (cat.toLowerCase().includes(key.toLowerCase()))
      return CATEGORY_COLORS[key];
  }
  return "bg-gray-50 text-gray-600 border-gray-100";
}

function HalfCircleIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0"
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="6"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <path d="M 7 1 A 6 6 0 0 0 7 13 Z" fill="currentColor" />
    </svg>
  );
}
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame | null;
  onClose: () => void;
}

export function GameDetailModal({ game, onClose }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll
  useEffect(() => {
    if (game) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [game]);

  // Move focus to close button when modal opens
  useEffect(() => {
    if (game) closeButtonRef.current?.focus();
  }, [!!game]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const focusable = Array.from(
      modalRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!game) return null;

  // Trim description to a readable length
  const description = game.description
    ? game.description.length > 600
      ? game.description.slice(0, 600).trimEnd() + "…"
      : game.description
    : "No description available.";

  const stats: { icon: React.ReactNode; label: string; value: string }[] = [
    {
      icon: <Users size={13} className="shrink-0" aria-hidden="true" />,
      label: "Players",
      value: `${game.players} players`,
    },
    {
      icon: <Clock size={13} className="shrink-0" aria-hidden="true" />,
      label: "Duration",
      value: game.duration,
    },
    {
      icon: <HalfCircleIcon />,
      label: "Difficulty",
      value: game.difficulty ?? "Unknown",
    },
    ...(game.age
      ? [
          {
            icon: (
              <UserRound size={13} className="shrink-0" aria-hidden="true" />
            ),
            label: "Min. Age",
            value: game.age,
          },
        ]
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-detail-title"
        aria-describedby="game-detail-description"
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* ── Header image band ───────────────────────────────────────── */}
        <div className="relative h-36 bg-teal-800 shrink-0 overflow-hidden">
          {/* Blurred bg — purely decorative */}
          {game.image && (
            <img
              src={game.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-b from-teal-900/60 to-teal-800/90" />

          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close game details"
            className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 border border-white/60 flex items-center justify-center transition-colors z-10 cursor-pointer"
          >
            <X size={13} className="text-white block" aria-hidden="true" />
          </button>

          {/* Game image + title */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 px-5 pb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 shadow-lg mb-1">
              {game.image ? (
                <img
                  src={game.image}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  role="img"
                  aria-label={game.name}
                  className="w-full h-full bg-teal-600 flex items-center justify-center text-white font-black text-xl"
                >
                  {game.name[0]}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2
                id="game-detail-title"
                className="text-lg sm:text-2xl font-bold text-white leading-tight truncate"
              >
                {game.name}
              </h2>
              {(game.designer || game.publisher) && (
                <div className="flex flex-col gap-0.5 mt-1">
                  {game.designer && (
                    <div className="flex items-center gap-1.5">
                      <Pencil
                        size={11}
                        className="text-white/80 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-white/90 truncate sm:text-sm">
                        <span className="font-semibold">Designer:</span>{" "}
                        {game.designer}
                      </span>
                    </div>
                  )}
                  {game.publisher && (
                    <div className="flex items-center gap-1.5">
                      <Building2
                        size={11}
                        className="text-white/80 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="text-xs sm:text-sm text-white/90 truncate">
                        <span className="font-semibold">Publisher:</span>{" "}
                        {game.publisher}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {game.rating && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star
                    size={12}
                    className="text-amber-300 fill-amber-300"
                    aria-hidden="true"
                  />
                  <span className="sr-only">Rating:</span>
                  <span className="text-sm font-bold text-white">
                    {game.rating}
                  </span>
                  <span className="text-xs text-teal-100">
                    on BoardGameGeek
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5 bg-warm-50">
          {/* Stats grid */}
          <dl className="grid grid-cols-2 gap-2">
            {stats.map(({ icon, label, value }) => (
              <div
                key={label}
                className="bg-warm-100 border border-warm-300 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-3 flex flex-col gap-1"
              >
                <dt className="flex items-center gap-1.5 text-gray-500">
                  {icon}
                  <span className="text-[11px] sm:text-[11px] font-medium text-gray-600 uppercase tracking-widest">
                    {label}
                  </span>
                </dt>
                <dd>
                  {label === "Difficulty" ? (
                    <DifficultyDots
                      difficulty={game.difficulty}
                      dots={game.weightDots}
                      textSizeClass="text-sm sm:text-base"
                    />
                  ) : (
                    <span className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
                      {value}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {/* Description */}
          <div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              About this game
            </h3>
            <p
              id="game-detail-description"
              className="text-sm text-gray-600 leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Categories */}
          {game.categories.length > 0 && (
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  aria-hidden="true"
                >
                  <circle cx="17" cy="7" r="3" />
                  <circle cx="7" cy="17" r="3" />
                  <path d="M14 14h6v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 4h6v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
                </svg>
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {game.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      aria-hidden="true"
                    >
                      <circle cx="17" cy="7" r="3" />
                      <circle cx="7" cy="17" r="3" />
                      <path d="M14 14h6v5a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1zM4 4h6v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
                    </svg>
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-warm-300" />

          {/* Footer row */}
          <div className="flex items-center justify-between gap-3">
            <a
              href={`https://boardgamegeek.com/boardgame/${game.id}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View on BoardGameGeek (opens in new tab)"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-teal-700 transition-colors"
            >
              <Layers size={12} aria-hidden="true" />
              View on BoardGameGeek
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
