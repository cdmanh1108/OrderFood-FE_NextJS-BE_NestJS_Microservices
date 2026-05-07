import type {
  CreateShipperRequest,
  ListShippersQuery,
  PaginatedShippersResponse,
  ShipperDetailApiModel,
  UpdateShipperRequest,
  ShipperLocationApiModel,
} from "@/types/api";
import { httpService } from "../http/http-client";

const SHIPPERS_ENDPOINT = "/delivery/shippers";

export const deliveryShipperApi = {
  list(query?: ListShippersQuery): Promise<PaginatedShippersResponse> {
    return httpService.get<PaginatedShippersResponse>(SHIPPERS_ENDPOINT, {
      params: query,
    });
  },

  getMyProfile(): Promise<ShipperDetailApiModel> {
    return httpService.get<ShipperDetailApiModel>(`/delivery/me/shipper-profile`);
  },

  getById(id: string): Promise<ShipperDetailApiModel> {
    return httpService.get<ShipperDetailApiModel>(`${SHIPPERS_ENDPOINT}/${id}`);
  },

  create(payload: CreateShipperRequest): Promise<ShipperDetailApiModel> {
    return httpService.post<ShipperDetailApiModel, CreateShipperRequest>(
      SHIPPERS_ENDPOINT,
      payload,
    );
  },

  update(id: string, payload: UpdateShipperRequest): Promise<ShipperDetailApiModel> {
    return httpService.patch<ShipperDetailApiModel, UpdateShipperRequest>(
      `${SHIPPERS_ENDPOINT}/${id}`,
      payload,
    );
  },

  deactivate(id: string): Promise<ShipperDetailApiModel> {
    return httpService.put<ShipperDetailApiModel>(`${SHIPPERS_ENDPOINT}/${id}/deactivate`);
  },

  getLocation(id: string): Promise<ShipperLocationApiModel> {
    return httpService.get<ShipperLocationApiModel>(`${SHIPPERS_ENDPOINT}/${id}/location`);
  },
};
