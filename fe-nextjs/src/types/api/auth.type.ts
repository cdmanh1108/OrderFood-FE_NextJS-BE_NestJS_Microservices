export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: "ADMIN" | "STAFF" | "USER";
  isEmailVerified: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthFlowResponse {
  isEmailVerified: boolean;
  accessToken: string | null;
  refreshToken: string | null;
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

export interface VerifyEmailRequest {
  email: string;
  code: string;
}
