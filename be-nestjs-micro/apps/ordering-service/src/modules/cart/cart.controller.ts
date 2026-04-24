import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/common/rmq/rpc-message.helper';
import type { GetActiveCartQuery } from '@app/contracts/ordering/cart/commands/get-active-cart.query';
import type { AddCartItemCommand } from '@app/contracts/ordering/cart/commands/add-cart-item.command';
import type { UpdateCartItemCommand } from '@app/contracts/ordering/cart/commands/update-cart-item.command';
import type { RemoveCartItemCommand } from '@app/contracts/ordering/cart/commands/remove-cart-item.command';
import type { SetCartAddressCommand } from '@app/contracts/ordering/cart/commands/set-cart-address.command';
import type { SetCartNoteCommand } from '@app/contracts/ordering/cart/commands/set-cart-note.command';
import type { ClearCartCommand } from '@app/contracts/ordering/cart/commands/clear-cart.command';
import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @MessagePattern(ORDERING_PATTERNS.GET_ACTIVE_CART)
  findActive(@Payload() query: GetActiveCartQuery, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.cartService.findActive(query));
  }

  @MessagePattern(ORDERING_PATTERNS.ADD_CART_ITEM)
  addItem(@Payload() command: AddCartItemCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.cartService.addItem(command));
  }

  @MessagePattern(ORDERING_PATTERNS.UPDATE_CART_ITEM)
  updateItem(
    @Payload() command: UpdateCartItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.cartService.updateItem(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.REMOVE_CART_ITEM)
  removeItem(
    @Payload() command: RemoveCartItemCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.cartService.removeItem(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.SET_CART_ADDRESS)
  setAddress(
    @Payload() command: SetCartAddressCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.cartService.setAddress(command),
    );
  }

  @MessagePattern(ORDERING_PATTERNS.SET_CART_NOTE)
  setNote(@Payload() command: SetCartNoteCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.cartService.setNote(command));
  }

  @MessagePattern(ORDERING_PATTERNS.CLEAR_CART)
  clear(@Payload() command: ClearCartCommand, @Ctx() context: RmqContext) {
    return handleRpcMessage(context, () => this.cartService.clear(command));
  }
}
