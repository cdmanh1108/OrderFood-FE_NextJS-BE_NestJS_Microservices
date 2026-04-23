import type { CreateUploadUrlRequest, UploadUrlResponse } from "@/types/api";
import { httpService } from "../http/http-client";

const MEDIA_ENDPOINT = "/media";

export const mediaApi = {
  createUploadUrl(payload: CreateUploadUrlRequest): Promise<UploadUrlResponse> {
    return httpService.post<UploadUrlResponse, CreateUploadUrlRequest>(
      `${MEDIA_ENDPOINT}/upload-url`,
      payload,
    );
  },
};
