const SENSITIVE_KEYS = [
  'password',
  'accesstoken',
  'refreshtoken',
  'token',
  'secret',
  'oldpassword',
  'newpassword',
  'code'
];

export function maskSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const maskedObj: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      maskedObj[key] = '***';
    } else {
      maskedObj[key] = maskSensitiveData(value);
    }
  }

  return maskedObj;
}
