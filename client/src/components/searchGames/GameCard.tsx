import { useState, useRef, useLayoutEffect } from "react";
import { Users, Clock } from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";
import { TextButton } from "../ui/TextButton";

interface Props {
  game: BGGGame;
  onClick: (game: BGGGame) => void;
  onViewDetails: (game: BGGGame) => void;
  selected?: boolean;
  selectable?: boolean;
}

export function GameCard({
  game,
  onClick,
  onViewDetails,
  selected,
  selectable = true,
}: Props) {
  const [hovered, setHovered] = useState(false);
  const tagsRef = useRef<HTMLDivElement>(null);
  const [tagsOverflow, setTagsOverflow] = useState(false);

  useLayoutEffect(() => {
    if (game.categories.length < 2) return;
    const container = tagsRef.current;
    if (!container) return;
    const check = () => {
      const tags = container.querySelectorAll<HTMLElement>("[data-tag]");
      if (tags.length < 2) return;
      const gap = 6; // gap-1.5
      setTagsOverflow(
        tags[0].offsetWidth + gap + tags[1].offsetWidth > container.clientWidth,
      );
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, [game.categories]);

  return (
    <div
      className={`relative w-full text-left flex flex-col rounded-xl border transition-all duration-150 overflow-hidden ${
        selected
          ? "border-teal-500 bg-warm-100 shadow-sm"
          : "border-warm-300 bg-warm-50 hover:border-teal-500 hover:shadow-sm"
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Warm gradient overlay on hover */}
      <div
        className="absolute inset-x-0 top-0 h-56 rounded-t-xl pointer-events-none transition-opacity duration-200"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(250, 242, 233, 0.9), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Main clickable area */}
      <button
        onClick={() => onClick(game)}
        aria-pressed={selected}
        className={`relative flex items-start gap-4 p-4 w-full text-left flex-1 ${selectable ? "cursor-pointer" : "cursor-default"}`}
      >
        {/* Game image */}
        <div className="w-30 h-30 md:w-24 md:h-24 lg:w-30 lg:h-30 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
          {game.image ? (
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs sm:text-sm">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-lg md:text-base lg:text-lg font-bold text-gray-900 leading-snug mb-1.5">
            {game.name}
          </h3>

          <DifficultyDots
            difficulty={game.difficulty}
            dots={game.weightDots}
            textSizeClass="text-xs lg:text-sm"
          />

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Users size={13} className="sm:hidden" aria-hidden="true" />
              <Users size={15} className="hidden sm:block" aria-hidden="true" />
              <span className="text-xs lg:text-sm">{game.players} players</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock size={13} className="sm:hidden" aria-hidden="true" />
              <Clock size={15} className="hidden sm:block" aria-hidden="true" />
              <span className="text-xs lg:text-sm">{game.duration}</span>
            </div>
          </div>

          {game.categories.length > 0 && (
            <div
              ref={tagsRef}
              className="flex flex-wrap gap-x-1.5 mt-2 overflow-hidden max-h-5 lg:max-h-6"
            >
              {/* First tag — always visible, order:1 */}
              <span
                data-tag=""
                className="text-xs lg:text-sm bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shrink-0 order-1"
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
                {game.categories[0]}
              </span>
              {/* Ellipsis — order:2, sits right after first tag when second overflows */}
              {tagsOverflow && game.categories.length > 1 && (
                <span className="text-xs text-gray-400 font-medium self-center order-2">
                  …
                </span>
              )}
              {/* Second tag — always in DOM for measurement, hidden when overflowing, order:3 */}
              {game.categories.length > 1 && (
                <span
                  data-tag=""
                  className="text-xs lg:text-sm bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 shrink-0 order-3"
                  style={{ visibility: tagsOverflow ? "hidden" : "visible" }}
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
                  {game.categories[1]}
                </span>
              )}
            </div>
          )}
        </div>
      </button>

      {/* View details link — separated from select click */}
      <div
        className={`relative border-t px-3 py-1 ${
          selected ? "border-teal-200" : "border-warm-200"
        }`}
      >
        <TextButton
          label="View game details"
          size="small"
          onClick={() => onViewDetails(game)}
          rightIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1.5em"
              height="1.5em"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M3 9a1 1 0 0 0 0 2h18a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2z"
                strokeWidth="0.4"
                stroke="currentColor"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}
