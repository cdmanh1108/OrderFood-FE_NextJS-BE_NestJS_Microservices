import { Inject, Injectable } from '@nestjs/common';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { CalculateCheckoutCommand } from '@app/contracts/ordering/checkout/commands/calculate-checkout.command';
import { PlaceOrderCommand } from '@app/contracts/ordering/checkout/commands/place-order.command';
import { CheckoutPricingResult } from '@app/contracts/ordering/checkout/results/checkout-pricing.result';
import { PlaceOrderResult } from '@app/contracts/ordering/checkout/results/place-order.result';
import { CreateOrderCommand } from '@app/contracts/ordering/order/commands/create-order.command';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';
import { OrderStatus } from '@app/contracts/ordering/enums/order-status.enum';
import { OrderService } from '../order/order.service';
import { CreatePaymentCommand } from '@app/contracts/payment/commands/create-payment.command';
import { PaymentMethod } from '@app/contracts/payment/enums/payment-method.enum';
import { PaymentResult } from '@app/contracts/payment/results/payment.result';
import type { GetMenuItemDetailQuery } from '@app/contracts/catalog/menu-item/commands/get-menu-item-detail.query';
import type { MenuItemDetailResult } from '@app/contracts/catalog/menu-item/results/menu-item-detail.result';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  CATALOG_PATTERNS,
  PAYMENT_PATTERNS,
} from '@app/messaging/constants/patterns.constant';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import {
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
} from 'generated/ordering';

type CheckoutItemInput = {
  menuItemId: string;
  quantity: number;
  note?: string;
};

