export interface JwtPayload {
  sub?: string;
  role?: string;
  email?: string;
  iat?: number;
  exp?: number;
}

function decodeBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (base64.length % 4)) % 4;
  const padded = `${base64}${"=".repeat(padLength)}`;

  return Buffer.from(padded, "base64").toString("utf8");
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

export function isExpired(payload: JwtPayload): boolean {
  if (!payload.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}

