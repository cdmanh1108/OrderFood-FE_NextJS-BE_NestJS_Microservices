import type { ConsumeMessage, Options } from 'amqplib';
import { RMQ_MESSAGE_HEADERS } from './rmq-message.constants';
import type {
  HandleEventMessageOptions,
  RmqHeaderMap,
  RmqMessageMetadata,
} from './rmq-message.types';

export function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

export function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

export function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function getMessageHeaders(message: ConsumeMessage): RmqHeaderMap {
  const headers = message.properties.headers;
  if (!headers || typeof headers !== 'object') {
    return {};
  }

  return headers as RmqHeaderMap;
}

function getRetryCountFromXDeath(
  headers: RmqHeaderMap,
  retryQueue: string,
): number {
  const xDeath = headers['x-death'];
  if (!Array.isArray(xDeath)) {
    return 0;
  }

  let retryCount = 0;
  for (const death of xDeath) {
    if (!death || typeof death !== 'object') {
      continue;
    }

    const deathRecord = death as Record<string, unknown>;
    const queue = deathRecord.queue;
    if (typeof queue !== 'string' || queue !== retryQueue) {
      continue;
    }

    const count = toNumber(deathRecord.count);
    if (typeof count === 'number' && count > retryCount) {
      retryCount = Math.floor(count);
    }
  }

  return retryCount;
}

export function resolveRetryCount(
  headers: RmqHeaderMap,
  retryQueue: string,
): number {
  const headerValue = toNumber(headers[RMQ_MESSAGE_HEADERS.RETRY_COUNT]);
  if (typeof headerValue === 'number' && Number.isFinite(headerValue)) {
    return Math.max(0, Math.floor(headerValue));
  }

  return getRetryCountFromXDeath(headers, retryQueue);
}

export function resolveExpiresAt(
  input: number | Date | undefined,
): number | undefined {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return Math.floor(input);
  }

  if (input instanceof Date) {
    const time = input.getTime();
    if (Number.isFinite(time)) {
      return Math.floor(time);
    }
  }

  return undefined;
}

export function buildHeaders(
  input: {
    eventId?: string;
    expiresAt?: number;
    retryCount?: number;
    headers?: Record<string, string>;
  } = {},
): Record<string, string> {
  const headers: Record<string, string> = {
    ...(input.headers ?? {}),
  };

  if (input.eventId) {
    headers[RMQ_MESSAGE_HEADERS.EVENT_ID] = input.eventId;
  }

  if (typeof input.expiresAt === 'number') {
    headers[RMQ_MESSAGE_HEADERS.EXPIRES_AT] = String(input.expiresAt);
  }

  if (typeof input.retryCount === 'number') {
    headers[RMQ_MESSAGE_HEADERS.RETRY_COUNT] = String(input.retryCount);
  }

  return headers;
}

export function toMutableHeaders(
  headers: RmqHeaderMap,
): Record<string, unknown> {
  return {
    ...headers,
  };
}

export function toPublishOptions(
  message: ConsumeMessage,
  headers: Record<string, unknown>,
): Options.Publish {
  return {
    persistent: true,
    contentType: message.properties.contentType,
    contentEncoding: message.properties.contentEncoding,
    correlationId: message.properties.correlationId,
    messageId: message.properties.messageId,
    timestamp: message.properties.timestamp,
    type: message.properties.type,
    appId: message.properties.appId,
    headers,
  };
}

export function shouldDropExpiredMessage(
  metadata: RmqMessageMetadata,
): boolean {
  return (
    typeof metadata.expiresAt === 'number' && Date.now() > metadata.expiresAt
  );
}

export function resolveQueueName(
  message: ConsumeMessage,
  options: HandleEventMessageOptions,
): string | undefined {
  if (options.queue) {
    return options.queue;
  }

  const routingKey = message.fields.routingKey;
  if (typeof routingKey === 'string' && routingKey.length > 0) {
    return routingKey;
  }

  return undefined;
}
