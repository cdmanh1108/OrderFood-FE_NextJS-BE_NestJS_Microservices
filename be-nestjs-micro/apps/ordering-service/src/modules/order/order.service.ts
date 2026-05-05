import { Inject, Injectable } from '@nestjs/common';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';
import { PaymentStatus } from '@app/contracts/ordering/enums/payment-status.enum';
import { FulfillmentStatus } from '@app/contracts/ordering/enums/fulfillment-status.enum';
import {
  Prisma,
  OrderChannel as PrismaOrderChannel,
  OrderSource as PrismaOrderSource,
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
  FulfillmentStatus as PrismaFulfillmentStatus,
} from 'generated/ordering';

import type { GetOrderDetailQuery } from '@app/contracts/ordering/order/commands/get-order-detail.query';
import type { ListOrdersQuery } from '@app/contracts/ordering/order/commands/list-orders.query';
import type { UpdateOrderStatusCommand } from '@app/contracts/ordering/order/commands/update-order-status.command';
import type { CancelOrderCommand } from '@app/contracts/ordering/order/commands/cancel-order.command';

import type { OrderDetailResult } from '@app/contracts/ordering/order/results/order-detail.result';
import type { PaginatedOrdersResult } from '@app/contracts/ordering/order/results/paginated-orders.result';
import type { UpdateOrderStatusResult } from '@app/contracts/ordering/order/results/update-order-status.result';
import type { CancelOrderResult } from '@app/contracts/ordering/order/results/cancel-order.result';
import type { CreateOrderCommand } from '@app/contracts/ordering/order/commands/create-order.command';
import type { DeleteOrderCommand } from '@app/contracts/ordering/order/commands/delete-order.command';
import type { CreateOrderResult } from '@app/contracts/ordering/order/results/create-order.result';
import type { DeleteOrderResult } from '@app/contracts/ordering/order/results/delete-order.result';
import type { MarkSessionOrdersPaidCommand } from '@app/contracts/ordering/order/commands/mark-session-orders-paid.command';

