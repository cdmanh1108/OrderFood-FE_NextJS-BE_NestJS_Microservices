import { randomUUID } from 'node:crypto';
import { RmqContext, RmqRecord, RmqRecordBuilder } from '@nestjs/microservices';
import {
  RMQ_DEFAULT_MAX_RETRY_COUNT,
  RMQ_DEFAULT_RETRY_DELAY_MS,
  getRmqQueueTopology,
} from '../config/rmq.config';
import { RMQ_MESSAGE_HEADERS } from './rmq-message.constants';
import {
  ensureRetryQueues,
  getChannelAndMessage,
  publishToQueue,
  resolveTerminalAction,
} from './rmq-channel.utils';
import type {
  BuildRmqEventMessageOptions,
  HandleEventMessageOptions,
  RmqMessageMetadata,
} from './rmq-message.types';
import {
  buildHeaders,
  getMessageHeaders,
  isNonNegativeInteger,
  isPositiveInteger,
  resolveExpiresAt,
  resolveQueueName,
  resolveRetryCount,
  shouldDropExpiredMessage,
  toMutableHeaders,
  toNumber,
  toPublishOptions,
} from './rmq-message.utils';

export function buildRmqEventMessage<TData>(
  payload: TData,
  options: BuildRmqEventMessageOptions = {},
): RmqRecord<TData> {
  const eventId = options.eventId ?? randomUUID();
  const expiresAtFromInput = resolveExpiresAt(options.expiresAt);
  const expiresAtFromTtl =
    typeof options.ttlMs === 'number' && isPositiveInteger(options.ttlMs)
      ? Date.now() + options.ttlMs
      : undefined;
  const expiresAt = expiresAtFromInput ?? expiresAtFromTtl;

  const headers = buildHeaders({
    eventId,
    expiresAt,
    retryCount: options.retryCount ?? 0,
    headers: options.headers,
  });

  return new RmqRecordBuilder(payload)
    .setOptions({
      persistent: options.persistent ?? true,
      headers,
    })
    .build() as RmqRecord<TData>;
}

export async function handleEventMessage<T>(
  context: RmqContext,
  handler: () => Promise<T>,
  options: HandleEventMessageOptions = {},
): Promise<T | undefined> {
  const { channel, message } = getChannelAndMessage(context);
  const baseQueue = resolveQueueName(message, options);
  const retryTopology = options.retryTopology ?? {
    enabled: true,
    retryDelayMs: RMQ_DEFAULT_RETRY_DELAY_MS,
  };
  const retryEnabled = retryTopology.enabled ?? true;
  const queueTopology = getRmqQueueTopology(
    baseQueue ?? 'default_event_queue',
    retryTopology,
  );
  const headers = getMessageHeaders(message);
  const eventIdValue = headers[RMQ_MESSAGE_HEADERS.EVENT_ID];
  const expiresAtValue = headers[RMQ_MESSAGE_HEADERS.EXPIRES_AT];

  const metadata: RmqMessageMetadata = {
    eventId: typeof eventIdValue === 'string' ? eventIdValue : undefined,
    expiresAt: toNumber(expiresAtValue),
    retryCount: resolveRetryCount(headers, queueTopology.retryQueue),
    headers,
  };

  if (shouldDropExpiredMessage(metadata)) {
    resolveTerminalAction(channel, message, options.onExpired ?? 'ack');
    return undefined;
  }

  if (metadata.eventId && options.dedupe) {
    const isDuplicate = await options.dedupe(metadata.eventId, metadata);
    if (isDuplicate) {
      resolveTerminalAction(channel, message, options.onDuplicate ?? 'ack');
      return undefined;
    }
  }

  try {
    const result = await handler();
    channel.ack(message);
    return result;
  } catch (error) {
    const maxRetryCount = isNonNegativeInteger(options.maxRetryCount ?? NaN)
      ? (options.maxRetryCount ?? RMQ_DEFAULT_MAX_RETRY_COUNT)
      : RMQ_DEFAULT_MAX_RETRY_COUNT;
    const retryable = options.isRetryable
      ? await options.isRetryable(error, metadata)
      : true;
    const canRetry =
      retryEnabled && retryable && metadata.retryCount < maxRetryCount;

    if (
      !retryEnabled ||
      !baseQueue ||
      typeof channel.sendToQueue !== 'function'
    ) {
      channel.nack(message, false, false);
      throw error;
    }

    await ensureRetryQueues(channel, baseQueue, retryTopology);

    const nextRetryCount = metadata.retryCount + 1;
    const publishHeaders = toMutableHeaders(metadata.headers);
    if (metadata.eventId) {
      publishHeaders[RMQ_MESSAGE_HEADERS.EVENT_ID] = metadata.eventId;
    }
    if (typeof metadata.expiresAt === 'number') {
      publishHeaders[RMQ_MESSAGE_HEADERS.EXPIRES_AT] = String(
        metadata.expiresAt,
      );
    }
    publishHeaders[RMQ_MESSAGE_HEADERS.RETRY_COUNT] = String(
      canRetry ? nextRetryCount : metadata.retryCount,
    );

    const targetQueue = canRetry
      ? queueTopology.retryQueue
      : queueTopology.deadLetterQueue;
    await publishToQueue(
      channel,
      targetQueue,
      message.content,
      toPublishOptions(message, publishHeaders),
    );

    channel.ack(message);
    throw error;
  }
}
