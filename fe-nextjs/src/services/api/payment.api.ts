import { httpService } from "../http/http-client";

export type PaymentMethod =
  | "PAYOS"
  | "MOMO"
  | "VNPAY"
  | "ZALOPAY"
  | "STRIPE"
  | "BANK_TRANSFER"
  | "CASH"
  | "COD";

export interface CreatePaymentRequest {
  orderId: string;
  orderCode?: string;
  method: PaymentMethod;
  amount: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  returnUrl?: string;
  cancelUrl?: string;
  expiresAt?: string;
}

export interface PaymentTransactionModel {
  id: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  gateway: string;
  gatewayTransactionId?: string;
  gatewayReference?: string;
  rawPayload?: unknown;
  errorMessage?: string;
  processedAt?: string;
}

export interface PaymentModel {
  id: string;
  orderId: string;
  orderCode?: string;
  method: string;
  status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "EXPIRED" | "REFUNDED";
  amount: string;
  currency: string;
  gateway?: string;
  gatewayPaymentId?: string;
  paymentUrl?: string;
  checkoutUrl?: string;
  gatewayReference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  paidAt?: string;
  failedAt?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  transactions?: PaymentTransactionModel[];
}

const PAYMENT_ENDPOINT = "/payments";

export const paymentApi = {
  create(payload: CreatePaymentRequest): Promise<PaymentModel> {
    return httpService.post<PaymentModel, CreatePaymentRequest>(
      PAYMENT_ENDPOINT,
      payload,
    );
  },

  getByOrderId(orderId: string): Promise<PaymentModel> {
    return httpService.get<PaymentModel>(`${PAYMENT_ENDPOINT}/order/${orderId}`);
  },

  getById(id: string): Promise<PaymentModel> {
    return httpService.get<PaymentModel>(`${PAYMENT_ENDPOINT}/${id}`);
  },

  cancel(id: string, reason?: string): Promise<PaymentModel> {
    return httpService.post<PaymentModel>(`${PAYMENT_ENDPOINT}/${id}/cancel`, {
      reason,
    });
  },
};
