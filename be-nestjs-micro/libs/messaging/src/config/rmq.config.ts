import {
  ClientProviderOptions,
  RmqOptions,
  Transport,
} from '@nestjs/microservices';

export function getRmqUri(): string {
  return process.env.RABBITMQ_URI ?? 'amqp://guest:guest@localhost:5672';
}

export function createRmqServerOptions(queue: string): RmqOptions {
  return {
    transport: Transport.RMQ,
    options: {
      urls: [getRmqUri()],
      queue,
      queueOptions: {
        durable: true,
      },
      prefetchCount: 10,
      noAck: false,
    },
  };
}

export function createRmqClientOptions(
  name: string,
  queue: string,
): ClientProviderOptions {
  return {
    name,
    transport: Transport.RMQ,
    options: {
      urls: [getRmqUri()],
      queue,
      queueOptions: {
        durable: true,
      },
    },
  };
}
