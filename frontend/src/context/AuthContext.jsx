import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";
import { setUnauthorizedHandler } from "../services/api";

const AuthContext = createContext(null);

const parseTokenPayload = (jwtToken) => {
  try {
    const encodedPayload = jwtToken.split(".")[1];
    if (!encodedPayload) {
      return null;
    }

    const normalized = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    const hydrateAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        setUser(data.user);
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    hydrateAuth();
  }, [token, logout]);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const payload = parseTokenPayload(token);
    const expiryInMs = (payload?.exp || 0) * 1000 - Date.now();

    if (expiryInMs <= 0) {
      logout();
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      logout();
    }, expiryInMs);

    return () => clearTimeout(timeoutId);
  }, [token, logout]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
    }),
    [user, token, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
