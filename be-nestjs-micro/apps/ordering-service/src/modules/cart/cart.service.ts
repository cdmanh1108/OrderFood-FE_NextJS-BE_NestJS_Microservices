import { Injectable } from '@nestjs/common';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { AddCartItemCommand } from '@app/contracts/ordering/cart/commands/add-cart-item.command';
import { ClearCartCommand } from '@app/contracts/ordering/cart/commands/clear-cart.command';
import { GetActiveCartQuery } from '@app/contracts/ordering/cart/commands/get-active-cart.query';
import { RemoveCartItemCommand } from '@app/contracts/ordering/cart/commands/remove-cart-item.command';
import { SetCartAddressCommand } from '@app/contracts/ordering/cart/commands/set-cart-address.command';
import { SetCartNoteCommand } from '@app/contracts/ordering/cart/commands/set-cart-note.command';
import { UpdateCartItemCommand } from '@app/contracts/ordering/cart/commands/update-cart-item.command';
import { CartDetailResult } from '@app/contracts/ordering/cart/results/cart-detail.result';
import { CartItemResult } from '@app/contracts/ordering/cart/results/cart-item.result';
import { ClearCartResult } from '@app/contracts/ordering/cart/results/clear-cart.result';
import { RemoveCartItemResult } from '@app/contracts/ordering/cart/results/remove-cart-item.result';
import { SetCartAddressResult } from '@app/contracts/ordering/cart/results/set-cart-address.result';
import { SetCartNoteResult } from '@app/contracts/ordering/cart/results/set-cart-note.result';
import { AddressDetailResult } from '@app/contracts/ordering/address/results/address-detail.result';

type DecimalLike = {
  toNumber(): number;
};

type NullableDecimalLike = DecimalLike | null;

