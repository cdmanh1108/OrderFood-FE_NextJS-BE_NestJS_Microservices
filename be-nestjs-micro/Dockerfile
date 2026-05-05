FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG APP_NAME

RUN case "$APP_NAME" in \
    "iam-service") npx prisma generate --schema=prisma/iam/schema.prisma ;; \
    "catalog-service") npx prisma generate --schema=prisma/catalog/schema.prisma ;; \
    "ordering-service") npx prisma generate --schema=prisma/ordering/schema.prisma ;; \
    "dinein-service") npx prisma generate --schema=prisma/dinein/schema.prisma ;; \
    "payment-service") npx prisma generate --schema=prisma/payment/schema.prisma ;; \
    "delivery-service") npx prisma generate --schema=prisma/delivery/schema.prisma ;; \
    "notification-service") echo "Notification service has no Prisma schema, skip prisma generate" ;; \
    "review-service") echo "Review service has no Prisma schema, skip prisma generate" ;; \
    "media-service") echo "Media service has no Prisma schema, skip prisma generate" ;; \
    "gateway") echo "Gateway has no Prisma schema, skip prisma generate" ;; \
    *) echo "Unknown APP_NAME: $APP_NAME" && exit 1 ;; \
    esac

RUN npx nest build ${APP_NAME}


# =========================
# Production app runner
# =========================
FROM node:20-alpine AS app-runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/libs ./libs

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

CMD ["sh", "-c", "exec node dist/apps/${APP_NAME}/main.js"]


# =========================
# Migration / seed runner
# =========================
FROM node:20-alpine AS migration-runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

# Cần devDependencies vì prisma CLI / tsx thường nằm trong devDependencies
RUN npm ci --include=dev

COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Nên copy thêm để seed tsx/path alias không lỗi
COPY --from=builder /app/tsconfig*.json ./
COPY --from=builder /app/libs ./libs

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

CMD ["sh", "-c", "echo 'Migration runner. Override command in ECS Run Task.'"]