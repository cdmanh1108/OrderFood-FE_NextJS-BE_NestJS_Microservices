import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppRpcException } from '@app/common/exceptions/app-rpc.exception';
import { ERRORS } from '@app/common/constants/error-code.constant';
import { CreateUploadUrlCommand } from '@app/contracts/media/commands/create-upload-url.command';
import { MEDIA_SUPPORTED_CONTENT_TYPES } from '@app/config';

@Injectable()
export class MediaUrlBuilder {
  validateInput(command: CreateUploadUrlCommand): void {
    if (!command.fileName?.trim()) {
      throw new AppRpcException({
        code: ERRORS.VALIDATION_ERROR.code,
        message: 'Tên file là bắt buộc',
      });
    }

    if (!command.contentType?.trim()) {
      throw new AppRpcException({
        code: ERRORS.VALIDATION_ERROR.code,
        message: 'Content-Type là bắt buộc',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const supportedContentTypes: readonly string[] =
      MEDIA_SUPPORTED_CONTENT_TYPES;
    if (!supportedContentTypes.includes(command.contentType)) {
      throw new AppRpcException({
        code: ERRORS.VALIDATION_ERROR.code,
        message: 'Loại file không được hỗ trợ',
      });
    }
  }

  buildObjectKey(fileName: string, folder?: string): string {
    const safeFolder = this.normalizeFolder(folder);
    const extension = this.getFileExtension(fileName);
    return `${safeFolder}/${this.buildDatePrefix()}/${randomUUID()}${extension}`;
  }

  buildPublicUrl(publicBaseUrl: string, key: string): string {
    const normalizedBase = publicBaseUrl.trim().replace(/\/+$/g, '');
    return `${normalizedBase}/${key}`;
  }

  private normalizeFolder(folder?: string): string {
    if (!folder?.trim()) return 'uploads';

    return (
      folder
        .trim()
        .toLowerCase()
        .replace(/\\/g, '/')
        .replace(/^\/+|\/+$/g, '')
        .replace(/[^a-z0-9/_-]/g, '') || 'uploads'
    );
  }

  private getFileExtension(fileName: string): string {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex < 0) return '';
    return fileName.slice(lastDotIndex).toLowerCase();
  }

  private buildDatePrefix(): string {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    return `${year}/${month}`;
  }
}
