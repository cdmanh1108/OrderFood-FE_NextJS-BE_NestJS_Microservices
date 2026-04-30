export function mapWebhookLogToResult(log: any) {
  return {
    id: log.id,
    paymentId: log.paymentId,

    gateway: log.gateway,
    eventType: log.eventType,
    eventId: log.eventId,

    status: log.status,

    headers: log.headers,
    payload: log.payload,
    signature: log.signature,

    processedAt: log.processedAt,
    errorMessage: log.errorMessage,

    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}
