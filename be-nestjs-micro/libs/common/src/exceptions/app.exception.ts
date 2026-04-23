import { HttpException, HttpStatus } from '@nestjs/common';

export interface HttpErrorPayload {
  message: string;
  status: HttpStatus;
  code: string;
}

export class AppException extends HttpException {
  constructor(payload: HttpErrorPayload) {
    super(
      {
        message: payload.message,
        code: payload.code,
      },
      payload.status,
    );
  }
}
