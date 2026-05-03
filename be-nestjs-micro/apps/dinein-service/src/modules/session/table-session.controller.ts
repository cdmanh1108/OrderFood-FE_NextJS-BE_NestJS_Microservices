import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DINEIN_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';

import type { JoinOrCreateSessionCommand } from '@app/contracts/dinein/session/commands/join-or-create-session.command';
import type { CloseSessionCommand } from '@app/contracts/dinein/session/commands/close-session.command';

import { TableSessionService } from './table-session.service';

@Controller()
export class TableSessionController {
  constructor(private readonly sessionService: TableSessionService) {}

  @MessagePattern(DINEIN_PATTERNS.JOIN_OR_CREATE_SESSION)
  async joinOrCreate(
    @Payload() command: JoinOrCreateSessionCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.sessionService.joinOrCreate(command),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.GET_SESSION)
  async getSession(
    @Payload() payload: { id: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.sessionService.findOne(payload.id),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.GET_ACTIVE_SESSION_BY_TABLE)
  async getActiveSessionByTable(
    @Payload() payload: { tableId: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.sessionService.findActiveByTableId(payload.tableId),
    );
  }

  @MessagePattern(DINEIN_PATTERNS.CLOSE_SESSION)
  async closeSession(
    @Payload() command: CloseSessionCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.sessionService.close(command),
    );
  }
}
