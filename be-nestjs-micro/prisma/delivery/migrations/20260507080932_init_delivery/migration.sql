-- CreateEnum
CREATE TYPE "DeliveryTaskStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('MOTORBIKE', 'BICYCLE', 'CAR');

-- CreateTable
CREATE TABLE "shippers" (
    "id" UUID NOT NULL,
    "userId" VARCHAR(30) NOT NULL,
    "fullName" VARCHAR(120) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "licensePlate" VARCHAR(20) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatarUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shippers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_tasks" (
    "id" UUID NOT NULL,
    "orderId" VARCHAR(36) NOT NULL,
    "shipperId" UUID,
    "status" "DeliveryTaskStatus" NOT NULL DEFAULT 'PENDING',
    "recipientName" VARCHAR(120) NOT NULL,
    "recipientPhone" VARCHAR(20) NOT NULL,
    "deliveryAddress" TEXT NOT NULL,
    "deliveryLat" DECIMAL(10,7),
    "deliveryLng" DECIMAL(10,7),
    "note" TEXT,
    "assignedAt" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delivery_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_task_status_histories" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "fromStatus" "DeliveryTaskStatus",
    "toStatus" "DeliveryTaskStatus" NOT NULL,
    "note" VARCHAR(500),
    "changedBy" VARCHAR(30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_task_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipper_location_histories" (
    "id" UUID NOT NULL,
    "shipperId" UUID NOT NULL,
    "lat" DECIMAL(10,7) NOT NULL,
    "lng" DECIMAL(10,7) NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shipper_location_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_proofs" (
    "id" UUID NOT NULL,
    "taskId" UUID NOT NULL,
    "mediaFileId" VARCHAR(255) NOT NULL,
    "note" VARCHAR(500),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_proofs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shippers_userId_key" ON "shippers"("userId");

-- CreateIndex
CREATE INDEX "shippers_userId_idx" ON "shippers"("userId");

-- CreateIndex
CREATE INDEX "shippers_isActive_idx" ON "shippers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_tasks_orderId_key" ON "delivery_tasks"("orderId");

-- CreateIndex
CREATE INDEX "delivery_tasks_shipperId_status_idx" ON "delivery_tasks"("shipperId", "status");

-- CreateIndex
CREATE INDEX "delivery_tasks_status_idx" ON "delivery_tasks"("status");

-- CreateIndex
CREATE INDEX "delivery_tasks_orderId_idx" ON "delivery_tasks"("orderId");

-- CreateIndex
CREATE INDEX "delivery_task_status_histories_taskId_idx" ON "delivery_task_status_histories"("taskId");

-- CreateIndex
CREATE INDEX "shipper_location_histories_shipperId_recordedAt_idx" ON "shipper_location_histories"("shipperId", "recordedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "delivery_proofs_taskId_key" ON "delivery_proofs"("taskId");

-- AddForeignKey
ALTER TABLE "delivery_tasks" ADD CONSTRAINT "delivery_tasks_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "shippers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_task_status_histories" ADD CONSTRAINT "delivery_task_status_histories_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "delivery_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipper_location_histories" ADD CONSTRAINT "shipper_location_histories_shipperId_fkey" FOREIGN KEY ("shipperId") REFERENCES "shippers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_proofs" ADD CONSTRAINT "delivery_proofs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "delivery_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
