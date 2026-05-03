import type {
  ReservationApiModel,
  PaginatedReservationsResponse,
  ListReservationsRequest,
  CreateReservationRequest,
  UpdateReservationStatusRequest,
} from "@/types/api";
import { httpService } from "../http/http-client";

const RESERVATION_ENDPOINT = "/dinein/reservations";

export const reservationApi = {
  list(
    query?: ListReservationsRequest,
  ): Promise<PaginatedReservationsResponse> {
    return httpService.get<PaginatedReservationsResponse>(
      RESERVATION_ENDPOINT,
      { params: query },
    );
  },

  getById(id: string): Promise<ReservationApiModel> {
    return httpService.get<ReservationApiModel>(
      `${RESERVATION_ENDPOINT}/${id}`,
    );
  },

  create(payload: CreateReservationRequest): Promise<ReservationApiModel> {
    return httpService.post<ReservationApiModel, CreateReservationRequest>(
      RESERVATION_ENDPOINT,
      payload,
    );
  },

  updateStatus(
    id: string,
    payload: UpdateReservationStatusRequest,
  ): Promise<ReservationApiModel> {
    return httpService.patch<
      ReservationApiModel,
      UpdateReservationStatusRequest
    >(`${RESERVATION_ENDPOINT}/${id}/status`, payload);
  },
};
