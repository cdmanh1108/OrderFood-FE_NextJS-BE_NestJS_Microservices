import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';
import type { ShipperDetailResult } from '../../shipper/results/shipper-detail.result';

export interface DeliveryProofResult {
  id: string;
  taskId: string;
  mediaFileId: string;
  imageUrl: string;
  note: string | null;
  submittedAt: Date;
}

export interface DeliveryTaskStatusHistoryResult {
  id: string;
  fromStatus: DeliveryTaskStatus | null;
  toStatus: DeliveryTaskStatus;
  note: string | null;
  changedBy: string | null;
  createdAt: Date;
}

export interface DeliveryTaskDetailResult {
  id: string;
  orderId: string;
  shipperId: string | null;
  shipper: ShipperDetailResult | null;
  status: DeliveryTaskStatus;
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryLat: number | null;
  deliveryLng: number | null;
  note: string | null;
  assignedAt: Date | null;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
  failedAt: Date | null;
  cancelledAt: Date | null;
  proof: DeliveryProofResult | null;
  statusHistories: DeliveryTaskStatusHistoryResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedTasksResult {
  items: DeliveryTaskDetailResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
