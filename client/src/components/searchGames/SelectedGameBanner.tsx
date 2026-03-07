import { X, Star, Users, Clock, Shield, Baby } from "lucide-react";
import { type BGGGame } from "../../hooks/useBGG";
import { DifficultyDots } from "./DifficultyDots";

interface Props {
  game: BGGGame;
  onClose: () => void;
}

export function SelectedGameBanner({ game, onClose }: Props) {
  // Truncate description
  const desc = game.description
    ? game.description
        .replace(/&#10;/g, " ")
        .replace(/&amp;/g, "&")
        .slice(0, 160) + "..."
    : null;

  const stats = [
    { icon: Users, label: "PLAYERS", value: game.players },
    { icon: Clock, label: "DURATION", value: game.duration },
    {
      icon: Shield,
      label: "DIFFICULTY",
      value: (
        <span className="flex items-center gap-2">
          <DifficultyDots difficulty={game.difficulty} dots={game.weightDots} />
        </span>
      ),
    },
    ...(game.age ? [{ icon: Baby, label: "AGE", value: game.age }] : []),
  ];

  return (
    <div className="w-full bg-teal-700 rounded-xl p-5 text-white relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
      >
        <X size={13} className="text-white" />
      </button>

      {/* Title row */}
      <div className="flex items-center gap-2 mb-1 -mt-2">
        <img
          src={game.image}
          alt={game.name}
          className="w-38 h-38 rounded-sm object-cover"
        />
        <div className="flex flex-col ">
          <h2 className="text-lg font-bold text-white">{game.name}</h2>
          <p className="text-sm text-teal-200 mb-2 ml-1">
            {/* hardcoded for now — will come from backend later */}4 cafés have
            this game
          </p>
          {game.rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                <Star size={12} className="text-amber-300 fill-amber-300" />
                <span className="text-sm font-bold text-white">
                  {game.rating}
                </span>
              </div>
              <span className="text-sm text-teal-200">Highly Rated</span>
            </div>
          )}
          {desc && (
            <p className="text-sm text-teal-100 leading-relaxed mb-4">{desc}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white/10 rounded-lg px-3 py-2.5">
            <p className="text-[10px] font-semibold text-teal-300 tracking-widest uppercase mb-1">
              {label}
            </p>
            <div className="text-sm font-bold text-white">
              {typeof value === "string" ? value : value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
