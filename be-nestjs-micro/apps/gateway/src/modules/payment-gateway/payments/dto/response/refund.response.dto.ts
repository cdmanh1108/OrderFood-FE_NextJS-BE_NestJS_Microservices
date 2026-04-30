import { RefundStatus } from "@app/contracts/payment/enums/refund-status.enum";

export class RefundResponseDto {
  id: string;
  paymentId: string;

  amount: string;
  currency: string;
  status: RefundStatus;

  reason?: string | null;

  gateway?: string | null;
  gatewayRefundId?: string | null;
  gatewayReference?: string | null;

  requestPayload?: Record<string, any> | null;
  responsePayload?: Record<string, any> | null;

  requestedBy?: string | null;

  refundedAt?: Date | null;
  failedAt?: Date | null;

  errorCode?: string | null;
  errorMessage?: string | null;

  createdAt: Date;
  updatedAt: Date;
}