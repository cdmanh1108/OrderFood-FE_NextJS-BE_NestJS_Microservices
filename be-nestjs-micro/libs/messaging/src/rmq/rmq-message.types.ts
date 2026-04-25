import type { ConsumeMessage, Options } from 'amqplib';
import type { RmqRetryTopologyOptions } from '../config/rmq.config';

export type RmqTerminalAction = 'ack' | 'nack';

export type RmqHeaderMap = Record<string, unknown>;

export type RmqChannelRef = {
  ack(message: ConsumeMessage): void;
  nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
  assertQueue?(
    queue: string,
    options?: {
      durable: boolean;
      arguments?: Record<string, string | number>;
    },
  ): Promise<unknown>;
  sendToQueue?(
    queue: string,
    content: Buffer,
    options?: Options.Publish,
  ): boolean;
};

export interface RmqMessageMetadata {
  eventId?: string;
  expiresAt?: number;
  retryCount: number;
  headers: RmqHeaderMap;
}

export interface HandleRpcMessageOptions {
  onError?: RmqTerminalAction;
}

export interface HandleEventMessageOptions {
  queue?: string;
  maxRetryCount?: number;
  isRetryable?: (
    error: unknown,
    metadata: RmqMessageMetadata,
  ) => boolean | Promise<boolean>;
  onDuplicate?: RmqTerminalAction;
  onExpired?: RmqTerminalAction;
  dedupe?: (
    eventId: string,
    metadata: RmqMessageMetadata,
  ) => boolean | Promise<boolean>;
  retryTopology?: RmqRetryTopologyOptions;
}

export interface BuildRmqEventMessageOptions {
  eventId?: string;
  ttlMs?: number;
  expiresAt?: number | Date;
  retryCount?: number;
  headers?: Record<string, string>;
  persistent?: boolean;
}
