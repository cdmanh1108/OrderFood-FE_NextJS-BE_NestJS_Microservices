import { OrderChannel } from '../../enums/order-channel.enum';
import { OrderSource } from '../../enums/order-source.enum';

export interface GetActiveCartQuery {
  userId?: string;
  channel: OrderChannel;
  source: OrderSource;
  tableId?: string;
  tableSessionId?: string;
  createIfMissing?: boolean;
}
