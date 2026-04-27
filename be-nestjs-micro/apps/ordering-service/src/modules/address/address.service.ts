import { Injectable } from '@nestjs/common';
import { OrderingPrismaService } from '@app/database/ordering-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import type { CreateAddressCommand } from '@app/contracts/ordering/address/commands/create-address.command';
import type { UpdateAddressCommand } from '@app/contracts/ordering/address/commands/update-address.command';
import type { GetAddressDetailQuery } from '@app/contracts/ordering/address/commands/get-address-detail.query';
import type { ListAddressesQuery } from '@app/contracts/ordering/address/commands/list-addresses.query';
import type { SetDefaultAddressCommand } from '@app/contracts/ordering/address/commands/set-default-address.command';
import type { DeleteAddressCommand } from '@app/contracts/ordering/address/commands/delete-address.command';
import type { AddressDetailResult } from '@app/contracts/ordering/address/results/address-detail.result';
import type { PaginatedAddressesResult } from '@app/contracts/ordering/address/results/paginated-addresses.result';
import type { SetDefaultAddressResult } from '@app/contracts/ordering/address/results/set-default-address.result';
import type { DeleteAddressResult } from '@app/contracts/ordering/address/results/delete-address.result';

type DecimalLike = {
  toNumber(): number;
};

type NullableDecimalLike = DecimalLike | null;

type AddressEntity = {
  id: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string | null;
  detail: string | null;
  latitude: NullableDecimalLike;
  longitude: NullableDecimalLike;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AddressService {
  constructor(private readonly prisma: OrderingPrismaService) {}

  async create(command: CreateAddressCommand): Promise<AddressDetailResult> {
    const hasAnyAddress = await this.prisma.address.count({
      where: { userId: command.userId },
    });

    const shouldSetDefault = command.isDefault === true || hasAnyAddress === 0;

    const createdAddress = await this.prisma.$transaction(async (tx) => {
      if (shouldSetDefault) {
        await tx.address.updateMany({
          where: { userId: command.userId },
          data: { isDefault: false },
        });
      }

      return tx.address.create({
        data: {
          userId: command.userId,
          receiverName: command.receiverName,
          receiverPhone: command.receiverPhone,
          province: command.province,
          district: command.district,
          ward: command.ward,
          street: command.street ?? null,
          detail: command.detail ?? null,
          latitude: command.latitude ?? null,
          longitude: command.longitude ?? null,
          isDefault: shouldSetDefault,
        },
      });
    });

    return this.toAddressDetailResult(
      createdAddress as unknown as AddressEntity,
    );
  }

  async update(command: UpdateAddressCommand): Promise<AddressDetailResult> {
    const address = await this.findAddress(command.id, command.userId);
    const data: {
      receiverName?: string;
      receiverPhone?: string;
      province?: string;
      district?: string;
      ward?: string;
      street?: string | null;
      detail?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    } = {};

    if (command.receiverName !== undefined) {
      data.receiverName = command.receiverName;
    }
    if (command.receiverPhone !== undefined) {
      data.receiverPhone = command.receiverPhone;
    }
    if (command.province !== undefined) {
      data.province = command.province;
    }
    if (command.district !== undefined) {
      data.district = command.district;
    }
    if (command.ward !== undefined) {
      data.ward = command.ward;
    }
    if (command.street !== undefined) {
      data.street = command.street;
    }
    if (command.detail !== undefined) {
      data.detail = command.detail;
    }
    if (command.latitude !== undefined) {
      data.latitude = command.latitude;
    }
    if (command.longitude !== undefined) {
      data.longitude = command.longitude;
    }

    if (Object.keys(data).length === 0) {
      return this.toAddressDetailResult(address as unknown as AddressEntity);
    }

    const updated = await this.prisma.address.update({
      where: { id: command.id },
      data,
    });

    return this.toAddressDetailResult(updated as unknown as AddressEntity);
  }

  async findOne(query: GetAddressDetailQuery): Promise<AddressDetailResult> {
    const address = await this.findAddress(query.id, query.userId);
    return this.toAddressDetailResult(address as unknown as AddressEntity);
  }

  async findAll(query: ListAddressesQuery): Promise<PaginatedAddressesResult> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.address.findMany({
        where: { userId: query.userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      this.prisma.address.count({
        where: { userId: query.userId },
      }),
    ]);

    return {
      items: items.map((item) =>
        this.toAddressDetailResult(item as unknown as AddressEntity),
      ),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async setDefault(
    command: SetDefaultAddressCommand,
  ): Promise<SetDefaultAddressResult> {
    const address = await this.findAddress(command.id, command.userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.address.updateMany({
        where: { userId: command.userId },
        data: { isDefault: false },
      });

      await tx.address.update({
        where: { id: command.id },
        data: { isDefault: true },
      });
    });

    return {
      id: address.id,
      userId: address.userId,
      isDefault: true,
    };
  }

  async remove(command: DeleteAddressCommand): Promise<DeleteAddressResult> {
    const address = await this.findAddress(command.id, command.userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: { id: command.id },
      });

      if (!address.isDefault) {
        return;
      }

      const latestAddress = await tx.address.findFirst({
        where: { userId: command.userId },
        orderBy: { createdAt: 'desc' },
      });

      if (!latestAddress) {
        return;
      }

      await tx.address.update({
        where: { id: latestAddress.id },
        data: { isDefault: true },
      });
    });

    return {
      id: command.id,
      deleted: true,
    };
  }

  private async findAddress(id: string, userId: string) {
    const address = await this.prisma.address.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!address) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Address not found',
      });
    }

    return address;
  }

  private toAddressDetailResult(address: AddressEntity): AddressDetailResult {
    return {
      id: address.id,
      userId: address.userId,
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      province: address.province,
      district: address.district,
      ward: address.ward,
      street: address.street,
      detail: address.detail,
      latitude: this.decimalToNumber(address.latitude),
      longitude: this.decimalToNumber(address.longitude),
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  private decimalToNumber(value: NullableDecimalLike): number | null {
    return value ? value.toNumber() : null;
  }
}
