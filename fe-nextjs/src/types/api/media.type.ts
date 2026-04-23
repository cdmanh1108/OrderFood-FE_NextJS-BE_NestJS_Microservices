export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
] as const;

export type ImageContentType = (typeof SUPPORTED_IMAGE_TYPES)[number];

export interface CreateUploadUrlRequest {
  fileName: string;
  contentType: ImageContentType;
  folder?: string;
}

export interface UploadUrlResponse {
  key: string;
  bucket: string;
  region: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}
