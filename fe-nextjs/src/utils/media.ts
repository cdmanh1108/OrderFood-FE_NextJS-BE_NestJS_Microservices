import type { ImageContentType } from "@/types/api";
import { SUPPORTED_IMAGE_TYPES } from "@/types/api";

export function isImageContentType(value: string): value is ImageContentType {
  return (SUPPORTED_IMAGE_TYPES as readonly string[]).includes(value);
}

export function resolveImageContentType(
  file: Pick<File, "type" | "name">,
): ImageContentType | null {
  if (isImageContentType(file.type)) {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (lowerName.endsWith(".png")) {
    return "image/png";
  }
  if (lowerName.endsWith(".webp")) {
    return "image/webp";
  }

  return null;
}
