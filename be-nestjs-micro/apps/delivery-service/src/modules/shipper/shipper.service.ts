import { Injectable } from '@nestjs/common';
import { DeliveryPrismaService } from '@app/database/delivery-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import {
  VehicleType as PrismaVehicleType,
  Prisma,
} from 'generated/delivery';
import { VehicleType } from '@app/contracts/delivery/enums/delivery-task-status.enum';

import type { CreateShipperCommand } from '@app/contracts/delivery/shipper/commands/create-shipper.command';
import type { UpdateShipperCommand } from '@app/contracts/delivery/shipper/commands/update-shipper.command';
import type { ListShippersQuery } from '@app/contracts/delivery/shipper/commands/list-shippers.query';
import type {
  ShipperDetailResult,
  PaginatedShippersResult,
} from '@app/contracts/delivery/shipper/results/shipper-detail.result';

@Injectable()
export class ShipperService {
  constructor(private readonly prisma: DeliveryPrismaService) {}

  async create(command: CreateShipperCommand): Promise<ShipperDetailResult> {
    const existing = await this.prisma.shipper.findUnique({
      where: { userId: command.userId },
    });

    if (existing) {
      throw new AppRpcException({
        code: ERRORS.CONFLICT.code,
        message: 'Tài khoản này đã có hồ sơ shipper',
      });
    }

    const shipper = await this.prisma.shipper.create({
      data: {
        userId: command.userId,
        fullName: command.fullName,
        phoneNumber: command.phoneNumber,
        vehicleType: command.vehicleType as PrismaVehicleType,
        licensePlate: command.licensePlate,
        avatarUrl: command.avatarUrl,
      },
    });

    return this.mapToResult(shipper);
  }

  async update(command: UpdateShipperCommand): Promise<ShipperDetailResult> {
    const shipper = await this.prisma.shipper.findUnique({
      where: { id: command.id },
    });

    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy shipper',
      });
    }

    const updated = await this.prisma.shipper.update({
      where: { id: command.id },
      data: {
        ...(command.fullName && { fullName: command.fullName }),
        ...(command.phoneNumber && { phoneNumber: command.phoneNumber }),
        ...(command.vehicleType && {
          vehicleType: command.vehicleType as PrismaVehicleType,
        }),
        ...(command.licensePlate && { licensePlate: command.licensePlate }),
        ...(command.avatarUrl !== undefined && { avatarUrl: command.avatarUrl }),
        ...(command.isActive !== undefined && { isActive: command.isActive }),
      },
    });

    return this.mapToResult(updated);
  }

  async deactivate(id: string): Promise<ShipperDetailResult> {
    const shipper = await this.prisma.shipper.findUnique({ where: { id } });
    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy shipper',
      });
    }

    const updated = await this.prisma.shipper.update({
      where: { id },
      data: { isActive: false },
    });

    return this.mapToResult(updated);
  }

  async findOne(id: string): Promise<ShipperDetailResult> {
    const shipper = await this.prisma.shipper.findUnique({ where: { id } });
    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy shipper',
      });
    }
    return this.mapToResult(shipper);
  }

  async findByUserId(userId: string): Promise<ShipperDetailResult> {
    const shipper = await this.prisma.shipper.findUnique({ where: { userId } });
    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy hồ sơ shipper',
      });
    }
    return this.mapToResult(shipper);
  }

  async findAll(query: ListShippersQuery): Promise<PaginatedShippersResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ShipperWhereInput = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [items, total] = await Promise.all([
      this.prisma.shipper.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.shipper.count({ where }),
    ]);

    return {
      items: items.map((s) => this.mapToResult(s)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  mapToResult(shipper: {
    id: string;
    userId: string;
    fullName: string;
    phoneNumber: string;
    vehicleType: PrismaVehicleType;
    licensePlate: string;
    isActive: boolean;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): ShipperDetailResult {
    return {
      id: shipper.id,
      userId: shipper.userId,
      fullName: shipper.fullName,
      phoneNumber: shipper.phoneNumber,
      vehicleType: shipper.vehicleType as VehicleType,
      licensePlate: shipper.licensePlate,
      isActive: shipper.isActive,
      avatarUrl: shipper.avatarUrl,
      createdAt: shipper.createdAt,
      updatedAt: shipper.updatedAt,
    };
  }
}
