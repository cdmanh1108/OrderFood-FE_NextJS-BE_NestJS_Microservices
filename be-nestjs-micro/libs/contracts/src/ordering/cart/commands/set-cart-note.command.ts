export interface SetCartNoteCommand {
  userId: string;
  cartId: string;
  note?: string;
}
