export interface RecordLocationCommand {
  shipperId: string;
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface GetCurrentLocationQuery {
  shipperId: string;
}

export interface GetLocationHistoryQuery {
  shipperId: string;
  limit?: number;
}
