import { TableStatus } from '../../enums/table-status.enum';

export interface UpdateTableCommand {
  id: string;
  number?: string;
  seats?: number;
  status?: TableStatus;
  note?: string;
  qrCode?: string;
}
