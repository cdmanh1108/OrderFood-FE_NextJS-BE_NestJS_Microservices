import { PaymentResult } from './payment.result';

export class ListPaymentsResult {
  items: PaymentResult[];
  page: number;
  limit: number;
  total: number;
}