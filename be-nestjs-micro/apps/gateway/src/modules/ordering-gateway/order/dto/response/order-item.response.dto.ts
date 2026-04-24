export class OrderItemResponseDto {
  id!: string;
  menuItemId!: string;
  menuItemName!: string;
  menuItemImageUrl!: string | null;
  unitPrice!: number;
  quantity!: number;
  lineTotal!: number;
  note!: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
