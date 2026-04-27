export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortDirection;
}

export interface ApiMeta {
  timestamp: string;
  path: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiMeta;
}

export type ApiEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export type SortDirection = "asc" | "desc";
