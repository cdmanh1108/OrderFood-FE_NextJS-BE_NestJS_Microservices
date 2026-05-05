-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'COD', 'BANK_TRANSFER', 'PAYOS', 'MOMO', 'VNPAY', 'ZALOPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED', 'EXPIRED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentTransactionType" AS ENUM ('CREATE_PAYMENT', 'WEBHOOK', 'CONFIRM', 'CANCEL', 'EXPIRE', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WebhookProcessStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "orderCode" VARCHAR(50),
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,0) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "gateway" VARCHAR(50),
    "gatewayPaymentId" VARCHAR(120),
    "gatewayReference" VARCHAR(120),
    "paymentUrl" VARCHAR(1000),
    "qrCodeUrl" VARCHAR(1000),
    "checkoutUrl" VARCHAR(1000),
    "description" VARCHAR(255),
    "metadata" JSONB,
    "paidAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "canceledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "type" "PaymentTransactionType" NOT NULL,
    "status" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,0),
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "gateway" VARCHAR(50),
    "gatewayTransactionId" VARCHAR(120),
    "gatewayReference" VARCHAR(120),
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "rawPayload" JSONB,
    "errorCode" VARCHAR(100),
    "errorMessage" TEXT,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "amount" DECIMAL(10,0) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'VND',
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "gateway" VARCHAR(50),
    "gatewayRefundId" VARCHAR(120),
    "gatewayReference" VARCHAR(120),
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "requestedBy" VARCHAR(30),
    "refundedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "errorCode" VARCHAR(100),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_webhook_logs" (
    "id" UUID NOT NULL,
    "paymentId" UUID,
    "gateway" VARCHAR(50) NOT NULL,
    "eventType" VARCHAR(120),
    "eventId" VARCHAR(180),
    "status" "WebhookProcessStatus" NOT NULL DEFAULT 'RECEIVED',
    "headers" JSONB,
    "payload" JSONB NOT NULL,
    "signature" VARCHAR(500),
    "processedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_orderId_idx" ON "payments"("orderId");

-- CreateIndex
CREATE INDEX "payments_orderCode_idx" ON "payments"("orderCode");

-- CreateIndex
CREATE INDEX "payments_method_idx" ON "payments"("method");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_gateway_idx" ON "payments"("gateway");

-- CreateIndex
CREATE INDEX "payments_gatewayPaymentId_idx" ON "payments"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "payments_gatewayReference_idx" ON "payments"("gatewayReference");

-- CreateIndex
CREATE INDEX "payments_createdAt_idx" ON "payments"("createdAt");

-- CreateIndex
CREATE INDEX "payment_transactions_paymentId_idx" ON "payment_transactions"("paymentId");

-- CreateIndex
CREATE INDEX "payment_transactions_type_idx" ON "payment_transactions"("type");

-- CreateIndex
CREATE INDEX "payment_transactions_status_idx" ON "payment_transactions"("status");

-- CreateIndex
CREATE INDEX "payment_transactions_gateway_idx" ON "payment_transactions"("gateway");

-- CreateIndex
CREATE INDEX "payment_transactions_gatewayTransactionId_idx" ON "payment_transactions"("gatewayTransactionId");

-- CreateIndex
CREATE INDEX "payment_transactions_gatewayReference_idx" ON "payment_transactions"("gatewayReference");

-- CreateIndex
CREATE INDEX "payment_transactions_createdAt_idx" ON "payment_transactions"("createdAt");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE INDEX "refunds_status_idx" ON "refunds"("status");

-- CreateIndex
CREATE INDEX "refunds_gateway_idx" ON "refunds"("gateway");

-- CreateIndex
CREATE INDEX "refunds_gatewayRefundId_idx" ON "refunds"("gatewayRefundId");

-- CreateIndex
CREATE INDEX "refunds_gatewayReference_idx" ON "refunds"("gatewayReference");

-- CreateIndex
CREATE INDEX "refunds_requestedBy_idx" ON "refunds"("requestedBy");

-- CreateIndex
CREATE INDEX "refunds_createdAt_idx" ON "refunds"("createdAt");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_paymentId_idx" ON "payment_webhook_logs"("paymentId");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_gateway_idx" ON "payment_webhook_logs"("gateway");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_eventType_idx" ON "payment_webhook_logs"("eventType");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_eventId_idx" ON "payment_webhook_logs"("eventId");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_status_idx" ON "payment_webhook_logs"("status");

-- CreateIndex
CREATE INDEX "payment_webhook_logs_createdAt_idx" ON "payment_webhook_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_webhook_logs_gateway_eventId_key" ON "payment_webhook_logs"("gateway", "eventId");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_webhook_logs" ADD CONSTRAINT "payment_webhook_logs_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
