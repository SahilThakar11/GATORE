/**
 * Tests for useBusinessSettings hook and its exported time-conversion helpers.
 *
 * Strategy:
 *  - Mock useAuth so the hook can run without a real AuthProvider.
 *  - Stub global fetch before each test using vi.stubGlobal.
 *  - Use renderHook + act to invoke hook methods and inspect state.
 */
import { renderHook, act } from '@testing-library/react';
import {
  useBusinessSettings,
  timeStringToMinutes,
  minutesToTimeString,
} from '../../../src/hooks/useBusinessSettings';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../../src/context/AuthContext';

beforeEach(() => {
  vi.clearAllMocks();
  (useAuth as ReturnType<typeof vi.fn>).mockReturnValue({ accessToken: 'test-token' });
  vi.stubGlobal('fetch', vi.fn());
});

// ─── Helper: build a successful fetch mock ────────────────────────────────────

function mockFetch(body: unknown, ok = true) {
  (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok,
    json: async () => body,
  });
}

// ─── timeStringToMinutes ──────────────────────────────────────────────────────

describe('timeStringToMinutes', () => {
  it('converts "10:00 AM" to 600', () => {
    expect(timeStringToMinutes('10:00 AM')).toBe(600);
  });

  it('converts "6:00 PM" to 1080', () => {
    expect(timeStringToMinutes('6:00 PM')).toBe(1080);
  });

  it('returns 600 as default for an unknown time string', () => {
    expect(timeStringToMinutes('99:99 ZZ')).toBe(600);
  });
});

// ─── minutesToTimeString ──────────────────────────────────────────────────────

describe('minutesToTimeString', () => {
  it('converts 600 to "10:00 AM"', () => {
    expect(minutesToTimeString(600)).toBe('10:00 AM');
  });

  it('converts 1080 to "6:00 PM"', () => {
    expect(minutesToTimeString(1080)).toBe('6:00 PM');
  });

  it('returns "10:00 AM" as default for an unknown minute value', () => {
    expect(minutesToTimeString(9999)).toBe('10:00 AM');
  });
});

// ─── updateProfile ────────────────────────────────────────────────────────────

describe('updateProfile', () => {
  it('returns json and saving is false after a successful call', async () => {
    mockFetch({ success: true, data: { name: 'My Cafe' } });

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.updateProfile({ name: 'My Cafe' });
    });

    expect(json).toEqual({ success: true, data: { name: 'My Cafe' } });
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when the API returns success=false', async () => {
    mockFetch({ success: false, message: 'Validation failed' });

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updateProfile({ name: '' });
    });

    expect(result.current.error).toBe('Validation failed');
    expect(result.current.saving).toBe(false);
  });

  it('sets a generic error on network failure', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network down'));

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updateProfile({ name: 'Cafe' });
    });

    expect(result.current.error).toBe('Failed to update profile.');
    expect(result.current.saving).toBe(false);
  });
});

// ─── fetchTables ──────────────────────────────────────────────────────────────

describe('fetchTables', () => {
  it('returns the data array on success', async () => {
    const tables = [{ id: 1, name: 'T1', capacity: 4, type: 'standard', status: 'available' }];
    mockFetch({ success: true, data: tables });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchTables();
    });

    expect(data).toEqual(tables);
  });

  it('returns an empty array when success=false', async () => {
    mockFetch({ success: false });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchTables();
    });

    expect(data).toEqual([]);
  });
});

// ─── addTable ─────────────────────────────────────────────────────────────────

describe('addTable', () => {
  it('returns the json response on success', async () => {
    const responseJson = { success: true, data: { id: 2, name: 'T2' } };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.addTable({ name: 'T2', capacity: 2, type: 'bar' });
    });

    expect(json).toEqual(responseJson);
  });
});

// ─── removeTable ──────────────────────────────────────────────────────────────

describe('removeTable', () => {
  it('returns the json response on success', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.removeTable(1);
    });

    expect(json).toEqual(responseJson);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      '/api/business-system/tables/1',
    );
  });
});

// ─── fetchHours ───────────────────────────────────────────────────────────────

describe('fetchHours', () => {
  it('returns the data array on success', async () => {
    const hours = [{ id: 1, dayOfWeek: 'Monday', openTime: 600, closeTime: 1200, isClosed: false }];
    mockFetch({ success: true, data: hours });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchHours();
    });

    expect(data).toEqual(hours);
  });

  it('returns an empty array when success=false', async () => {
    mockFetch({ success: false });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchHours();
    });

    expect(data).toEqual([]);
  });
});

// ─── updateHours ──────────────────────────────────────────────────────────────

