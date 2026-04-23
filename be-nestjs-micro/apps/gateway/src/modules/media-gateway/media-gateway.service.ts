import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateUploadUrlRequestDto } from './dto/request/create-upload-url.request.dto';
import { RMQ_SERVICES } from '@app/messaging/constants/services.constants';
import { UploadUrlResult } from '@app/contracts/media/result/upload-url.result';
import { CreateUploadUrlCommand } from '@app/contracts/media/commands/create-upload-url.command';
import { MEDIA_PATTERNS } from '@app/messaging/constants/patterns.constant';

@Injectable()
export class MediaGatewayService {
  constructor(
    @Inject(RMQ_SERVICES.MEDIA)
    private readonly mediaClient: ClientProxy,
  ) {}

  async createUploadUrl(
    dto: CreateUploadUrlRequestDto,
  ): Promise<UploadUrlResult> {
    const command: CreateUploadUrlCommand = {
      fileName: dto.fileName,
      contentType: dto.contentType,
      folder: dto.folder,
    };

    return firstValueFrom(
      this.mediaClient.send<UploadUrlResult, CreateUploadUrlCommand>(
        MEDIA_PATTERNS.CREATE_UPLOAD_URL,
        command,
      ),
    );
  }
}
