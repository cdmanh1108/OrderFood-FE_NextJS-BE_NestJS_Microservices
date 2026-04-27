# Full NestJS Microservice + Database Context

Last updated: 2026-04-25

Use this file as context when starting a new chat.

---

## 1. Project Goal

Build a NestJS microservice backend for a restaurant / food ordering system.

Business flows:

1. **Dine-in QR ordering**
   - Customer sits at a table.
   - Each table has a QR code.
   - Customer scans QR, opens menu, adds food to cart, places order.
   - Order is linked to `tableId` and `tableSessionId`.

2. **Online ordering**
   - Customer registers / logs in.
   - Customer browses menu, adds items or combos to cart.
   - Customer chooses shipping address.
   - Customer checks out, pays online or by another method.
   - Notification/email is sent.

3. **Admin/backoffice**
   - Manage users/staff.
   - Manage categories, menu items, combos.
   - Manage dining tables and QR.
   - Manage orders, payment, reviews, media.

---

## 2. Tech Stack

- NestJS monorepo
- `apps/` + `libs/`
- RabbitMQ transport via `@nestjs/microservices`
- RMQ RPC with `ClientProxy.send(...)`
- RMQ events with `ClientProxy.emit(...)`
- Prisma ORM
- PostgreSQL
- AWS S3 / S3-compatible storage through `media-service`
- Validation with `class-validator` / `class-transformer`

---

## 3. Monorepo Layout

```txt
be/
├─ apps/
│  ├─ gateway/
│  ├─ iam-service/
│  ├─ catalog-service/
│  ├─ ordering-service/
│  ├─ dinein-service/
│  ├─ payment-service/
│  ├─ notification-service/
│  ├─ review-service/
│  └─ media-service/
│
├─ libs/
│  ├─ common/
│  ├─ contracts/
│  ├─ messaging/
│  ├─ database/
│  ├─ logger/
│  ├─ auth/
│  ├─ config/
│  └─ testing/
│
├─ docker-compose.yml
├─ package.json
├─ package-lock.json
├─ tsconfig.base.json
├─ nest-cli.json
└─ .env.example
```

Important monorepo rule:

- Install dependencies at root `be/package.json`.
- Do not install dependencies separately inside each app.
- Each app can still run/deploy as a separate microservice.

---

## 4. Services and Domain Boundaries

### 4.1 Gateway

Path: `apps/gateway`

Responsibilities:

- HTTP entrypoint.
- Global prefix: `/api/v1`.
- Validate request DTOs.
- Call backend microservices through RMQ RPC.
- Map RPC errors to HTTP exceptions.
- Should not contain business logic.

Recommended gateway module layout:

```txt
apps/gateway/src/modules/
├─ iam-gateway/
├─ catalog-gateway/
├─ ordering-gateway/
├─ dinein-gateway/
├─ payment-gateway/
├─ notification-gateway/
├─ review-gateway/
└─ media-gateway/
```

For `ordering-gateway`, prefer sub-feature folders:

```txt
ordering-gateway/
├─ carts/
│  ├─ carts.controller.ts
│  └─ dto/
├─ orders/
│  ├─ orders.controller.ts
│  └─ dto/
├─ checkout/
│  ├─ checkout.controller.ts
│  └─ dto/
├─ addresses/
│  ├─ addresses.controller.ts
│  └─ dto/
├─ clients/
│  └─ ordering.client.ts
└─ ordering-gateway.module.ts
```

### 4.2 IAM Service

Path: `apps/iam-service`

Responsibilities:

- Register/login/logout.
- Access token + refresh token.
- Verify email.
- Forgot/reset password.
- Users, roles, basic profile.

Does **not** own shipping addresses. Shipping addresses are customer/order business data, not identity data.

### 4.3 Catalog Service

Path: `apps/catalog-service`

Responsibilities:

- Categories.
- Menu items.
- Combos.
- Combo items/components.
- Availability.
- Menu item media references.

### 4.4 Ordering Service

Path: `apps/ordering-service`

Responsibilities:

- Carts.
- Cart items.
- Checkout.
- Orders.
- Order items.
- Pricing snapshot.
- Shipping address snapshot.
- Reusable customer addresses, because there is no `customer-service` yet.

Cart is **not** created when user registers. Cart is created when user starts ordering.

### 4.5 Dine-in Service

Path: `apps/dinein-service`

Responsibilities:

- Dining areas.
- Tables.
- Table QR.
- Table sessions.
- Reservations.

Reservation stays inside `dinein-service` for now.

### 4.6 Payment Service

Path: `apps/payment-service`

Responsibilities:

- Payment intents.
- Transactions.
- Gateway callback/webhook logs.
- Refunds.

### 4.7 Notification Service

Path: `apps/notification-service`

Responsibilities:

