import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from 'generated/delivery';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { createPrismaPool } from './prisma-pool.util';

@Injectable()
export class DeliveryPrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DELIVERY_DATABASE_URL;

    if (!connectionString) {
      throw new Error('DELIVERY_DATABASE_URL is not defined');
    }

    const pool = createPrismaPool(connectionString);

    super({
      adapter: new PrismaPg(pool),
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
