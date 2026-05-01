import type { PaymentWebhookLogResult } from '@app/contracts/payment/results/payment-webhook-log.result';
import { PaymentWebhookLog, Prisma } from 'generated/payment';

function jsonToRecord(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function jsonToRequiredRecord(
  value: Prisma.JsonValue,
): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export function mapWebhookLogToResult(log: PaymentWebhookLog): PaymentWebhookLogResult {
  return {
    id: log.id,
    paymentId: log.paymentId,

    gateway: log.gateway,
    eventType: log.eventType,
    eventId: log.eventId,

    status: log.status as PaymentWebhookLogResult['status'],

    headers: jsonToRecord(log.headers),
    payload: jsonToRequiredRecord(log.payload),
    signature: log.signature,

    processedAt: log.processedAt,
    errorMessage: log.errorMessage,

    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}
