import { DeliveryTaskStatus } from '../../enums/delivery-task-status.enum';

export interface UpdateTaskStatusCommand {
  taskId: string;
  status: DeliveryTaskStatus;
  note?: string;
  changedBy?: string; // userId
}
