import { useState, useCallback, useEffect } from "react";

export interface BGGGame {
  id: string;
  name: string;
  image: string;
  description: string;
  players: string;
  duration: string;
  age: string | null;
  rating: number | null;
  difficulty: string | null;
  weightDots: number;
  categories: string[];
}

const POPULAR_IDS = [
  "174430",
  "169786",
  "266192",
  "13",
  "30549",
  "68448",
  "167791",
  "161936",
  "224517",
  "220308",
  "233078",
  "182028",
];

export function useBGGPopular() {
  const [games, setGames] = useState<BGGGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const ids = POPULAR_IDS.join(",");
        const res = await globalThis.fetch(`/api/bgg/games?ids=${ids}`);
        if (!res.ok) throw new Error("Failed to fetch games");
        setGames(await res.json());
      } catch (e: any) {
        setError(e?.message ?? "Failed to load games");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { games, loading, error };
}

// BGG search returns all matching IDs at once — we paginate client-side
const SEARCH_PAGE_SIZE = 8;

export function useBGGSearch() {
  const [allIds, setAllIds] = useState<string[]>([]); // all matched IDs from search
  const [games, setGames] = useState<BGGGame[]>([]); // loaded game details
  const [page, setPage] = useState(0); // how many pages loaded
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const hasMore = games.length < allIds.length;
  const totalResults = allIds.length;

  // Fetch details for a batch of IDs
  const fetchDetails = useCallback(
    async (ids: string[], isLoadMore = false) => {
      if (ids.length === 0) return;

      isLoadMore ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await globalThis.fetch(
          `/api/bgg/games?ids=${ids.join(",")}`,
        );
        if (!res.ok) throw new Error("Failed to fetch game details");
        const data: BGGGame[] = await res.json();
        setGames((prev) => (isLoadMore ? [...prev, ...data] : data));
      } catch (e: any) {
        setError(e?.message ?? "Failed to load games");
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [],
  );

  const search = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      setQuery(q);
      setLoading(true);
      setError(null);
      setGames([]);
      setPage(0);
      setAllIds([]);

      try {
        // Get all matching IDs from search
        const res = await globalThis.fetch(
          `/api/bgg/search-ids?q=${encodeURIComponent(q)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const ids: string[] = await res.json();

        setAllIds(ids);
        setPage(1);

        // Load first page of details
        await fetchDetails(ids.slice(0, SEARCH_PAGE_SIZE));
      } catch (e: any) {
        setError(e?.message ?? "Search failed");
        setLoading(false);
      }
    },
    [fetchDetails],
  );

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    const start = nextPage * SEARCH_PAGE_SIZE;
    const end = start + SEARCH_PAGE_SIZE;
    const nextIds = allIds.slice(start, end);

    if (nextIds.length === 0) return;

    setPage(nextPage);
    await fetchDetails(nextIds, true);
  }, [page, allIds, fetchDetails]);

  const clear = useCallback(() => {
    setQuery("");
    setGames([]);
    setAllIds([]);
    setPage(0);
    setError(null);
  }, []);

  return {
    games,
    query,
    loading,
    loadingMore,
    error,
    hasMore,
    totalResults,
    search,
    loadMore,
    clear,
  };
}
