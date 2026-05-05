-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'CHECKED_OUT', 'ABANDONED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('DINE_IN', 'ONLINE');

-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('QR', 'WEB', 'MOBILE', 'POS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('NONE', 'PREPARING', 'READY_FOR_PICKUP', 'SHIPPING', 'DELIVERED', 'FAILED');

-- CreateTable
CREATE TABLE "addresses" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(30) NOT NULL,
    "receiverName" VARCHAR(120) NOT NULL,
    "receiverPhone" VARCHAR(20) NOT NULL,
    "province" VARCHAR(120) NOT NULL,
    "district" VARCHAR(120) NOT NULL,
    "ward" VARCHAR(120) NOT NULL,
    "street" VARCHAR(255),
    "detail" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(30),
    "channel" "OrderChannel" NOT NULL,
    "source" "OrderSource" NOT NULL,
    "tableId" UUID,
    "tableSessionId" UUID,
    "addressId" UUID,
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "cartId" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "menuItemName" VARCHAR(150) NOT NULL,
    "menuItemImageUrl" VARCHAR(255),
    "unitPrice" DECIMAL(10,0) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "userId" VARCHAR(30),
    "channel" "OrderChannel" NOT NULL,
    "source" "OrderSource" NOT NULL,
    "tableId" UUID,
    "tableSessionId" UUID,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "fulfillmentStatus" "FulfillmentStatus" NOT NULL DEFAULT 'NONE',
    "note" TEXT,
    "placedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "menuItemName" VARCHAR(150) NOT NULL,
    "menuItemImageUrl" VARCHAR(255),
    "unitPrice" DECIMAL(10,0) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshots" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "itemsSubtotal" DECIMAL(10,0) NOT NULL,
    "modifiersTotal" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "discountTotal" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "shippingFee" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "serviceFee" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "taxTotal" DECIMAL(10,0) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(10,0) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_address_snapshots" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "receiverName" VARCHAR(120) NOT NULL,
    "receiverPhone" VARCHAR(20) NOT NULL,
    "province" VARCHAR(120) NOT NULL,
    "district" VARCHAR(120) NOT NULL,
    "ward" VARCHAR(120) NOT NULL,
    "street" VARCHAR(255),
    "detail" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipping_address_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX "addresses_isDefault_idx" ON "addresses"("isDefault");

-- CreateIndex
CREATE INDEX "carts_userId_idx" ON "carts"("userId");

-- CreateIndex
CREATE INDEX "carts_status_idx" ON "carts"("status");

-- CreateIndex
CREATE INDEX "carts_tableId_idx" ON "carts"("tableId");

-- CreateIndex
CREATE INDEX "carts_tableSessionId_idx" ON "carts"("tableSessionId");

-- CreateIndex
CREATE INDEX "carts_addressId_idx" ON "carts"("addressId");

-- CreateIndex
CREATE INDEX "cart_items_cartId_idx" ON "cart_items"("cartId");

-- CreateIndex
CREATE INDEX "cart_items_menuItemId_idx" ON "cart_items"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX "orders_fulfillmentStatus_idx" ON "orders"("fulfillmentStatus");

-- CreateIndex
CREATE INDEX "orders_tableId_idx" ON "orders"("tableId");

-- CreateIndex
CREATE INDEX "orders_tableSessionId_idx" ON "orders"("tableSessionId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "order_items_menuItemId_idx" ON "order_items"("menuItemId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_snapshots_orderId_key" ON "pricing_snapshots"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_address_snapshots_orderId_key" ON "shipping_address_snapshots"("orderId");

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_address_snapshots" ADD CONSTRAINT "shipping_address_snapshots_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
