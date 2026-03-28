import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Rehydrate from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const stored = localStorage.getItem("authUser");
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
        setAccessToken(token);
      } catch {
        localStorage.removeItem("authUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    }
  }, []);

  const setAuth = useCallback((
    newUser: AuthUser,
    newAccessToken: string,
    refreshToken: string,
  ) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    setUser(newUser);
    setAccessToken(newAccessToken);
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("authUser", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    setUser(null);
    setAccessToken(null);
  }, []);

  // Only logout when the server explicitly rejects the token (401/403);
  // network errors and timeouts should not force a logout.
  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const storedRefreshToken = localStorage.getItem("refreshToken");
    if (!storedRefreshToken) return null;

    try {
      const res = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      // Only logout if the server explicitly rejects the token
      if (res.status === 401 || res.status === 403) {
        logout();
        return null;
      }

      // Server error or unexpected response — don't logout, just fail silently
      if (!res.ok) return null;

      const json = await res.json();
      if (json.success && json.data?.accessToken) {
        localStorage.setItem("accessToken", json.data.accessToken);
        setAccessToken(json.data.accessToken);
        return json.data.accessToken;
      }
    } catch {
      // Network error (offline, timeout, etc.) — don't logout
    }

    return null;
  }, [logout]);

  const contextValue = useMemo(() => ({
    user,
    accessToken,
    isAuthenticated: !!user,
    setAuth,
    updateUser,
    logout,
    refreshAccessToken,
  }), [user, accessToken, logout, refreshAccessToken, setAuth, updateUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
