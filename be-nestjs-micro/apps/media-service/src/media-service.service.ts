import { Injectable } from '@nestjs/common';
import { CreateUploadUrlCommand } from '@app/contracts/media/commands/create-upload-url.command';
import { UploadUrlResult } from '@app/contracts/media/result/upload-url.result';
import { MediaUrlBuilder } from './providers/media-url.builder';
import { S3Provider } from './providers/s3.provider';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaUrlBuilder: MediaUrlBuilder,
    private readonly s3Provider: S3Provider,
  ) {}

  async createUploadUrl(
    command: CreateUploadUrlCommand,
  ): Promise<UploadUrlResult> {
    this.mediaUrlBuilder.validateInput(command);

    const key = this.mediaUrlBuilder.buildObjectKey(
      command.fileName,
      command.folder,
    );

    const uploadUrl = await this.s3Provider.createUploadUrl({
      key,
      contentType: command.contentType,
    });

    return {
      key,
      bucket: this.s3Provider.bucket,
      region: this.s3Provider.region,
      uploadUrl,
      publicUrl: this.mediaUrlBuilder.buildPublicUrl(
        this.s3Provider.publicBaseUrl,
        key,
      ),
      expiresIn: this.s3Provider.expiresIn,
    };
  }
}
