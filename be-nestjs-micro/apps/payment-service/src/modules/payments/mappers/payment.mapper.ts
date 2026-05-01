import type { PaymentResult } from '@app/contracts/payment/results/payment.result';
import type { PaymentTransactionResult } from '@app/contracts/payment/results/payment-transaction.result';
import { Payment, PaymentTransaction, Prisma } from 'generated/payment';

type PaymentWithTransactions = Payment & {
  transactions?: PaymentTransaction[];
};

function jsonToRecord(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function mapPaymentTransactionToResult(
  transaction: PaymentTransaction,
): PaymentTransactionResult {
  return {
    id: transaction.id,
    paymentId: transaction.paymentId,

    type: transaction.type as PaymentTransactionResult['type'],
    status: transaction.status as PaymentTransactionResult['status'],

    amount: transaction.amount?.toString() ?? null,
    currency: transaction.currency,

    gateway: transaction.gateway,
    gatewayTransactionId: transaction.gatewayTransactionId,
    gatewayReference: transaction.gatewayReference,

    requestPayload: jsonToRecord(transaction.requestPayload),
    responsePayload: jsonToRecord(transaction.responsePayload),
    rawPayload: jsonToRecord(transaction.rawPayload),

    errorCode: transaction.errorCode,
    errorMessage: transaction.errorMessage,

    processedAt: transaction.processedAt,

    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

export function mapPaymentToResult(payment: PaymentWithTransactions): PaymentResult {
  return {
    id: payment.id,

    orderId: payment.orderId,
    orderCode: payment.orderCode,

    method: payment.method as PaymentResult['method'],
    status: payment.status as PaymentResult['status'],

    amount: payment.amount.toString(),
    currency: payment.currency,

    gateway: payment.gateway,
    gatewayPaymentId: payment.gatewayPaymentId,
    gatewayReference: payment.gatewayReference,

    paymentUrl: payment.paymentUrl,
    qrCodeUrl: payment.qrCodeUrl,
    checkoutUrl: payment.checkoutUrl,

    description: payment.description,
    metadata: jsonToRecord(payment.metadata),

    paidAt: payment.paidAt,
    failedAt: payment.failedAt,
    canceledAt: payment.canceledAt,
    expiredAt: payment.expiredAt,
    refundedAt: payment.refundedAt,

    expiresAt: payment.expiresAt,

    transactions: payment.transactions?.map(mapPaymentTransactionToResult),

    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}
