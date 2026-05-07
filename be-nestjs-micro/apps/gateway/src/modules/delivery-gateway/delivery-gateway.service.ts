import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { DELIVERY_PATTERNS, ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { firstValueFrom } from 'rxjs';
import { DeliveryTaskStatus } from '@app/contracts/delivery/enums/delivery-task-status.enum';
import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';

import type { CreateShipperCommand } from '@app/contracts/delivery/shipper/commands/create-shipper.command';
import type { UpdateShipperCommand } from '@app/contracts/delivery/shipper/commands/update-shipper.command';
import type { ListShippersQuery } from '@app/contracts/delivery/shipper/commands/list-shippers.query';
import type { CreateDeliveryTaskCommand } from '@app/contracts/delivery/task/commands/create-delivery-task.command';
import type { AssignTaskCommand } from '@app/contracts/delivery/task/commands/assign-task.command';
import type { UpdateTaskStatusCommand } from '@app/contracts/delivery/task/commands/update-task-status.command';
import type { ListTasksQuery, GetMyTasksQuery } from '@app/contracts/delivery/task/commands/list-tasks.query';
import type { RecordLocationCommand, GetCurrentLocationQuery, GetLocationHistoryQuery } from '@app/contracts/delivery/location/commands/location.commands';
import type { SubmitProofCommand } from '@app/contracts/delivery/proof/commands/submit-proof.command';

@Injectable()
export class DeliveryGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.DELIVERY) private readonly deliveryClient: ClientProxy,
    @Inject(RMQ_SERVICES.ORDERING) private readonly orderingClient: ClientProxy,
  ) {}

  // Shipper
  async createShipper(command: CreateShipperCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.CREATE_SHIPPER, command));
  }

  async updateShipper(command: UpdateShipperCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.UPDATE_SHIPPER, command));
  }

  async getShipperDetail(id: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_SHIPPER_DETAIL, { id }));
  }

  async getShipperByUserId(userId: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_SHIPPER_BY_USER_ID, { userId }));
  }

  async listShippers(query: ListShippersQuery) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.LIST_SHIPPERS, query));
  }

  async deactivateShipper(id: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.DEACTIVATE_SHIPPER, { id }));
  }

  // Task
  async createDeliveryTask(command: CreateDeliveryTaskCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.CREATE_TASK, command));
  }

  async assignTask(command: AssignTaskCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.ASSIGN_TASK, command));
  }

  async updateTaskStatus(command: UpdateTaskStatusCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.UPDATE_TASK_STATUS, command));
  }

  async syncOrderStatus(orderId: string, taskStatus: DeliveryTaskStatus) {
    let fulfillmentStatus: FulfillmentStatus;
    let orderStatus: OrderStatus | undefined = undefined;

    switch (taskStatus) {
      case DeliveryTaskStatus.PICKED_UP:
      case DeliveryTaskStatus.IN_TRANSIT:
        fulfillmentStatus = FulfillmentStatus.SHIPPING;
        break;
      case DeliveryTaskStatus.DELIVERED:
        fulfillmentStatus = FulfillmentStatus.DELIVERED;
        orderStatus = OrderStatus.COMPLETED;
        break;
      case DeliveryTaskStatus.FAILED:
      case DeliveryTaskStatus.CANCELLED:
        fulfillmentStatus = FulfillmentStatus.FAILED;
        break;
      default:
        return; // Don't sync other statuses like PENDING/ASSIGNED
    }

    try {
      await firstValueFrom(
        this.orderingClient.send(ORDERING_PATTERNS.UPDATE_ORDER_STATUS, {
          id: orderId,
          fulfillmentStatus,
          ...(orderStatus ? { status: orderStatus } : {}),
        })
      );
    } catch (error) {
      console.error('Failed to sync order status from delivery task', error);
    }
  }

  async cancelTask(taskId: string, note?: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.CANCEL_TASK, { taskId, note }));
  }

  async getTaskDetail(id: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_TASK_DETAIL, { id }));
  }

  async listTasks(query: ListTasksQuery) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.LIST_TASKS, query));
  }

  async getMyTasks(query: GetMyTasksQuery) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_MY_TASKS, query));
  }

  // Location
  async recordLocation(command: RecordLocationCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.RECORD_LOCATION, command));
  }

  async getCurrentLocation(query: GetCurrentLocationQuery) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_CURRENT_LOCATION, query));
  }

  async getLocationHistory(query: GetLocationHistoryQuery) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_LOCATION_HISTORY, query));
  }

  // Proof
  async submitProof(command: SubmitProofCommand) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.SUBMIT_PROOF, command));
  }

  async getTaskProof(taskId: string) {
    return firstValueFrom(this.deliveryClient.send(DELIVERY_PATTERNS.GET_TASK_PROOF, { taskId }));
  }
}
