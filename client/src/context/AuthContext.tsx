import { createContext, useContext, useState, useEffect } from "react";

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
  logout: () => void;
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

  const setAuth = (
    newUser: AuthUser,
    newAccessToken: string,
    refreshToken: string,
  ) => {
    localStorage.setItem("accessToken", newAccessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("authUser", JSON.stringify(newUser));
    setUser(newUser);
    setAccessToken(newAccessToken);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("authUser");
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        setAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
