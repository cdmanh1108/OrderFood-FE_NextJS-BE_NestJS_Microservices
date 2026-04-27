import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';

import type { GetOrderDetailQuery } from '@app/contracts/ordering/order/commands/get-order-detail.query';
import type { ListOrdersQuery } from '@app/contracts/ordering/order/commands/list-orders.query';
import type { UpdateOrderStatusCommand } from '@app/contracts/ordering/order/commands/update-order-status.command';
import type { CancelOrderCommand } from '@app/contracts/ordering/order/commands/cancel-order.command';
import type { CreateOrderCommand } from '@app/contracts/ordering/order/commands/create-order.command';
import type { DeleteOrderCommand } from '@app/contracts/ordering/order/commands/delete-order.command';

import type { OrderDetailResult } from '@app/contracts/ordering/order/results/order-detail.result';
import type { PaginatedOrdersResult } from '@app/contracts/ordering/order/results/paginated-orders.result';
import type { UpdateOrderStatusResult } from '@app/contracts/ordering/order/results/update-order-status.result';
import type { CancelOrderResult } from '@app/contracts/ordering/order/results/cancel-order.result';
import type { CreateOrderResult } from '@app/contracts/ordering/order/results/create-order.result';
import type { DeleteOrderResult } from '@app/contracts/ordering/order/results/delete-order.result';

import { ListOrdersRequestDto } from './dto/request/list-orders.request.dto';
import { UpdateOrderStatusRequestDto } from './dto/request/update-order-status.request.dto';
import { CancelOrderRequestDto } from './dto/request/cancel-order.request.dto';
import { CreateOrderRequestDto } from './dto/request/create-order.request.dto';

@Injectable()
export class OrderOrderingGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.ORDERING)
    private readonly orderingClient: ClientProxy,
  ) {}

  async createOrder(
    userId: string,
    dto: CreateOrderRequestDto,
  ): Promise<CreateOrderResult> {
    const command: CreateOrderCommand = {
      userId,
      ...dto,
    };

    return firstValueFrom(
      this.orderingClient
        .send<CreateOrderResult, CreateOrderCommand>(
          ORDERING_PATTERNS.CREATE_ORDER,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async deleteOrder(id: string): Promise<DeleteOrderResult> {
    const command: DeleteOrderCommand = { id };

    return firstValueFrom(
      this.orderingClient
        .send<DeleteOrderResult, DeleteOrderCommand>(
          ORDERING_PATTERNS.DELETE_ORDER,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findAllUser(
    userId: string,
    dto: ListOrdersRequestDto,
  ) {
    const query: ListOrdersQuery = {
      userId,
      page: dto.page,
      limit: dto.limit,
      status: dto.status,
    };

    const result = await firstValueFrom(
      this.orderingClient
        .send<PaginatedOrdersResult, ListOrdersQuery>(
          ORDERING_PATTERNS.LIST_ORDERS,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );

    return {
      ...result,
      items: result.items.map(this.mapToUserOrder),
    };
  }

  async findOneUser(userId: string, id: string) {
    const query: GetOrderDetailQuery = { id, userId };

    const result = await firstValueFrom(
      this.orderingClient
        .send<OrderDetailResult, GetOrderDetailQuery>(
          ORDERING_PATTERNS.GET_ORDER_DETAIL,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );

    return this.mapToUserOrder(result);
  }

  async findAllAdmin(dto: ListOrdersRequestDto): Promise<PaginatedOrdersResult> {
    const query: ListOrdersQuery = {
      userId: dto.userId,
      page: dto.page,
      limit: dto.limit,
      keyword: dto.keyword,
      status: dto.status,
      paymentStatus: dto.paymentStatus,
      fulfillmentStatus: dto.fulfillmentStatus,
    };

    return firstValueFrom(
      this.orderingClient
        .send<PaginatedOrdersResult, ListOrdersQuery>(
          ORDERING_PATTERNS.LIST_ORDERS,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async findOneAdmin(id: string): Promise<OrderDetailResult> {
    const query: GetOrderDetailQuery = { id, userId: undefined };

    return firstValueFrom(
      this.orderingClient
        .send<OrderDetailResult, GetOrderDetailQuery>(
          ORDERING_PATTERNS.GET_ORDER_DETAIL,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  private mapToUserOrder(order: OrderDetailResult) {
    return {
      id: order.id,
      code: order.code,
      channel: order.channel,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        menuItemImageUrl: item.menuItemImageUrl,
      })),
      pricingSnapshot: order.pricingSnapshot ? {
        grandTotal: order.pricingSnapshot.grandTotal,
      } : null,
      shippingAddress: order.shippingAddress ? {
        receiverName: order.shippingAddress.receiverName,
        receiverPhone: order.shippingAddress.receiverPhone,
        street: order.shippingAddress.street,
        ward: order.shippingAddress.ward,
        district: order.shippingAddress.district,
        province: order.shippingAddress.province,
        detail: order.shippingAddress.detail,
      } : null,
      createdAt: order.createdAt,
      completedAt: order.completedAt,
      canceledAt: order.canceledAt,
    };
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusRequestDto,
  ): Promise<UpdateOrderStatusResult> {
    const command: UpdateOrderStatusCommand = {
      id,
      status: dto.status!,
      paymentStatus: dto.paymentStatus,
      fulfillmentStatus: dto.fulfillmentStatus,
    };

    return firstValueFrom(
      this.orderingClient
        .send<UpdateOrderStatusResult, UpdateOrderStatusCommand>(
          ORDERING_PATTERNS.UPDATE_ORDER_STATUS,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async cancelOrder(
    userId: string,
    id: string,
    dto: CancelOrderRequestDto,
  ): Promise<CancelOrderResult> {
    const command: CancelOrderCommand = {
      id,
      actorId: userId,
      reason: dto.reason,
    };

    return firstValueFrom(
      this.orderingClient
        .send<CancelOrderResult, CancelOrderCommand>(
          ORDERING_PATTERNS.CANCEL_ORDER,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
