/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ConfigService } from '@nestjs/config';
import { getMediaConfig } from '@app/config';

@Injectable()
export class S3Provider {
  readonly region: string;
  readonly bucket: string;
  readonly publicBaseUrl: string;
  readonly expiresIn: number;

  private readonly client: S3Client;

  constructor(private readonly configService: ConfigService) {
    const config = getMediaConfig(this.configService);

    this.region = config.region;
    this.bucket = config.bucket;
    this.publicBaseUrl = config.publicBaseUrl;
    this.expiresIn = config.presignedExpiresIn;

    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async createUploadUrl(input: {
    key: string;
    contentType: string;
  }): Promise<string> {
    const putObjectCommand = new PutObjectCommand({
      Bucket: this.bucket,
      Key: input.key,
      ContentType: input.contentType,
    });

    return getSignedUrl(this.client, putObjectCommand, {
      expiresIn: this.expiresIn,
    });
  }
}
