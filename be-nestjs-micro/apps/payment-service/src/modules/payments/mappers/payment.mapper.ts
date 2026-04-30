export function mapPaymentTransactionToResult(transaction: any) {
  return {
    id: transaction.id,
    paymentId: transaction.paymentId,

    type: transaction.type,
    status: transaction.status,

    amount: transaction.amount?.toString() ?? null,
    currency: transaction.currency,

    gateway: transaction.gateway,
    gatewayTransactionId: transaction.gatewayTransactionId,
    gatewayReference: transaction.gatewayReference,

    requestPayload: transaction.requestPayload,
    responsePayload: transaction.responsePayload,
    rawPayload: transaction.rawPayload,

    errorCode: transaction.errorCode,
    errorMessage: transaction.errorMessage,

    processedAt: transaction.processedAt,

    createdAt: transaction.createdAt,
    updatedAt: transaction.updatedAt,
  };
}

export function mapPaymentToResult(payment: any) {
  return {
    id: payment.id,

    orderId: payment.orderId,
    orderCode: payment.orderCode,

    method: payment.method,
    status: payment.status,

    amount: payment.amount.toString(),
    currency: payment.currency,

    gateway: payment.gateway,
    gatewayPaymentId: payment.gatewayPaymentId,
    gatewayReference: payment.gatewayReference,

    paymentUrl: payment.paymentUrl,
    qrCodeUrl: payment.qrCodeUrl,
    checkoutUrl: payment.checkoutUrl,

    description: payment.description,
    metadata: payment.metadata,

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
