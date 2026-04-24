import axios, {
  AxiosError,
  AxiosResponse,
  type AxiosRequestConfig,
} from "axios";
import type { ApiEnvelope, ApiErrorEnvelope } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

const DEFAULT_TIMEOUT_MS = 15000;

export interface RequestConfig<T = unknown> extends AxiosRequestConfig<T> {
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    options?: { status?: number; code?: string; details?: unknown },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options?.status;
    this.code = options?.code;
    this.details = options?.details;
  }
}

const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorEnvelope>) => {
    const status = error.response?.status;
    const errorEnvelope = error.response?.data;

    if (
      errorEnvelope &&
      typeof errorEnvelope === "object" &&
      "success" in errorEnvelope &&
      errorEnvelope.success === false
    ) {
      return Promise.reject(
        new ApiClientError(errorEnvelope.error.message, {
          status,
          code: errorEnvelope.error.code,
          details: errorEnvelope.error.details,
        }),
      );
    }

    return Promise.reject(
      new ApiClientError(error.message || "Network request failed", {
        status,
      }),
    );
  },
);

function isApiEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    "success" in (payload as Record<string, unknown>)
  );
}

function unwrapApiData<T>(
  payload: ApiEnvelope<T> | T,
  status?: number,
): T {
  let currentPayload: unknown = payload;
  let depth = 0;

  while (isApiEnvelope<unknown>(currentPayload) && depth < 10) {
    if (!currentPayload.success) {
      throw new ApiClientError(currentPayload.error.message, {
        status,
        code: currentPayload.error.code,
        details: currentPayload.error.details,
      });
    }

    currentPayload = currentPayload.data;
    depth += 1;
  }

  return currentPayload as T;
}

async function request<TResponse, TBody = unknown>(
  config: RequestConfig<TBody>,
): Promise<TResponse> {
  const response = await httpClient.request<
    ApiEnvelope<TResponse> | TResponse,
    AxiosResponse<ApiEnvelope<TResponse> | TResponse>,
    TBody
  >(config);

  return unwrapApiData<TResponse>(response.data, response.status);
}

export const httpService = {
  get<TResponse>(url: string, config?: RequestConfig): Promise<TResponse> {
    return request<TResponse>({
      ...config,
      method: "GET",
      url,
    });
  },

  post<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<TResponse> {
    return request<TResponse, TBody>({
      ...config,
      method: "POST",
      url,
      data: body,
    });
  },

  put<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<TResponse> {
    return request<TResponse, TBody>({
      ...config,
      method: "PUT",
      url,
      data: body,
    });
  },

  patch<TResponse, TBody = unknown>(
    url: string,
    body?: TBody,
    config?: RequestConfig<TBody>,
  ): Promise<TResponse> {
    return request<TResponse, TBody>({
      ...config,
      method: "PATCH",
      url,
      data: body,
    });
  },

  delete<TResponse>(url: string, config?: RequestConfig): Promise<TResponse> {
    return request<TResponse>({
      ...config,
      method: "DELETE",
      url,
    });
  },
};

export { API_BASE_URL };
