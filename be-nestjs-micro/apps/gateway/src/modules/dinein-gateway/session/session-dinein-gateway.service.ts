import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { mapRpcErrorToHttpException } from '@app/common/utils/map-rpc-error-to-http.utils';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { DINEIN_PATTERNS, ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { TableSessionStatus } from '@app/contracts/dinein/enums/table-session-status.enum';
import { OrderChannel } from '@app/contracts/ordering/enums/order-channel.enum';
import { OrderSource } from '@app/contracts/ordering/enums/order-source.enum';

import type { JoinOrCreateSessionCommand } from '@app/contracts/dinein/session/commands/join-or-create-session.command';
import type { CloseSessionCommand, DineInPaymentMethod } from '@app/contracts/dinein/session/commands/close-session.command';
import type { TableSessionDetailResult } from '@app/contracts/dinein/session/results/table-session-detail.result';
import type { ListOrdersQuery } from '@app/contracts/ordering/order/commands/list-orders.query';
import type { PaginatedOrdersResult } from '@app/contracts/ordering/order/results/paginated-orders.result';
import type { CreateOrderCommand } from '@app/contracts/ordering/order/commands/create-order.command';
import type { CreateOrderResult } from '@app/contracts/ordering/order/results/create-order.result';
import type { DineInCreateOrderRequestDto } from './dto/dinein-create-order.request.dto';

@Injectable()
export class SessionDineinGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.DINEIN)
    private readonly dineinClient: ClientProxy,
    @Inject(RMQ_SERVICES.ORDERING)
    private readonly orderingClient: ClientProxy,
  ) {}

  async joinOrCreate(tableId: string): Promise<TableSessionDetailResult> {
    const command: JoinOrCreateSessionCommand = { tableId };
    return firstValueFrom(
      this.dineinClient
        .send<TableSessionDetailResult, JoinOrCreateSessionCommand>(
          DINEIN_PATTERNS.JOIN_OR_CREATE_SESSION,
          command,
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }

  async getSession(id: string): Promise<TableSessionDetailResult> {
    return firstValueFrom(
      this.dineinClient
        .send<TableSessionDetailResult, { id: string }>(
          DINEIN_PATTERNS.GET_SESSION,
          { id },
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }

  async getActiveSessionByTableId(
    tableId: string,
  ): Promise<TableSessionDetailResult | null> {
    return firstValueFrom(
      this.dineinClient
        .send<TableSessionDetailResult | null, { tableId: string }>(
          DINEIN_PATTERNS.GET_ACTIVE_SESSION_BY_TABLE,
          { tableId },
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }

  async closeSession(
    id: string,
    paymentMethod: DineInPaymentMethod,
  ): Promise<TableSessionDetailResult> {
    // Step 1: Mark all pending orders of this session as PAID
    await firstValueFrom(
      this.orderingClient
        .send<{ updatedCount: number }, { tableSessionId: string; paymentMethod: string }>(
          ORDERING_PATTERNS.MARK_SESSION_ORDERS_PAID,
          { tableSessionId: id, paymentMethod },
        )
        .pipe(catchError(() => throwError(() => null))),
    ).catch(() => null); // non-fatal: proceed even if ordering fails

    // Step 2: Close the session and free the table
    const command: CloseSessionCommand = { id, paymentMethod };
    return firstValueFrom(
      this.dineinClient
        .send<TableSessionDetailResult, CloseSessionCommand>(
          DINEIN_PATTERNS.CLOSE_SESSION,
          command,
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }

  async createDineInOrder(
    sessionId: string,
    dto: DineInCreateOrderRequestDto,
  ): Promise<CreateOrderResult> {
    // Validate session is still ACTIVE
    const session = await firstValueFrom(
      this.dineinClient
        .send<TableSessionDetailResult | null, { id: string }>(
          DINEIN_PATTERNS.GET_SESSION,
          { id: sessionId },
        )
        .pipe(catchError(() => throwError(() => null))),
    ).catch(() => null);

    if (!session || session.status !== TableSessionStatus.ACTIVE) {
      throw new HttpException(
        'Phiên bàn đã kết thúc, không thể đặt thêm món.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const command: CreateOrderCommand = {
      userId: undefined,
      channel: OrderChannel.DINE_IN,
      source: OrderSource.WEB,
      tableId: session.tableId,
      tableSessionId: sessionId,
      note: dto.note,
      items: dto.items,
    };

    return firstValueFrom(
      this.orderingClient
        .send<CreateOrderResult, CreateOrderCommand>(
          ORDERING_PATTERNS.CREATE_ORDER,
          command,
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }

  async getSessionOrders(
    sessionId: string,
    limit = 100,
  ): Promise<PaginatedOrdersResult> {
    const query: ListOrdersQuery = {
      tableSessionId: sessionId,
      limit,
      page: 1,
    };
    return firstValueFrom(
      this.orderingClient
        .send<PaginatedOrdersResult, ListOrdersQuery>(
          ORDERING_PATTERNS.LIST_ORDERS,
          query,
        )
        .pipe(
          catchError((err) =>
            throwError(() => mapRpcErrorToHttpException(err)),
          ),
        ),
    );
  }
}
