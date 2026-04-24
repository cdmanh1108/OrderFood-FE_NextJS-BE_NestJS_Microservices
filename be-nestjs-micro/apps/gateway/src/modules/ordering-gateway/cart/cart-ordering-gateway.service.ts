import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { AddCartItemRequestDto } from './dto/request/add-cart-item.request.dto';
import { GetActiveCartRequestDto } from './dto/request/get-active-cart.request.dto';
import { UpdateCartItemRequestDto } from './dto/request/update-cart-item.request.dto';
import { RemoveCartItemRequestDto } from './dto/request/remove-cart-item.request.dto';
import { SetCartAddressRequestDto } from './dto/request/set-cart-address.request.dto';
import { SetCartNoteRequestDto } from './dto/request/set-cart-note.request.dto';
import { ClearCartRequestDto } from './dto/request/clear-cart.request.dto';
import { GetActiveCartQuery } from '@app/contracts/ordering/cart/commands/get-active-cart.query';
import { AddCartItemCommand } from '@app/contracts/ordering/cart/commands/add-cart-item.command';
import { UpdateCartItemCommand } from '@app/contracts/ordering/cart/commands/update-cart-item.command';
import { RemoveCartItemCommand } from '@app/contracts/ordering/cart/commands/remove-cart-item.command';
import { SetCartAddressCommand } from '@app/contracts/ordering/cart/commands/set-cart-address.command';
import { SetCartNoteCommand } from '@app/contracts/ordering/cart/commands/set-cart-note.command';
import { ClearCartCommand } from '@app/contracts/ordering/cart/commands/clear-cart.command';
import { CartDetailResult } from '@app/contracts/ordering/cart/results/cart-detail.result';
import { RemoveCartItemResult } from '@app/contracts/ordering/cart/results/remove-cart-item.result';
import { SetCartAddressResult } from '@app/contracts/ordering/cart/results/set-cart-address.result';
import { SetCartNoteResult } from '@app/contracts/ordering/cart/results/set-cart-note.result';
import { ClearCartResult } from '@app/contracts/ordering/cart/results/clear-cart.result';

@Injectable()
export class CartOrderingGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.ORDERING)
    private readonly orderingClient: ClientProxy,
  ) {}

  async findActive(dto: GetActiveCartRequestDto): Promise<CartDetailResult> {
    const query: GetActiveCartQuery = {
      userId: dto.userId,
      channel: dto.channel,
      source: dto.source,
      tableId: dto.tableId,
      tableSessionId: dto.tableSessionId,
      createIfMissing: dto.createIfMissing,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          CartDetailResult,
          GetActiveCartQuery
        >(ORDERING_PATTERNS.GET_ACTIVE_CART, query)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async addItem(dto: AddCartItemRequestDto): Promise<CartDetailResult> {
    const command: AddCartItemCommand = {
      cartId: dto.cartId,
      menuItemId: dto.menuItemId,
      menuItemName: dto.menuItemName,
      menuItemImageUrl: dto.menuItemImageUrl,
      unitPrice: dto.unitPrice,
      quantity: dto.quantity,
      note: dto.note,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          CartDetailResult,
          AddCartItemCommand
        >(ORDERING_PATTERNS.ADD_CART_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async updateItem(dto: UpdateCartItemRequestDto): Promise<CartDetailResult> {
    const command: UpdateCartItemCommand = {
      cartId: dto.cartId,
      itemId: dto.itemId,
      quantity: dto.quantity,
      note: dto.note,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          CartDetailResult,
          UpdateCartItemCommand
        >(ORDERING_PATTERNS.UPDATE_CART_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async removeItem(
    dto: RemoveCartItemRequestDto,
  ): Promise<RemoveCartItemResult> {
    const command: RemoveCartItemCommand = {
      cartId: dto.cartId,
      itemId: dto.itemId,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          RemoveCartItemResult,
          RemoveCartItemCommand
        >(ORDERING_PATTERNS.REMOVE_CART_ITEM, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async setAddress(
    dto: SetCartAddressRequestDto,
  ): Promise<SetCartAddressResult> {
    const command: SetCartAddressCommand = {
      cartId: dto.cartId,
      addressId: dto.addressId,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          SetCartAddressResult,
          SetCartAddressCommand
        >(ORDERING_PATTERNS.SET_CART_ADDRESS, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async setNote(dto: SetCartNoteRequestDto): Promise<SetCartNoteResult> {
    const command: SetCartNoteCommand = {
      cartId: dto.cartId,
      note: dto.note,
    };

    return firstValueFrom(
      this.orderingClient
        .send<
          SetCartNoteResult,
          SetCartNoteCommand
        >(ORDERING_PATTERNS.SET_CART_NOTE, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async clear(dto: ClearCartRequestDto): Promise<ClearCartResult> {
    const command: ClearCartCommand = { cartId: dto.cartId };

    return firstValueFrom(
      this.orderingClient
        .send<
          ClearCartResult,
          ClearCartCommand
        >(ORDERING_PATTERNS.CLEAR_CART, command)
        .pipe(
          catchError((error: unknown) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