const ORDER_DETAIL_INCLUDE = {
  items: true,
  pricingSnapshot: true,
  shippingAddress: true,
} satisfies Prisma.OrderInclude;

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: typeof ORDER_DETAIL_INCLUDE;
}>;

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: OrderingPrismaService,
    @Inject(RMQ_SERVICES.DELIVERY) private readonly deliveryClient: ClientProxy,
  ) {}

  async createOrder(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const code = this.generateNumericOrderCode();
    const itemsSubtotal = command.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const grandTotal = itemsSubtotal;

    const order = await this.prisma.order.create({
      data: {
        code,
        userId: command.userId,
        channel: command.channel as PrismaOrderChannel,
        source: command.source as PrismaOrderSource,
        tableId: command.tableId,
        tableSessionId: command.tableSessionId,
        note: command.note,
        status: OrderStatus.PLACED,
        placedAt: new Date(),
        items: {
          create: command.items.map((item) => ({
            menuItemId: item.menuItemId,
            menuItemName: item.menuItemName,
            menuItemImageUrl: item.menuItemImageUrl,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            note: item.note,
          })),
        },
        pricingSnapshot: {
          create: {
            itemsSubtotal,
            grandTotal,
            currency: 'VND',
          },
        },
        ...(command.shippingAddress
          ? {
              shippingAddress: {
                create: {
                  receiverName: command.shippingAddress.receiverName,
                  receiverPhone: command.shippingAddress.receiverPhone,
                  province: command.shippingAddress.province,
                  district: command.shippingAddress.district,
                  ward: command.shippingAddress.ward,
                  street: command.shippingAddress.street,
                  detail: command.shippingAddress.detail,
                  latitude: command.shippingAddress.latitude,
                  longitude: command.shippingAddress.longitude,
                },
              },
            }
          : {}),
      },
    });

    return {
      id: order.id,
      code: order.code,
    };
  }

  async deleteOrder(command: DeleteOrderCommand): Promise<DeleteOrderResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: command.id },
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: ERRORS.NOT_FOUND.message,
      });
    }

    await this.prisma.order.delete({
      where: { id: command.id },
    });

    return { success: true };
  }

  async markSessionOrdersPaid(
    command: MarkSessionOrdersPaidCommand,
  ): Promise<{ updatedCount: number }> {
    const result = await this.prisma.order.updateMany({
      where: {
        tableSessionId: command.tableSessionId,
        paymentStatus: PrismaPaymentStatus.PENDING,
      },
      data: {
        paymentStatus: PrismaPaymentStatus.PAID,
      },
    });

    return { updatedCount: result.count };
  }

  async findOne(query: GetOrderDetailQuery): Promise<OrderDetailResult> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: query.id,
        ...(query.userId ? { userId: query.userId } : {}),
      },
      include: ORDER_DETAIL_INCLUDE,
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: ERRORS.NOT_FOUND.message,
      });
    }

    return this.mapToResult(order);
  }

  async findAll(query: ListOrdersQuery): Promise<PaginatedOrdersResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.status) {
      if (query.status === OrderStatus.CONFIRMED) {
        where.status = {
          in: [
            PrismaOrderStatus.CONFIRMED,
            PrismaOrderStatus.PREPARING,
            PrismaOrderStatus.READY,
          ],
        };
      } else {
        where.status = query.status as PrismaOrderStatus;
      }
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus as PrismaPaymentStatus;
    }
    if (query.fulfillmentStatus) {
      where.fulfillmentStatus =
        query.fulfillmentStatus as PrismaFulfillmentStatus;
    }
    if (query.keyword) {
      where.code = { contains: query.keyword, mode: 'insensitive' };
    }
    if (query.tableSessionId) {
      where.tableSessionId = query.tableSessionId;
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: ORDER_DETAIL_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      items: items.map((item) => this.mapToResult(item)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async updateStatus(
    command: UpdateOrderStatusCommand,
  ): Promise<UpdateOrderStatusResult> {
    const order = await this.prisma.order.findUnique({
      where: { id: command.id },
      include: { shippingAddress: true },
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: ERRORS.NOT_FOUND.message,
      });
    }

    const data: Prisma.OrderUpdateInput = {};
    // ... (logic for status, paymentStatus, fulfillmentStatus)
    if (command.status) {
      if (!this.isSupportedOrderStatus(command.status)) {
        throw new AppRpcException({
          code: ERRORS.BAD_REQUEST.code,
          message:
            'Trang thai don hang khong hop le. Dung fulfillmentStatus cho trang thai chuan bi/giao hang.',
        });
      }

      data.status = command.status as PrismaOrderStatus;

      if (command.status === OrderStatus.CONFIRMED) {
        data.confirmedAt = new Date();
      } else if (command.status === OrderStatus.COMPLETED) {
        data.completedAt = new Date();
      } else if (command.status === OrderStatus.CANCELED) {
        data.canceledAt = new Date();
      }
    }

    if (command.paymentStatus) {
      data.paymentStatus = command.paymentStatus as PrismaPaymentStatus;
    }

    if (command.fulfillmentStatus) {
      data.fulfillmentStatus =
        command.fulfillmentStatus as PrismaFulfillmentStatus;
    }

    if (Object.keys(data).length === 0) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Thieu truong trang thai de cap nhat',
      });
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id: command.id },
      data,
      include: { shippingAddress: true },
    });

    // Emit event if ready for delivery
    if (
      updatedOrder.fulfillmentStatus === PrismaFulfillmentStatus.READY_FOR_PICKUP &&
      updatedOrder.channel === PrismaOrderChannel.ONLINE &&
      updatedOrder.shippingAddress
    ) {
      const address = updatedOrder.shippingAddress;
      const fullAddress = [
        address.street,
        address.ward,
        address.district,
        address.province,
      ]
        .filter(Boolean)
        .join(', ');

      this.deliveryClient.emit(ORDERING_PATTERNS.ORDER_READY_FOR_DELIVERY, {
        orderId: updatedOrder.id,
        recipientName: address.receiverName,
        recipientPhone: address.receiverPhone,
        deliveryAddress: address.detail ? `${address.detail}, ${fullAddress}` : fullAddress,
        deliveryLat: address.latitude ? Number(address.latitude) : undefined,
        deliveryLng: address.longitude ? Number(address.longitude) : undefined,
        note: updatedOrder.note,
      });
    }

    return {
      id: updatedOrder.id,
      status: this.mapOrderStatusToContract(updatedOrder.status),
      paymentStatus: updatedOrder.paymentStatus as PaymentStatus,
      fulfillmentStatus: this.mapFulfillmentStatusToContract(
        updatedOrder.fulfillmentStatus,
        updatedOrder.status,
      ),
      updatedAt: updatedOrder.updatedAt,
    };
  }

  async cancelOrder(command: CancelOrderCommand): Promise<CancelOrderResult> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: command.id,
        ...(command.actorId ? { userId: command.actorId } : {}),
      },
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Khong tim thay don hang',
      });
    }

    const normalizedStatus = this.mapOrderStatusToContract(order.status);
    const normalizedFulfillment = this.mapFulfillmentStatusToContract(
      order.fulfillmentStatus,
      order.status,
    );

    if (
      normalizedStatus === OrderStatus.COMPLETED ||
      normalizedStatus === OrderStatus.CANCELED ||
      normalizedFulfillment === FulfillmentStatus.PREPARING ||
      normalizedFulfillment === FulfillmentStatus.READY_FOR_PICKUP ||
      normalizedFulfillment === FulfillmentStatus.SHIPPING ||
      normalizedFulfillment === FulfillmentStatus.DELIVERED
    ) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Don hang khong the huy',
      });
    }

    await this.prisma.order.update({
      where: { id: command.id },
      data: {
        status: OrderStatus.CANCELED,
        canceledAt: new Date(),
        ...(command.reason ? { note: command.reason } : {}),
      },
    });

    return {
      id: command.id,
      status: OrderStatus.CANCELED,
      canceledAt: new Date(),
    };
  }

  private mapToResult(order: OrderWithRelations): OrderDetailResult {
    return {
      id: order.id,
      code: order.code,
      userId: order.userId,
      channel: order.channel as OrderChannel,
      source: order.source as OrderSource,
      tableId: order.tableId,
      tableSessionId: order.tableSessionId,
      status: this.mapOrderStatusToContract(order.status),
      paymentStatus: order.paymentStatus as PaymentStatus,
      fulfillmentStatus: this.mapFulfillmentStatusToContract(
        order.fulfillmentStatus,
        order.status,
      ),
      note: order.note,
      items: order.items.map((item) => this.mapOrderItem(item)),
      pricingSnapshot: order.pricingSnapshot
        ? {
            id: order.pricingSnapshot.id,
            orderId: order.pricingSnapshot.orderId,
            itemsSubtotal: order.pricingSnapshot.itemsSubtotal.toNumber(),
            modifiersTotal: order.pricingSnapshot.modifiersTotal.toNumber(),
            discountTotal: order.pricingSnapshot.discountTotal.toNumber(),
            shippingFee: order.pricingSnapshot.shippingFee.toNumber(),
            serviceFee: order.pricingSnapshot.serviceFee.toNumber(),
            taxTotal: order.pricingSnapshot.taxTotal.toNumber(),
            grandTotal: order.pricingSnapshot.grandTotal.toNumber(),
            currency: order.pricingSnapshot.currency,
            createdAt: order.pricingSnapshot.createdAt,
          }
        : null,
      shippingAddress: order.shippingAddress
        ? {
            id: order.shippingAddress.id,
            orderId: order.shippingAddress.orderId,
            receiverName: order.shippingAddress.receiverName,
            receiverPhone: order.shippingAddress.receiverPhone,
            province: order.shippingAddress.province,
            district: order.shippingAddress.district,
            ward: order.shippingAddress.ward,
            street: order.shippingAddress.street,
            detail: order.shippingAddress.detail,
            latitude: order.shippingAddress.latitude
              ? order.shippingAddress.latitude.toNumber()
              : null,
            longitude: order.shippingAddress.longitude
              ? order.shippingAddress.longitude.toNumber()
              : null,
            createdAt: order.shippingAddress.createdAt,
          }
        : null,
      placedAt: order.placedAt,
      confirmedAt: order.confirmedAt,
      completedAt: order.completedAt,
      canceledAt: order.canceledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapOrderItem(
    item: OrderWithRelations['items'][number],
  ): OrderDetailResult['items'][number] {
    const unitPrice = item.unitPrice ? item.unitPrice.toNumber() : 0;
    return {
      id: item.id,
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      menuItemImageUrl: item.menuItemImageUrl,
      unitPrice,
      quantity: item.quantity,
      lineTotal: unitPrice * item.quantity,
      note: item.note,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  private isSupportedOrderStatus(status: OrderStatus): boolean {
    return (
      status === OrderStatus.DRAFT ||
      status === OrderStatus.PLACED ||
      status === OrderStatus.CONFIRMED ||
      status === OrderStatus.COMPLETED ||
      status === OrderStatus.CANCELED
    );
  }

  private mapOrderStatusToContract(status: PrismaOrderStatus): OrderStatus {
    if (
      status === PrismaOrderStatus.PREPARING ||
      status === PrismaOrderStatus.READY
    ) {
      return OrderStatus.CONFIRMED;
    }

    return status as OrderStatus;
  }

  private mapFulfillmentStatusToContract(
    fulfillmentStatus: PrismaFulfillmentStatus,
    orderStatus: PrismaOrderStatus,
  ): FulfillmentStatus {
    if (fulfillmentStatus !== PrismaFulfillmentStatus.NONE) {
      return fulfillmentStatus as FulfillmentStatus;
    }

    if (orderStatus === PrismaOrderStatus.PREPARING) {
      return FulfillmentStatus.PREPARING;
    }

    if (orderStatus === PrismaOrderStatus.READY) {
      return FulfillmentStatus.READY_FOR_PICKUP;
    }

    return fulfillmentStatus as FulfillmentStatus;
  }

  private generateNumericOrderCode(): string {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `${Date.now()}${randomSuffix}`;
  }
}
