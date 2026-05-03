import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DINEIN_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type { CreateReservationCommand } from '@app/contracts/dinein/reservation/commands/create-reservation.command';
import type { UpdateReservationStatusCommand } from '@app/contracts/dinein/reservation/commands/update-reservation-status.command';
import type { ListReservationsQuery } from '@app/contracts/dinein/reservation/commands/list-reservations.query';

import { ReservationService } from './reservation.service';

@Controller()
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @MessagePattern(DINEIN_PATTERNS.CREATE_RESERVATION)
  async createReservation(
    @Payload() command: CreateReservationCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.reservationService.create(command),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.GET_RESERVATION_DETAIL)
  async getReservationDetail(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.reservationService.findOne(payload.id),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.LIST_RESERVATIONS)
  async listReservations(
    @Payload() query: ListReservationsQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.reservationService.findAll(query),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.UPDATE_RESERVATION_STATUS)
  async updateReservationStatus(
    @Payload() command: UpdateReservationStatusCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.reservationService.updateStatus(command),
    );
  }
}
