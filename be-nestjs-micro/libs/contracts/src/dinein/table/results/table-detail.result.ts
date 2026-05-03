import { TableStatus } from '../../enums/table-status.enum';

export interface TableDetailResult {
  id: string;
  number: string;
  seats: number;
  status: TableStatus;
  note: string | null;
  qrCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}
