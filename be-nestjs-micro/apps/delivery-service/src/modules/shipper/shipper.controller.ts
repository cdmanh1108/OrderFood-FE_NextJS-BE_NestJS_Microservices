import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELIVERY_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type { CreateShipperCommand } from '@app/contracts/delivery/shipper/commands/create-shipper.command';
import type { UpdateShipperCommand } from '@app/contracts/delivery/shipper/commands/update-shipper.command';
import type { ListShippersQuery } from '@app/contracts/delivery/shipper/commands/list-shippers.query';

import { ShipperService } from './shipper.service';

@Controller()
export class ShipperController {
  constructor(private readonly shipperService: ShipperService) {}

  @MessagePattern(DELIVERY_PATTERNS.CREATE_SHIPPER)
  async createShipper(
    @Payload() command: CreateShipperCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.create(command),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.UPDATE_SHIPPER)
  async updateShipper(
    @Payload() command: UpdateShipperCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.update(command),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_SHIPPER_DETAIL)
  async getShipperDetail(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.findOne(payload.id),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_SHIPPER_BY_USER_ID)
  async getShipperByUserId(
    @Payload() payload: { userId: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.findByUserId(payload.userId),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.LIST_SHIPPERS)
  async listShippers(
    @Payload() query: ListShippersQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.findAll(query),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.DEACTIVATE_SHIPPER)
  async deactivateShipper(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.shipperService.deactivate(payload.id),
    );
  }
}
