import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@app/auth/guards/jwt-auth.guard';
import { Roles, RolesGuard } from '@app/auth';
import type { RequestWithUser } from '@app/auth';
import { ReservationDineinGatewayService } from './reservation-dinein-gateway.service';
import { CreateReservationRequestDto } from './dto/create-reservation.request.dto';
import { UpdateReservationStatusRequestDto } from './dto/update-reservation-status.request.dto';
import { ListReservationsRequestDto } from './dto/list-reservations.request.dto';

@Controller('dinein/reservations')
export class ReservationDineinGatewayController {
  constructor(
    private readonly reservationService: ReservationDineinGatewayService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createReservation(
    @Req() request: RequestWithUser,
    @Body() dto: CreateReservationRequestDto,
  ) {
    const userId = request.user?.sub;
    return this.reservationService.createReservation(userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async listReservations(@Query() dto: ListReservationsRequestDto) {
    return this.reservationService.listReservations(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async getReservationDetail(@Param('id') id: string) {
    return this.reservationService.getReservationDetail(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  async updateReservationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateReservationStatusRequestDto,
  ) {
    return this.reservationService.updateReservationStatus(id, dto);
  }
}