- Email templates.
- Notification messages.
- Email logs.
- Consumes events such as `UserRegistered`, `OrderPlaced`, `PaymentSucceeded`.

### 4.8 Review Service

Path: `apps/review-service`

Responsibilities:

- Reviews/comments.
- Ratings.
- Review media links.
- Moderation logs.

### 4.9 Media Service

Path: `apps/media-service`

Responsibilities:

- Media file metadata.
- Presigned upload URLs.
- Upload sessions.
- Media usage/reference tracking.
- S3 integration.

Other domains should store media reference IDs/URLs, while file metadata and upload policy live here.

---

## 5. RabbitMQ Context

Each service consumes its own queue:

```txt
iam_queue
catalog_queue
ordering_queue
dinein_queue
payment_queue
notification_queue
review_queue
media_queue
```

Shared RMQ config belongs in:

```txt
libs/messaging/src/config/rmq.config.ts
libs/messaging/src/rmq/rpc-message.helper.ts
```

Current RMQ policy implemented:

- RPC success -> `ack`
- RPC error -> `nack(false, false)` by default, no requeue
- Event handler supports retry metadata:
  - `x-event-id`
  - `x-expires-at`
  - `x-retry-count`
- Retry queue flow supported:
  - main queue -> retry queue with TTL -> main queue
  - max retry exceeded -> DLQ
- Existing queue mismatch is avoided by `retryTopology.bindMainQueueToRetryDlx=false` by default.

Important implemented files from current project:

- `libs/messaging/src/rmq/rpc-message.helper.ts`
- `libs/messaging/src/config/rmq.config.ts`
- legacy re-export: `libs/common/src/rmq/rpc-message.helper.ts`

Notification service currently uses event retry policy.
IAM service publishes notification event with `buildRmqEventMessage(...)`.

---

## 6. Environment Database URLs

```env
IAM_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/iam_db
CATALOG_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/catalog_db
ORDERING_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ordering_db
DINEIN_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dinein_db
PAYMENT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/payment_db
NOTIFICATION_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/notification_db
REVIEW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/review_db
MEDIA_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/media_db
```

---

## 7. Database Ownership by Service

### 7.1 `iam_db`

Owned by `iam-service`.

Tables:

```txt
users
profiles
roles
user_roles
auth_sessions
refresh_tokens
email_verification_tokens
password_reset_tokens
```

### 7.2 `catalog_db`

Owned by `catalog-service`.

Tables:

```txt
categories
menu_items
combos
combo_items
availability_rules
menu_item_media
```

### 7.3 `ordering_db`

Owned by `ordering-service`.

Tables:

```txt
addresses
carts
cart_items
cart_item_components
orders
order_items
order_item_components
pricing_snapshots
shipping_address_snapshots
```

No modifiers/toppings for now.

Reason:

- Size is fixed in item design.
- Spicy/not spicy can be handled by `note`.
- Extra bun / extra pork roll / extra food is a separate menu item.
- Combo is handled as `itemType = COMBO` and snapshot components in `cart_item_components` / `order_item_components`.

### 7.4 `dinein_db`

Owned by `dinein-service`.

Tables:

```txt
dining_areas
dining_tables
table_qrs
table_sessions
reservations
```

### 7.5 `payment_db`

Owned by `payment-service`.

Tables:

```txt
payments
payment_transactions
refunds
payment_webhook_logs
```

### 7.6 `notification_db`

Owned by `notification-service`.

Tables:

```txt
notification_templates
notification_messages
notification_logs
email_logs
```

### 7.7 `review_db`

Owned by `review-service`.

Tables:

```txt
reviews
ratings
review_media
review_moderation_logs
```

### 7.8 `media_db`

Owned by `media-service`.

Tables:

```txt
media_files
media_folders
media_usages
upload_sessions
```

---

## 8. Prisma Style Rules

Use Prisma with PostgreSQL.

Project style:

- Field names are camelCase.
- Do not use field-level `@map("snake_case")`.
- Table names can use `@@map("snake_case")`.
- UUID IDs use `@db.Uuid` where possible.
- VNĐ prices use `Decimal @db.Decimal(10, 0)`.
- Each service has its own Prisma schema and generated client.

Example generator style:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/ordering"
}

datasource db {
  provider = "postgresql"
  url      = env("ORDERING_DATABASE_URL")
}
```

---

# 9. Prisma Schemas

The following schemas are recommended/current target schemas.

---

## 9.1 IAM Service Prisma Schema

Path:

```txt
apps/iam-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/iam"
}

datasource db {
  provider = "postgresql"
  url      = env("IAM_DATABASE_URL")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  BANNED
}

enum RoleName {
  ADMIN
  MANAGER
  STAFF
  CUSTOMER
}

