/**
 * Tests for the useBusinessDashboard hook.
 *
 * Strategy:
 *  - Mock useAuth to provide a stable accessToken and refreshAccessToken spy.
 *  - Stub global fetch before each test using vi.stubGlobal.
 *  - Use renderHook + act/waitFor for async state assertions.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBusinessDashboard } from '../../../src/hooks/useBusinessDashboard';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../src/context/AuthContext';

const mockRefreshAccessToken = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({
    accessToken: 'test-token',
    refreshAccessToken: mockRefreshAccessToken,
  });
  vi.stubGlobal('fetch', vi.fn());
});

// ─── Helper factories ─────────────────────────────────────────────────────────

function makeProfileResponse(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      id: 1,
      name: 'Test Cafe',
      isSetupComplete: true,
      tables: [],
      menuItems: [],
      operatingHours: [],
      restaurantGames: [],
      _count: { tables: 0, restaurantGames: 0, menuItems: 0 },
      ...overrides,
    },
  };
}

function makeStatsResponse(overrides: Record<string, unknown> = {}) {
  return {
    success: true,
    data: {
      occupancy: { occupied: 2, total: 10 },
      todayReservations: { total: 5, pending: 1 },
      totalCustomersToday: 20,
      newCustomersThisWeek: 3,
      avgSessionMinutes: 90,
      reservations: [],
      ...overrides,
    },
  };
}

/**
 * Sets up fetch to respond to the two parallel mount calls:
 * - first call → profile endpoint
 * - second call → dashboard endpoint
 * Additional calls can be appended via the `extra` parameter.
 */
function setupMountFetch(
  profileBody = makeProfileResponse(),
  dashboardBody = makeStatsResponse(),
  extra: Array<unknown> = [],
) {
  const responses = [profileBody, dashboardBody, ...extra];
  responses.forEach((body) => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => body,
    });
  });
}

// ─── Mount behaviour ──────────────────────────────────────────────────────────

describe('on mount', () => {
  it('calls fetch for both profile and dashboard endpoints', async () => {
    setupMountFetch();

    renderHook(() => useBusinessDashboard());

    await waitFor(() => {
      const urls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
      expect(urls).toContain('/api/business-system/profile');
      expect(urls).toContain('/api/business-system/dashboard');
    });
  });

  it('sets stats and profile from successful responses', async () => {
    const profileBody = makeProfileResponse({ name: 'My Cafe' });
    const statsBody = makeStatsResponse({ totalCustomersToday: 42 });
    setupMountFetch(profileBody, statsBody);

    const { result } = renderHook(() => useBusinessDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.profile?.name).toBe('My Cafe');
    expect(result.current.stats?.totalCustomersToday).toBe(42);
  });

  it('sets loading=true during fetch and loading=false after', async () => {
    // Delay resolution so we can observe the loading=true state
    let resolveProfile!: (value: unknown) => void;
    let resolveDashboard!: (value: unknown) => void;

    (fetch as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce(
        new Promise((r) => { resolveProfile = r; }),
      )
      .mockReturnValueOnce(
        new Promise((r) => { resolveDashboard = r; }),
      );

    const { result } = renderHook(() => useBusinessDashboard());

    // loading should be true before data arrives
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveProfile({ status: 200, json: async () => makeProfileResponse() });
      resolveDashboard({ status: 200, json: async () => makeStatsResponse() });
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });
});

// ─── needsSetup ───────────────────────────────────────────────────────────────

describe('needsSetup', () => {
  it('is true when profile is null (before data arrives)', async () => {
    // Simulate a fetch that never resolves so profile stays null
    (fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useBusinessDashboard());

    expect(result.current.needsSetup).toBe(true);
  });

  it('is true when profile.isSetupComplete=false', async () => {
    setupMountFetch(makeProfileResponse({ isSetupComplete: false }));

    const { result } = renderHook(() => useBusinessDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.needsSetup).toBe(true);
  });

  it('is false when profile.isSetupComplete=true', async () => {
    setupMountFetch(makeProfileResponse({ isSetupComplete: true }));

    const { result } = renderHook(() => useBusinessDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.needsSetup).toBe(false);
  });
});

// ─── fetchWithAuth 401 retry ──────────────────────────────────────────────────

describe('fetchWithAuth 401 retry', () => {
  it('calls refreshAccessToken and retries the request after a 401', async () => {
    const newToken = 'refreshed-token';
    mockRefreshAccessToken.mockResolvedValue(newToken);

    // Both mount fetches return 401 on first attempt, then succeed on retry
    (fetch as ReturnType<typeof vi.fn>)
      // First profile attempt → 401
      .mockResolvedValueOnce({ status: 401, json: async () => ({}) })
      // Profile retry after token refresh
      .mockResolvedValueOnce({ status: 200, json: async () => makeProfileResponse() })
      // First dashboard attempt → 401
      .mockResolvedValueOnce({ status: 401, json: async () => ({}) })
      // Dashboard retry after token refresh
      .mockResolvedValueOnce({ status: 200, json: async () => makeStatsResponse() });

    const { result } = renderHook(() => useBusinessDashboard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockRefreshAccessToken).toHaveBeenCalled();
    // Retried requests should carry the new token
    const allCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
    const retryCalls = allCalls.filter((c) => {
      const init = c[1] as RequestInit;
      const authHeader = (init.headers as Record<string, string>)?.Authorization;
      return authHeader === `Bearer ${newToken}`;
    });
    expect(retryCalls.length).toBeGreaterThan(0);
  });
});

// ─── completeSetup ────────────────────────────────────────────────────────────

describe('completeSetup', () => {
  it('calls POST /setup, then fetchAll, and returns the json', async () => {
    // Mount fetch pair
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Responses for completeSetup + subsequent fetchAll (profile + dashboard)
    const setupResponse = { success: true, data: { setupDone: true } };
    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ status: 200, json: async () => setupResponse })
      .mockResolvedValueOnce({ status: 200, json: async () => makeProfileResponse() })
      .mockResolvedValueOnce({ status: 200, json: async () => makeStatsResponse() });

    let json: unknown;
    await act(async () => {
      json = await result.current.completeSetup({ profile: { name: 'Cafe' } });
    });

    expect(json).toEqual(setupResponse);

    const urls = (fetch as ReturnType<typeof vi.fn>).mock.calls.map((c) => c[0]);
    expect(urls).toContain('/api/business-system/setup');
  });
});

