import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELIVERY_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type {
  RecordLocationCommand,
  GetCurrentLocationQuery,
  GetLocationHistoryQuery,
} from '@app/contracts/delivery/location/commands/location.commands';

import { LocationService } from './location.service';

@Controller()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @MessagePattern(DELIVERY_PATTERNS.RECORD_LOCATION)
  async recordLocation(
    @Payload() command: RecordLocationCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.locationService.record(command),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_CURRENT_LOCATION)
  async getCurrentLocation(
    @Payload() query: GetCurrentLocationQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.locationService.getCurrentLocation(query),
    );
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_LOCATION_HISTORY)
  async getLocationHistory(
    @Payload() query: GetLocationHistoryQuery,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.locationService.getHistory(query),
    );
  }
}
