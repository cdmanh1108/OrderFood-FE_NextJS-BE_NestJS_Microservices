import type { ShipperDetailApiModel } from "./delivery-shipper.type";

export enum DeliveryTaskStatus {
  PENDING = "PENDING",
  ASSIGNED = "ASSIGNED",
  PICKED_UP = "PICKED_UP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
}

export interface DeliveryProofApiModel {
  id: string;
  taskId: string;
  mediaFileId: string;
  imageUrl: string;
  note: string | null;
  submittedAt: string;
}

export interface DeliveryTaskStatusHistoryApiModel {
  id: string;
  fromStatus: DeliveryTaskStatus | null;
  toStatus: DeliveryTaskStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface DeliveryTaskDetailApiModel {
  id: string;
  orderId: string;
  shipperId: string | null;
  shipper: ShipperDetailApiModel | null;
  status: DeliveryTaskStatus;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  note: string | null;
  assignedAt: string | null;
  pickedUpAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  proof: DeliveryProofApiModel | null;
  statusHistories: DeliveryTaskStatusHistoryApiModel[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDeliveryTasksResponse {
  items: DeliveryTaskDetailApiModel[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AssignTaskRequest {
  shipperId: string;
}

export interface UpdateTaskStatusRequest {
  status: DeliveryTaskStatus;
  note?: string;
}

export interface ListTasksQuery {
  shipperId?: string;
  status?: DeliveryTaskStatus;
  page?: number;
  limit?: number;
}
