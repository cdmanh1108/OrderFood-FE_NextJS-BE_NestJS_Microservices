import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { RequestWithUser } from '@app/auth';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { CartOrderingGatewayService } from './cart-ordering-gateway.service';
import { GetActiveCartRequestDto } from './dto/request/get-active-cart.request.dto';
import { AddCartItemRequestDto } from './dto/request/add-cart-item.request.dto';
import { UpdateCartItemRequestDto } from './dto/request/update-cart-item.request.dto';
import { RemoveCartItemRequestDto } from './dto/request/remove-cart-item.request.dto';
import { SetCartAddressRequestDto } from './dto/request/set-cart-address.request.dto';
import { SetCartNoteRequestDto } from './dto/request/set-cart-note.request.dto';
import { ClearCartRequestDto } from './dto/request/clear-cart.request.dto';

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
      this.getUserId(request),
      query,
    );
  }

  @Post('items')
  addItem(@Body() dto: AddCartItemRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.addItem(
      this.getUserId(request),
      dto,
    );
  }

  @Patch('items')
  updateItem(
    @Body() dto: UpdateCartItemRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.updateItem(
      this.getUserId(request),
      dto,
    );
  }

  @Delete('items')
  removeItem(
    @Body() dto: RemoveCartItemRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.removeItem(
      this.getUserId(request),
      dto,
    );
  }

  @Patch('address')
  setAddress(
    @Body() dto: SetCartAddressRequestDto,
    @Req() request: RequestWithUser,
  ) {
    return this.cartOrderingGatewayService.setAddress(
      this.getUserId(request),
      dto,
    );
  }

  @Patch('note')
  setNote(@Body() dto: SetCartNoteRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.setNote(
      this.getUserId(request),
      dto,
    );
  }

  @Post('clear')
  clear(@Body() dto: ClearCartRequestDto, @Req() request: RequestWithUser) {
    return this.cartOrderingGatewayService.clear(this.getUserId(request), dto);
  }

  private getUserId(request: RequestWithUser): string {
    const userId = request.user?.sub;
    if (!userId) {
      throw new UnauthorizedException({
        code: ERRORS.UNAUTHORIZED.code,
        message: ERRORS.UNAUTHORIZED.message,
      });
    }

    return userId;
  }
}
