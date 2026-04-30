import type {
  OrderApiModel,
  ListOrdersRequest,
  PaginatedOrdersResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  CancelOrderRequest,
  DeleteOrderResponse,
} from "@/types/api";
import { httpService } from "../http/http-client";

const ORDER_ENDPOINT = "/ordering/orders";

export const orderApi = {
  list(query?: ListOrdersRequest): Promise<PaginatedOrdersResponse> {
    return httpService.get<PaginatedOrdersResponse>(ORDER_ENDPOINT, {
      params: query,
    });
  },

  getById(id: string): Promise<OrderApiModel> {
    return httpService.get<OrderApiModel>(`${ORDER_ENDPOINT}/${id}`);
  },

  listAdmin(query?: ListOrdersRequest): Promise<PaginatedOrdersResponse> {
    return httpService.get<PaginatedOrdersResponse>(`${ORDER_ENDPOINT}/admin`, {
      params: query,
    });
  },

  getByIdAdmin(id: string): Promise<OrderApiModel> {
    return httpService.get<OrderApiModel>(`${ORDER_ENDPOINT}/admin/${id}`);
  },

  create(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    return httpService.post<CreateOrderResponse, CreateOrderRequest>(
      ORDER_ENDPOINT,
      payload,
    );
  },

  updateStatus(
    id: string,
    payload: UpdateOrderStatusRequest,
  ): Promise<OrderApiModel> {
    return httpService.patch<OrderApiModel, UpdateOrderStatusRequest>(
      `${ORDER_ENDPOINT}/${id}/status`,
      payload,
    );
  },

  cancel(id: string, payload: CancelOrderRequest): Promise<OrderApiModel> {
    return httpService.post<OrderApiModel, CancelOrderRequest>(
      `${ORDER_ENDPOINT}/${id}/cancel`,
      payload,
    );
  },

  delete(id: string): Promise<DeleteOrderResponse> {
    return httpService.delete<DeleteOrderResponse>(`${ORDER_ENDPOINT}/${id}`);
  },
};
