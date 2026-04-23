import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AppLoggerService } from '../logger.service';
import { getOrCreateRequestId } from '../utils/request-context.util';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();

    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const requestId = getOrCreateRequestId(request.headers['x-request-id']);
    response.setHeader('x-request-id', requestId);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, originalUrl, ip, params, query, body } = request;

    this.logger.logWithContext(
      'Incoming HTTP request',
      'HttpLoggingInterceptor',
      {
        requestId,
        method,
        url: originalUrl,
        ip,
        params,
        query,
        body,
      },
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.logWithContext(
          'HTTP request completed',
          'HttpLoggingInterceptor',
          {
            requestId,
            method,
            url: originalUrl,
            statusCode: response.statusCode,
            durationMs: Date.now() - now,
          },
        );
      }),
      catchError((error: unknown) => {
        const err = error as Error & { status?: number };

        this.logger.errorWithContext(
          'HTTP request failed',
          err.stack,
          'HttpLoggingInterceptor',
          {
            requestId,
            method,
            url: originalUrl,
            statusCode: err.status,
            durationMs: Date.now() - now,
            errorMessage: err.message,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