type ResolvedCheckoutItem = {
  menuItemId: string;
  menuItemName: string;
  menuItemImageUrl?: string;
  unitPrice: number;
  quantity: number;
  note?: string;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: OrderingPrismaService,
    private readonly orderService: OrderService,
    @Inject(RMQ_SERVICES.PAYMENT) private readonly paymentClient: ClientProxy,
    @Inject(RMQ_SERVICES.CATALOG) private readonly catalogClient: ClientProxy,
  ) {}

  async calculateCheckout(
    command: CalculateCheckoutCommand,
  ): Promise<CheckoutPricingResult> {
    const items = command.items ?? [];

    if (items.length === 0) {
      return this.buildPricing([], command.promoCode);
    }

    const resolvedItems = await this.resolveCheckoutItems(
      items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
    );

    return this.buildPricing(resolvedItems, command.promoCode);
  }

  async placeOrder(command: PlaceOrderCommand): Promise<PlaceOrderResult> {
    if (!command.items || command.items.length === 0) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: ERRORS.BAD_REQUEST.message,
      });
    }

    const resolvedItems = await this.resolveCheckoutItems(
      command.items.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        note: item.note,
      })),
    );

    const pricing = this.buildPricing(resolvedItems, command.promoCode);

    const createOrderCommand: CreateOrderCommand = {
      userId: command.userId,
      channel: OrderChannel.ONLINE,
      source: OrderSource.WEB,
      note: command.note,
      items: resolvedItems.map((item) => this.mapCheckoutItemToOrderItem(item)),
      shippingAddress: command.shippingAddress,
    };

    const createdOrder =
      await this.orderService.createOrder(createOrderCommand);

    try {
      const returnUrl = this.attachOrderIdToUrl(
        command.returnUrl,
        createdOrder.id,
      );
      const cancelUrl = this.attachOrderIdToUrl(
        command.cancelUrl,
        createdOrder.id,
      );

      const paymentCommand: CreatePaymentCommand = {
        orderId: createdOrder.id,
        orderCode:
          command.paymentMethod === PaymentMethod.PAYOS
            ? createdOrder.code
            : undefined,
        method: command.paymentMethod,
        amount: pricing.grandTotal.toString(),
        currency: pricing.currency,
        description: `Thanh toan don ${createdOrder.code}`,
        metadata: {
          orderCode: createdOrder.code,
          source: 'checkout',
        },
        returnUrl,
        cancelUrl,
      };

      const payment = await firstValueFrom(
        this.paymentClient.send<PaymentResult, CreatePaymentCommand>(
          PAYMENT_PATTERNS.CREATE_PAYMENT,
          paymentCommand,
        ),
      );

      return {
        orderId: createdOrder.id,
        orderCode: createdOrder.code,
        orderStatus: OrderStatus.PLACED,
        paymentId: payment.id,
        paymentMethod: payment.method,
        paymentStatus: payment.status,
        checkoutUrl: payment.checkoutUrl ?? payment.paymentUrl ?? null,
        amount: pricing.grandTotal,
        currency: pricing.currency,
        createdAt: payment.createdAt ? new Date(payment.createdAt) : new Date(),
      };
    } catch (error) {
      await this.prisma.order.update({
        where: { id: createdOrder.id },
        data: {
          status: PrismaOrderStatus.CANCELED,
          paymentStatus: PrismaPaymentStatus.FAILED,
          canceledAt: new Date(),
        },
      });

      throw error;
    }
  }

  private buildPricing(
    items: Array<Pick<ResolvedCheckoutItem, 'unitPrice' | 'quantity'>>,
    promoCode?: string,
  ): CheckoutPricingResult {
    const itemsSubtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    // Shipping is temporarily disabled. It will be calculated by address later.
    const shippingFee = 0;

    // In the future, verify promoCode from DB.
    let discountTotal = 0;
    if (promoCode === 'DISCOUNT10') {
      discountTotal = itemsSubtotal * 0.1;
    }

    const serviceFee = 0;
    const taxTotal = 0;

    const grandTotal =
      itemsSubtotal + shippingFee + serviceFee + taxTotal - discountTotal;

    return {
      itemsSubtotal,
      shippingFee,
      discountTotal,
      serviceFee,
      taxTotal,
      grandTotal: grandTotal > 0 ? grandTotal : 0,
      currency: 'VND',
    };
  }

  private async resolveCheckoutItems(
    items: CheckoutItemInput[],
  ): Promise<ResolvedCheckoutItem[]> {
    const normalizedItems = items.map((item) => {
      const menuItemId = item.menuItemId?.trim();

      if (!menuItemId) {
        throw new AppRpcException({
          code: ERRORS.BAD_REQUEST.code,
          message: 'Thieu menuItemId',
        });
      }

      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new AppRpcException({
          code: ERRORS.BAD_REQUEST.code,
          message: `S? l??ng kh?ng h?p l? cho m?n ${menuItemId}`,
        });
      }

      return {
        menuItemId,
        quantity: item.quantity,
        note: item.note,
      };
    });

    const menuItemMap = await this.getCatalogMenuItems(
      normalizedItems.map((item) => item.menuItemId),
    );

    return normalizedItems.map((item) => {
      const catalogItem = menuItemMap.get(item.menuItemId);

      if (!catalogItem) {
        throw new AppRpcException({
          code: ERRORS.MENU_ITEM_NOT_FOUND.code,
          message: `Kh?ng t?m th?y m?n ?n: ${item.menuItemId}`,
        });
      }

      if (!catalogItem.isActive || !catalogItem.isAvailable) {
        throw new AppRpcException({
          code: ERRORS.BAD_REQUEST.code,
          message: `M?n ?n hi?n kh?ng kh? d?ng: ${catalogItem.name}`,
        });
      }

      return {
        menuItemId: catalogItem.id,
        menuItemName: catalogItem.name,
        menuItemImageUrl: catalogItem.image ?? undefined,
        unitPrice: catalogItem.price,
        quantity: item.quantity,
        note: item.note,
      };
    });
  }

  private async getCatalogMenuItems(
    menuItemIds: string[],
  ): Promise<Map<string, MenuItemDetailResult>> {
    const uniqueMenuItemIds = Array.from(new Set(menuItemIds));

    const menuItems = await Promise.all(
      uniqueMenuItemIds.map(async (id) => {
        const query: GetMenuItemDetailQuery = { id };

        return firstValueFrom(
          this.catalogClient.send<MenuItemDetailResult, GetMenuItemDetailQuery>(
            CATALOG_PATTERNS.GET_MENU_ITEM_DETAIL,
            query,
          ),
        );
      }),
    );

    return new Map(menuItems.map((item) => [item.id, item]));
  }

  private mapCheckoutItemToOrderItem(item: ResolvedCheckoutItem) {
    return {
      menuItemId: item.menuItemId,
      menuItemName: item.menuItemName,
      menuItemImageUrl: item.menuItemImageUrl,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      note: item.note,
    };
  }

  private attachOrderIdToUrl(
    rawUrl: string | undefined,
    orderId: string,
  ): string | undefined {
    if (!rawUrl) {
      return undefined;
    }

    try {
      const url = new URL(rawUrl);
      url.searchParams.set('orderId', orderId);
      return url.toString();
    } catch {
      const separator = rawUrl.includes('?') ? '&' : '?';
      return `${rawUrl}${separator}orderId=${encodeURIComponent(orderId)}`;
    }
  }
}
