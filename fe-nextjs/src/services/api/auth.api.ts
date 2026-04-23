import type { AuthSession, LoginRequest, RegisterRequest } from "@/types/api";
import { httpService } from "../http/http-client";

const AUTH_ENDPOINT = "/auth";

export const authApi = {
  login(payload: LoginRequest): Promise<AuthSession> {
    return httpService.post<AuthSession, LoginRequest>(
      `${AUTH_ENDPOINT}/login`,
      payload,
      { skipAuth: true },
    );
  },

  register(payload: RegisterRequest): Promise<AuthSession> {
    return httpService.post<AuthSession, RegisterRequest>(
      `${AUTH_ENDPOINT}/register`,
      payload,
      { skipAuth: true },
    );
  },
};
