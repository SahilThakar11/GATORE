/**
 * Tests for the ProtectedRoute component.
 *
 * Strategy:
 *  - Mock useAuth to control isAuthenticated and user.role.
 *  - Wrap with MemoryRouter so <Navigate> works correctly.
 *  - Assert on what is rendered or the current URL after navigation.
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../../../../src/components/auth/ProtectedRoute';

// ─── Mock ─────────────────────────────────────────────────────────────────────

const mockUseAuth = vi.fn();

vi.mock('../../../../src/context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderRoute({
  isAuthenticated,
  role = 'user',
  requiredRole,
  initialPath = '/protected',
}: {
  isAuthenticated: boolean;
  role?: string;
  requiredRole?: string;
  initialPath?: string;
}) {
  mockUseAuth.mockReturnValue({
    isAuthenticated,
    user: isAuthenticated ? { id: '1', email: 'u@u.com', name: 'U', role } : null,
  });

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('ProtectedRoute', () => {
  it('renders children when the user is authenticated and no role is required', () => {
    renderRoute({ isAuthenticated: true });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to / when the user is not authenticated', () => {
    renderRoute({ isAuthenticated: false });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user role matches the required role', () => {
    renderRoute({ isAuthenticated: true, role: 'admin', requiredRole: 'admin' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects to / when the user role does not match the required role', () => {
    renderRoute({ isAuthenticated: true, role: 'user', requiredRole: 'admin' });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to / when user is null even if isAuthenticated is somehow true', () => {
    // Edge case: isAuthenticated=true but user object is null
    mockUseAuth.mockReturnValue({ isAuthenticated: true, user: null });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/protected"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renders children for business role when requiredRole is "business"', () => {
    renderRoute({ isAuthenticated: true, role: 'business', requiredRole: 'business' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('blocks a regular user from accessing a business-only route', () => {
    renderRoute({ isAuthenticated: true, role: 'user', requiredRole: 'business' });
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('allows access when no requiredRole is specified (any authenticated user)', () => {
    renderRoute({ isAuthenticated: true, role: 'business' });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
