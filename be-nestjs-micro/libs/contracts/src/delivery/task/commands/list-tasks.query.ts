import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export interface ListTasksQuery {
  shipperId?: string;
  orderId?: string;
  status?: DeliveryTaskStatus;
  page?: number;
  limit?: number;
}

export interface GetMyTasksQuery {
  shipperId: string;
  status?: DeliveryTaskStatus;
  page?: number;
  limit?: number;
}
