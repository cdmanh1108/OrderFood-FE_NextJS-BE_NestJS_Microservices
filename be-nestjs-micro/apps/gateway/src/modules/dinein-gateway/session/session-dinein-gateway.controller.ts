import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@app/auth';
import { SessionDineinGatewayService } from './session-dinein-gateway.service';
import { DineInCreateOrderRequestDto } from './dto/dinein-create-order.request.dto';
import { CloseSessionRequestDto } from './dto/close-session.request.dto';

@Controller('dinein')
export class SessionDineinGatewayController {
  constructor(private readonly sessionService: SessionDineinGatewayService) {}

  // Public: scan QR → join/create session
  @Post('tables/:tableId/session/join')
  async joinOrCreate(@Param('tableId') tableId: string) {
    return this.sessionService.joinOrCreate(tableId);
  }

  // Public: get active session for a table (no auth, for admin view too)
  @Get('tables/:tableId/active-session')
  async getActiveSession(@Param('tableId') tableId: string) {
    return this.sessionService.getActiveSessionByTableId(tableId);
  }

  // Public: get session info
  @Get('sessions/:id')
  async getSession(@Param('id') id: string) {
    return this.sessionService.getSession(id);
  }

  // Public: get orders for a session (dine-in users don't have JWT)
  @Get('sessions/:id/orders')
  async getSessionOrders(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    return this.sessionService.getSessionOrders(
      id,
      limit ? Number(limit) : 100,
    );
  }

  // Public: dine-in users place order (no JWT — session validation happens in service)
  @Post('sessions/:id/orders')
  async createDineInOrder(
    @Param('id') id: string,
    @Body() dto: DineInCreateOrderRequestDto,
  ) {
    return this.sessionService.createDineInOrder(id, dto);
  }

  // Admin/Staff only: close session + mark orders as PAID
  @Post('sessions/:id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async closeSession(
    @Param('id') id: string,
    @Body() dto: CloseSessionRequestDto,
  ) {
    return this.sessionService.closeSession(id, dto.paymentMethod);
  }
}
