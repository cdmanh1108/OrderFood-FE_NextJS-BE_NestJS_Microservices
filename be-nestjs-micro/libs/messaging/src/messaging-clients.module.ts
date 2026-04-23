import { DynamicModule, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { createRmqClientOptions } from './config/rmq.config';

type ClientConfig = {
  name: string;
  queue: string;
};

@Module({})
export class MessagingClientsModule {
  static register(clients: ClientConfig[]): DynamicModule {
    return {
      module: MessagingClientsModule,
      imports: [
        ClientsModule.register(
          clients.map((c) => createRmqClientOptions(c.name, c.queue)),
        ),
      ],
      exports: [ClientsModule],
    };
  }
}
