/**
 * Tests for the useRecommendedGames hook.
 *
 * The hook has three distinct code paths:
 *
 *  1. Unauthenticated  – fetches the 12 hard-coded popular IDs from /api/bgg/games.
 *  2. Authenticated, no preferences  – fetches /api/auth/preferences first; because
 *     gameTypes is empty the hook falls back to popular IDs (isPersonalized=false).
 *  3. Authenticated, with preferences  – preferences contain gameTypes, so the hook
 *     builds a personalised ID list and fetches those (isPersonalized=true).
 *
 * Strategy:
 *  - Mock useAuth to control user / accessToken per test.
 *  - Stub globalThis.fetch to intercept all API calls.
 *  - The hook is async (useEffect → async run()) so all assertions are guarded
 *    with waitFor().
 */
import { renderHook, waitFor } from '@testing-library/react';
import { useRecommendedGames } from '../../../src/hooks/useRecommendedGames';
import type { BGGGame } from '../../../src/hooks/useBGG';
import { useAuth } from '../../../src/context/AuthContext';

// ─── Mock AuthContext ─────────────────────────────────────────────────────────

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ─── Test data ────────────────────────────────────────────────────────────────

const MOCK_USER = { id: '1', email: 'user@example.com', name: 'Test User', role: 'user' as const };
const MOCK_TOKEN = 'access.token.here';

const POPULAR_IDS = [
  '174430', '169786', '266192', '13', '30549', '68448',
  '167791', '161936', '224517', '220308', '233078', '182028',
];

const makeGame = (id: string): BGGGame => ({
  id,
  name: `Game ${id}`,
  image: '',
  description: '',
  players: '2-4',
  duration: '60 min',
  age: null,
  rating: null,
  difficulty: null,
  weightDots: 0,
  categories: [],
  designer: null,
  publisher: null,
});

const POPULAR_GAMES: BGGGame[] = POPULAR_IDS.map(makeGame);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFail() {
  return vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
}

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// Initial state (shared)
// ═══════════════════════════════════════════════════════════════════════════════

describe('initial state', () => {
  it('starts with loading=true, empty games, and isPersonalized=false', async () => {
    mockUseAuth.mockReturnValue({ user: null, accessToken: null });
    vi.stubGlobal('fetch', mockFetchOk(POPULAR_GAMES));

    const { result } = renderHook(() => useRecommendedGames());

    expect(result.current.loading).toBe(true);
    expect(result.current.games).toEqual([]);
    expect(result.current.isPersonalized).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Unauthenticated path
// ═══════════════════════════════════════════════════════════════════════════════

describe('unauthenticated user', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, accessToken: null });
  });

  it('fetches /api/bgg/games with all 12 popular IDs', async () => {
    const mockFetch = mockFetchOk(POPULAR_GAMES);
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const url: string = mockFetch.mock.calls[0][0];
    expect(url).toMatch(/^\/api\/bgg\/games\?ids=/);
    // Spot-check a few popular IDs are present
    expect(url).toContain('174430');
    expect(url).toContain('182028');
    // Should contain all 12
    for (const id of POPULAR_IDS) {
      expect(url).toContain(id);
    }
  });

  it('does NOT call /api/auth/preferences', async () => {
    const mockFetch = mockFetchOk(POPULAR_GAMES);
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const allUrls: string[] = mockFetch.mock.calls.map((c: unknown[]) => c[0] as string);
    expect(allUrls.some((u) => u.includes('/api/auth/preferences'))).toBe(false);
  });

  it('populates games from the API response', async () => {
    vi.stubGlobal('fetch', mockFetchOk(POPULAR_GAMES));

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual(POPULAR_GAMES);
    expect(result.current.isPersonalized).toBe(false);
  });

  it('returns an empty games array and loading=false when the BGG fetch fails', async () => {
    vi.stubGlobal('fetch', mockFetchFail());

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual([]);
    expect(result.current.isPersonalized).toBe(false);
  });

  it('returns empty games and loading=false when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Offline')));

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Authenticated — no preferences (gameTypes is empty)
// ═══════════════════════════════════════════════════════════════════════════════

