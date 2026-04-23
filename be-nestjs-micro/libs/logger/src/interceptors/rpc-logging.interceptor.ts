import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { AppLoggerService } from '../logger.service';

@Injectable()
export class RpcLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const now = Date.now();
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = context.switchToRpc().getData();

    const requestId =
      data && typeof data === 'object' && 'requestId' in data
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (data.requestId as string | undefined)
        : undefined;

    this.logger.logWithContext(
      'Incoming RPC message',
      'RpcLoggingInterceptor',
      {
        requestId,
        controller: className,
        handler: handlerName,
        payload: data,
      },
    );

    return next.handle().pipe(
      tap(() => {
        this.logger.logWithContext(
          'RPC message processed',
          'RpcLoggingInterceptor',
          {
            requestId,
            controller: className,
            handler: handlerName,
            durationMs: Date.now() - now,
          },
        );
      }),
      catchError((error: unknown) => {
        const err = error as Error;

        this.logger.errorWithContext(
          'RPC message failed',
          err.stack,
          'RpcLoggingInterceptor',
          {
            requestId,
            controller: className,
            handler: handlerName,
            durationMs: Date.now() - now,
            errorMessage: err.message,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
