import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ERRORS,
  ErrorCode,
  getErrorDefinition,
} from '../constants/error-code.constant';

function mapHttpStatusToDefaultErrorCode(status: HttpStatus): ErrorCode {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return ERRORS.VALIDATION_ERROR.code;
    case HttpStatus.UNAUTHORIZED:
      return ERRORS.AUTH_UNAUTHORIZED.code;
    case HttpStatus.FORBIDDEN:
      return ERRORS.FORBIDDEN.code;
    case HttpStatus.NOT_FOUND:
      return ERRORS.NOT_FOUND.code;
    case HttpStatus.CONFLICT:
      return ERRORS.CONFLICT.code;
    default:
      return ERRORS.INTERNAL_ERROR.code;
  }
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: ErrorCode = ERRORS.INTERNAL_ERROR.code;
    let message: string = ERRORS.INTERNAL_ERROR.message;
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const body = res as {
          code?: string;
          message?: string | string[];
          details?: unknown;
        };

        if (typeof body.code === 'string') {
          code = body.code as ErrorCode;
        } else {
          code = mapHttpStatusToDefaultErrorCode(status);
        }

        if (typeof body.message === 'string') {
          message = body.message;
        } else if (Array.isArray(body.message)) {
          message = body.message.join(', ');
        } else {
          message = exception.message;
        }

        details = body.details;
      } else {
        code = mapHttpStatusToDefaultErrorCode(status);
        message = exception.message;
      }
    }

    const errorDefinition = getErrorDefinition(code);

    response.status(status).json({
      success: false,
      error: {
        code,
        message: message || errorDefinition.message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        path: request.originalUrl || request.url,
      },
    });
  }
}
