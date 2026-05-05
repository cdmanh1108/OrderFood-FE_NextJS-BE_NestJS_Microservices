import { Injectable } from '@nestjs/common';
import { DeliveryPrismaService } from '@app/database/delivery-prisma.service';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { DeliveryTaskStatus as PrismaTaskStatus } from 'generated/delivery';

import type { SubmitProofCommand } from '@app/contracts/delivery/proof/commands/submit-proof.command';
import type { DeliveryProofResult } from '@app/contracts/delivery/task/results/delivery-task-detail.result';

@Injectable()
export class ProofService {
  constructor(private readonly prisma: DeliveryPrismaService) {}

  async submit(command: SubmitProofCommand): Promise<DeliveryProofResult> {
    const task = await this.prisma.deliveryTask.findUnique({
      where: { id: command.taskId },
      include: { proof: true },
    });

    if (!task) {
      throw new AppRpcException({
        code: ERRORS.NOT_FOUND.code,
        message: 'Không tìm thấy nhiệm vụ giao hàng',
      });
    }

    // Only allow proof submission when IN_TRANSIT
    if (task.status !== PrismaTaskStatus.IN_TRANSIT) {
      throw new AppRpcException({
        code: ERRORS.BAD_REQUEST.code,
        message: 'Chỉ có thể nộp ảnh xác nhận khi đang trong quá trình giao hàng',
      });
    }

    // Idempotent: return existing proof if already submitted
    if (task.proof) {
      return this.mapToResult(task.proof);
    }

    const proof = await this.prisma.deliveryProof.create({
      data: {
        taskId: command.taskId,
        mediaFileId: command.mediaFileId,
        imageUrl: command.imageUrl,
        note: command.note,
      },
    });

    return this.mapToResult(proof);
  }

  async getByTaskId(taskId: string): Promise<DeliveryProofResult | null> {
    const proof = await this.prisma.deliveryProof.findUnique({
      where: { taskId },
    });

    return proof ? this.mapToResult(proof) : null;
  }

  private mapToResult(proof: {
    id: string;
    taskId: string;
    mediaFileId: string;
    imageUrl: string;
    note: string | null;
    submittedAt: Date;
  }): DeliveryProofResult {
    return {
      id: proof.id,
      taskId: proof.taskId,
      mediaFileId: proof.mediaFileId,
      imageUrl: proof.imageUrl,
      note: proof.note,
      submittedAt: proof.submittedAt,
    };
  }
}
