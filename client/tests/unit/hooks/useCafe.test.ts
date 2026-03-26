/**
 * Tests for the useCafe.ts module.
 *
 * Covers:
 *  - formatMinutes() utility function (pure, no fetch required)
 *  - useCafes()          — list with and without city filter, error path
 *  - useCafe()           — single café by id, no-id early exit, error path
 *  - useCafeGames()      — happy path, no-id early exit, refetch with category
 *  - useCafeAvailability() — happy path, early exit when id/date is missing
 *  - useCafesByGame()    — happy path, early exit when bggId is null
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import {
  formatMinutes,
  useCafes,
  useCafe,
  useCafeGames,
  useCafeAvailability,
  useCafesByGame,
} from '../../../src/hooks/useCafe';
import type { CafeSummary, CafeDetail, CafeGame, AvailabilityResult } from '../../../src/hooks/useCafe';

// ─── Shared test fixtures ─────────────────────────────────────────────────────

const MOCK_CAFE_SUMMARY: CafeSummary = {
  id: 1,
  name: 'Board & Brew',
  tagline: 'Where games meet coffee',
  city: 'Toronto',
  province: 'ON',
  address: '123 Main St',
  phone: '416-555-0100',
  website: 'https://boardandbrew.ca',
  logoUrl: null,
  rating: 4.5,
  reviewCount: 42,
  operatingHours: [],
  _count: { restaurantGames: 20, tables: 8 },
};

const MOCK_CAFE_DETAIL: CafeDetail = {
  ...MOCK_CAFE_SUMMARY,
  description: 'A cosy board game café in the heart of Toronto.',
  postalCode: 'M5V 1A1',
  tables: [
    { id: 1, name: 'Table A', capacity: 4, minCapacity: 2, status: 'available', description: null },
  ],
  restaurantGames: [],
};

const MOCK_GAME: CafeGame = {
  id: 10,
  bggId: '174430',
  name: 'Gloomhaven',
  imageUrl: null,
  category: 'Strategy',
  difficulty: 'Heavy',
  minPlayers: 1,
  maxPlayers: 4,
  estimatedPlayTime: 120,
  bggRating: 8.7,
  ageRating: '14+',
  status: 'available',
};

const MOCK_AVAILABILITY: AvailabilityResult = {
  isOpen: true,
  openTime: 540,
  closeTime: 1320,
  slots: [
    { time: '2026-03-24T10:00:00.000Z', available: true, reservedGameIds: [] },
    { time: '2026-03-24T11:00:00.000Z', available: false, reservedGameIds: [10] },
  ],
};

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
    json: async () => ({}),
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
// formatMinutes
// ═══════════════════════════════════════════════════════════════════════════════

describe('formatMinutes', () => {
  it('formats midnight (0) as 12:00 AM', () => {
    expect(formatMinutes(0)).toBe('12:00 AM');
  });

  it('formats noon (720) as 12:00 PM', () => {
    expect(formatMinutes(720)).toBe('12:00 PM');
  });

  it('formats 9:00 AM correctly (540 minutes)', () => {
    expect(formatMinutes(540)).toBe('9:00 AM');
  });

  it('formats 9:30 AM correctly (570 minutes)', () => {
    expect(formatMinutes(570)).toBe('9:30 AM');
  });

  it('formats 1:00 PM correctly (780 minutes)', () => {
    expect(formatMinutes(780)).toBe('1:00 PM');
  });

  it('formats 11:59 PM correctly (1439 minutes)', () => {
    expect(formatMinutes(1439)).toBe('11:59 PM');
  });

  it('pads single-digit minutes with a leading zero', () => {
    expect(formatMinutes(601)).toBe('10:01 AM');
  });

  it('handles 1:00 AM (60 minutes)', () => {
    expect(formatMinutes(60)).toBe('1:00 AM');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useCafes
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCafes', () => {
  describe('without a city filter', () => {
    it('starts with loading=true and an empty cafes array', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ data: [] }));

      const { result } = renderHook(() => useCafes());

      expect(result.current.loading).toBe(true);
      expect(result.current.cafes).toEqual([]);

      await waitFor(() => expect(result.current.loading).toBe(false));
    });

    it('populates cafes from result.data on success', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ data: [MOCK_CAFE_SUMMARY] }));

      const { result } = renderHook(() => useCafes());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.cafes).toEqual([MOCK_CAFE_SUMMARY]);
      expect(result.current.error).toBeNull();
    });

    it('calls /api/restaurant with no query string when city is omitted', async () => {
      const mockFetch = mockFetchOk({ data: [] });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafes());

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/restaurant');
    });
  });

  describe('with a city filter', () => {
    it('appends the city as a URL-encoded query parameter', async () => {
      const mockFetch = mockFetchOk({ data: [] });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafes('New York'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/restaurant?city=New%20York');
    });

    it('returns only cafes matching the city', async () => {
      const toronto = { ...MOCK_CAFE_SUMMARY, id: 2, city: 'Vancouver' };
      vi.stubGlobal('fetch', mockFetchOk({ data: [toronto] }));

      const { result } = renderHook(() => useCafes('Vancouver'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.cafes).toEqual([toronto]);
    });
  });

  describe('error handling', () => {
    it('sets error when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(404));

      const { result } = renderHook(() => useCafes());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/404/);
      expect(result.current.cafes).toEqual([]);
    });

    it('sets error when fetch throws a network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

      const { result } = renderHook(() => useCafes());

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Network down');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useCafe
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCafe', () => {
  describe('when id is not provided', () => {
    it('sets loading=false immediately without making any fetch call', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafe(undefined));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.cafe).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('when a numeric id is provided', () => {
    it('fetches /api/restaurant/:id and populates cafe from result.data', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ data: MOCK_CAFE_DETAIL }));

      const { result } = renderHook(() => useCafe(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.cafe).toEqual(MOCK_CAFE_DETAIL);
      expect(result.current.error).toBeNull();
    });

    it('uses the correct URL with the provided id', async () => {
      const mockFetch = mockFetchOk({ data: MOCK_CAFE_DETAIL });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafe(42));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/restaurant/42');
    });
  });

  describe('when a string id is provided', () => {
    it('works with a string id', async () => {
      const mockFetch = mockFetchOk({ data: MOCK_CAFE_DETAIL });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafe('7'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/restaurant/7');
    });
  });

  describe('error handling', () => {
    it('sets error when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(404));

      const { result } = renderHook(() => useCafe(99));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/404/);
      expect(result.current.cafe).toBeNull();
    });

    it('sets error when fetch throws', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Timeout')));

      const { result } = renderHook(() => useCafe(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Timeout');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useCafeGames
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCafeGames', () => {
  describe('when restaurantId is not provided', () => {
    it('sets loading=false without making a fetch call', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafeGames(undefined));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.games).toEqual([]);
    });
  });

  describe('success', () => {
    it('fetches /api/restaurant/:id/games and populates games from result.data', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ data: [MOCK_GAME] }));

      const { result } = renderHook(() => useCafeGames(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.games).toEqual([MOCK_GAME]);
      expect(result.current.error).toBeNull();
    });

    it('uses the correct URL for the given restaurantId', async () => {
      const mockFetch = mockFetchOk({ data: [] });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafeGames(5));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/restaurant/5/games');
    });
  });

  describe('refetch()', () => {
    it('refetches without a category filter when called with no argument', async () => {
      const mockFetch = mockFetchOk({ data: [MOCK_GAME] });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafeGames(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.refetch(); });

      // Two calls total: initial mount + explicit refetch
      expect(mockFetch).toHaveBeenCalledTimes(2);
      const secondUrl: string = mockFetch.mock.calls[1][0];
      expect(secondUrl).toBe('/api/restaurant/1/games');
    });

    it('appends a URL-encoded category query param when provided', async () => {
      const mockFetch = mockFetchOk({ data: [] });
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafeGames(3));

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => { await result.current.refetch('Strategy'); });

      const lastUrl: string = mockFetch.mock.calls[mockFetch.mock.calls.length - 1][0];
      expect(lastUrl).toBe('/api/restaurant/3/games?category=Strategy');
    });
  });

  describe('error handling', () => {
    it('sets error when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(500));

      const { result } = renderHook(() => useCafeGames(1));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/500/);
      expect(result.current.games).toEqual([]);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useCafeAvailability
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCafeAvailability', () => {
  describe('when restaurantId or date is missing', () => {
    it('does not fetch and keeps availability=null when restaurantId is missing', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafeAvailability(undefined, '2026-03-24'));

      // loading starts as false for this hook (no id/date guard)
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.availability).toBeNull();
    });

    it('does not fetch and keeps availability=null when date is missing', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafeAvailability(1, null));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.availability).toBeNull();
    });
  });

  describe('success', () => {
    it('populates availability from result.data on success', async () => {
      vi.stubGlobal('fetch', mockFetchOk({ data: MOCK_AVAILABILITY }));

      const { result } = renderHook(() => useCafeAvailability(1, '2026-03-24'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.availability).toEqual(MOCK_AVAILABILITY);
      expect(result.current.error).toBeNull();
    });

    it('includes partySize in the query string when provided', async () => {
      const mockFetch = mockFetchOk({ data: MOCK_AVAILABILITY });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafeAvailability(2, '2026-03-24', 4));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).toContain('date=2026-03-24');
      expect(url).toContain('partySize=4');
    });

    it('omits partySize from the query string when not provided', async () => {
      const mockFetch = mockFetchOk({ data: MOCK_AVAILABILITY });
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafeAvailability(1, '2026-03-24'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      const url: string = mockFetch.mock.calls[0][0];
      expect(url).not.toContain('partySize');
    });
  });

  describe('error handling', () => {
    it('sets error when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(503));

      const { result } = renderHook(() => useCafeAvailability(1, '2026-03-24'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/503/);
      expect(result.current.availability).toBeNull();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// useCafesByGame
// ═══════════════════════════════════════════════════════════════════════════════

describe('useCafesByGame', () => {
  const MOCK_GAME_RESPONSE = {
    data: {
      restaurants: [MOCK_CAFE_SUMMARY],
      game: { name: 'Gloomhaven' },
    },
  };

  describe('when bggId is null', () => {
    it('returns empty cafes and empty gameName without fetching', async () => {
      const mockFetch = vi.fn();
      vi.stubGlobal('fetch', mockFetch);

      const { result } = renderHook(() => useCafesByGame(null));

      // loading starts as false for this hook when bggId is absent
      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(mockFetch).not.toHaveBeenCalled();
      expect(result.current.cafes).toEqual([]);
      expect(result.current.gameName).toBe('');
    });
  });

  describe('success', () => {
    it('populates cafes and gameName from the API response', async () => {
      vi.stubGlobal('fetch', mockFetchOk(MOCK_GAME_RESPONSE));

      const { result } = renderHook(() => useCafesByGame('174430'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.cafes).toEqual([MOCK_CAFE_SUMMARY]);
      expect(result.current.gameName).toBe('Gloomhaven');
      expect(result.current.error).toBeNull();
    });

    it('calls /api/games/:bggId/restaurants', async () => {
      const mockFetch = mockFetchOk(MOCK_GAME_RESPONSE);
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafesByGame('174430'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/games/174430/restaurants');
    });

    it('appends city filter when provided', async () => {
      const mockFetch = mockFetchOk(MOCK_GAME_RESPONSE);
      vi.stubGlobal('fetch', mockFetch);

      renderHook(() => useCafesByGame('174430', 'Toronto'));

      await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

      expect(mockFetch.mock.calls[0][0]).toBe('/api/games/174430/restaurants?city=Toronto');
    });
  });

  describe('error handling', () => {
    it('sets error when the response is not ok', async () => {
      vi.stubGlobal('fetch', mockFetchFail(404));

      const { result } = renderHook(() => useCafesByGame('999999'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toMatch(/404/);
      expect(result.current.cafes).toEqual([]);
    });

    it('sets error when fetch throws', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection refused')));

      const { result } = renderHook(() => useCafesByGame('174430'));

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.error).toBe('Connection refused');
    });
  });
});
