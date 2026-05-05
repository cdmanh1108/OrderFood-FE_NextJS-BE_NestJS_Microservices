import { Controller } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELIVERY_PATTERNS, ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';
import { handleEventMessage } from '@app/messaging/rmq/event-message.helper';

import type { CreateDeliveryTaskCommand } from '@app/contracts/delivery/task/commands/create-delivery-task.command';
import type { AssignTaskCommand } from '@app/contracts/delivery/task/commands/assign-task.command';
import type { UpdateTaskStatusCommand } from '@app/contracts/delivery/task/commands/update-task-status.command';
import type { ListTasksQuery, GetMyTasksQuery } from '@app/contracts/delivery/task/commands/list-tasks.query';
import type { OrderReadyForDeliveryEvent } from '@app/contracts/ordering/order/events/order-ready-for-delivery.event';

import { TaskService } from './task.service';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @EventPattern(ORDERING_PATTERNS.ORDER_READY_FOR_DELIVERY)
  async handleOrderReady(
    @Payload() event: OrderReadyForDeliveryEvent,
    @Ctx() context: RmqContext,
  ) {
    return handleEventMessage(context, () => this.taskService.create(event));
  }

  @MessagePattern(DELIVERY_PATTERNS.CREATE_TASK)
  async createTask(
    @Payload() command: CreateDeliveryTaskCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.taskService.create(command));
  }

  @MessagePattern(DELIVERY_PATTERNS.ASSIGN_TASK)
  async assignTask(
    @Payload() command: AssignTaskCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.taskService.assign(command));
  }

  @MessagePattern(DELIVERY_PATTERNS.UPDATE_TASK_STATUS)
  async updateTaskStatus(
    @Payload() command: UpdateTaskStatusCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.taskService.updateStatus(command),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.CANCEL_TASK)
  async cancelTask(
    @Payload() payload: { taskId: string; note?: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.taskService.cancel(payload.taskId, payload.note),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_TASK_DETAIL)
  async getTaskDetail(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.taskService.findOne(payload.id),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.LIST_TASKS)
  async listTasks(
    @Payload() query: ListTasksQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.taskService.findAll(query));
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_MY_TASKS)
  async getMyTasks(
    @Payload() query: GetMyTasksQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.taskService.getMyTasks(query),
    );
  }
}
