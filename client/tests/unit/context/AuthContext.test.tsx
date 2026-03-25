import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../src/context/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MOCK_USER = { id: '1', email: 'user@test.com', name: 'Test User', role: 'user' };
const ACCESS_TOKEN = 'access-token-123';
const REFRESH_TOKEN = 'refresh-token-456';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// ─── useAuth — outside provider ───────────────────────────────────────────────
describe('useAuth outside AuthProvider', () => {
  it('throws an error when used outside the provider', () => {
    // Suppress the console.error output from React's error boundary
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    );
  });
});

// ─── Initial state ────────────────────────────────────────────────────────────
describe('AuthProvider — initial state', () => {
  it('starts with user=null and isAuthenticated=false when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.accessToken).toBeNull();
  });

  it('rehydrates user from localStorage on mount', async () => {
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    localStorage.setItem('authUser', JSON.stringify(MOCK_USER));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Wait for the useEffect to fire
    await waitFor(() => {
      expect(result.current.user).toEqual(MOCK_USER);
      expect(result.current.accessToken).toBe(ACCESS_TOKEN);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('clears localStorage and stays unauthenticated when stored user JSON is corrupted', async () => {
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    localStorage.setItem('authUser', 'not-valid-json{{{');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
    expect(localStorage.getItem('accessToken')).toBeNull();
  });
});

// ─── setAuth ──────────────────────────────────────────────────────────────────
describe('setAuth', () => {
  it('sets user and token in state and localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setAuth(MOCK_USER, ACCESS_TOKEN, REFRESH_TOKEN);
    });

    expect(result.current.user).toEqual(MOCK_USER);
    expect(result.current.accessToken).toBe(ACCESS_TOKEN);
    expect(result.current.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe(ACCESS_TOKEN);
    expect(localStorage.getItem('refreshToken')).toBe(REFRESH_TOKEN);
    expect(localStorage.getItem('authUser')).toBe(JSON.stringify(MOCK_USER));
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('clears user, token, and localStorage on logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setAuth(MOCK_USER, ACCESS_TOKEN, REFRESH_TOKEN);
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.accessToken).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('authUser')).toBeNull();
  });
});

// ─── updateUser ───────────────────────────────────────────────────────────────
describe('updateUser', () => {
  it('merges partial updates into the existing user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setAuth(MOCK_USER, ACCESS_TOKEN, REFRESH_TOKEN);
    });
    act(() => {
      result.current.updateUser({ name: 'Updated Name' });
    });

    expect(result.current.user?.name).toBe('Updated Name');
    expect(result.current.user?.email).toBe(MOCK_USER.email); // other fields preserved
  });

  it('persists updated user to localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.setAuth(MOCK_USER, ACCESS_TOKEN, REFRESH_TOKEN);
    });
    act(() => {
      result.current.updateUser({ name: 'Saved Name' });
    });

    const stored = JSON.parse(localStorage.getItem('authUser')!);
    expect(stored.name).toBe('Saved Name');
  });

  it('does nothing when called before setAuth (user is null)', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    act(() => {
      result.current.updateUser({ name: 'Should not crash' });
    });
    expect(result.current.user).toBeNull();
  });
});

// ─── refreshAccessToken ───────────────────────────────────────────────────────
describe('refreshAccessToken', () => {
  it('returns null when no refresh token is stored', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    const token = await result.current.refreshAccessToken();
    expect(token).toBeNull();
  });

  it('fetches a new access token and updates state', async () => {
    localStorage.setItem('refreshToken', REFRESH_TOKEN);
    const NEW_TOKEN = 'new-access-token';
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: true, data: { accessToken: NEW_TOKEN } }),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    let token: string | null = null;

    await act(async () => {
      token = await result.current.refreshAccessToken();
    });

    expect(token).toBe(NEW_TOKEN);
    expect(result.current.accessToken).toBe(NEW_TOKEN);
    expect(localStorage.getItem('accessToken')).toBe(NEW_TOKEN);
  });

  it('logs out and returns null when the refresh API call fails', async () => {
    localStorage.setItem('refreshToken', REFRESH_TOKEN);
    localStorage.setItem('authUser', JSON.stringify(MOCK_USER));
    localStorage.setItem('accessToken', ACCESS_TOKEN);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({ success: false }),
      }),
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    // Let the rehydration effect settle
    await waitFor(() => expect(result.current.user).toEqual(MOCK_USER));

    let token: string | null = 'sentinel';
    await act(async () => {
      token = await result.current.refreshAccessToken();
    });

    expect(token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('logs out and returns null on a network error', async () => {
    localStorage.setItem('refreshToken', REFRESH_TOKEN);
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useAuth(), { wrapper });
    let token: string | null = 'sentinel';

    await act(async () => {
      token = await result.current.refreshAccessToken();
    });

    expect(token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});

// ─── Context consumers receive latest values ──────────────────────────────────
describe('AuthProvider — renders children with context', () => {
  it('provides isAuthenticated=false initially', () => {
    function TestConsumer() {
      const { isAuthenticated } = useAuth();
      return <div>{isAuthenticated ? 'auth' : 'anon'}</div>;
    }

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('anon')).toBeInTheDocument();
  });
});
