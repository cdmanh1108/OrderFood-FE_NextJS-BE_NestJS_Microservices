import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

type HttpSuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
};

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, HttpSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<HttpSuccessResponse<T>> {
    const ctx = context.switchToHttp();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      })),
    );
  }
}
