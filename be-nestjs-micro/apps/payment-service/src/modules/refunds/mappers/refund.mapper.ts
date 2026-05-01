import type { RefundResult } from '@app/contracts/payment/results/refund.result';
import { Prisma, Refund } from 'generated/payment';

function jsonToRecord(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function mapRefundToResult(refund: Refund): RefundResult {
  return {
    id: refund.id,
    paymentId: refund.paymentId,

    amount: refund.amount.toString(),
    currency: refund.currency,
    status: refund.status as RefundResult['status'],

    reason: refund.reason,

    gateway: refund.gateway,
    gatewayRefundId: refund.gatewayRefundId,
    gatewayReference: refund.gatewayReference,

    requestPayload: jsonToRecord(refund.requestPayload),
    responsePayload: jsonToRecord(refund.responsePayload),

    requestedBy: refund.requestedBy,

    refundedAt: refund.refundedAt,
    failedAt: refund.failedAt,

    errorCode: refund.errorCode,
    errorMessage: refund.errorMessage,

    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  };
}
