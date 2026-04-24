# Nest Microservice Context (Current State)

Last updated: 2026-04-25

## 1. Tech stack

- NestJS (Gateway + RMQ microservices)
- RabbitMQ (Transport RMQ)
- Prisma + PostgreSQL (multi-schema theo domain)
- AWS S3 (presigned upload URL qua media-service)
- Monorepo: `apps/` + `libs/`

---

## 2. High-level architecture

### Gateway (HTTP layer)

- `apps/gateway` là entrypoint HTTP.
- Global prefix: `/api/v1`.
- Validate request bằng `ValidationPipe`.
- Gửi RPC qua `ClientProxy.send(...)` tới service tương ứng.
- Bắt lỗi RPC và map sang HTTP error bằng `mapRpcErrorToHttpException`.

### Microservices (business layer)

- Mỗi service lắng nghe queue riêng (`iam_queue`, `catalog_queue`, `ordering_queue`, ...).
- Handler dùng `@MessagePattern(...)`.
- Business logic ở service class.

### Shared libs

- `libs/contracts`: command/query/result/enums.
- `libs/messaging`: RMQ config, queues, service tokens, patterns.
- `libs/common`: exception/filter/interceptor/helper dùng chung.
- `libs/database`: Prisma service/module theo domain DB.
- `libs/logger`: HTTP/RPC logging utilities.

---

## 3. Current module map (important)

### Gateway modules đang active

- `auth-gateway/auth`
- `auth-gateway/user`
- `catalog-gateway/category`
- `catalog-gateway/menu-item`
- `media-gateway`
- `ordering-gateway/cart` (đã nối route + service)

### Ordering Gateway hiện tại

- `OrderingGatewayModule` hiện chỉ import `CartOrderingGatewayModule`.
- `address/checkout/order` hiện mới có DTO (request/response), chưa có controller/service/module active.

### Ordering Service hiện tại

- `OrderingServiceModule` đang import `CartModule`.
- `cart.controller.ts` đã xử lý các pattern cart.
- `cart.service.ts` đã có logic DB cho cart.

---

## 4. RMQ conventions (đang dùng)

### Server/client config

File: `libs/messaging/src/config/rmq.config.ts`

- `noAck: false`
- `prefetchCount: 10`
- queue durable

### Ack behavior hiện tại

File: `libs/common/src/rmq/rpc-message.helper.ts`

- `handleRpcMessage(...)` đang `ack` trong `finally`.
- Nghĩa là hiện tại success/error đều ack (không retry qua nack).

> Nếu muốn policy `success -> ack`, `error -> nack(false, false)` thì cần đổi helper này.

---

## 5. Messaging patterns (current)

File: `libs/messaging/src/constants/patterns.constant.ts`

### Ordering patterns hiện có

- Address:
  - `ordering.address.create`
  - `ordering.address.update`
  - `ordering.address.get_detail`
  - `ordering.address.list`
  - `ordering.address.set_default`
  - `ordering.address.delete`
- Cart:
  - `ordering.cart.get_active`
  - `ordering.cart.add_item`
  - `ordering.cart.update_item`
  - `ordering.cart.remove_item`
  - `ordering.cart.set_address`
  - `ordering.cart.set_note`
  - `ordering.cart.clear`
- Checkout:
  - `ordering.checkout.preview`
  - `ordering.checkout.place_order`
  - `CREATE_ORDER` alias -> `ordering.checkout.place_order`
- Order:
  - `ordering.order.get_detail`
  - `ordering.order.list`
  - `ordering.order.cancel`
  - `ordering.order.update_status`

---

## 6. Contracts status (ordering)

`libs/contracts/src/ordering` đã có đầy đủ:

- `enums/`
  - `CartStatus`, `OrderChannel`, `OrderSource`, `OrderStatus`, `PaymentStatus`, `FulfillmentStatus`
- `address/commands`, `address/results`
- `cart/commands`, `cart/results`
- `checkout/commands`, `checkout/results`
- `order/commands`, `order/results`

Convention:

- Request nội bộ: `*.command.ts` / `*.query.ts` dùng `interface`.
- Kết quả: `*.result.ts` dùng `interface`.

---

## 7. Ordering cart API (gateway HTTP)

Base: `/api/v1/carts`

- `GET /active`
- `POST /items`
- `PATCH /items`
- `DELETE /items`
- `PATCH /address`
- `PATCH /note`
- `POST /clear`

Flow:

1. Gateway nhận request DTO.
2. Map sang contract command/query.
3. Gửi RMQ tới `ORDERING_SERVICE`.
4. Ordering service xử lý và trả result.

---

## 8. Ordering cart business logic (current)

Trong `apps/ordering-service/src/modules/cart/cart.service.ts`:

- `findActive`:
  - tìm cart `ACTIVE` theo `(userId | tableId | tableSessionId)` + `channel/source`
  - nếu không có và `createIfMissing=true` thì tạo mới
  - chặn query mơ hồ khi không có định danh cart và không cho create
- `addItem`:
  - yêu cầu cart tồn tại và status `ACTIVE`
  - nếu item đã có thì cộng quantity
- `updateItem`:
  - update quantity/note theo `itemId`
- `removeItem`:
  - xóa item khỏi cart
- `setAddress`:
  - cho phép clear address (`addressId` rỗng)
  - verify address tồn tại
  - nếu cart có `userId` thì address phải cùng user
- `setNote`: update note ở cart
- `clear`: xóa toàn bộ `cart_items` của cart

---

## 9. ID/data conventions (quan trọng)

### IAM user id

File: `prisma/iam/schema.prisma`

- `User.id` dùng `cuid()` (không phải UUID).

### Ordering userId columns

File: `prisma/ordering/schema.prisma`

- `Address.userId`, `Cart.userId`, `Order.userId` đang là `@db.VarChar(30)` để tương thích CUID.

### ID khác trong ordering

- `address.id`, `cart.id`, `order.id`, `cartItem.id`... vẫn là UUID.

### Decimal mapping

- Giá/kinh độ/vĩ độ từ Prisma Decimal được map sang `number` trong service result.

---

## 10. Error handling conventions

### Common

- Dùng `AppRpcException` trong microservice.
- Error code/message centralized ở:
  - `libs/common/src/constants/error-code.constant.ts`

### Gateway

- Service gateway bắt lỗi `.send(...).pipe(catchError(...))`
- Map RPC error -> HTTP exception qua:
  - `libs/common/src/utils/map-rpc-error-to-http.utils.ts`

---

## 11. Frontend integration status (cart)

`fe-nextjs` đã tích hợp cart API:

- type: `src/types/api/cart.type.ts`
- service: `src/services/api/cart.api.ts`
- context: `src/contexts/cart-context.tsx`
- page đang dùng: `src/app/(private)/(user)/order-food/page.tsx`

---

## 12. Known gaps / next steps

1. Ordering gateway:
   - mới active `cart`
   - `address/checkout/order` chưa có controller/service/module.
2. Ordering service:
   - mới có `cart` module
   - chưa có module `address`, `checkout`, `order`.
3. RMQ ack/nack:
   - hiện helper ack cả khi lỗi
   - chưa có retry policy / DLQ / dedupe eventId chuẩn hóa.
4. Migration:
   - cần tạo/apply migration cho đổi kiểu `userId` trong ordering schema.

---

## 13. Quick run checklist

Backend type-check:

```bash
npx tsc -p apps/gateway/tsconfig.app.json --noEmit
npx tsc -p apps/ordering-service/tsconfig.app.json --noEmit
```

Start services (example):

```bash
npm run start:gateway
npm run start:ordering-service
```

