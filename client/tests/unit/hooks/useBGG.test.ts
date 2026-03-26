/**
 * Tests for useBGGPopular and useBGGSearch hooks.
 *
 * Strategy:
 *  - Stub globalThis.fetch before each test so network calls never leave the process.
 *  - useBGGPopular fires a single fetch on mount; we verify loading states, the
 *    happy-path (games populated), and the error-path (non-ok response / thrown error).
 *  - useBGGSearch is tested for search(), loadMore(), and clear() in isolation,
 *    plus edge-cases such as an empty query and a failed search-ids request.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBGGPopular, useBGGSearch } from '../../../src/hooks/useBGG';
import type { BGGGame } from '../../../src/hooks/useBGG';

// ─── Shared test data ─────────────────────────────────────────────────────────

const makeGame = (id: string, name: string): BGGGame => ({
  id,
  name,
  image: `https://example.com/${id}.jpg`,
  description: `Description for ${name}`,
  players: '2-4',
  duration: '60-120 min',
  age: '14+',
  rating: 8.5,
  difficulty: 'Medium',
  weightDots: 3,
  categories: ['Strategy'],
  designer: 'Designer Name',
  publisher: 'Publisher Name',
});

const MOCK_GAMES: BGGGame[] = [
  makeGame('174430', 'Gloomhaven'),
  makeGame('169786', 'Scythe'),
  makeGame('266192', 'Wingspan'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFail(status = 500) {
  return vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: async () => ({ message: 'Server error' }),
  });
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// useBGGPopular
// ═══════════════════════════════════════════════════════════════════════════════

describe('useBGGPopular', () => {
  describe('initial state', () => {
    it('starts with loading=true, empty games array and no error', async () => {
      // Resolve immediately so the hook finishes cleanly after the assertion.
      vi.stubGlobal('fetch', mockFetchOk(MOCK_GAMES));

      const { result } = renderHook(() => useBGGPopular());

      // Captured synchronously before the microtask queue drains.
      expect(result.current.loading).toBe(true);
      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBeNull();

      await waitFor(() => expect(result.current.loading).toBe(false));
    });
  });

  describe('success', () => {
    it('populates games and clears loading when the fetch resolves', async () => {
      vi.stubGlobal('fetch', mockFetchOk(MOCK_GAMES));

      const { result } = renderHook(() => useBGGPopular());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.games).toEqual(MOCK_GAMES);
      expect(result.current.error).toBeNull();
    });

    it('calls fetch with the 12 popular BGG IDs joined by commas', async () => {
      const mockFetch = mockFetchOk(MOCK_GAMES);
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useBGGPopular());

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toMatch(/^\/api\/bgg\/games\?ids=/);
      // All 12 IDs should be present
      expect(url).toContain('174430');
      expect(url).toContain('182028');
    });
  });

  describe('error handling', () => {
    it('sets error and clears loading when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail());

      const { result } = renderHook(() => useBGGPopular());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Failed to fetch games');
      expect(result.current.games).toEqual([]);
    });

    it('sets error and clears loading when fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network offline')));

      const { result } = renderHook(() => useBGGPopular());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Network offline');
      expect(result.current.games).toEqual([]);
    });

    it('uses a fallback error message when the thrown value has no message', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(null));

      const { result } = renderHook(() => useBGGPopular());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Failed to load games');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useBGGSearch
// ═══════════════════════════════════════════════════════════════════════════════

describe('useBGGSearch', () => {
  // 10 fake search-result IDs so we can test pagination (page size = 8).
  const SEARCH_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const PAGE_1_GAMES = SEARCH_IDS.slice(0, 8).map((id) => makeGame(id, `Game ${id}`));
  const PAGE_2_GAMES = SEARCH_IDS.slice(8).map((id) => makeGame(id, `Game ${id}`));

  describe('initial state', () => {
    it('starts with all state fields at their default values', () => {
      const { result } = renderHook(() => useBGGSearch());

      expect(result.current.games).toEqual([]);
      expect(result.current.query).toBe('');
      expect(result.current.loading).toBe(false);
      expect(result.current.loadingMore).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(false);
      expect(result.current.totalResults).toBe(0);
    });
  });

  describe('search()', () => {
    it('ignores calls with an empty / whitespace-only query', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('   ');
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    it('sets loading=true, resets state, then populates games on success', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          // First call: search-ids
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          // Second call: game details for page 1
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('catan');
      });

      expect(result.current.query).toBe('catan');
      expect(result.current.games).toEqual(PAGE_1_GAMES);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.totalResults).toBe(10);
    });

    it('derives hasMore correctly when more pages exist', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('catan');
      });

      // 8 games loaded out of 10 total IDs → hasMore should be true
      expect(result.current.hasMore).toBe(true);
    });

    it('sets hasMore=false when all results fit on the first page', async () => {
      const fewIds = ['1', '2', '3'];
      const fewGames = fewIds.map((id) => makeGame(id, `Game ${id}`));

      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => fewIds })
          .mockResolvedValueOnce({ ok: true, json: async () => fewGames }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('catan');
      });

      expect(result.current.hasMore).toBe(false);
    });

    it('URL-encodes the search query when calling the API', async () => {
      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => [] });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('settlers of catan');
      });

      const searchUrl: string = mockFetch.mock.calls[0][0];
      expect(searchUrl).toBe('/api/bgg/search-ids?q=settlers%20of%20catan');
    });

    it('sets error and clears loading when search-ids request is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(500));

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('catan');
      });

      expect(result.current.error).toBe('Search failed');
      expect(result.current.loading).toBe(false);
      expect(result.current.games).toEqual([]);
    });

    it('sets error when search-ids fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('DNS failure')));

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => {
        await result.current.search('catan');
      });

      expect(result.current.error).toBe('DNS failure');
      expect(result.current.loading).toBe(false);
    });

    it('replaces previous results when a new search is performed', async () => {
      const firstGames = [makeGame('1', 'First')];
      const secondGames = [makeGame('2', 'Second')];

      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => ['1'] })
          .mockResolvedValueOnce({ ok: true, json: async () => firstGames })
          .mockResolvedValueOnce({ ok: true, json: async () => ['2'] })
          .mockResolvedValueOnce({ ok: true, json: async () => secondGames }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('first'); });
      await act(async () => { await result.current.search('second'); });

      expect(result.current.games).toEqual(secondGames);
      expect(result.current.query).toBe('second');
    });
  });

  describe('loadMore()', () => {
    it('appends the next page of games to the existing list', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_2_GAMES }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });
      await act(async () => { await result.current.loadMore(); });

      expect(result.current.games).toHaveLength(10);
      expect(result.current.games).toEqual([...PAGE_1_GAMES, ...PAGE_2_GAMES]);
    });

    it('sets loadingMore during the load-more fetch', async () => {
      let resolveDetails!: (value: unknown) => void;
      const detailsPromise = new Promise((res) => { resolveDetails = res; });

      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES })
          // The third call (loadMore details) hangs until we resolve manually.
          .mockReturnValueOnce(
            detailsPromise.then(() => ({ ok: true, json: async () => PAGE_2_GAMES })),
          ),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });

      // Start loadMore without awaiting so we can inspect mid-flight state.
      act(() => { result.current.loadMore(); });

      await waitFor(() => expect(result.current.loadingMore).toBe(true));

      // Resolve the in-flight details request.
      await act(async () => { resolveDetails(undefined); });

      await waitFor(() => expect(result.current.loadingMore).toBe(false));
    });

    it('does nothing when there are no more pages', async () => {
      const fewIds = ['1', '2'];
      const fewGames = fewIds.map((id) => makeGame(id, `Game ${id}`));

      const mockFetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => fewIds })
        .mockResolvedValueOnce({ ok: true, json: async () => fewGames });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });

      const callCountAfterSearch = mockFetch.mock.calls.length;

      await act(async () => { await result.current.loadMore(); });

      // No additional fetch should have been made.
      expect(mockFetch.mock.calls.length).toBe(callCountAfterSearch);
    });

    it('sets hasMore=false after all pages are loaded', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_2_GAMES }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });
      await act(async () => { await result.current.loadMore(); });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe('clear()', () => {
    it('resets all state fields back to their defaults', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn()
          .mockResolvedValueOnce({ ok: true, json: async () => SEARCH_IDS })
          .mockResolvedValueOnce({ ok: true, json: async () => PAGE_1_GAMES }),
      );

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });

      act(() => { result.current.clear(); });

      expect(result.current.games).toEqual([]);
      expect(result.current.query).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.hasMore).toBe(false);
      expect(result.current.totalResults).toBe(0);
      expect(result.current.loading).toBe(false);
    });

    it('also clears any error state that was set', async () => {
      vi.stubGlobal('fetch', mockFetchFail());

      const { result } = renderHook(() => useBGGSearch());

      await act(async () => { await result.current.search('catan'); });
      expect(result.current.error).not.toBeNull();

      act(() => { result.current.clear(); });

      expect(result.current.error).toBeNull();
    });
  });
});
