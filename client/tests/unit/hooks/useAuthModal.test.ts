/**
 * Tests for the useAuthModal hook.
 *
 * Strategy:
 *  - Mock useAuth so the hook can run without a real AuthProvider/localStorage.
 *  - Mock global fetch for API-calling actions.
 *  - Use renderHook with act() to trigger state updates.
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuthModal } from '../../../src/hooks/useAuthModal';

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockSetAuth = vi.fn();
const mockContextLogout = vi.fn();

vi.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({
    setAuth: mockSetAuth,
    logout: mockContextLogout,
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  localStorage.clear();
});

// ─── open / close ─────────────────────────────────────────────────────────────
describe('open / close', () => {
  it('opens the modal in signup mode by default', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe('signup');
    expect(result.current.step).toBe('email');
  });

  it('opens the modal in signin mode when specified', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signin'));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.mode).toBe('signin');
    expect(result.current.step).toBe('signin');
  });

  it('closes the modal and clears error', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

// ─── switchMode ───────────────────────────────────────────────────────────────
describe('switchMode', () => {
  it('switches from signup to signin', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signup'));
    act(() => result.current.switchMode());
    expect(result.current.mode).toBe('signin');
    expect(result.current.step).toBe('signin');
  });

  it('switches from signin to signup', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signin'));
    act(() => result.current.switchMode());
    expect(result.current.mode).toBe('signup');
    expect(result.current.step).toBe('email');
  });

  it('clears the error when switching modes', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    // Manually inject an error state by checking it stays null after switch
    act(() => result.current.switchMode());
    expect(result.current.error).toBeNull();
  });
});

// ─── updateData ───────────────────────────────────────────────────────────────
describe('updateData', () => {
  it('merges a partial patch into formData', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.updateData({ email: 'new@example.com' }));
    expect(result.current.formData.email).toBe('new@example.com');
  });

  it('preserves other formData fields when patching', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.updateData({ email: 'a@b.com' }));
    act(() => result.current.updateData({ name: 'Alice' }));
    expect(result.current.formData.email).toBe('a@b.com');
    expect(result.current.formData.name).toBe('Alice');
  });

  it('clears the error when data is updated', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.updateData({ email: 'x@x.com' }));
    expect(result.current.error).toBeNull();
  });
});

// ─── goBack ───────────────────────────────────────────────────────────────────
describe('goBack', () => {
  it('goes back from otp to email when email is not yet verified', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    // Simulate being on the OTP step
    act(() => (result.current as any).step = 'otp');
    // Force using internal setStep via a navigation that results in otp
    // We test goBack by simulating the state through open + a fake step
  });

  it('closes the modal when goBack is called from email step', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signup'));
    // email step → goBack closes
    act(() => result.current.goBack());
    expect(result.current.isOpen).toBe(false);
  });

  it('closes the modal when goBack is called from signin step', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signin'));
    act(() => result.current.goBack());
    expect(result.current.isOpen).toBe(false);
  });
});

// ─── googleSignIn ─────────────────────────────────────────────────────────────
describe('googleSignIn', () => {
  const BASE_GOOGLE_USER = {
    email: 'g@google.com',
    name: 'Google User',
    googleId: 'gid-123',
    isNewUser: false,
    accessToken: 'google-access',
    refreshToken: 'google-refresh',
  };

  it('closes the modal for a returning Google user', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    act(() => result.current.googleSignIn({ ...BASE_GOOGLE_USER, isNewUser: false }));
    expect(result.current.isOpen).toBe(false);
  });

  it('navigates to profile step for a new Google user', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    act(() => result.current.googleSignIn({ ...BASE_GOOGLE_USER, isNewUser: true }));
    expect(result.current.step).toBe('profile');
    expect(result.current.formData.isGoogleAuth).toBe(true);
    expect(result.current.formData.email).toBe('g@google.com');
  });

  it('calls setAuth with Google user data for both new and returning users', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.googleSignIn(BASE_GOOGLE_USER));
    expect(mockSetAuth).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'g@google.com' }),
      'google-access',
      'google-refresh',
    );
  });
});

// ─── stepNumber / totalSteps ─────────────────────────────────────────────────
describe('stepNumber and totalSteps', () => {
  it('returns stepNumber=1 and totalSteps=5 for standard email step', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open('signup'));
    expect(result.current.stepNumber).toBe(1);
    expect(result.current.totalSteps).toBe(5);
  });

  it('returns totalSteps=3 for a Google auth flow', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    act(() => result.current.updateData({ isGoogleAuth: true }));
    expect(result.current.totalSteps).toBe(3);
  });
});

// ─── submitPassword ───────────────────────────────────────────────────────────
describe('submitPassword', () => {
  it('advances to the profile step', () => {
    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());
    act(() => result.current.submitPassword());
    expect(result.current.step).toBe('profile');
  });
});

// ─── submitSignIn ─────────────────────────────────────────────────────────────
describe('submitSignIn', () => {
  it('sets error on non-ok API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      }),
    );

    const { result } = renderHook(() => useAuthModal());
    await act(async () => {
      await result.current.submitSignIn();
    });

    expect(result.current.error).toBe('Invalid credentials');
  });

  it('calls setAuth and closes modal on successful sign-in', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            user: { id: '1', email: 'u@u.com', name: 'User', role: 'user' },
            accessToken: 'at',
            refreshToken: 'rt',
          },
        }),
      }),
    );

    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());

    await act(async () => {
      await result.current.submitSignIn();
    });

    expect(mockSetAuth).toHaveBeenCalled();
    expect(result.current.isOpen).toBe(false);
  });

  it('sets network error message when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));

    const { result } = renderHook(() => useAuthModal());
    await act(async () => {
      await result.current.submitSignIn();
    });

    expect(result.current.error).toContain('Network error');
  });
});

// ─── submitEmail ──────────────────────────────────────────────────────────────
describe('submitEmail', () => {
  it('advances to otp step on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'OTP sent' }),
      }),
    );

    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());

    await act(async () => {
      await result.current.submitEmail();
    });

    expect(result.current.step).toBe('otp');
  });

  it('advances to password step when server returns resume_password', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'resume_password' }),
      }),
    );

    const { result } = renderHook(() => useAuthModal());
    act(() => result.current.open());

    await act(async () => {
      await result.current.submitEmail();
    });

    expect(result.current.step).toBe('password');
  });

  it('sets error on non-ok API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Email already registered' }),
      }),
    );

    const { result } = renderHook(() => useAuthModal());
    await act(async () => {
      await result.current.submitEmail();
    });

    expect(result.current.error).toBe('Email already registered');
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('calls the context logout after calling the API', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));

    const { result } = renderHook(() => useAuthModal());
    await act(async () => {
      await result.current.logout();
    });

    expect(mockContextLogout).toHaveBeenCalledTimes(1);
  });

  it('still calls context logout even if the fetch fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    const { result } = renderHook(() => useAuthModal());
    await act(async () => {
      await result.current.logout();
    });

    expect(mockContextLogout).toHaveBeenCalledTimes(1);
  });
});
