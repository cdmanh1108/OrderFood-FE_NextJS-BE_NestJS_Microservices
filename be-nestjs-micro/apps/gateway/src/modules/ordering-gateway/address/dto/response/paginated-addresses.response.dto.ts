import { AddressResponseDto } from './address.response.dto';

export class PaginatedAddressesResponseDto {
  items!: AddressResponseDto[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
