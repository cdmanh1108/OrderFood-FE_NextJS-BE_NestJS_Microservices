import { ConfigService } from '@nestjs/config';

const DEFAULT_PRESIGNED_EXPIRES_IN = 300;

export const MEDIA_SUPPORTED_CONTENT_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
] as const;

export type MediaSupportedContentType =
  (typeof MEDIA_SUPPORTED_CONTENT_TYPES)[number];

export interface MediaConfig {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
  presignedExpiresIn: number;
}

export function getMediaConfig(configService: ConfigService): MediaConfig {
  const region = configService.getOrThrow<string>('AWS_REGION');
  const accessKeyId = configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
  const secretAccessKey = configService.getOrThrow<string>(
    'AWS_SECRET_ACCESS_KEY',
  );
  const bucket = configService.getOrThrow<string>('AWS_S3_BUCKET').trim();
  const publicBaseUrl = configService
    .getOrThrow<string>('AWS_S3_PUBLIC_BASE_URL')
    .trim()
    .replace(/\/+$/g, '');

  const expiresInRaw =
    configService.get<string>('AWS_S3_PRESIGNED_EXPIRES_IN') ??
    `${DEFAULT_PRESIGNED_EXPIRES_IN}`;
  const parsedExpiresIn = Number(expiresInRaw);

  return {
    region,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl,
    presignedExpiresIn:
      Number.isFinite(parsedExpiresIn) && parsedExpiresIn > 0
        ? parsedExpiresIn
        : DEFAULT_PRESIGNED_EXPIRES_IN,
  };
}
