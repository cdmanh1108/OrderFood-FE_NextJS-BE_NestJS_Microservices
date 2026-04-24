import { AddressDetailResult } from './address-detail.result';

export interface PaginatedAddressesResult {
  items: AddressDetailResult[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}
