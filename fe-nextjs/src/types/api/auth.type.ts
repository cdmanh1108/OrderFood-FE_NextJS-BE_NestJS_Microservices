export interface AuthUser {
  id: string;
  email: string;
  fullName: string | null;
  role: "ADMIN" | "STAFF" | "USER";
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}
