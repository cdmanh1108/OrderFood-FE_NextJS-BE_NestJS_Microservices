import { RmqContext } from '@nestjs/microservices';
import type { HandleRpcMessageOptions } from './rmq-message.types';
import {
  getChannelAndMessage,
  resolveTerminalAction,
} from './rmq-channel.utils';

export async function handleRpcMessage<T>(
  context: RmqContext,
  handler: () => Promise<T>,
  options: HandleRpcMessageOptions = {},
): Promise<T> {
  const { channel, message } = getChannelAndMessage(context);
  const onError = options.onError ?? 'nack';

  try {
    const result = await handler();
    channel.ack(message);
    return result;
  } catch (error) {
    resolveTerminalAction(channel, message, onError);
    throw error;
  }
}
