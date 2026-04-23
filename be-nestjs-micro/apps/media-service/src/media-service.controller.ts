import { Controller } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { MEDIA_PATTERNS } from '@app/messaging/constants/patterns.constant';
import type { CreateUploadUrlCommand } from '@app/contracts/media/commands/create-upload-url.command';
import { UploadUrlResult } from '@app/contracts/media/result/upload-url.result';
import { handleRpcMessage } from '@app/common/rmq/rpc-message.helper';
import { MediaService } from './media-service.service';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @MessagePattern(MEDIA_PATTERNS.CREATE_UPLOAD_URL)
  createUploadUrl(
    @Payload() command: CreateUploadUrlCommand,
    @Ctx() context: RmqContext,
  ): Promise<UploadUrlResult> {
    return handleRpcMessage(context, () =>
      this.mediaService.createUploadUrl(command),
    );
  }
}