type CartWithRelations = {
  id: string;
  userId: string | null;
  channel: CartDetailResult['channel'];
  source: CartDetailResult['source'];
  tableId: string | null;
  tableSessionId: string | null;
  addressId: string | null;
  status: CartDetailResult['status'];
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  address: {
    id: string;
    userId: string;
    receiverName: string;
    receiverPhone: string;
    province: string;
    district: string;
    ward: string;
    street: string | null;
    detail: string | null;
    latitude: NullableDecimalLike;
    longitude: NullableDecimalLike;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  items: Array<{
    id: string;
    menuItemId: string;
    menuItemName: string;
    menuItemImageUrl: string | null;
    unitPrice: DecimalLike;
    quantity: number;
    note: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

@Injectable()
export class CartService {
  constructor(private readonly prisma: OrderingPrismaService) {}

  async findActive(query: GetActiveCartQuery): Promise<CartDetailResult> {
    const hasIdentity = Boolean(
      query.userId || query.tableId || query.tableSessionId,
    );

    if (!hasIdentity && !query.createIfMissing) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message:
          'Cần userId hoặc tableId hoặc tableSessionId để tìm giỏ hàng đang hoạt động',
      });
    }

    let cart = await this.prisma.cart.findFirst({
      where: {
        status: 'ACTIVE',
        ...(query.userId !== undefined ? { userId: query.userId } : {}),
        channel: query.channel,
        source: query.source,
        ...(query.tableId !== undefined ? { tableId: query.tableId } : {}),
        ...(query.tableSessionId !== undefined
          ? { tableSessionId: query.tableSessionId }
          : {}),
      },
      include: {
        address: true,
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!cart && query.createIfMissing) {
      cart = await this.prisma.cart.create({
        data: {
          userId: query.userId ?? null,
          channel: query.channel,
          source: query.source,
          tableId: query.tableId ?? null,
          tableSessionId: query.tableSessionId ?? null,
        },
        include: {
          address: true,
          items: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      });
    }

    if (!cart) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy giỏ hàng đang hoạt động',
      });
    }

    return this.toCartDetailResult(cart as unknown as CartWithRelations);
  }

  async addItem(command: AddCartItemCommand): Promise<CartDetailResult> {
    const cart = await this.ensureCartOwned(command.cartId, command.userId);

    if (cart.status !== 'ACTIVE') {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể thêm món vào giỏ hàng đang hoạt động',
      });
    }

    const quantityToAdd = command.quantity ?? 1;

    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cartId: command.cartId,
        menuItemId: command.menuItemId,
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + quantityToAdd,
          note: command.note ?? existingItem.note,
        },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: command.cartId,
          menuItemId: command.menuItemId,
          menuItemName: command.menuItemName,
          menuItemImageUrl: command.menuItemImageUrl ?? null,
          unitPrice: command.unitPrice,
          quantity: quantityToAdd,
          note: command.note ?? null,
        },
      });
    }

    return this.getCartDetail(command.cartId);
  }

  async updateItem(command: UpdateCartItemCommand): Promise<CartDetailResult> {
    await this.ensureCartOwned(command.cartId, command.userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: command.itemId,
        cartId: command.cartId,
      },
    });

    if (!item) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy món trong giỏ hàng',
      });
    }

    const data: {
      quantity?: number;
      note?: string | null;
    } = {};

    if (command.quantity !== undefined) {
      data.quantity = command.quantity;
    }

    if (command.note !== undefined) {
      data.note = command.note;
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data,
      });
    }

    return this.getCartDetail(command.cartId);
  }

  async removeItem(
    command: RemoveCartItemCommand,
  ): Promise<RemoveCartItemResult> {
    await this.ensureCartOwned(command.cartId, command.userId);

    const item = await this.prisma.cartItem.findFirst({
      where: {
        id: command.itemId,
        cartId: command.cartId,
      },
    });

    if (!item) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy món trong giỏ hàng',
      });
    }

    await this.prisma.cartItem.delete({
      where: { id: item.id },
    });

    const remainingItems = await this.prisma.cartItem.count({
      where: { cartId: command.cartId },
    });

    return {
      cartId: command.cartId,
      itemId: command.itemId,
      removed: true,
      remainingItems,
    };
  }

  async setAddress(
    command: SetCartAddressCommand,
  ): Promise<SetCartAddressResult> {
    const cart = await this.ensureCartOwned(command.cartId, command.userId);

    if (!command.addressId) {
      await this.prisma.cart.update({
        where: { id: command.cartId },
        data: { addressId: null },
      });

      return {
        cartId: command.cartId,
        addressId: null,
      };
    }

    const address = await this.prisma.address.findUnique({
      where: { id: command.addressId },
    });

    if (!address) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy địa chỉ',
      });
    }

    if (cart.userId && address.userId !== cart.userId) {
      throw new AppRpcException({
        code: ERRORS.FORBIDDEN.code,
        message: 'Địa chỉ không thuộc về người dùng hiện tại',
      });
    }

    await this.prisma.cart.update({
      where: { id: command.cartId },
      data: { addressId: command.addressId },
    });

    return {
      cartId: command.cartId,
      addressId: command.addressId,
    };
  }

  async setNote(command: SetCartNoteCommand): Promise<SetCartNoteResult> {
    await this.ensureCartOwned(command.cartId, command.userId);

    const updated = await this.prisma.cart.update({
      where: { id: command.cartId },
      data: {
        note: command.note ?? null,
      },
    });

    return {
      cartId: updated.id,
      note: updated.note,
    };
  }

  async clear(command: ClearCartCommand): Promise<ClearCartResult> {
    await this.ensureCartOwned(command.cartId, command.userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: command.cartId },
    });

    return {
      cartId: command.cartId,
      cleared: true,
    };
  }

  private async getCartDetail(cartId: string): Promise<CartDetailResult> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        address: true,
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!cart) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy giỏ hàng',
      });
    }

    return this.toCartDetailResult(cart as unknown as CartWithRelations);
  }

  private async ensureCartExists(cartId: string): Promise<{
    id: string;
    userId: string | null;
    status: string;
  }> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!cart) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy giỏ hàng',
      });
    }

    return cart;
  }

  private async ensureCartOwned(
    cartId: string,
    userId: string,
  ): Promise<{
    id: string;
    userId: string | null;
    status: string;
  }> {
    const cart = await this.ensureCartExists(cartId);
    if (!cart.userId || cart.userId !== userId) {
      throw new AppRpcException({
        code: ERRORS.FORBIDDEN.code,
        message: 'Cart does not belong to current user',
      });
    }

    return cart;
  }

  private toCartDetailResult(cart: CartWithRelations): CartDetailResult {
    const items = cart.items.map((item) => this.toCartItemResult(item));
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: cart.id,
      userId: cart.userId,
      channel: cart.channel,
      source: cart.source,
      tableId: cart.tableId,
      tableSessionId: cart.tableSessionId,
      addressId: cart.addressId,
      address: cart.address ? this.toAddressDetailResult(cart.address) : null,
      status: cart.status,
      note: cart.note,
      items,
      itemsCount,
      subtotal,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private toCartItemResult(
    item: CartWithRelations['items'][number],
  ): CartItemResult {
    const unitPrice = item.unitPrice.toNumber();
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

  private toAddressDetailResult(
    address: NonNullable<CartWithRelations['address']>,
  ): AddressDetailResult {
    return {
      id: address.id,
      userId: address.userId,
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      detail: address.detail,
      latitude: this.decimalToNumber(address.latitude),
      longitude: this.decimalToNumber(address.longitude),
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  private decimalToNumber(value: NullableDecimalLike): number | null {
    return value ? value.toNumber() : null;
  }
}
