import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLoggerService extends Logger {
  logWithContext(
    message: string,
    context: string,
    meta?: Record<string, unknown>,
  ) {
    super.log(this.stringify(message, meta), context);
  }

  warnWithContext(
    message: string,
    context: string,
    meta?: Record<string, unknown>,
  ) {
    super.warn(this.stringify(message, meta), context);
  }

  errorWithContext(
    message: string,
    trace: string | undefined,
    context: string,
    meta?: Record<string, unknown>,
  ) {
    super.error(this.stringify(message, meta), trace, context);
  }

  private stringify(message: string, meta?: Record<string, unknown>): string {
    if (!meta || Object.keys(meta).length === 0) {
      return message;
    }

    return `${message} ${JSON.stringify(meta)}`;
  }
}
