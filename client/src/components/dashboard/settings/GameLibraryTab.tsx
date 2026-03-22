import { useState } from "react";
import { Upload, Link, Search, X } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

interface GameItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

const MOCK_GAMES: GameItem[] = [
  {
    id: "1",
    name: "Wingspan",
    description:
      "Strategically manage your resources, build habitats, and score points through various objectives as you explore the beauty of avian life.",
    imageUrl:
      "https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__thumb/img/VNToqgS2-pOGU6MuvIkMPKn_y-s=/fit-in/200x150/filters:strip_icc()/pic4458123.jpg",
  },
  {
    id: "2",
    name: "Dune: Imperium – Uprising",
    description:
      "Effectively allocate your resources, construct outposts, and earn points by completing diverse objectives as you delve into the captivating world of Dune Imperium Rising.",
    imageUrl:
      "https://cf.geekdo-images.com/0kFMKjsDW1JMS--LRrIxFw__thumb/img/xG8NxDe-0-2WEaz_GFhHjiO-S4Y=/fit-in/200x150/filters:strip_icc()/pic7477524.jpg",
  },
  {
    id: "3",
    name: "Scythe Board Game",
    description:
      "Strategically manage your resources, build habitats, and score points through various objectives as you explore the beauty of avian life.",
    imageUrl:
      "https://cf.geekdo-images.com/7k_nOxpO9OGIjhLq2BUZdA__thumb/img/HIdkMO1sS2nYPDNeDuVT-8MHjsE=/fit-in/200x150/filters:strip_icc()/pic3163924.jpg",
  },
];

export default function GameLibraryTab({ onBack }: { onBack: () => void }) {
  const [games, setGames] = useState<GameItem[]>(MOCK_GAMES);

  const removeGame = (id: string) =>
    setGames((prev) => prev.filter((g) => g.id !== id));

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
        {games.map((game) => (
          <div
            key={game.id}
            className="flex items-start gap-4 border border-gray-200 rounded-xl p-4"
          >
            <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900">{game.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug line-clamp-2">
                {game.description}
              </p>
            </div>
            <button
              onClick={() => removeGame(game.id)}
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
