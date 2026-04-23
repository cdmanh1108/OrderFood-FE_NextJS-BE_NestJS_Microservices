import { RmqContext } from '@nestjs/microservices';

export async function handleRpcMessage<T>(
  context: RmqContext,
  handler: () => Promise<T>,
): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const channel = context.getChannelRef();
  const message = context.getMessage();

  try {
    return await handler();
  } finally {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    channel.ack(message);
  }
}