describe('updateHours', () => {
  it('returns the json on a successful update', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    const hours = [{ dayOfWeek: 'Monday', openTime: 600, closeTime: 1200, isClosed: false }];
    let json: unknown;
    await act(async () => {
      json = await result.current.updateHours(hours);
    });

    expect(json).toEqual(responseJson);
    expect(result.current.saving).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when the API returns success=false', async () => {
    mockFetch({ success: false, message: 'Invalid hours data' });

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updateHours([]);
    });

    expect(result.current.error).toBe('Invalid hours data');
  });

  it('sets a generic error on network failure', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('timeout'));

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updateHours([]);
    });

    expect(result.current.error).toBe('Failed to update hours.');
  });
});

// ─── fetchGames ───────────────────────────────────────────────────────────────

describe('fetchGames', () => {
  it('returns the data array on success', async () => {
    const games = [
      { id: 1, restaurantGameId: 10, name: 'Catan', description: null, imageUrl: null, bggId: '13', status: 'active' },
    ];
    mockFetch({ success: true, data: games });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchGames();
    });

    expect(data).toEqual(games);
  });
});

// ─── addGame ──────────────────────────────────────────────────────────────────

describe('addGame', () => {
  it('returns the json response on success', async () => {
    const responseJson = { success: true, data: { id: 5 } };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.addGame({ bggId: '13', name: 'Catan' });
    });

    expect(json).toEqual(responseJson);
  });
});

// ─── removeGame ───────────────────────────────────────────────────────────────

describe('removeGame', () => {
  it('returns the json response on success and calls the correct URL', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.removeGame(10);
    });

    expect(json).toEqual(responseJson);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      '/api/business-system/games/10',
    );
  });
});

// ─── fetchMenu ────────────────────────────────────────────────────────────────

describe('fetchMenu', () => {
  it('returns the data array on success', async () => {
    const menu = [{ id: 1, name: 'Coffee', description: null, price: '3.50', category: 'drinks' }];
    mockFetch({ success: true, data: menu });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchMenu();
    });

    expect(data).toEqual(menu);
  });
});

// ─── addMenuItem ──────────────────────────────────────────────────────────────

describe('addMenuItem', () => {
  it('returns the json response on success', async () => {
    const responseJson = { success: true, data: { id: 3 } };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.addMenuItem({ name: 'Tea', price: '2.50' });
    });

    expect(json).toEqual(responseJson);
  });
});

// ─── removeMenuItem ───────────────────────────────────────────────────────────

describe('removeMenuItem', () => {
  it('returns the json response and calls the correct URL', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.removeMenuItem(3);
    });

    expect(json).toEqual(responseJson);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      '/api/business-system/menu/3',
    );
  });
});

// ─── fetchPricing ─────────────────────────────────────────────────────────────

describe('fetchPricing', () => {
  it('returns the pricing data on success', async () => {
    const pricing = {
      pricingType: 'hourly',
      hourlyRate: '10.00',
      coverFee: null,
      minSpend: null,
      enableThreshold: false,
    };
    mockFetch({ success: true, data: pricing });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchPricing();
    });

    expect(data).toEqual(pricing);
  });

  it('returns null when success=false', async () => {
    mockFetch({ success: false });

    const { result } = renderHook(() => useBusinessSettings());

    let data: unknown;
    await act(async () => {
      data = await result.current.fetchPricing();
    });

    expect(data).toBeNull();
  });
});

// ─── updatePricing ────────────────────────────────────────────────────────────

describe('updatePricing', () => {
  it('returns the json on a successful update and clears error', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.updatePricing({ pricingType: 'hourly', hourlyRate: '15.00' });
    });

    expect(json).toEqual(responseJson);
    expect(result.current.error).toBeNull();
    expect(result.current.saving).toBe(false);
  });

  it('sets error when the API returns success=false', async () => {
    mockFetch({ success: false, message: 'Invalid pricing' });

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updatePricing({ pricingType: 'hourly' });
    });

    expect(result.current.error).toBe('Invalid pricing');
  });

  it('sets a generic error on network failure', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Connection reset'));

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.updatePricing({});
    });

    expect(result.current.error).toBe('Failed to update pricing.');
  });
});

// ─── deleteAccount ────────────────────────────────────────────────────────────

describe('deleteAccount', () => {
  it('returns the json on a successful delete', async () => {
    const responseJson = { success: true };
    mockFetch(responseJson);

    const { result } = renderHook(() => useBusinessSettings());

    let json: unknown;
    await act(async () => {
      json = await result.current.deleteAccount();
    });

    expect(json).toEqual(responseJson);
    expect(result.current.error).toBeNull();
    expect(result.current.saving).toBe(false);
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe(
      '/api/business-system/account',
    );
  });

  it('sets error when the API returns success=false', async () => {
    mockFetch({ success: false, message: 'Cannot delete active account' });

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(result.current.error).toBe('Cannot delete active account');
  });

  it('sets a generic error on network failure', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Net error'));

    const { result } = renderHook(() => useBusinessSettings());

    await act(async () => {
      await result.current.deleteAccount();
    });

    expect(result.current.error).toBe('Failed to delete account.');
  });
});
