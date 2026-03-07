import { Users, Clock } from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame;
  onClick: (game: BGGGame) => void;
  selected?: boolean;
}

export function GameCard({ game, onClick, selected }: Props) {
  return (
    <button
      onClick={() => onClick(game)}
      className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all duration-150 ${
        selected
          ? "border-teal-500 bg-teal-50 shadow-sm"
          : "border-gray-100 bg-white hover:border-teal-200 hover:shadow-sm"
      }`}
    >
      {/* Game image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">
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

        {/* Category tags */}
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
  );
}