model User {
  id              String     @id @default(uuid()) @db.Uuid
  email           String     @unique @db.VarChar(150)
  passwordHash    String     @db.VarChar(255)
  phoneNumber     String?    @unique @db.VarChar(20)
  status          UserStatus @default(ACTIVE)
  isEmailVerified Boolean    @default(false)

  profile         Profile?
  roles           UserRole[]
  authSessions    AuthSession[]
  refreshTokens   RefreshToken[]
  emailTokens     EmailVerificationToken[]
  resetTokens     PasswordResetToken[]

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([email])
  @@index([phoneNumber])
  @@index([status])
  @@map("users")
}

model Profile {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @unique @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  fullName  String   @db.VarChar(120)
  avatarUrl String?  @db.VarChar(500)
  birthday  DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("profiles")
}

model Role {
  id          String     @id @default(uuid()) @db.Uuid
  name        RoleName   @unique
  description String?    @db.Text

  users       UserRole[]

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("roles")
}

model UserRole {
  userId    String   @db.Uuid
  roleId    String   @db.Uuid

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  role      Role     @relation(fields: [roleId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  createdAt DateTime @default(now())

  @@id([userId, roleId])
  @@map("user_roles")
}

model AuthSession {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  userAgent String?  @db.VarChar(500)
  ipAddress String?  @db.VarChar(80)
  revokedAt DateTime?
  expiresAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("auth_sessions")
}

model RefreshToken {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  tokenHash   String   @unique @db.VarChar(255)
  expiresAt   DateTime
  revokedAt   DateTime?
  replacedBy  String?  @db.VarChar(255)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}

model EmailVerificationToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  tokenHash String   @unique @db.VarChar(255)
  expiresAt DateTime
  usedAt    DateTime?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
  @@map("email_verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  tokenHash String   @unique @db.VarChar(255)
  expiresAt DateTime
  usedAt    DateTime?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([expiresAt])
  @@map("password_reset_tokens")
}
```

---

## 9.2 Catalog Service Prisma Schema

Path:

```txt
apps/catalog-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/catalog"
}

datasource db {
  provider = "postgresql"
  url      = env("CATALOG_DATABASE_URL")
}

model Category {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @unique @db.VarChar(120)
  slug        String  @unique @db.VarChar(140)
  description String? @db.Text
  image       String? @db.VarChar(255)
  isActive    Boolean @default(true)
  sortOrder   Int     @default(0)

  menuItems   MenuItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([sortOrder])
  @@index([isActive])
  @@map("categories")
}

model MenuItem {
  id              String  @id @default(uuid()) @db.Uuid
  name            String  @db.VarChar(150)
  slug            String  @unique @db.VarChar(180)
  description     String? @db.Text
  price           Decimal @db.Decimal(10, 0)
  image           String? @db.VarChar(255)
  sku             String? @unique @db.VarChar(50)
  isActive        Boolean @default(true)
  isAvailable     Boolean @default(true)
  isComboEligible Boolean @default(true)
  sortOrder       Int     @default(0)

  categoryId      String   @db.Uuid
  category        Category @relation(fields: [categoryId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  comboItems      ComboItem[]
  media           MenuItemMedia[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([name])
  @@index([categoryId])
  @@index([sortOrder])
  @@index([isActive])
  @@map("menu_items")
}

model Combo {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @db.VarChar(150)
  slug        String  @unique @db.VarChar(180)
  description String? @db.Text
  price       Decimal @db.Decimal(10, 0)
  image       String? @db.VarChar(255)
  sku         String? @unique @db.VarChar(50)
  isActive    Boolean @default(true)
  isAvailable Boolean @default(true)
  sortOrder   Int     @default(0)

  items       ComboItem[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([sortOrder])
  @@index([isActive])
  @@map("combos")
}

model ComboItem {
  id         String   @id @default(uuid()) @db.Uuid
  comboId    String   @db.Uuid
  combo      Combo    @relation(fields: [comboId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  menuItemId String   @db.Uuid
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  quantity   Int      @default(1)
  sortOrder  Int      @default(0)

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([comboId, menuItemId])
  @@index([comboId])
  @@index([menuItemId])
  @@map("combo_items")
}

model AvailabilityRule {
  id          String   @id @default(uuid()) @db.Uuid
  targetType  String   @db.VarChar(40) // MENU_ITEM or COMBO
  targetId    String   @db.Uuid
  dayOfWeek   Int?
  startTime   String?  @db.VarChar(10)
  endTime     String?  @db.VarChar(10)
  isAvailable Boolean  @default(true)
  note        String?  @db.Text

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([targetType, targetId])
  @@map("availability_rules")
}

model MenuItemMedia {
  id         String   @id @default(uuid()) @db.Uuid
  menuItemId String   @db.Uuid
  menuItem   MenuItem @relation(fields: [menuItemId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  mediaFileId String  @db.Uuid
  url         String? @db.VarChar(500)
  sortOrder   Int     @default(0)
  isPrimary   Boolean @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([menuItemId])
  @@index([mediaFileId])
  @@map("menu_item_media")
}
```

---

## 9.3 Ordering Service Prisma Schema

Path:

```txt
apps/ordering-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/ordering"
}

datasource db {
  provider = "postgresql"
  url      = env("ORDERING_DATABASE_URL")
}

enum CartStatus {
  ACTIVE
  CHECKED_OUT
  ABANDONED
  EXPIRED
}

enum OrderChannel {
  DINE_IN
  ONLINE
}

enum OrderSource {
  QR
  WEB
  MOBILE
  POS
}

enum CatalogItemType {
  MENU_ITEM
  COMBO
}

enum OrderStatus {
  PLACED
  CONFIRMED
  PREPARING
  READY
  COMPLETED
  CANCELED
}

enum PaymentStatus {
  UNPAID
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum FulfillmentStatus {
  NONE
  PREPARING
  READY_FOR_PICKUP
  SHIPPING
  DELIVERED
  FAILED
}

model Address {
  id            String   @id @default(uuid()) @db.Uuid
  userId        String   @db.Uuid

  receiverName  String   @db.VarChar(120)
  receiverPhone String   @db.VarChar(20)

  province      String   @db.VarChar(120)
  district      String   @db.VarChar(120)
  ward          String   @db.VarChar(120)
  street        String?  @db.VarChar(255)
  detail        String?  @db.Text

  latitude      Decimal? @db.Decimal(10, 7)
  longitude     Decimal? @db.Decimal(10, 7)

  isDefault     Boolean  @default(false)

  carts         Cart[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([isDefault])
  @@map("addresses")
}

model Cart {
  id             String      @id @default(uuid()) @db.Uuid
  userId         String?     @db.Uuid

  channel        OrderChannel
  source         OrderSource

  tableId        String?     @db.Uuid
  tableSessionId String?     @db.Uuid

  addressId      String?     @db.Uuid
  address        Address?    @relation(fields: [addressId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  status         CartStatus  @default(ACTIVE)
  note           String?     @db.Text

  items          CartItem[]

  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  expiresAt      DateTime?

  @@index([userId])
  @@index([status])
  @@index([tableId])
  @@index([tableSessionId])
  @@index([addressId])
  @@map("carts")
}

model CartItem {
  id               String              @id @default(uuid()) @db.Uuid
  cartId           String              @db.Uuid
  cart             Cart                @relation(fields: [cartId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  catalogItemId    String              @db.Uuid
  itemType         CatalogItemType
  itemName         String              @db.VarChar(150)
  itemImageUrl     String?             @db.VarChar(255)

  unitPrice        Decimal             @db.Decimal(10, 0)
  quantity         Int                 @default(1)

  note             String?             @db.Text

  components       CartItemComponent[]

  createdAt        DateTime            @default(now())
  updatedAt        DateTime            @updatedAt

  @@index([cartId])
  @@index([catalogItemId])
  @@index([itemType])
  @@map("cart_items")
}

model CartItemComponent {
  id           String   @id @default(uuid()) @db.Uuid
  cartItemId   String   @db.Uuid
  cartItem     CartItem @relation(fields: [cartItemId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  menuItemId   String   @db.Uuid
  menuItemName String   @db.VarChar(150)
  quantity     Int      @default(1)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([cartItemId])
  @@index([menuItemId])
  @@map("cart_item_components")
}

model Order {
  id                String                  @id @default(uuid()) @db.Uuid
  code              String                  @unique @db.VarChar(50)

  userId            String?                 @db.Uuid

  channel           OrderChannel
  source            OrderSource

  tableId           String?                 @db.Uuid
  tableSessionId    String?                 @db.Uuid

  status            OrderStatus             @default(PLACED)
  paymentStatus     PaymentStatus           @default(UNPAID)
  fulfillmentStatus FulfillmentStatus       @default(NONE)

  note              String?                 @db.Text

  items             OrderItem[]
  pricingSnapshot   PricingSnapshot?
  shippingAddress   ShippingAddressSnapshot?

  placedAt          DateTime?
  confirmedAt       DateTime?
  completedAt       DateTime?
  canceledAt        DateTime?

  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  @@index([userId])
  @@index([status])
  @@index([paymentStatus])
  @@index([fulfillmentStatus])
  @@index([tableId])
  @@index([tableSessionId])
  @@map("orders")
}

model OrderItem {
  id               String               @id @default(uuid()) @db.Uuid
  orderId          String               @db.Uuid
  order            Order                @relation(fields: [orderId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  catalogItemId    String               @db.Uuid
  itemType         CatalogItemType
  itemName         String               @db.VarChar(150)
  itemImageUrl     String?              @db.VarChar(255)

  unitPrice        Decimal              @db.Decimal(10, 0)
  quantity         Int

  note             String?              @db.Text

  components       OrderItemComponent[]

  createdAt        DateTime             @default(now())
  updatedAt        DateTime             @updatedAt

  @@index([orderId])
  @@index([catalogItemId])
  @@index([itemType])
  @@map("order_items")
}

model OrderItemComponent {
  id           String    @id @default(uuid()) @db.Uuid
  orderItemId  String    @db.Uuid
  orderItem    OrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  menuItemId   String    @db.Uuid
  menuItemName String    @db.VarChar(150)
  quantity     Int       @default(1)

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([orderItemId])
  @@index([menuItemId])
  @@map("order_item_components")
}

model PricingSnapshot {
  id             String   @id @default(uuid()) @db.Uuid
  orderId        String   @unique @db.Uuid
  order          Order    @relation(fields: [orderId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  itemsSubtotal  Decimal  @db.Decimal(10, 0)
  discountTotal  Decimal  @default(0) @db.Decimal(10, 0)
  shippingFee    Decimal  @default(0) @db.Decimal(10, 0)
  serviceFee     Decimal  @default(0) @db.Decimal(10, 0)
  taxTotal       Decimal  @default(0) @db.Decimal(10, 0)
  grandTotal     Decimal  @db.Decimal(10, 0)

  currency       String   @default("VND") @db.VarChar(10)

  createdAt      DateTime @default(now())

  @@map("pricing_snapshots")
}

model ShippingAddressSnapshot {
  id            String   @id @default(uuid()) @db.Uuid
  orderId       String   @unique @db.Uuid
  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  receiverName  String   @db.VarChar(120)
  receiverPhone String   @db.VarChar(20)

  province      String   @db.VarChar(120)
  district      String   @db.VarChar(120)
  ward          String   @db.VarChar(120)
  street        String?  @db.VarChar(255)
  detail        String?  @db.Text

  latitude      Decimal? @db.Decimal(10, 7)
  longitude     Decimal? @db.Decimal(10, 7)

  createdAt     DateTime @default(now())

  @@map("shipping_address_snapshots")
}
```

---

## 9.4 Dine-in Service Prisma Schema

Path:

```txt
apps/dinein-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/dinein"
}

datasource db {
  provider = "postgresql"
  url      = env("DINEIN_DATABASE_URL")
}

enum TableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  CLEANING
  INACTIVE
}

enum TableSessionStatus {
  ACTIVE
  CLOSED
  CANCELED
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  COMPLETED
  CANCELED
  NO_SHOW
}

model DiningArea {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @unique @db.VarChar(120)
  description String? @db.Text
  sortOrder   Int     @default(0)
  isActive    Boolean @default(true)

  tables      DiningTable[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([name])
  @@index([sortOrder])
  @@index([isActive])
  @@map("dining_areas")
}

model DiningTable {
  id            String      @id @default(uuid()) @db.Uuid
  code          String      @unique @db.VarChar(50)
  name          String?     @db.VarChar(120)
  capacity      Int         @default(1)
  status        TableStatus @default(AVAILABLE)
  sortOrder     Int         @default(0)
  isActive      Boolean     @default(true)

  diningAreaId  String?     @db.Uuid
  diningArea    DiningArea? @relation(fields: [diningAreaId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  qrCodes       TableQr[]
  sessions      TableSession[]
  reservations  Reservation[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([code])
  @@index([status])
  @@index([diningAreaId])
  @@index([sortOrder])
  @@index([isActive])
  @@map("dining_tables")
}

model TableQr {
  id          String      @id @default(uuid()) @db.Uuid
  tableId     String      @db.Uuid
  table       DiningTable @relation(fields: [tableId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  token       String      @unique @db.VarChar(255)
  qrUrl       String?     @db.VarChar(500)
  isActive    Boolean     @default(true)

  expiresAt   DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([tableId])
  @@index([token])
  @@index([isActive])
  @@map("table_qrs")
}

model TableSession {
  id            String             @id @default(uuid()) @db.Uuid
  tableId       String             @db.Uuid
  table         DiningTable        @relation(fields: [tableId], references: [id], onDelete: Restrict, onUpdate: Cascade)

  qrToken       String?            @db.VarChar(255)
  status        TableSessionStatus @default(ACTIVE)

  guestCount    Int?
  openedBy      String?            @db.Uuid
  closedBy      String?            @db.Uuid

  openedAt      DateTime           @default(now())
  closedAt      DateTime?

  note          String?            @db.Text

  createdAt     DateTime           @default(now())
  updatedAt     DateTime           @updatedAt

  @@index([tableId])
  @@index([status])
  @@index([openedAt])
  @@map("table_sessions")
}

model Reservation {
  id              String            @id @default(uuid()) @db.Uuid

  tableId          String?           @db.Uuid
  table            DiningTable?      @relation(fields: [tableId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  customerUserId   String?           @db.Uuid
  customerName     String            @db.VarChar(120)
  customerPhone    String            @db.VarChar(20)
  customerEmail    String?           @db.VarChar(150)

  guestCount       Int               @default(1)
  reservationTime  DateTime
  holdUntil        DateTime?

  status           ReservationStatus @default(PENDING)

  note             String?           @db.Text
  canceledReason   String?           @db.Text

  checkedInAt      DateTime?
  completedAt      DateTime?
  canceledAt       DateTime?
  noShowAt         DateTime?

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt

  @@index([tableId])
  @@index([customerUserId])
  @@index([customerPhone])
  @@index([reservationTime])
  @@index([status])
  @@map("reservations")
}
```

---

## 9.5 Payment Service Prisma Schema

Path:

```txt
apps/payment-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/payment"
}

datasource db {
  provider = "postgresql"
  url      = env("PAYMENT_DATABASE_URL")
}

enum PaymentMethod {
  CASH
  COD
  CARD
  BANK_TRANSFER
  EWALLET
  VNPAY
  MOMO
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  CANCELED
  REFUNDED
}

enum TransactionStatus {
  PENDING
  SUCCEEDED
  FAILED
}

enum RefundStatus {
  PENDING
  SUCCEEDED
  FAILED
}

model Payment {
  id              String        @id @default(uuid()) @db.Uuid
  orderId          String        @unique @db.Uuid
  userId           String?       @db.Uuid
  method           PaymentMethod
  status           PaymentStatus @default(PENDING)

  amount           Decimal       @db.Decimal(10, 0)
  currency         String        @default("VND") @db.VarChar(10)

  gateway          String?       @db.VarChar(80)
  gatewayPaymentId String?       @db.VarChar(255)
  paymentUrl       String?       @db.VarChar(1000)

  paidAt           DateTime?
  failedAt         DateTime?
  canceledAt       DateTime?

  transactions     PaymentTransaction[]
  refunds          Refund[]
  webhookLogs      PaymentWebhookLog[]

  createdAt        DateTime      @default(now())
  updatedAt        DateTime      @updatedAt

  @@index([orderId])
  @@index([userId])
  @@index([status])
  @@map("payments")
}

model PaymentTransaction {
  id             String            @id @default(uuid()) @db.Uuid
  paymentId      String            @db.Uuid
  payment        Payment           @relation(fields: [paymentId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  status         TransactionStatus @default(PENDING)
  amount         Decimal           @db.Decimal(10, 0)
  gateway        String?           @db.VarChar(80)
  gatewayTransId String?           @db.VarChar(255)
  rawPayload     Json?

  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([paymentId])
  @@index([status])
  @@map("payment_transactions")
}

model Refund {
  id              String       @id @default(uuid()) @db.Uuid
  paymentId        String       @db.Uuid
  payment          Payment      @relation(fields: [paymentId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  amount           Decimal      @db.Decimal(10, 0)
  reason           String?      @db.Text
  status           RefundStatus @default(PENDING)
  gatewayRefundId  String?      @db.VarChar(255)
  rawPayload       Json?

  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt

  @@index([paymentId])
  @@index([status])
  @@map("refunds")
}

model PaymentWebhookLog {
  id          String   @id @default(uuid()) @db.Uuid
  paymentId   String?  @db.Uuid
  payment     Payment? @relation(fields: [paymentId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  gateway     String   @db.VarChar(80)
  eventType   String?  @db.VarChar(120)
  payload     Json
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  error       String?  @db.Text

  @@index([paymentId])
  @@index([gateway])
  @@map("payment_webhook_logs")
}
```

---

## 9.6 Notification Service Prisma Schema

Path:

```txt
apps/notification-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/notification"
}

datasource db {
  provider = "postgresql"
  url      = env("NOTIFICATION_DATABASE_URL")
}

enum NotificationChannel {
  EMAIL
  SMS
  PUSH
}

enum NotificationStatus {
  PENDING
  SENT
  FAILED
  CANCELED
}

model NotificationTemplate {
  id          String              @id @default(uuid()) @db.Uuid
  code        String              @unique @db.VarChar(120)
  channel     NotificationChannel
  subject     String?             @db.VarChar(255)
  body        String              @db.Text
  isActive    Boolean             @default(true)

  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([code])
  @@index([channel])
  @@map("notification_templates")
}

model NotificationMessage {
  id          String              @id @default(uuid()) @db.Uuid
  userId      String?             @db.Uuid
  channel     NotificationChannel
  recipient   String              @db.VarChar(255)
  subject     String?             @db.VarChar(255)
  body        String              @db.Text
  status      NotificationStatus  @default(PENDING)
  metadata    Json?

  sentAt      DateTime?
  failedAt    DateTime?
  error       String?             @db.Text

  logs        NotificationLog[]
  emailLogs   EmailLog[]

  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  @@index([userId])
  @@index([channel])
  @@index([status])
  @@map("notification_messages")
}

model NotificationLog {
  id             String              @id @default(uuid()) @db.Uuid
  messageId       String              @db.Uuid
  message         NotificationMessage @relation(fields: [messageId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  status          NotificationStatus
  detail          String?             @db.Text
  createdAt       DateTime            @default(now())

  @@index([messageId])
  @@map("notification_logs")
}

model EmailLog {
  id             String               @id @default(uuid()) @db.Uuid
  messageId       String?              @db.Uuid
  message         NotificationMessage? @relation(fields: [messageId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  recipient       String               @db.VarChar(255)
  subject         String?              @db.VarChar(255)
  provider        String?              @db.VarChar(80)
  providerMessageId String?            @db.VarChar(255)
  status          NotificationStatus
  error           String?              @db.Text

  createdAt       DateTime             @default(now())

  @@index([messageId])
  @@index([recipient])
  @@map("email_logs")
}
```

---

## 9.7 Review Service Prisma Schema

Path:

```txt
apps/review-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/review"
}

datasource db {
  provider = "postgresql"
  url      = env("REVIEW_DATABASE_URL")
}

enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
  HIDDEN
}

enum ModerationAction {
  APPROVE
  REJECT
  HIDE
  RESTORE
}

model Review {
  id            String       @id @default(uuid()) @db.Uuid
  userId        String       @db.Uuid
  orderId       String?      @db.Uuid
  orderItemId   String?      @db.Uuid
  menuItemId    String       @db.Uuid

  rating        Int
  comment       String?      @db.Text
  status        ReviewStatus @default(PENDING)

  media         ReviewMedia[]
  moderationLogs ReviewModerationLog[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@index([userId])
  @@index([menuItemId])
  @@index([orderId])
  @@index([status])
  @@map("reviews")
}

model Rating {
  id             String   @id @default(uuid()) @db.Uuid
  menuItemId      String   @unique @db.Uuid
  ratingAverage   Decimal  @default(0) @db.Decimal(3, 2)
  ratingCount     Int      @default(0)
  oneStarCount    Int      @default(0)
  twoStarCount    Int      @default(0)
  threeStarCount  Int      @default(0)
  fourStarCount   Int      @default(0)
  fiveStarCount   Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("ratings")
}

model ReviewMedia {
  id          String   @id @default(uuid()) @db.Uuid
  reviewId    String   @db.Uuid
  review      Review   @relation(fields: [reviewId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  mediaFileId String   @db.Uuid
  url         String?  @db.VarChar(500)
  sortOrder   Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([reviewId])
  @@index([mediaFileId])
  @@map("review_media")
}

model ReviewModerationLog {
  id          String           @id @default(uuid()) @db.Uuid
  reviewId    String           @db.Uuid
  review      Review           @relation(fields: [reviewId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  moderatorId String?          @db.Uuid
  action      ModerationAction
  reason      String?          @db.Text

  createdAt   DateTime         @default(now())

  @@index([reviewId])
  @@index([moderatorId])
  @@map("review_moderation_logs")
}
```

---

## 9.8 Media Service Prisma Schema

Path:

```txt
apps/media-service/prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../generated/media"
}

datasource db {
  provider = "postgresql"
  url      = env("MEDIA_DATABASE_URL")
}

enum MediaVisibility {
  PUBLIC
  PRIVATE
}

enum MediaStatus {
  PENDING
  UPLOADED
  FAILED
  DELETED
}

enum UploadSessionStatus {
  PENDING
  COMPLETED
  EXPIRED
  CANCELED
}

model MediaFolder {
  id          String      @id @default(uuid()) @db.Uuid
  name        String      @db.VarChar(120)
  path        String      @unique @db.VarChar(500)
  parentId    String?     @db.Uuid
  parent      MediaFolder? @relation("FolderTree", fields: [parentId], references: [id], onDelete: SetNull, onUpdate: Cascade)
  children    MediaFolder[] @relation("FolderTree")

  files       MediaFile[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([parentId])
  @@map("media_folders")
}

model MediaFile {
  id             String          @id @default(uuid()) @db.Uuid
  folderId        String?         @db.Uuid
  folder          MediaFolder?    @relation(fields: [folderId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  ownerUserId     String?         @db.Uuid
  bucket          String          @db.VarChar(120)
  objectKey       String          @unique @db.VarChar(1000)
  originalName    String          @db.VarChar(255)
  mimeType        String          @db.VarChar(120)
  sizeBytes       BigInt?
  checksum        String?         @db.VarChar(255)
  url             String?         @db.VarChar(1000)
  visibility      MediaVisibility @default(PUBLIC)
  status          MediaStatus     @default(PENDING)

  usages          MediaUsage[]
  uploadSessions  UploadSession[]

  uploadedAt      DateTime?
  deletedAt       DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@index([ownerUserId])
  @@index([status])
  @@index([folderId])
  @@map("media_files")
}

model MediaUsage {
  id          String    @id @default(uuid()) @db.Uuid
  mediaFileId String    @db.Uuid
  mediaFile   MediaFile @relation(fields: [mediaFileId], references: [id], onDelete: Cascade, onUpdate: Cascade)

  serviceName String    @db.VarChar(80)
  targetType  String    @db.VarChar(80)
  targetId    String    @db.Uuid
  purpose     String?   @db.VarChar(120)

  createdAt   DateTime  @default(now())

  @@index([mediaFileId])
  @@index([serviceName, targetType, targetId])
  @@map("media_usages")
}

model UploadSession {
  id            String              @id @default(uuid()) @db.Uuid
  mediaFileId    String?             @db.Uuid
  mediaFile      MediaFile?          @relation(fields: [mediaFileId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  ownerUserId    String?             @db.Uuid
  bucket         String              @db.VarChar(120)
  objectKey      String              @db.VarChar(1000)
  originalName   String              @db.VarChar(255)
  mimeType       String              @db.VarChar(120)
  sizeBytes      BigInt?
  uploadUrl      String?             @db.VarChar(2000)
  status         UploadSessionStatus @default(PENDING)
  expiresAt      DateTime

  completedAt    DateTime?
  canceledAt     DateTime?
  createdAt      DateTime            @default(now())
  updatedAt      DateTime            @updatedAt

  @@index([ownerUserId])
  @@index([status])
  @@index([mediaFileId])
  @@map("upload_sessions")
}
```

---

## 10. Important Design Decisions

### 10.1 Cart creation

Do not create cart when user registers.

Correct flow:

```txt
Register user -> IAM only
User starts ordering -> create/find active cart
Checkout -> create order from cart
```

### 10.2 Address ownership

`addresses` is currently in `ordering_db`, not `iam_db`.

Reason:

- IAM handles identity/auth/roles.
- Shipping address is order/customer business data.
- Address uses `userId` as reference only; no cross-database FK to IAM.

Future option:

- If `customer-service` is created later, move reusable `addresses` to `customer_db`.
- Keep `shipping_address_snapshots` in `ordering_db` forever.

### 10.3 Combo handling

Catalog owns combo definition:

```txt
catalog_db.combos
catalog_db.combo_items
```

Ordering only stores snapshots:

```txt
ordering_db.cart_items.itemType = COMBO
ordering_db.cart_item_components
ordering_db.order_items.itemType = COMBO
ordering_db.order_item_components
```

### 10.4 No modifier tables for now

No `cart_item_modifiers` or `order_item_modifiers` for now.

Reason:

- Extra bun/extra food is represented as separate menu item.
- Spicy/not spicy can be note.
- Size is fixed by menu item.

### 10.5 Pricing snapshot

`pricing_snapshots` stores checkout calculation at the time of order.

Reason:

- Menu prices can change.
- Shipping fee can change.
- Discounts can change.
- Old orders must preserve original amount.

### 10.6 Shipping address snapshot

`shipping_address_snapshots` stores delivery address at order time.

Reason:

- User can edit saved address later.
- Old orders must keep original receiver/address info.

---

## 11. Common Commands

Generate Prisma client:

```bash
npx prisma generate --schema=apps/ordering-service/prisma/schema.prisma
```

Run migration:

```bash
npx prisma migrate dev --schema=apps/ordering-service/prisma/schema.prisma --name init_ordering
```

Repeat per service:

```bash
npx prisma generate --schema=apps/iam-service/prisma/schema.prisma
npx prisma generate --schema=apps/catalog-service/prisma/schema.prisma
npx prisma generate --schema=apps/dinein-service/prisma/schema.prisma
npx prisma generate --schema=apps/payment-service/prisma/schema.prisma
npx prisma generate --schema=apps/notification-service/prisma/schema.prisma
npx prisma generate --schema=apps/review-service/prisma/schema.prisma
npx prisma generate --schema=apps/media-service/prisma/schema.prisma
```

---

## 12. Current Verification Context

The previous context file reported that these type-checks passed:

```bash
npx tsc -p apps/notification-service/tsconfig.app.json --noEmit
npx tsc -p apps/iam-service/tsconfig.app.json --noEmit
npx tsc -p apps/catalog-service/tsconfig.app.json --noEmit
npx tsc -p apps/ordering-service/tsconfig.app.json --noEmit
npx tsc -p apps/media-service/tsconfig.app.json --noEmit
```

No TypeScript errors found at that point.

---


