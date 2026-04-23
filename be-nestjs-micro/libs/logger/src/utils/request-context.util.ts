import { randomUUID } from 'crypto';

export function getOrCreateRequestId(value?: string | string[]): string {
  if (Array.isArray(value)) {
    return value[0] ?? randomUUID();
  }

  return value?.trim() ? value : randomUUID();
}
