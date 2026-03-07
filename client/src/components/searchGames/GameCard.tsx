import { Users, Clock, ChevronRight } from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame;
  onClick: (game: BGGGame) => void;
  onViewDetails: (game: BGGGame) => void;
  selected?: boolean;
}

export function GameCard({ game, onClick, onViewDetails, selected }: Props) {
  return (
    <div
      className={`w-full text-left flex flex-col rounded-xl border transition-all duration-150 overflow-hidden  ${
        selected
          ? "border-teal-500 bg-warm-100 shadow-sm"
          : "border-warm-300 bg-white hover:border-teal-200 hover:shadow-sm"
      }`}
    >
      {/* Main clickable area */}
      <button
        onClick={() => onClick(game)}
        className="flex items-start gap-4 p-4 w-full text-left cursor-pointer"
      >
        {/* Game image */}
        <div className="w-30 h-30 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
          {game.image ? (
            <img
              src={game.image}
              alt={game.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              No image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1.5">
            {game.name}
          </h3>

          <DifficultyDots difficulty={game.difficulty} dots={game.weightDots} />

          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Users size={13} />
              <span className="text-xs">{game.players} players</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={13} />
              <span className="text-xs">{game.duration}</span>
            </div>
          </div>

          {game.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {game.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="text-xs bg-[#fdf0e8] text-[#b07040] px-2 py-0.5 rounded-md font-medium flex items-center gap-1"
                >
                  <span className="text-[10px]">⊞</span> {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </button>

      {/* View details link — separated from select click */}
      <div
        className={`border-t px-4 py-2 ${
          selected ? "border-teal-200" : "border-gray-100"
        }`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(game);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
        >
          View game details
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
