import { Pool } from 'pg';

export function createPrismaPool(connectionString: string): Pool {
  const isDev = process.env.NODE_ENV !== 'production';
  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1');

  return new Pool({
    connectionString,
    ssl:
      isDev || isLocal
        ? false
        : {
            rejectUnauthorized: false,
          },
  });
}
