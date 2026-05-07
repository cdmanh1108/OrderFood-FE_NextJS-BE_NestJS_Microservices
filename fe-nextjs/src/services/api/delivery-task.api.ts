import type {
  AssignTaskRequest,
  DeliveryTaskDetailApiModel,
  ListTasksQuery,
  PaginatedDeliveryTasksResponse,
  UpdateTaskStatusRequest,
  SubmitProofRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const TASKS_ENDPOINT = "/delivery/tasks";

export const deliveryTaskApi = {
  list(query?: ListTasksQuery): Promise<PaginatedDeliveryTasksResponse> {
    return httpService.get<PaginatedDeliveryTasksResponse>(TASKS_ENDPOINT, {
      params: query,
    });
  },

  getMyTasks(query?: Omit<ListTasksQuery, "shipperId">): Promise<PaginatedDeliveryTasksResponse> {
    return httpService.get<PaginatedDeliveryTasksResponse>(`/delivery/my-tasks`, {
      params: query,
    });
  },

  getById(id: string): Promise<DeliveryTaskDetailApiModel> {
    return httpService.get<DeliveryTaskDetailApiModel>(`${TASKS_ENDPOINT}/${id}`);
  },

  getByOrderId(orderId: string): Promise<DeliveryTaskDetailApiModel> {
    return httpService.get<DeliveryTaskDetailApiModel>(`/delivery/order-tasks/${orderId}`);
  },

  assign(id: string, payload: AssignTaskRequest): Promise<DeliveryTaskDetailApiModel> {
    return httpService.post<DeliveryTaskDetailApiModel, AssignTaskRequest>(
      `${TASKS_ENDPOINT}/${id}/assign`,
      payload,
    );
  },

  updateStatus(id: string, payload: UpdateTaskStatusRequest): Promise<DeliveryTaskDetailApiModel> {
    return httpService.patch<DeliveryTaskDetailApiModel, UpdateTaskStatusRequest>(
      `${TASKS_ENDPOINT}/${id}/status`,
      payload,
    );
  },

  cancel(id: string, note?: string): Promise<DeliveryTaskDetailApiModel> {
    return httpService.post<DeliveryTaskDetailApiModel, { note?: string }>(
      `${TASKS_ENDPOINT}/${id}/cancel`,
      { note }
    );
  },

  submitProof(id: string, payload: SubmitProofRequest): Promise<DeliveryTaskDetailApiModel> {
    return httpService.post<DeliveryTaskDetailApiModel, SubmitProofRequest>(
      `${TASKS_ENDPOINT}/${id}/proof`,
      payload
    );
  },
};
