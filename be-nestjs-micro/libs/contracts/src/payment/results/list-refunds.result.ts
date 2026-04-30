import { RefundResult } from './refund.result';

export class ListRefundsResult {
  items: RefundResult[];
  page: number;
  limit: number;
  total: number;
}