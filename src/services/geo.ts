export function isPrivateIp(ip: string | undefined): boolean {
  if (!ip) return true;
  if (ip === '::1') return true;
  if (/^127\./.test(ip)) return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  const m = ip.match(/^172\.(\d+)\./);
  if (m && parseInt(m[1], 10) >= 16 && parseInt(m[1], 10) <= 31) return true;
  return false;
}

export async function lookupCity(ip: string): Promise<string> {
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return 'unknown';
    const data = (await response.json()) as { status: string; city?: string };
    if (data.status !== 'success') return 'unknown';
    return data.city ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
