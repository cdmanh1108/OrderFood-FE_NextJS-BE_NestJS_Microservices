import { Inject, Injectable } from '@nestjs/common';
import { DineinPrismaService } from '@app/database/dinein-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { TableSessionStatus } from '@app/contracts/dinein/enums/table-session-status.enum';
import { TableStatus } from '@app/contracts/dinein/enums/table-status.enum';
import {
  Prisma,
  TableSessionStatus as PrismaSessionStatus,
  TableStatus as PrismaTableStatus,
} from 'generated/dinein';

import { catchError, firstValueFrom, throwError } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { ORDERING_PATTERNS } from '@app/messaging/constants/patterns.constant';
import type { JoinOrCreateSessionCommand } from '@app/contracts/dinein/session/commands/join-or-create-session.command';
import type { CloseSessionCommand } from '@app/contracts/dinein/session/commands/close-session.command';
import type { MarkSessionOrdersPaidCommand } from '@app/contracts/ordering/order/commands/mark-session-orders-paid.command';
import type { TableSessionDetailResult } from '@app/contracts/dinein/session/results/table-session-detail.result';

type SessionWithTable = Prisma.TableSessionGetPayload<{
  include: { table: true };
}>;

@Injectable()
export class TableSessionService {
  constructor(
    private readonly prisma: DineinPrismaService,
    @Inject(RMQ_SERVICES.ORDERING) private readonly orderingClient: ClientProxy,
  ) { }

  async joinOrCreate(
    command: JoinOrCreateSessionCommand,
  ): Promise<TableSessionDetailResult> {
    const table = await this.prisma.table.findUnique({
      where: { id: command.tableId },
    });

    if (!table) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy bàn',
      });
    }

    // Block join if table is being cleaned or reserved for someone else
    if (table.status === PrismaTableStatus.CLEANING) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Bàn đang được dọn dẹp, vui lòng chờ nhân viên sắp xếp',
      });
    }

    if (table.status === PrismaTableStatus.RESERVED) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Bàn đã được đặt trước, vui lòng liên hệ nhân viên',
      });
    }

    // Check if there's already an active session for this table
    const existingSession = await this.prisma.tableSession.findFirst({
      where: {
        tableId: command.tableId,
        status: PrismaSessionStatus.ACTIVE,
      },
      include: { table: true },
    });

    if (existingSession) {
      return this.mapToResult(existingSession);
    }

    // Create a new session and mark table as OCCUPIED
    const [session] = await this.prisma.$transaction([
      this.prisma.tableSession.create({
        data: {
          tableId: command.tableId,
          status: PrismaSessionStatus.ACTIVE,
        },
        include: { table: true },
      }),
      this.prisma.table.update({
        where: { id: command.tableId },
        data: { status: PrismaTableStatus.OCCUPIED },
      }),
    ]);

    return this.mapToResult(session);
  }

  async findOne(id: string): Promise<TableSessionDetailResult> {
    const session = await this.prisma.tableSession.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!session) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy phiên bàn',
      });
    }

    return this.mapToResult(session);
  }

  async findActiveByTableId(
    tableId: string,
  ): Promise<TableSessionDetailResult | null> {
    const session = await this.prisma.tableSession.findFirst({
      where: { tableId, status: PrismaSessionStatus.ACTIVE },
      include: { table: true },
    });

    return session ? this.mapToResult(session) : null;
  }

  async close(command: CloseSessionCommand): Promise<TableSessionDetailResult> {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: command.id },
    });

    if (!session) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy phiên bàn',
      });
    }

    if (session.status === PrismaSessionStatus.CLOSED) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Phiên bàn đã đóng',
      });
    }

    const [closed] = await this.prisma.$transaction([
      this.prisma.tableSession.update({
        where: { id: command.id },
        data: {
          status: PrismaSessionStatus.CLOSED,
          closedAt: new Date(),
          paymentMethod: command.paymentMethod,
        },
        include: { table: true },
      }),
      this.prisma.table.update({
        where: { id: session.tableId },
        data: { status: PrismaTableStatus.AVAILABLE },
      }),
    ]);

    // Ensure orders are updated before returning
    await firstValueFrom(
      this.orderingClient
        .send<{ updatedCount: number }, MarkSessionOrdersPaidCommand>(
          ORDERING_PATTERNS.MARK_SESSION_ORDERS_PAID,
          {
            tableSessionId: command.id,
            paymentMethod: command.paymentMethod,
          },
        )
        .pipe(
          catchError((err) => {
            console.error('Failed to mark session orders paid:', err);
            return throwError(() => err);
          }),
        ),
    ).catch(() => null); // Silently catch if order service is down, or we can throw

    return this.mapToResult(closed);
  }

  private mapToResult(session: SessionWithTable): TableSessionDetailResult {
    return {
      id: session.id,
      tableId: session.tableId,
      table: {
        id: session.table.id,
        number: session.table.number,
        seats: session.table.seats,
        status: session.table.status as TableStatus,
        note: session.table.note,
        qrCode: session.table.qrCode,
        createdAt: session.table.createdAt,
        updatedAt: session.table.updatedAt,
      },
      status: session.status as TableSessionStatus,
      paymentMethod: session.paymentMethod,
      openedAt: session.openedAt,
      closedAt: session.closedAt,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
