import { Injectable } from '@nestjs/common';
import { DeliveryPrismaService } from '@app/database/delivery-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';

import type {
  RecordLocationCommand,
  GetCurrentLocationQuery,
  GetLocationHistoryQuery,
} from '@app/contracts/delivery/location/commands/location.commands';
import type { ShipperLocationResult } from '@app/contracts/delivery/location/results/shipper-location.result';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: DeliveryPrismaService) {}

  async record(command: RecordLocationCommand): Promise<ShipperLocationResult> {
    const shipper = await this.prisma.shipper.findUnique({
      where: { id: command.shipperId },
    });

    if (!shipper) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy shipper',
      });
    }

    const location = await this.prisma.shipperLocationHistory.create({
      data: {
        shipperId: command.shipperId,
        lat: command.lat,
        lng: command.lng,
        accuracy: command.accuracy,
      },
    });

    return this.mapToResult(location);
  }

  async getCurrentLocation(
    query: GetCurrentLocationQuery,
  ): Promise<ShipperLocationResult | null> {
    const latest = await this.prisma.shipperLocationHistory.findFirst({
      where: { shipperId: query.shipperId },
      orderBy: { recordedAt: 'desc' },
    });

    return latest ? this.mapToResult(latest) : null;
  }

  async getHistory(
    query: GetLocationHistoryQuery,
  ): Promise<ShipperLocationResult[]> {
    const limit = query.limit && query.limit > 0 ? query.limit : 50;

    const records = await this.prisma.shipperLocationHistory.findMany({
      where: { shipperId: query.shipperId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });

    return records.map((r) => this.mapToResult(r));
  }

  private mapToResult(record: {
    id: string;
    shipperId: string;
    lat: unknown;
    lng: unknown;
    accuracy: number | null;
    recordedAt: Date;
  }): ShipperLocationResult {
    return {
      id: record.id,
      shipperId: record.shipperId,
      lat: Number(record.lat),
      lng: Number(record.lng),
      accuracy: record.accuracy,
      recordedAt: record.recordedAt,
    };
  }
}
