import { Injectable } from '@nestjs/common';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';

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
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: OrderingPrismaService) {}

  async createOrder(command: CreateOrderCommand): Promise<CreateOrderResult> {
    const code = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const itemsSubtotal = command.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const grandTotal = itemsSubtotal;

    const order = await this.prisma.order.create({
      data: {
        code,
        userId: command.userId,
        channel: command.channel as any,
        source: command.source as any,
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
        message: 'Order not found',
      });
    }

    await this.prisma.order.delete({
      where: { id: command.id },
    });

    return { success: true };
  }

  async findOne(query: GetOrderDetailQuery): Promise<OrderDetailResult> {
    const order = await this.prisma.order.findFirst({
      where: {
        id: query.id,
        ...(query.userId ? { userId: query.userId } : {}),
      },
      include: {
        items: true,
        pricingSnapshot: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Order not found',
      });
    }

    return this.mapToResult(order);
  }

  async findAll(query: ListOrdersQuery): Promise<PaginatedOrdersResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }
    if (query.fulfillmentStatus) {
      where.fulfillmentStatus = query.fulfillmentStatus;
    }
    if (query.keyword) {
      where.code = { contains: query.keyword, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          items: true,
          pricingSnapshot: true,
          shippingAddress: true,
        },
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
    });

    if (!order) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Order not found',
      });
    }

    const data: any = { status: command.status };
    if (command.status === OrderStatus.CONFIRMED) {
      data.confirmedAt = new Date();
    } else if (command.status === OrderStatus.COMPLETED) {
      data.completedAt = new Date();
    } else if (command.status === OrderStatus.CANCELED) {
      data.canceledAt = new Date();
    }

    if (command.paymentStatus) {
      data.paymentStatus = command.paymentStatus;
    }

    if (command.fulfillmentStatus) {
      data.fulfillmentStatus = command.fulfillmentStatus;
    }

    await this.prisma.order.update({
      where: { id: command.id },
      data,
    });

    return {
      id: command.id,
      status: command.status,
      paymentStatus: command.paymentStatus,
      fulfillmentStatus: command.fulfillmentStatus,
      updatedAt: new Date(),
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
        message: 'Order not found',
      });
    }

    if (
      order.status === 'COMPLETED' ||
      order.status === 'CANCELED' ||
      order.status === 'READY' ||
      order.status === 'PREPARING'
    ) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Order cannot be canceled',
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

  private mapToResult(order: any): any {
    return {
      id: order.id,
      code: order.code,
      userId: order.userId,
      channel: order.channel as any,
      source: order.source as any,
      tableId: order.tableId,
      tableSessionId: order.tableSessionId,
      status: order.status as any,
      paymentStatus: order.paymentStatus as any,
      fulfillmentStatus: order.fulfillmentStatus as any,
      note: order.note,
      items: (order.items || []).map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        menuItemImageUrl: item.menuItemImageUrl,
        unitPrice: item.unitPrice ? item.unitPrice.toNumber() : 0,
        quantity: item.quantity,
        note: item.note,
      })),
      pricingSnapshot: order.pricingSnapshot
        ? {
            itemsSubtotal: order.pricingSnapshot.itemsSubtotal.toNumber(),
            modifiersTotal: order.pricingSnapshot.modifiersTotal.toNumber(),
            discountTotal: order.pricingSnapshot.discountTotal.toNumber(),
            shippingFee: order.pricingSnapshot.shippingFee.toNumber(),
            serviceFee: order.pricingSnapshot.serviceFee.toNumber(),
            taxTotal: order.pricingSnapshot.taxTotal.toNumber(),
            grandTotal: order.pricingSnapshot.grandTotal.toNumber(),
            currency: order.pricingSnapshot.currency,
          }
        : null,
      shippingAddress: order.shippingAddress
        ? {
            receiverName: order.shippingAddress.receiverName,
            receiverPhone: order.shippingAddress.receiverPhone,
            province: order.shippingAddress.province,
            district: order.shippingAddress.district,
            ward: order.shippingAddress.ward,
            street: order.shippingAddress.street,
            detail: order.shippingAddress.detail,
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
}
