"use client";

import { useEffect, useState } from "react";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState & {
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
} {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored auth:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Failed to logout from server:", error);
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const handleSetToken = (newToken: string | null) => {
    setToken(newToken);
    if (newToken) {
      localStorage.setItem("authToken", newToken);
    } else {
      localStorage.removeItem("authToken");
    }
  };

  const handleSetUser = (newUser: User | null) => {
    setUser(newUser);
    if (newUser) {
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("user");
    }
  };

  return {
    user,
    token,
    isLoading,
    isAuthenticated: !!token && !!user,
    logout,
    setUser: handleSetUser,
    setToken: handleSetToken,
  };
}
