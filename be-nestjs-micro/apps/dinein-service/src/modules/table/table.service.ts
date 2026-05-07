import { Injectable } from '@nestjs/common';
import { DineinPrismaService } from '@app/database/dinein-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { TableStatus } from '@app/contracts/dinein/enums/table-status.enum';
import {
  Prisma,
  TableStatus as PrismaTableStatus,
  TableSessionStatus as PrismaSessionStatus,
  ReservationStatus as PrismaReservationStatus,
} from 'generated/dinein';

import type { CreateTableCommand } from '@app/contracts/dinein/table/commands/create-table.command';
import type { UpdateTableCommand } from '@app/contracts/dinein/table/commands/update-table.command';
import type { DeleteTableCommand } from '@app/contracts/dinein/table/commands/delete-table.command';
import type { GetTableDetailQuery } from '@app/contracts/dinein/table/commands/get-table-detail.query';
import type { ListTablesQuery } from '@app/contracts/dinein/table/commands/list-tables.query';
import type { TableDetailResult } from '@app/contracts/dinein/table/results/table-detail.result';
import type { PaginatedTablesResult } from '@app/contracts/dinein/table/results/paginated-tables.result';
import type { DeleteTableResult } from '@app/contracts/dinein/table/results/delete-table.result';

@Injectable()
export class TableService {
  constructor(private readonly prisma: DineinPrismaService) { }

  async create(command: CreateTableCommand): Promise<TableDetailResult> {
    const existing = await this.prisma.table.findUnique({
      where: { number: command.number },
    });

    if (existing) {
      throw new AppRpcException({
        code: ERRORS.CONFLICT.code,
        message: `Bàn số "${command.number}" đã tồn tại`,
      });
    }

    const table = await this.prisma.table.create({
      data: {
        number: command.number,
        seats: command.seats,
        note: command.note,
        qrCode: command.qrCode, // Or we leave it empty if we don't save to db
      },
    });

    const appOrigin = process.env.APP_ORIGIN || 'http://localhost:5000';
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(
      `${appOrigin}/tables/${table.id}`,
    )}`;

    const result = this.mapToResult(table);
    // Overwrite qrCode with the generated URL just for this response
    result.qrCode = qrCodeUrl;

    return result;
  }

  async update(command: UpdateTableCommand): Promise<TableDetailResult> {
    const table = await this.prisma.table.findUnique({
      where: { id: command.id },
    });

    if (!table) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy bàn',
      });
    }

    if (command.number && command.number !== table.number) {
      const existing = await this.prisma.table.findUnique({
        where: { number: command.number },
      });
      if (existing) {
        throw new AppRpcException({
          code: ERRORS.CONFLICT.code,
          message: `Bàn số "${command.number}" đã tồn tại`,
        });
      }
    }

    const data: Prisma.TableUpdateInput = {};
    if (command.number !== undefined) data.number = command.number;
    if (command.seats !== undefined) data.seats = command.seats;
    if (command.status !== undefined)
      data.status = command.status as PrismaTableStatus;
    if (command.note !== undefined) data.note = command.note;
    if (command.qrCode !== undefined) data.qrCode = command.qrCode;

    const updated = await this.prisma.table.update({
      where: { id: command.id },
      data,
    });

    return this.mapToResult(updated);
  }

  async delete(command: DeleteTableCommand): Promise<DeleteTableResult> {
    const table = await this.prisma.table.findUnique({
      where: { id: command.id },
    });

    if (!table) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy bàn',
      });
    }

    // Block delete if table has an active session
    const activeSession = await this.prisma.tableSession.findFirst({
      where: { tableId: command.id, status: PrismaSessionStatus.ACTIVE },
    });
    if (activeSession) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Không thể xóa bàn đang có phiên gọi món đang hoạt động',
      });
    }

    // Block delete if table has a pending/confirmed reservation
    const pendingReservation = await this.prisma.reservation.findFirst({
      where: {
        tableId: command.id,
        status: {
          in: [PrismaReservationStatus.PENDING, PrismaReservationStatus.CONFIRMED],
        },
      },
    });
    if (pendingReservation) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Không thể xóa bàn đang có đặt bàn chưa hoàn thành',
      });
    }

    await this.prisma.table.delete({ where: { id: command.id } });

    return { success: true };
  }

  async findOne(query: GetTableDetailQuery): Promise<TableDetailResult> {
    const table = await this.prisma.table.findUnique({
      where: { id: query.id },
    });

    if (!table) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy bàn',
      });
    }

    return this.mapToResult(table);
  }

  async findAll(query: ListTablesQuery): Promise<PaginatedTablesResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 100;
    const skip = (page - 1) * limit;

    const where: Prisma.TableWhereInput = {};
    if (query.status) {
      where.status = query.status as PrismaTableStatus;
    }

    const [items, total] = await Promise.all([
      this.prisma.table.findMany({
        where,
        orderBy: { number: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.table.count({ where }),
    ]);

    return {
      items: items.map((t) => this.mapToResult(t)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  private mapToResult(table: {
    id: string;
    number: string;
    seats: number;
    status: PrismaTableStatus;
    note: string | null;
    qrCode: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): TableDetailResult {
    return {
      id: table.id,
      number: table.number,
      seats: table.seats,
      status: table.status as TableStatus,
      note: table.note,
      qrCode: table.qrCode,
      createdAt: table.createdAt,
      updatedAt: table.updatedAt,
    };
  }
}
