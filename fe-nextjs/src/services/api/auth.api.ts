import type {
  AuthFlowResponse,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const AUTH_ENDPOINT = "/auth";

export const authApi = {
  login(payload: LoginRequest): Promise<AuthFlowResponse> {
    return httpService.post<AuthFlowResponse, LoginRequest>(
      `${AUTH_ENDPOINT}/login`,
      payload,
      { skipAuth: true },
    );
  },

  register(payload: RegisterRequest): Promise<AuthFlowResponse> {
    return httpService.post<AuthFlowResponse, RegisterRequest>(
      `${AUTH_ENDPOINT}/register`,
      payload,
      { skipAuth: true },
    );
  },

  verifyEmail(payload: VerifyEmailRequest): Promise<AuthFlowResponse> {
    return httpService.post<AuthFlowResponse, VerifyEmailRequest>(
      `${AUTH_ENDPOINT}/verify-email`,
      payload,
      { skipAuth: true },
    );
  },
};