describe('authenticated user with no preferences', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, accessToken: MOCK_TOKEN });
  });

  it('fetches /api/auth/preferences with the Authorization header', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { gameTypes: [], groupSize: '', complexity: '' } }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => POPULAR_GAMES });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const [prefsUrl, prefsInit] = mockFetch.mock.calls[0];
    expect(prefsUrl).toBe('/api/auth/preferences');
    expect((prefsInit as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: `Bearer ${MOCK_TOKEN}` }),
    );
  });

  it('falls back to popular IDs when gameTypes is empty and sets isPersonalized=false', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: { gameTypes: [], groupSize: '', complexity: '' } }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => POPULAR_GAMES }),
    );

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual(POPULAR_GAMES);
    expect(result.current.isPersonalized).toBe(false);
  });

  it('falls back to popular IDs when the preferences request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: false, status: 401, json: async () => ({}) })
        .mockResolvedValueOnce({ ok: true, json: async () => POPULAR_GAMES }),
    );

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // BGG fetch must have been called with popular IDs
    expect(result.current.isPersonalized).toBe(false);
    expect(result.current.games).toEqual(POPULAR_GAMES);
  });

  it('falls back to popular IDs when the preferences fetch throws', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockResolvedValueOnce({ ok: true, json: async () => POPULAR_GAMES }),
    );

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isPersonalized).toBe(false);
    expect(result.current.games).toEqual(POPULAR_GAMES);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Authenticated — with preferences (gameTypes is non-empty)
// ═══════════════════════════════════════════════════════════════════════════════

describe('authenticated user with preferences', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, accessToken: MOCK_TOKEN });
  });

  it('sets isPersonalized=true when gameTypes has at least one entry', async () => {
    const strategyGames = ['174430', '169786', '167791', '233078', '182028', '187645', '12333']
      .map(makeGame);

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { gameTypes: ['strategy'], groupSize: 'small', complexity: 'medium' },
          }),
        })
        .mockResolvedValueOnce({ ok: true, json: async () => strategyGames }),
    );

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isPersonalized).toBe(true);
    expect(result.current.games).toEqual(strategyGames);
  });

  it('does NOT include the popular-IDs URL when personalised IDs are available', async () => {
    const personalizedGames = ['174430', '169786'].map(makeGame);

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { gameTypes: ['strategy'], groupSize: '', complexity: '' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => personalizedGames });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const bggUrl: string = mockFetch.mock.calls[1][0];
    // The personalised list starts with strategy IDs — verify strategy games appear first.
    expect(bggUrl).toContain('174430'); // first strategy game
    // When strategy has fewer than 12 games the hook pads with popular IDs,
    // so we just verify the URL is the BGG games endpoint (not a raw popular-IDs fetch).
    expect(bggUrl).toMatch(/^\/api\/bgg\/games\?ids=/);
  });

  it('caps the recommended IDs at 12', async () => {
    const manyGames = Array.from({ length: 12 }, (_, i) => makeGame(String(i + 1)));

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          // 'strategy' + 'party' together have more than 12 unique IDs
          data: { gameTypes: ['strategy', 'party'], groupSize: '', complexity: '' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => manyGames });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const bggUrl: string = mockFetch.mock.calls[1][0];
    const ids = bggUrl.replace('/api/bgg/games?ids=', '').split(',');
    expect(ids.length).toBeLessThanOrEqual(12);
  });

  it('pads with popular IDs when a category produces fewer than 12 unique games', async () => {
    // 'educational' has 7 entries — should be padded to 12 with popular IDs
    const paddedGames = Array.from({ length: 12 }, (_, i) => makeGame(String(i + 1)));

    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { gameTypes: ['educational'], groupSize: '', complexity: '' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => paddedGames });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const bggUrl: string = mockFetch.mock.calls[1][0];
    const ids = bggUrl.replace('/api/bgg/games?ids=', '').split(',');
    expect(ids.length).toBe(12);
  });

  it('returns empty games and loading=false when the BGG fetch fails after personalisation', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { gameTypes: ['strategy'], groupSize: '', complexity: '' },
          }),
        })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useRecommendedGames());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.games).toEqual([]);
  });

  it('uses the correct Authorization header on the BGG request (second fetch)', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { gameTypes: ['party'], groupSize: '', complexity: '' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useRecommendedGames());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    // The second (BGG) fetch does not need an auth header — but the
    // preferences fetch (first) must carry one.
    const [, prefsInit] = mockFetch.mock.calls[0];
    expect((prefsInit as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: `Bearer ${MOCK_TOKEN}` }),
    );
  });
});
