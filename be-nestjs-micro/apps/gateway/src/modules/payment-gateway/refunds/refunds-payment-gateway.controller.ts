import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@app/auth';
import { RefundsPaymentGatewayService } from './refunds-payment-gateway.service';

import { CreateRefundRequestDto } from './dto/request/create-refund.request.dto';
import { ListRefundsQueryDto } from './dto/request/list-refunds.query.dto';
import { IsUUID } from 'class-validator';

export class RefundIdParamsDto {
  @IsUUID()
  id: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments/refunds')
export class RefundsPaymentGatewayController {
  constructor(private readonly refundsService: RefundsPaymentGatewayService) {}

  @Get()
  @Roles('ADMIN', 'STAFF')
  listRefunds(@Query() query: ListRefundsQueryDto) {
    return this.refundsService.listRefunds(query);
  }

  @Post()
  @Roles('ADMIN', 'STAFF')
  createRefund(@Body() dto: CreateRefundRequestDto) {
    return this.refundsService.createRefund(dto);
  }

  @Get(':id')
  @Roles('ADMIN', 'STAFF')
  getRefundById(@Param() params: RefundIdParamsDto) {
    return this.refundsService.getRefundById(params.id);
  }
}
