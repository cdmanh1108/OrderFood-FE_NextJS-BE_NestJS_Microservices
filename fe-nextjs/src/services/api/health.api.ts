import { httpService } from "../http/http-client";

export interface GatewayHealthResponse {
  status: string;
  service: string;
}

export const healthApi = {
  check(): Promise<GatewayHealthResponse> {
    return httpService.get<GatewayHealthResponse>("/health", {
      skipAuth: true,
    });
  },
};
