import type { AuthSession } from "@/types/api";

const AUTH_SESSION_KEY = "auth_session";

function canUseLocalStorage(): boolean {
  return typeof window !== "undefined";
}

export function getAuthSession(): AuthSession | null {
  if (!canUseLocalStorage()) {
    return null;
  }

  const rawValue = localStorage.getItem(AUTH_SESSION_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function setAuthSession(session: AuthSession): void {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (!canUseLocalStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function getAccessToken(): string | null {
  return getAuthSession()?.accessToken ?? null;
}
