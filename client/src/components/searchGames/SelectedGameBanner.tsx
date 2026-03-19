import { useRef, useEffect } from "react";
import { X, Star, Users, Clock, UserRound } from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame;
  onClose: () => void;
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

export function SelectedGameBanner({ game, onClose }: Props) {
  const bannerRef = useRef<HTMLDivElement>(null);

  // Move focus to banner when it appears so keyboard/screen reader users are aware
  useEffect(() => {
    bannerRef.current?.focus();
  }, []);

  const ratingLabel = (() => {
    const r = parseFloat(game.rating ?? "0");
    if (r >= 9.0) return "Exceptional";
    if (r >= 8.0) return "Highly Rated";
    if (r >= 7.0) return "Well Rated";
    if (r >= 6.0) return "Above Average";
    if (r >= 5.0) return "Average";
    return "Mixed Reviews";
  })();

  const desc = game.description
    ? game.description
        .replace(/&#10;/g, " ")
        .replace(/&amp;/g, "&")
        .slice(0, 220) + "..."
    : null;

  const stats: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }[] = [
    {
      icon: <Users size={13} className="shrink-0" aria-hidden="true" />,
      label: "Players",
      value: game.players,
    },
    {
      icon: <Clock size={13} className="shrink-0" aria-hidden="true" />,
      label: "Duration",
      value: game.duration,
    },
    {
      icon: <HalfCircleIcon />,
      label: "Difficulty",
      value: (
        <span className="flex items-center gap-2">
          <DifficultyDots
            difficulty={game.difficulty}
            dots={game.weightDots}
            isTextWhite={true}
            filledClass="bg-teal-900"
            emptyClass="bg-white"
          />
        </span>
      ),
    },
    ...(game.age
      ? [
          {
            icon: (
              <UserRound size={13} className="shrink-0" aria-hidden="true" />
            ),
            label: "Age",
            value: game.age,
          },
        ]
      : []),
  ];

  return (
    // aria-live so screen readers announce the banner when it dynamically appears
    <div
      ref={bannerRef}
      tabIndex={-1}
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Selected game: ${game.name}`}
      className="w-full bg-teal-700 rounded-xl p-5 text-white relative focus:outline-none"
    >
      <button
        onClick={onClose}
        aria-label="Dismiss selected game"
        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 border border-white/60 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X size={13} className="text-white" aria-hidden="true" />
      </button>

      {/* Title row */}
      <div className="flex items-center gap-2 mb-1">
        <img
          src={game.image}
          alt={game.name}
          className="w-38 h-38 rounded-sm object-cover"
        />
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-white">{game.name}</h2>
          {game.rating && (
            <div className="flex items-center gap-2">
              {/* sr-only provides the label; visual elements are hidden from AT */}
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                <span className="sr-only">Rating: {game.rating}</span>
                <Star
                  size={12}
                  className="text-amber-300 fill-amber-300"
                  aria-hidden="true"
                />
                <span
                  className="text-base font-bold text-white"
                  aria-hidden="true"
                >
                  {game.rating}
                </span>
              </div>
              <span className="text-base text-teal-50">{ratingLabel}</span>
            </div>
          )}
          {desc && (
            <p className="text-sm text-teal-50 leading-relaxed">{desc}</p>
          )}
        </div>
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {stats.map(({ icon, label, value }) => (
          <div
            key={label}
            className="rounded-lg px-3 py-2.5"
            style={{
              backgroundColor: "rgba(0,0,0,0.15)",
              outline: "1px solid rgba(255,255,255,0.20)",
            }}
          >
            <dt className="flex items-center gap-1 text-white/80 mb-1 text-[11px] font-medium tracking-widest uppercase">
              {icon}
              {label}
            </dt>
            <dd className="text-base font-semibold text-white">
              {typeof value === "string" ? value : value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
