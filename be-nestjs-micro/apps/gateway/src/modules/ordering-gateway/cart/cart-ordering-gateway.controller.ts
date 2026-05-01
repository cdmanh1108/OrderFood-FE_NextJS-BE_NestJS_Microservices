import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { RequestWithUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { CartOrderingGatewayService } from './cart-ordering-gateway.service';
import { GetActiveCartRequestDto } from './dto/request/get-active-cart.request.dto';
import { AddCartItemRequestDto } from './dto/request/add-cart-item.request.dto';
import { UpdateCartItemRequestDto } from './dto/request/update-cart-item.request.dto';
import { RemoveCartItemRequestDto } from './dto/request/remove-cart-item.request.dto';
import { SetCartAddressRequestDto } from './dto/request/set-cart-address.request.dto';
import { SetCartNoteRequestDto } from './dto/request/set-cart-note.request.dto';
import { ClearCartRequestDto } from './dto/request/clear-cart.request.dto';
import { getUserIdOrThrow } from '../../../common/utils/get-user-id.util';

@Controller('carts')
@UseGuards(JwtAuthGuard)
export class CartOrderingGatewayController {
  constructor(
    private readonly cartOrderingGatewayService: CartOrderingGatewayService,
  ) {}

  @Get('active')
  findActive(
    @Query() query: GetActiveCartRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.findActive(
      getUserIdOrThrow(request),
      query,
    );
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.addItem(
      getUserIdOrThrow(request),
      dto,
    );
  }

  @Patch('items')
  updateItem(
    @Body() dto: UpdateCartItemRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.updateItem(
      getUserIdOrThrow(request),
      dto,
    );
  }

  @Delete('items')
  removeItem(
    @Body() dto: RemoveCartItemRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.removeItem(
      getUserIdOrThrow(request),
      dto,
    );
  }

  @Patch('address')
  setAddress(
    @Body() dto: SetCartAddressRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.setAddress(
      getUserIdOrThrow(request),
      dto,
    );
  }

  @Patch('note')
  setNote(@Body() dto: SetCartNoteRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.setNote(
      getUserIdOrThrow(request),
      dto,
    );
  }

  @Post('clear')
  clear(@Body() dto: ClearCartRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.clear(
      getUserIdOrThrow(request),
      dto,
    );
  }
}
