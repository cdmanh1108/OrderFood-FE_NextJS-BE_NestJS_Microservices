export interface UploadUrlResult {
  key: string;
  bucket: string;
  region: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}
