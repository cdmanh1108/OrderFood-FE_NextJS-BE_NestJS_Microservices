import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { DELIVERY_PATTERNS } from '@app/messaging/constants/patterns.constant';
import { handleRpcMessage } from '@app/messaging/rmq/rpc-message.helper';
import type { SubmitProofCommand } from '@app/contracts/delivery/proof/commands/submit-proof.command';
import { ProofService } from './proof.service';

@Controller()
export class ProofController {
  constructor(private readonly proofService: ProofService) {}

  @MessagePattern(DELIVERY_PATTERNS.SUBMIT_PROOF)
  async submitProof(
    @Payload() command: SubmitProofCommand,
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () => this.proofService.submit(command));
  }

  @MessagePattern(DELIVERY_PATTERNS.GET_TASK_PROOF)
  async getTaskProof(
    @Payload() payload: { taskId: string },
    @Ctx() context: RmqContext,
  ) {
    return handleRpcMessage(context, () =>
      this.proofService.getByTaskId(payload.taskId),
    );
  }
}
