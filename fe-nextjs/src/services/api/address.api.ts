import type {
  AddressApiModel,
  CreateAddressRequest,
  DeleteAddressResponse,
  ListAddressesRequest,
  PaginatedAddressesResponse,
  SetDefaultAddressRequest,
  SetDefaultAddressResponse,
  UpdateAddressRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const ADDRESS_ENDPOINT = "/addresses";

export const addressApi = {
  list(query?: ListAddressesRequest): Promise<PaginatedAddressesResponse> {
    return httpService.get<PaginatedAddressesResponse>(ADDRESS_ENDPOINT, {
      params: query,
    });
  },

  getById(id: string): Promise<AddressApiModel> {
    return httpService.get<AddressApiModel>(`${ADDRESS_ENDPOINT}/${id}`);
  },

  create(payload: CreateAddressRequest): Promise<AddressApiModel> {
    return httpService.post<AddressApiModel, CreateAddressRequest>(
      ADDRESS_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateAddressRequest): Promise<AddressApiModel> {
    return httpService.patch<AddressApiModel, UpdateAddressRequest>(
      `${ADDRESS_ENDPOINT}/${id}`,
      payload,
    );
  },

  setDefault(
    id: string,
    payload: SetDefaultAddressRequest = { isDefault: true },
  ): Promise<SetDefaultAddressResponse> {
    return httpService.patch<SetDefaultAddressResponse, SetDefaultAddressRequest>(
      `${ADDRESS_ENDPOINT}/${id}/default`,
      payload,
    );
  },

  delete(id: string): Promise<DeleteAddressResponse> {
    return httpService.delete<DeleteAddressResponse>(`${ADDRESS_ENDPOINT}/${id}`);
  },
};
