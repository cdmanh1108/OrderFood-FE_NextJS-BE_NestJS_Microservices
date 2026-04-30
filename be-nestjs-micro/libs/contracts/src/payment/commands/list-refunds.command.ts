import { RefundStatus } from '../enums/refund-status.enum';

export class ListRefundsCommand {
  page?: number;
  limit?: number;

  paymentId?: string;
  status?: RefundStatus;
  gateway?: string;
  requestedBy?: string;
}