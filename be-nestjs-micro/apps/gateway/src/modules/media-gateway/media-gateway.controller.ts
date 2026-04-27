import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MediaGatewayService } from './media-gateway.service';
import { CreateUploadUrlRequestDto } from './dto/request/create-upload-url.request.dto';
import { UploadUrlResponseDto } from './dto/response/upload-url.response.dto';

import { JwtAuthGuard, Roles, RolesGuard } from '@app/auth';

@Controller('media')
export class MediaGatewayController {
  constructor(private readonly mediaGatewayService: MediaGatewayService) {}

  @Post('upload-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'STAFF')
  createUploadUrl(
    @Body() dto: CreateUploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    return this.mediaGatewayService.createUploadUrl(dto);
  }
}
