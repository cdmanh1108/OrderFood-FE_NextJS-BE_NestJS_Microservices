import {
  ClientProviderOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';

export const RMQ_DEFAULT_PREFETCH_COUNT = 10;
export const RMQ_DEFAULT_RETRY_DELAY_MS = 15_000;
export const RMQ_DEFAULT_MAX_RETRY_COUNT = 3;
export const RMQ_RETRY_QUEUE_SUFFIX = '.retry';
export const RMQ_DLQ_QUEUE_SUFFIX = '.dlq';

export interface RmqRetryTopologyOptions {
  enabled?: boolean;
  retryDelayMs?: number;
  retryQueue?: string;
  deadLetterQueue?: string;
  bindMainQueueToRetryDlx?: boolean;
}

export interface RmqServerOptionsOverrides {
  prefetchCount?: number;
  noAck?: boolean;
  retryTopology?: RmqRetryTopologyOptions;
}

export interface RmqClientOptionsOverrides {
  headers?: Record<string, string>;
  persistent?: boolean;
  retryTopology?: RmqRetryTopologyOptions;
}

export interface RmqQueueTopology {
  mainQueue: string;
  retryQueue: string;
  deadLetterQueue: string;
  retryDelayMs: number;
}

export interface RmqAssertQueueConfig {
  name: string;
  options: {
    durable: boolean;
    arguments?: Record<string, string | number>;
  };
}

export function getRmqUri(): string {
  return process.env.RABBITMQ_URI ?? 'amqp://guest:guest@localhost:5672';
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function normalizeRetryDelayMs(value: number | undefined): number {
  if (typeof value !== 'number' || !isPositiveInteger(value)) {
    return RMQ_DEFAULT_RETRY_DELAY_MS;
  }

  return value;
}

function resolveMainQueueArguments(
  queue: string,
  retryTopology: RmqRetryTopologyOptions | undefined,
): Record<string, string> | undefined {
  if (!retryTopology?.enabled || !retryTopology.bindMainQueueToRetryDlx) {
    return undefined;
  }

  const topology = getRmqQueueTopology(queue, retryTopology);
  return {
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': topology.retryQueue,
  };
}

export function getRmqQueueTopology(
  queue: string,
  options: RmqRetryTopologyOptions = {},
): RmqQueueTopology {
  return {
    mainQueue: queue,
    retryQueue: options.retryQueue ?? `${queue}${RMQ_RETRY_QUEUE_SUFFIX}`,
    deadLetterQueue:
      options.deadLetterQueue ?? `${queue}${RMQ_DLQ_QUEUE_SUFFIX}`,
    retryDelayMs: normalizeRetryDelayMs(options.retryDelayMs),
  };
}

export function createRmqRetryQueueConfigs(
  queue: string,
  options: RmqRetryTopologyOptions = {},
): {
  retryQueue: RmqAssertQueueConfig;
  deadLetterQueue: RmqAssertQueueConfig;
} {
  const topology = getRmqQueueTopology(queue, options);

  return {
    retryQueue: {
      name: topology.retryQueue,
      options: {
        durable: true,
        arguments: {
          'x-message-ttl': topology.retryDelayMs,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': topology.mainQueue,
        },
      },
    },
    deadLetterQueue: {
      name: topology.deadLetterQueue,
      options: {
        durable: true,
      },
    },
  };
}

export function createRmqServerOptions(
  queue: string,
  overrides: RmqServerOptionsOverrides = {},
): RmqOptions {
  const queueArguments = resolveMainQueueArguments(
    queue,
    overrides.retryTopology,
  );

  const prefetchCount = isPositiveInteger(overrides.prefetchCount ?? NaN)
    ? (overrides.prefetchCount ?? RMQ_DEFAULT_PREFETCH_COUNT)
    : RMQ_DEFAULT_PREFETCH_COUNT;

  return {
    transport: Transport.RMQ,
    options: {
      urls: [getRmqUri()],
      queue,
      queueOptions: {
        durable: true,
        ...(queueArguments ? { arguments: queueArguments } : {}),
      },
      prefetchCount,
      noAck: overrides.noAck ?? false,
    },
  };
}

export function createRmqClientOptions(
  name: string,
  queue: string,
  overrides: RmqClientOptionsOverrides = {},
): ClientProviderOptions {
  const queueArguments = resolveMainQueueArguments(
    queue,
    overrides.retryTopology,
  );

  return {
    name,
    transport: Transport.RMQ,
    options: {
      urls: [getRmqUri()],
      queue,
      queueOptions: {
        durable: true,
        ...(queueArguments ? { arguments: queueArguments } : {}),
      },
      ...(overrides.headers ? { headers: overrides.headers } : {}),
      ...(typeof overrides.persistent === 'boolean'
        ? { persistent: overrides.persistent }
        : {}),
    },
  };
}
