import { TableStatus } from '../../enums/table-status.enum';

export interface ListTablesQuery {
  status?: TableStatus;
  page?: number;
  limit?: number;
}
