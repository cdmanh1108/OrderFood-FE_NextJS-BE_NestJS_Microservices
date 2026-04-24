import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CartOrderingGatewayService } from './cart-ordering-gateway.service';
import { GetActiveCartRequestDto } from './dto/request/get-active-cart.request.dto';
import { AddCartItemRequestDto } from './dto/request/add-cart-item.request.dto';
import { UpdateCartItemRequestDto } from './dto/request/update-cart-item.request.dto';
import { RemoveCartItemRequestDto } from './dto/request/remove-cart-item.request.dto';
import { SetCartAddressRequestDto } from './dto/request/set-cart-address.request.dto';
import { SetCartNoteRequestDto } from './dto/request/set-cart-note.request.dto';
import { ClearCartRequestDto } from './dto/request/clear-cart.request.dto';

@Controller('carts')
export class CartOrderingGatewayController {
  constructor(
    private readonly cartOrderingGatewayService: CartOrderingGatewayService,
  ) {}

  @Get('active')
  findActive(@Query() query: GetActiveCartRequestDto) {
    return this.cartOrderingGatewayService.findActive(query);
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemRequestDto) {
    return this.cartOrderingGatewayService.addItem(dto);
  }

  @Patch('items')
  updateItem(@Body() dto: UpdateCartItemRequestDto) {
    return this.cartOrderingGatewayService.updateItem(dto);
  }

  @Delete('items')
  removeItem(@Body() dto: RemoveCartItemRequestDto) {
    return this.cartOrderingGatewayService.removeItem(dto);
  }

  @Patch('address')
  setAddress(@Body() dto: SetCartAddressRequestDto) {
    return this.cartOrderingGatewayService.setAddress(dto);
  }

  @Patch('note')
  setNote(@Body() dto: SetCartNoteRequestDto) {
    return this.cartOrderingGatewayService.setNote(dto);
  }

  @Post('clear')
  clear(@Body() dto: ClearCartRequestDto) {
    return this.cartOrderingGatewayService.clear(dto);
  }
}
