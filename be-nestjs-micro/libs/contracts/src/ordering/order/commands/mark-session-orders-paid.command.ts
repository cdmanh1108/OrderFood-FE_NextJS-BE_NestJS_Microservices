import { DineInPaymentMethod } from "@app/contracts/dinein/session/commands/close-session.command";

export interface MarkSessionOrdersPaidCommand {
  tableSessionId: string;
  paymentMethod: DineInPaymentMethod;
}
