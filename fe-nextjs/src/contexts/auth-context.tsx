import React, { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/services/api";
import {
  clearAuthSession,
  getAuthSession,
  setAuthSession,
} from "@/services/http";
import type { AuthUser } from "@/types/api";
import { UserRole } from "../types";
import type { AuthContextType, LoginCredentials, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapRoleToUserRole(role?: AuthUser["role"]): UserRole {
  if (role === UserRole.ADMIN) {
    return UserRole.ADMIN;
  }

  if (role === UserRole.STAFF) {
    return UserRole.STAFF;
  }

  return UserRole.USER;
}

function mapAuthUserToAppUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.fullName ?? authUser.email,
    email: authUser.email,
    phone: "",
    role: mapRoleToUserRole(authUser.role),
    createdAt: new Date().toISOString(),
    isActive: true,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const session = getAuthSession();
    if (session?.user) {
      setUser(mapAuthUserToAppUser(session.user));
    }

    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);

    try {
      const session = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });
      setAuthSession(session);
      setUser(mapAuthUserToAppUser(session.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthSession();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
