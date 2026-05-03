import type { TableSessionApiModel, PaginatedOrdersResponse, CreateOrderRequest, CreateOrderResponse } from "@/types/api";
import { httpService } from "../http/http-client";

const DINEIN_ENDPOINT = "/dinein";

export const sessionApi = {
  joinOrCreate(tableId: string): Promise<TableSessionApiModel> {
    return httpService.post<TableSessionApiModel>(
      `${DINEIN_ENDPOINT}/tables/${tableId}/session/join`,
    );
  },

  /** Admin: get active session for a table without creating one */
  getActiveByTableId(
    tableId: string,
  ): Promise<TableSessionApiModel | null> {
    return httpService.get<TableSessionApiModel | null>(
      `${DINEIN_ENDPOINT}/tables/${tableId}/active-session`,
    );
  },

  getById(id: string): Promise<TableSessionApiModel> {
    return httpService.get<TableSessionApiModel>(
      `${DINEIN_ENDPOINT}/sessions/${id}`,
    );
  },

  getOrders(id: string, limit = 100): Promise<PaginatedOrdersResponse> {
    return httpService.get<PaginatedOrdersResponse>(
      `${DINEIN_ENDPOINT}/sessions/${id}/orders`,
      { params: { limit } },
    );
  },

  close(id: string, paymentMethod: 'CASH' | 'BANK_TRANSFER'): Promise<TableSessionApiModel> {
    return httpService.post<TableSessionApiModel, { paymentMethod: string }>(
      `${DINEIN_ENDPOINT}/sessions/${id}/close`,
      { paymentMethod },
    );
  },

  /** Dine-in user places order — no JWT required */
  placeOrder(
    sessionId: string,
    payload: Pick<CreateOrderRequest, 'note' | 'items'>,
  ): Promise<CreateOrderResponse> {
    return httpService.post<CreateOrderResponse, typeof payload>(
      `${DINEIN_ENDPOINT}/sessions/${sessionId}/orders`,
      payload,
    );
  },
};