// ─── createWalkIn ─────────────────────────────────────────────────────────────

describe('createWalkIn', () => {
  it('calls POST /reservations, then fetchDashboard, and returns the json', async () => {
    // Mount fetch pair
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const walkInResponse = { success: true, data: { id: 99 } };

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ status: 200, json: async () => walkInResponse })
      // fetchDashboard call after success
      .mockResolvedValueOnce({ status: 200, json: async () => makeStatsResponse() });

    let json: unknown;
    await act(async () => {
      json = await result.current.createWalkIn({
        customerName: 'Alice',
        partySize: 2,
        tableId: 1,
      });
    });

    expect(json).toEqual(walkInResponse);

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
    const postCall = calls.find(
      (c) => c[0] === '/api/business-system/reservations' && (c[1] as RequestInit).method === 'POST',
    );
    expect(postCall).toBeDefined();

    // fetchDashboard should have been called again
    const dashboardCalls = calls.filter((c) => c[0] === '/api/business-system/dashboard');
    expect(dashboardCalls.length).toBeGreaterThanOrEqual(2);
  });
});

// ─── updateReservationStatus ──────────────────────────────────────────────────

describe('updateReservationStatus', () => {
  it('calls PATCH /:id/status, then fetchDashboard, and returns the json', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const patchResponse = { success: true };

    (fetch as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ status: 200, json: async () => patchResponse })
      .mockResolvedValueOnce({ status: 200, json: async () => makeStatsResponse() });

    let json: unknown;
    await act(async () => {
      json = await result.current.updateReservationStatus(42, 'confirmed', 'VIP table');
    });

    expect(json).toEqual(patchResponse);

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
    const patchCall = calls.find(
      (c) =>
        c[0] === '/api/business-system/reservations/42/status' &&
        (c[1] as RequestInit).method === 'PATCH',
    );
    expect(patchCall).toBeDefined();

    // Verify notes are included in the body
    const body = JSON.parse((patchCall![1] as RequestInit).body as string);
    expect(body).toEqual({ status: 'confirmed', notes: 'VIP table' });
  });
});

// ─── fetchReservations ────────────────────────────────────────────────────────

describe('fetchReservations', () => {
  it('includes date in query params when provided', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const reservationsData = [{ id: 1 }];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, data: reservationsData }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchReservations('2026-03-24');
    });

    expect(data).toEqual(reservationsData);

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
    const lastUrl = calls[calls.length - 1][0] as string;
    expect(lastUrl).toContain('date=2026-03-24');
  });

  it('includes status in query params when provided', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, data: [] }),
    });

    await act(async () => {
      await result.current.fetchReservations(undefined, 'pending');
    });

    const calls = (fetch as ReturnType<typeof vi.fn>).mock.calls;
    const lastUrl = calls[calls.length - 1][0] as string;
    expect(lastUrl).toContain('status=pending');
  });

  it('returns an empty array when success=false', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: false }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchReservations();
    });

    expect(data).toEqual([]);
  });
});

// ─── fetchPrefill ─────────────────────────────────────────────────────────────

describe('fetchPrefill', () => {
  it('returns data on success', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const prefill = { cafeName: 'Cafe A', ownerName: 'Bob', email: 'b@b.com', phone: null, city: 'Toronto' };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: true, data: prefill }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchPrefill();
    });

    expect(data).toEqual(prefill);
  });

  it('returns null when the API returns success=false', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      status: 200,
      json: async () => ({ success: false }),
    });

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchPrefill();
    });

    expect(data).toBeNull();
  });

  it('returns null on network failure', async () => {
    setupMountFetch();

    const { result } = renderHook(() => useBusinessDashboard());
    await waitFor(() => expect(result.current.loading).toBe(false));

    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('offline'));

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchPrefill();
    });

    expect(data).toBeNull();
  });
});
