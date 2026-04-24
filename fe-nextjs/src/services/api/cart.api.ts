import type {
  AddCartItemRequest,
  CartApiModel,
  ClearCartRequest,
  ClearCartResponse,
  GetActiveCartRequest,
  RemoveCartItemRequest,
  RemoveCartItemResponse,
  SetCartAddressRequest,
  SetCartAddressResponse,
  SetCartNoteRequest,
  SetCartNoteResponse,
  UpdateCartItemRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const CART_ENDPOINT = "/carts";

export const cartApi = {
  getActive(query: GetActiveCartRequest): Promise<CartApiModel> {
    return httpService.get<CartApiModel>(`${CART_ENDPOINT}/active`, {
      params: query,
    });
  },

  addItem(payload: AddCartItemRequest): Promise<CartApiModel> {
    return httpService.post<CartApiModel, AddCartItemRequest>(
      `${CART_ENDPOINT}/items`,
      payload,
    );
  },

  updateItem(payload: UpdateCartItemRequest): Promise<CartApiModel> {
    return httpService.patch<CartApiModel, UpdateCartItemRequest>(
      `${CART_ENDPOINT}/items`,
      payload,
    );
  },

  removeItem(payload: RemoveCartItemRequest): Promise<RemoveCartItemResponse> {
    return httpService.delete<RemoveCartItemResponse>(
      `${CART_ENDPOINT}/items`,
      {
        data: payload,
      },
    );
  },

  setAddress(payload: SetCartAddressRequest): Promise<SetCartAddressResponse> {
    return httpService.patch<SetCartAddressResponse, SetCartAddressRequest>(
      `${CART_ENDPOINT}/address`,
      payload,
    );
  },

  setNote(payload: SetCartNoteRequest): Promise<SetCartNoteResponse> {
    return httpService.patch<SetCartNoteResponse, SetCartNoteRequest>(
      `${CART_ENDPOINT}/note`,
      payload,
    );
  },

  clear(payload: ClearCartRequest): Promise<ClearCartResponse> {
    return httpService.post<ClearCartResponse, ClearCartRequest>(
      `${CART_ENDPOINT}/clear`,
      payload,
    );
  },
};
