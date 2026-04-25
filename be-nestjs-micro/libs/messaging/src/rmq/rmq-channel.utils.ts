import { RmqContext } from '@nestjs/microservices';
import type { ConsumeMessage, Options } from 'amqplib';
import {
  createRmqRetryQueueConfigs,
  type RmqRetryTopologyOptions,
} from '../config/rmq.config';
import type { RmqChannelRef, RmqTerminalAction } from './rmq-message.types';

export function resolveTerminalAction(
  channel: RmqChannelRef,
  message: ConsumeMessage,
  action: RmqTerminalAction,
): void {
  if (action === 'ack') {
    channel.ack(message);
    return;
  }

  channel.nack(message, false, false);
}

export function getChannelAndMessage(context: RmqContext): {
  channel: RmqChannelRef;
  message: ConsumeMessage;
} {
  const channel = context.getChannelRef() as RmqChannelRef;
  const message = context.getMessage() as ConsumeMessage;

  return {
    channel,
    message,
  };
}

export async function publishToQueue(
  channel: RmqChannelRef,
  queue: string,
  content: Buffer,
  options: Options.Publish,
): Promise<void> {
  if (typeof channel.sendToQueue !== 'function') {
    return;
  }

  channel.sendToQueue(queue, content, options);
}

export async function ensureRetryQueues(
  channel: RmqChannelRef,
  queue: string,
  topologyOptions: RmqRetryTopologyOptions = {},
): Promise<void> {
  if (typeof channel.assertQueue !== 'function') {
    return;
  }

  const { retryQueue, deadLetterQueue } = createRmqRetryQueueConfigs(
    queue,
    topologyOptions,
  );
  await channel.assertQueue(retryQueue.name, retryQueue.options);
  await channel.assertQueue(deadLetterQueue.name, deadLetterQueue.options);
}
