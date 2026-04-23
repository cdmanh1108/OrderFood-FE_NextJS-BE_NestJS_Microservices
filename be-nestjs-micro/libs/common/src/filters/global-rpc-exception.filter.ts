import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { ERRORS } from '../constants/error-code.constant';
import { RpcErrorPayload } from '../interfaces/rpc-error-payload.interface';

@Catch()
export class GlobalRpcExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(GlobalRpcExceptionFilter.name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      const error = exception.getError();

      this.logger.warn(
        typeof error === 'string' ? error : JSON.stringify(error),
      );

      if (typeof error === 'string') {
        return throwError(() => ({
          code: ERRORS.INTERNAL_ERROR.code,
          message: error,
        }));
      }

      if (typeof error === 'object' && error !== null) {
        const payload = error as Partial<RpcErrorPayload>;

        return throwError(() => ({
          code: payload.code ?? ERRORS.INTERNAL_ERROR.code,
          message: payload.message ?? ERRORS.INTERNAL_ERROR.message,
          details: payload.details,
        }));
      }

      return throwError(() => ({
        code: ERRORS.INTERNAL_ERROR.code,
        message: ERRORS.INTERNAL_ERROR.message,
      }));
    }

    this.logger.error(exception);

    return throwError(() => ({
      code: ERRORS.INTERNAL_ERROR.code,
      message: ERRORS.INTERNAL_ERROR.message,
    }));
  }
}
