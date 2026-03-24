import { useState, useEffect } from "react";
import { Upload, Link, Search, X, Loader2 } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";
import { useBusinessSettings, type GameItem } from "../../../hooks/useBusinessSettings";

export default function GameLibraryTab({ onBack }: { onBack: () => void }) {
  const { fetchGames, removeGame } = useBusinessSettings();
  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames().then((data) => {
      setGames(data);
      setLoading(false);
    });
  }, [fetchGames]);

  const handleRemove = async (restaurantGameId: number) => {
    const result = await removeGame(restaurantGameId);
    if (result.success) {
      setGames((prev) => prev.filter((g) => g.restaurantGameId !== restaurantGameId));
    }
  };

  const addOptions = [
    {
      icon: Upload,
      iconBg: "bg-teal-50 text-teal-600",
      title: "Upload CSV File",
      desc: "Import your entire game library at once using a CSV file. Download our template to get started.",
    },
    {
      icon: Link,
      iconBg: "bg-amber-50 text-amber-600",
      title: "Import from Board Game Geek",
      desc: "Connect your BoardGameGeek account to automatically import your collection.",
    },
    {
      icon: Search,
      iconBg: "bg-purple-50 text-purple-600",
      title: "Search & Add Manually",
      desc: "Search BoardGameGeek and add games one at a time to build your library.",
    },
  ];

  if (loading) {
    return (
      <SettingsPanel title="Game Library" subtitle="Manage your game collection" onBack={onBack}>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Game Library"
      subtitle="Enhance your game library to keep your customers informed about their available play options"
      onBack={onBack}
    >
      {/* Current Games */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Current Games in Library ({games.length})
      </h3>
      <div className="flex flex-col gap-3 mb-8">
        {games.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No games in your library yet. Add some below!
          </p>
        )}
        {games.map((game) => (
          <div
            key={game.restaurantGameId}
            className="flex items-start gap-4 border border-gray-200 rounded-xl p-4"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No img
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{game.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                {game.description || "No description available"}
              </p>
            </div>
            <button
              onClick={() => handleRemove(game.restaurantGameId)}
              className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer shrink-0 mt-1"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add more games */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">Add more games</h3>
      <div className="flex flex-col gap-2">
        {addOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.title}
              className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-4 text-left hover:bg-gray-50/50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{opt.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </SettingsPanel>
  );
}
