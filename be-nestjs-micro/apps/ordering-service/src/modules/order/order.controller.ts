import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type { GetOrderDetailQuery } from '@app/contracts/ordering/order/commands/get-order-detail.query';
import type { ListOrdersQuery } from '@app/contracts/ordering/order/commands/list-orders.query';
import type { UpdateOrderStatusCommand } from '@app/contracts/ordering/order/commands/update-order-status.command';
import type { CancelOrderCommand } from '@app/contracts/ordering/order/commands/cancel-order.command';
import type { CreateOrderCommand } from '@app/contracts/ordering/order/commands/create-order.command';
import type { DeleteOrderCommand } from '@app/contracts/ordering/order/commands/delete-order.command';

import { OrderService } from './order.service';

@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @MessagePattern(ORDERING_PATTERNS.CREATE_ORDER)
  async createOrder(
    @Payload() command: CreateOrderCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.orderService.createOrder(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.DELETE_ORDER)
  async deleteOrder(
    @Payload() command: DeleteOrderCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.orderService.deleteOrder(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.GET_ORDER_DETAIL)
  async getOrderDetail(
    @Payload() query: GetOrderDetailQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.orderService.findOne(query));
  }

  @MessagePattern(ORDERING_PATTERNS.LIST_ORDERS)
  async listOrders(
    @Payload() query: ListOrdersQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.orderService.findAll(query));
  }

  @MessagePattern(ORDERING_PATTERNS.UPDATE_ORDER_STATUS)
  async updateOrderStatus(
    @Payload() command: UpdateOrderStatusCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.orderService.updateStatus(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.CANCEL_ORDER)
  async cancelOrder(
    @Payload() command: CancelOrderCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.orderService.cancelOrder(command),
    );
  }
}
