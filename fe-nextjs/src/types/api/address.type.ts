export interface AddressApiModel {
  id: string;
  userId: string;
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street: string | null;
  detail: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListAddressesRequest {
  page?: number;
  limit?: number;
}

export interface PaginatedAddressesResponse {
  items: AddressApiModel[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
}

export interface CreateAddressRequest {
  receiverName: string;
  receiverPhone: string;
  province: string;
  district: string;
  ward: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequest {
  receiverName?: string;
  receiverPhone?: string;
  province?: string;
  district?: string;
  ward?: string;
  street?: string;
  detail?: string;
  latitude?: number;
  longitude?: number;
}

export interface SetDefaultAddressRequest {
  isDefault?: boolean;
}

export interface SetDefaultAddressResponse {
  id: string;
  userId: string;
  isDefault: boolean;
}

export interface DeleteAddressResponse {
  id: string;
  deleted: boolean;
}
