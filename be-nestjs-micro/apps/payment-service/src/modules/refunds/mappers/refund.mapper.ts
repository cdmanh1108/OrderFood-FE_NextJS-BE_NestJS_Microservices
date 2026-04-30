export function mapRefundToResult(refund: any) {
  return {
    id: refund.id,
    paymentId: refund.paymentId,

    amount: refund.amount.toString(),
    currency: refund.currency,
    status: refund.status,

    reason: refund.reason,

    gateway: refund.gateway,
    gatewayRefundId: refund.gatewayRefundId,
    gatewayReference: refund.gatewayReference,

    requestPayload: refund.requestPayload,
    responsePayload: refund.responsePayload,

    requestedBy: refund.requestedBy,

    refundedAt: refund.refundedAt,
    failedAt: refund.failedAt,

    errorCode: refund.errorCode,
    errorMessage: refund.errorMessage,

    createdAt: refund.createdAt,
    updatedAt: refund.updatedAt,
  };
}
