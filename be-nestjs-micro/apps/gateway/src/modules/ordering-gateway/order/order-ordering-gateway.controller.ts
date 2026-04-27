import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import type { RequestWithUser } from '@app/auth';
import { OrderOrderingGatewayService } from './order-ordering-gateway.service';
import { ListOrdersRequestDto } from './dto/request/list-orders.request.dto';
import { UpdateOrderStatusRequestDto } from './dto/request/update-order-status.request.dto';
import { CreateOrderRequestDto } from './dto/request/create-order.request.dto';
import { CancelOrderRequestDto } from './dto/request/cancel-order.request.dto';
import { ERRORS } from '@app/common/constants/error-code.constant';

import { Roles } from '@app/auth';
import { RolesGuard } from '@app/auth';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ordering/orders')
export class OrderOrderingGatewayController {
  constructor(private readonly orderService: OrderOrderingGatewayService) {}

  @Post()
  async createOrder(
    @Req() request: RequestWithUser,
    @Body() dto: CreateOrderRequestDto, 
  ) {
    return this.orderService.createOrder(this.getUserId(request), dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'STAFF')
  async deleteOrder(
    @Param('id') id: string,
  ) {
    return this.orderService.deleteOrder(id);
  }

  @Get()
  async findAllUser(
    @Req() request: RequestWithUser,
    @Query() dto: ListOrdersRequestDto,
  ) {
    const userId = this.getUserId(request);
    return this.orderService.findAllUser(userId, dto);
  }

  @Get('admin')
  @Roles('ADMIN', 'STAFF')
  async findAllAdmin(
    @Query() dto: ListOrdersRequestDto,
  ) {
    return this.orderService.findAllAdmin(dto);
  }

  @Get('admin/:id')
  @Roles('ADMIN', 'STAFF')
  async findOneAdmin(@Param('id') id: string) {
    return this.orderService.findOneAdmin(id);
  }

  @Get(':id')
  async findOneUser(@Req() request: RequestWithUser, @Param('id') id: string) {
    const userId = this.getUserId(request);
    return this.orderService.findOneUser(userId, id);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'STAFF')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusRequestDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }

  @Post(':id/cancel')
  async cancelOrder(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: CancelOrderRequestDto,
  ) {
    return this.orderService.cancelOrder(this.getUserId(request), id, dto);
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
