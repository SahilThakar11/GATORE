/**
 * Tests for the useMyReservations hook.
 *
 * Strategy:
 *  - Mock useAuth so we can control the user / accessToken independently for
 *    each test scenario without needing a real AuthProvider.
 *  - Stub globalThis.fetch (via vi.stubGlobal) to intercept all API calls.
 *  - Verify three top-level behaviours:
 *      1. Unauthenticated path: loading reaches false immediately, no fetch.
 *      2. Authenticated path: correct Authorization header, data is populated.
 *      3. cancelReservation(): issues a PATCH, then updates status locally.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMyReservations } from '../../../src/hooks/useReservations';
import type { Reservation } from '../../../src/hooks/useReservations';
import { useAuth } from '../../../src/context/AuthContext';

// ─── Mock AuthContext ─────────────────────────────────────────────────────────

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;

// ─── Test data ────────────────────────────────────────────────────────────────

const MOCK_USER = { id: '1', email: 'user@example.com', name: 'Test User', role: 'user' as const };
const MOCK_TOKEN = 'Bearer.token.here';

const makeReservation = (id: number, status = 'confirmed'): Reservation => ({
  id,
  reservationDate: '2026-03-24',
  startTime: '2026-03-24T18:00:00.000Z',
  endTime: '2026-03-24T20:00:00.000Z',
  partySize: 4,
  status,
  specialRequests: null,
  table: {
    id: 1,
    name: 'Table A',
    restaurant: {
      id: 1,
      name: 'Board & Brew',
      address: '123 Main St',
      city: 'Toronto',
      logoUrl: null,
    },
  },
  gameReservations: [],
});

const MOCK_RESERVATIONS: Reservation[] = [
  makeReservation(101, 'confirmed'),
  makeReservation(102, 'confirmed'),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetchOk(data: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
}

function mockFetchFail() {
  return vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
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
// Unauthenticated
// ═══════════════════════════════════════════════════════════════════════════════

describe('when no user is logged in', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: null, accessToken: null });
  });

  it('sets loading=false without calling fetch', async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('returns an empty reservations array and no error', async () => {
    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reservations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('returns cancelling=null', async () => {
    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cancelling).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Authenticated — initial fetch
// ═══════════════════════════════════════════════════════════════════════════════

describe('when a user is logged in', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, accessToken: MOCK_TOKEN });
  });

  it('starts with loading=true', () => {
    vi.stubGlobal('fetch', mockFetchOk({ data: [] }));

    const { result } = renderHook(() => useMyReservations());

    expect(result.current.loading).toBe(true);
  });

  it('fetches /api/reservations/my on mount', async () => {
    const mockFetch = mockFetchOk({ data: MOCK_RESERVATIONS });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useMyReservations());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [url] = mockFetch.mock.calls[0];
    expect(url).toBe('/api/reservations/my');
  });

  it('sends the Authorization header with the access token', async () => {
    const mockFetch = mockFetchOk({ data: MOCK_RESERVATIONS });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useMyReservations());

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));

    const [, init] = mockFetch.mock.calls[0];
    expect((init as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: `Bearer ${MOCK_TOKEN}` }),
    );
  });

  it('populates reservations from json.data on success', async () => {
    vi.stubGlobal('fetch', mockFetchOk({ data: MOCK_RESERVATIONS }));

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.reservations).toEqual(MOCK_RESERVATIONS);
    expect(result.current.error).toBeNull();
  });

  it('sets error when the response is not ok', async () => {
    vi.stubGlobal('fetch', mockFetchFail());

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load reservations');
    expect(result.current.reservations).toEqual([]);
  });

  it('sets error when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// cancelReservation
// ═══════════════════════════════════════════════════════════════════════════════

describe('cancelReservation()', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER, accessToken: MOCK_TOKEN });
  });

  it('issues a PATCH to /api/reservations/:id/cancel with the auth token', async () => {
    const mockFetch = vi.fn()
      // Initial load
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: MOCK_RESERVATIONS }) })
      // Cancel call
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.cancelReservation(101); });

    const cancelCall = mockFetch.mock.calls[1];
    const [cancelUrl, cancelInit] = cancelCall;
    expect(cancelUrl).toBe('/api/reservations/101/cancel');
    expect((cancelInit as RequestInit).method).toBe('PATCH');
    expect((cancelInit as RequestInit).headers).toEqual(
      expect.objectContaining({ Authorization: `Bearer ${MOCK_TOKEN}` }),
    );
  });

  it('updates the cancelled reservation status to "cancelled" locally', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: MOCK_RESERVATIONS }) })
        .mockResolvedValueOnce({ ok: true, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.cancelReservation(101); });

    const cancelled = result.current.reservations.find((r) => r.id === 101);
    const untouched = result.current.reservations.find((r) => r.id === 102);

    expect(cancelled?.status).toBe('cancelled');
    expect(untouched?.status).toBe('confirmed');
  });

  it('sets cancelling to the reservation id during the request, then resets to null', async () => {
    let resolvePatch!: () => void;
    const patchPromise = new Promise<void>((res) => { resolvePatch = res; });

    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: MOCK_RESERVATIONS }) })
        .mockReturnValueOnce(
          patchPromise.then(() => ({ ok: true, json: async () => ({}) })),
        ),
    );

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Start cancel without awaiting.
    act(() => { result.current.cancelReservation(101); });

    await waitFor(() => expect(result.current.cancelling).toBe(101));

    // Resolve the PATCH.
    await act(async () => { resolvePatch(); });

    await waitFor(() => expect(result.current.cancelling).toBeNull());
  });

  it('resets cancelling to null even when the PATCH fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: MOCK_RESERVATIONS }) })
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.cancelReservation(101); });

    expect(result.current.cancelling).toBeNull();
  });

  it('does not change other reservation statuses when cancel fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => ({ data: MOCK_RESERVATIONS }) })
        .mockResolvedValueOnce({ ok: false, json: async () => ({}) }),
    );

    const { result } = renderHook(() => useMyReservations());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => { await result.current.cancelReservation(101); });

    // On silent-fail the local state should NOT have been updated.
    expect(result.current.reservations.find((r) => r.id === 101)?.status).toBe('confirmed');
  });
});
