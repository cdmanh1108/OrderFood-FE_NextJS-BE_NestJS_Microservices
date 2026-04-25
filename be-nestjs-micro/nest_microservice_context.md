# Nest Microservice Context (Current State)

Last updated: 2026-04-25

## 1. Tech stack

- NestJS (Gateway + RMQ microservices)
- RabbitMQ (Transport RMQ)
- Prisma + PostgreSQL (multi-schema by domain)
- AWS S3 (presigned upload URL via media-service)
- Monorepo layout: `apps/` + `libs/`

---

## 2. Architecture overview

### Gateway (HTTP layer)

- `apps/gateway` is the HTTP entrypoint.
- Global prefix: `/api/v1`.
- Request validation by `ValidationPipe`.
- Call backend services through RMQ RPC (`ClientProxy.send(...)`).
- Map RPC errors to HTTP errors with `mapRpcErrorToHttpException`.

### Microservices (business layer)

- Each service consumes its own queue (`iam_queue`, `catalog_queue`, `ordering_queue`, ...).
- RPC handlers use `@MessagePattern(...)`.
- Async event handlers use `@EventPattern(...)` where needed.

### Shared libs

- `libs/contracts`: command/query/result/enums.
- `libs/messaging`: RMQ config, queues, patterns, transport helpers.
- `libs/common`: shared exception/filter/interceptor/utilities.
- `libs/database`: Prisma service/modules.
- `libs/logger`: logging/interceptors.

---

## 3. RMQ policy status (implemented)

This section records what was done to complete the RMQ policy:

- Move transport helper into `libs/messaging`:
  - New file: `libs/messaging/src/rmq/rpc-message.helper.ts`.
  - Old file `libs/common/src/rmq/rpc-message.helper.ts` is kept as re-export for backward compatibility.
- RPC ack/nack policy is now correct:
  - success -> `ack`
  - error -> `nack(false, false)` by default (no requeue)
- Event async helper added with per-service override support:
  - `maxRetryCount`
  - `isRetryable(error, metadata)`
  - `onDuplicate`
  - `onExpired`
  - `dedupe(eventId)` callback (for Redis integration)
- Event metadata headers are standardized:
  - `x-event-id`
  - `x-expires-at`
  - `x-retry-count`
- Producer-side message builder added:
  - `buildRmqEventMessage(...)` to create RMQ event record with headers.

---

## 4. RMQ topology and config (implemented)

File: `libs/messaging/src/config/rmq.config.ts`

### Added topology model

- Constants:
  - `RMQ_DEFAULT_PREFETCH_COUNT = 10`
  - `RMQ_DEFAULT_RETRY_DELAY_MS = 15000`
  - `RMQ_DEFAULT_MAX_RETRY_COUNT = 3`
  - queue suffixes: `.retry`, `.dlq`
- Helpers:
  - `getRmqQueueTopology(...)`
  - `createRmqRetryQueueConfigs(...)`

### Queue flow

- Retry flow supported:
  - `main queue -> retry queue (TTL) -> main queue`
  - max retry exceeded -> final DLQ
- `createRmqServerOptions(...)` and `createRmqClientOptions(...)` now support overrides for retry topology.

### Backward-compatibility fix for existing queues

- Existing RabbitMQ queue arguments are immutable.
- To avoid `406 PRECONDITION_FAILED` on old queues, binding main queue to retry DLX is controlled by flag:
  - `retryTopology.bindMainQueueToRetryDlx` (default: `false`)
- This keeps current queues working without force-delete/recreate.

---

## 5. Applied changes in services

### Notification service (event consumer)

- `apps/notification-service/src/main.ts`
  - Enable retry topology for notification queue.
  - Read retry delay from env: `RMQ_NOTIFICATION_RETRY_DELAY_MS`.
  - Read main-DLX binding flag from env: `RMQ_NOTIFICATION_BIND_MAIN_DLX`.
- `apps/notification-service/src/modules/email/email.controller.ts`
  - `@EventPattern(...)` now receives `RmqContext`.
  - Use `handleEventMessage(...)`.
  - Apply default policy:
    - `maxRetryCount` from env (`NOTIFICATION_EMAIL_MAX_RETRY_COUNT`)
    - `onDuplicate: 'ack'`
    - `onExpired: 'ack'`

### IAM service (event producer)

- `apps/iam-service/src/modules/auth/auth.service.ts`
  - `notificationClient.emit(...)` now uses `buildRmqEventMessage(...)`.
  - Publish metadata:
    - `eventId = requestId`
    - `ttlMs = 10 minutes`
    - auto header `x-retry-count = 0`

### RPC handlers import path cleanup

- Controllers moved from `@app/common/rmq/rpc-message.helper` to `@app/messaging/rmq/rpc-message.helper`.
- Re-export in `libs/common` is still available to avoid breaking old imports.

---

## 6. Environment keys

Updated in `.env.example`:

- `RMQ_NOTIFICATION_RETRY_DELAY_MS=15000`
- `RMQ_NOTIFICATION_BIND_MAIN_DLX=false`
- `NOTIFICATION_EMAIL_MAX_RETRY_COUNT=3`

---

## 7. Important operational note

If you want strict RabbitMQ topology on an existing queue:

1. Set `RMQ_NOTIFICATION_BIND_MAIN_DLX=true`.
2. Delete/recreate the existing `notification_queue` (or provision queue args upfront).
3. Start service again.

If queue is already live and cannot be recreated now:

- Keep `RMQ_NOTIFICATION_BIND_MAIN_DLX=false` to avoid arg mismatch.
- Retry/DLQ logic in helper still works via explicit republish path.

---

## 8. Verification done

Type-check passed after changes:

- `npx tsc -p apps/notification-service/tsconfig.app.json --noEmit`
- `npx tsc -p apps/iam-service/tsconfig.app.json --noEmit`
- `npx tsc -p apps/catalog-service/tsconfig.app.json --noEmit`
- `npx tsc -p apps/ordering-service/tsconfig.app.json --noEmit`
- `npx tsc -p apps/media-service/tsconfig.app.json --noEmit`

No TypeScript errors found.
