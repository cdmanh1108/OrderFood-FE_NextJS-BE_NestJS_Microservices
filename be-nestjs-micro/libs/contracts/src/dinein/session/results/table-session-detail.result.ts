import { TableSessionStatus } from '../../enums/table-session-status.enum';
import type { TableDetailResult } from '../../table/results/table-detail.result';
import type { DineInPaymentMethod } from '../commands/close-session.command';

export interface TableSessionDetailResult {
  id: string;
  tableId: string;
  table: TableDetailResult;
  status: TableSessionStatus;
  paymentMethod: DineInPaymentMethod | null;
  openedAt: Date;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
