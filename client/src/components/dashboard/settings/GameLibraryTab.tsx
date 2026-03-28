import { useState, useEffect, useCallback } from "react";
import { SettingsPanel } from "./SettingsPanel";
import GameSearchPanel from "./GameSearchPanel";
import { useBusinessSettings, type GameItem } from "../../../hooks/useBusinessSettings";
import type { BGGGame } from "../../../hooks/useBGG";
import { Loader2 } from "lucide-react";

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

export default function GameLibraryTab({ onBack }: { onBack: () => void }) {
  const { fetchGames, addGame, removeGame, saving } = useBusinessSettings();
  const [library, setLibrary] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<Set<string>>(new Set());
  const [removing, setRemoving] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchGames().then((data) => {
      setLibrary(data);
      setLoading(false);
    });
  }, [fetchGames]);

  const handleAdd = useCallback(
    async (game: BGGGame) => {
      const bggId = String(game.id);
      setAdding((prev) => new Set(prev).add(bggId));
      const [min, max] = parsePlayers(game.players);
      const result = await addGame({
        bggId,
        name: game.name,
        imageUrl: game.image || null,
        minPlayers: min,
        maxPlayers: max,
        estimatedPlayTime: parseDuration(game.duration),
        category: game.categories?.[0] ?? null,
        difficulty: game.difficulty ?? null,
      });
      if (result?.success) {
        setLibrary((prev) => [...prev, result.data as GameItem]);
      }
      setAdding((prev) => {
        const next = new Set(prev);
        next.delete(bggId);
        return next;
      });
    },
    [addGame],
  );

  const handleRemove = useCallback(
    async (restaurantGameId: number) => {
      setRemoving((prev) => new Set(prev).add(restaurantGameId));
      const result = await removeGame(restaurantGameId);
      if (result?.success) {
        setLibrary((prev) => prev.filter((g) => g.restaurantGameId !== restaurantGameId));
      }
      setRemoving((prev) => {
        const next = new Set(prev);
        next.delete(restaurantGameId);
        return next;
      });
    },
    [removeGame],
  );

  if (loading) {
    return (
      <SettingsPanel title="Game Library" subtitle="Manage your board game collection" onBack={onBack}>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Game Library"
      subtitle="Search BoardGameGeek and add games your café offers"
      onBack={onBack}
      onSave={async () => true}
      saving={saving}
    >
      <GameSearchPanel
        library={library}
        adding={adding}
        removing={removing}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
    </SettingsPanel>
  );
}
