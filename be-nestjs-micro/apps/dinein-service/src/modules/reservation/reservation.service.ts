import { Injectable } from '@nestjs/common';
import { DineinPrismaService } from '@app/database/dinein-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ReservationStatus } from '@app/contracts/dinein/enums/reservation-status.enum';
import {
  Prisma,
  ReservationStatus as PrismaReservationStatus,
} from 'generated/dinein';

import type { CreateReservationCommand } from '@app/contracts/dinein/reservation/commands/create-reservation.command';
import type { UpdateReservationStatusCommand } from '@app/contracts/dinein/reservation/commands/update-reservation-status.command';
import type { ListReservationsQuery } from '@app/contracts/dinein/reservation/commands/list-reservations.query';
import type { ReservationDetailResult } from '@app/contracts/dinein/reservation/results/reservation-detail.result';
import type { PaginatedReservationsResult } from '@app/contracts/dinein/reservation/results/paginated-reservations.result';

type ReservationWithTable = Prisma.ReservationGetPayload<{
  include: { table: true };
}>;

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: DineinPrismaService) {}

  async create(
    command: CreateReservationCommand,
  ): Promise<ReservationDetailResult> {
    const table = await this.prisma.table.findUnique({
      where: { id: command.tableId },
    });

    if (!table) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy bàn',
      });
    }

    const reservation = await this.prisma.reservation.create({
      data: {
        tableId: command.tableId,
        userId: command.userId,
        guestName: command.guestName,
        guestPhone: command.guestPhone,
        partySize: command.partySize,
        scheduledAt: new Date(command.scheduledAt),
        note: command.note,
        status: PrismaReservationStatus.PENDING,
      },
      include: { table: true },
    });

    return this.mapToResult(reservation);
  }

  async findOne(id: string): Promise<ReservationDetailResult> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: { table: true },
    });

    if (!reservation) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy đặt bàn',
      });
    }

    return this.mapToResult(reservation);
  }

  async findAll(query: ListReservationsQuery): Promise<PaginatedReservationsResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReservationWhereInput = {};
    if (query.tableId) where.tableId = query.tableId;
    if (query.userId) where.userId = query.userId;
    if (query.status) {
      where.status = query.status as PrismaReservationStatus;
    }
    if (query.date) {
      const dateStart = new Date(query.date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(query.date);
      dateEnd.setHours(23, 59, 59, 999);
      where.scheduledAt = { gte: dateStart, lte: dateEnd };
    }

    const [items, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: { table: true },
        orderBy: { scheduledAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      items: items.map((r) => this.mapToResult(r)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async updateStatus(
    command: UpdateReservationStatusCommand,
  ): Promise<ReservationDetailResult> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: command.id },
    });

    if (!reservation) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy đặt bàn',
      });
    }

    const updated = await this.prisma.reservation.update({
      where: { id: command.id },
      data: { status: command.status as PrismaReservationStatus },
      include: { table: true },
    });

    return this.mapToResult(updated);
  }

  private mapToResult(reservation: ReservationWithTable): ReservationDetailResult {
    return {
      id: reservation.id,
      tableId: reservation.tableId,
      tableNumber: reservation.table.number,
      userId: reservation.userId,
      guestName: reservation.guestName,
      guestPhone: reservation.guestPhone,
      partySize: reservation.partySize,
      scheduledAt: reservation.scheduledAt,
      note: reservation.note,
      status: reservation.status as ReservationStatus,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }
}
