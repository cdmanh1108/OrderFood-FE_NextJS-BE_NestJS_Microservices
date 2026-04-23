import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const service = process.env.PRISMA_SERVICE;

if (!service) {
  throw new Error('PRISMA_SERVICE is not set');
}

const databaseUrls: Record<string, string | undefined> = {
  iam: process.env.IAM_DATABASE_URL,
  catalog: process.env.CATALOG_DATABASE_URL,
  ordering: process.env.ORDERING_DATABASE_URL,
  dinein: process.env.DINEIN_DATABASE_URL,
  payment: process.env.PAYMENT_DATABASE_URL,
  notification: process.env.NOTIFICATION_DATABASE_URL,
  review: process.env.REVIEW_DATABASE_URL,
  media: process.env.MEDIA_DATABASE_URL,
};

const url = databaseUrls[service];

if (!url) {
  throw new Error(`Database URL is not set for service: ${service}`);
}

export default defineConfig({
  schema: `prisma/${service}/schema.prisma`,
  datasource: {
    url,
  },
});
