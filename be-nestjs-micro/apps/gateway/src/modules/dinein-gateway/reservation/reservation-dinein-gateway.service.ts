import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { DINEIN_PATTERNS } from '@app/messaging/constants/patterns.constant';

import type { CreateReservationCommand } from '@app/contracts/dinein/reservation/commands/create-reservation.command';
import type { UpdateReservationStatusCommand } from '@app/contracts/dinein/reservation/commands/update-reservation-status.command';
import type { ListReservationsQuery } from '@app/contracts/dinein/reservation/commands/list-reservations.query';
import type { ReservationDetailResult } from '@app/contracts/dinein/reservation/results/reservation-detail.result';
import type { PaginatedReservationsResult } from '@app/contracts/dinein/reservation/results/paginated-reservations.result';

import { CreateReservationRequestDto } from './dto/create-reservation.request.dto';
import { UpdateReservationStatusRequestDto } from './dto/update-reservation-status.request.dto';
import { ListReservationsRequestDto } from './dto/list-reservations.request.dto';

@Injectable()
export class ReservationDineinGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.DINEIN)
    private readonly dineinClient: ClientProxy,
  ) {}

  async createReservation(
    userId: string | undefined,
    dto: CreateReservationRequestDto,
  ): Promise<ReservationDetailResult> {
    const command: CreateReservationCommand = { ...dto, userId };
    return firstValueFrom(
      this.dineinClient
        .send<ReservationDetailResult, CreateReservationCommand>(
          DINEIN_PATTERNS.CREATE_RESERVATION,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async getReservationDetail(id: string): Promise<ReservationDetailResult> {
    return firstValueFrom(
      this.dineinClient
        .send<ReservationDetailResult, { id: string }>(
          DINEIN_PATTERNS.GET_RESERVATION_DETAIL,
          { id },
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async listReservations(
    dto: ListReservationsRequestDto,
  ): Promise<PaginatedReservationsResult> {
    const query: ListReservationsQuery = { ...dto };
    return firstValueFrom(
      this.dineinClient
        .send<PaginatedReservationsResult, ListReservationsQuery>(
          DINEIN_PATTERNS.LIST_RESERVATIONS,
          query,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }

  async updateReservationStatus(
    id: string,
    dto: UpdateReservationStatusRequestDto,
  ): Promise<ReservationDetailResult> {
    const command: UpdateReservationStatusCommand = { id, status: dto.status };
    return firstValueFrom(
      this.dineinClient
        .send<ReservationDetailResult, UpdateReservationStatusCommand>(
          DINEIN_PATTERNS.UPDATE_RESERVATION_STATUS,
          command,
        )
        .pipe(
          catchError((error) =>
            throwError(() => mapRpcErrorToHttpException(error)),
          ),
        ),
    );
  }
}
