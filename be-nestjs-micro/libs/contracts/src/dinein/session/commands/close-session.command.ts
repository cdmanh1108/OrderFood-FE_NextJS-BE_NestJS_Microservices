export type DineInPaymentMethod = 'CASH' | 'BANK_TRANSFER';

export interface CloseSessionCommand {
  id: string;
  paymentMethod: DineInPaymentMethod;
}
