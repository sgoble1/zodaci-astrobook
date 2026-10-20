/** Return links stay on this application, never an external or malformed URL. */
export function internalDestination(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/.test(value)) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith('//') || /[\\\u0000-\u0020]/.test(decoded)) return fallback;
    const url = new URL(value, 'https://zodaci.invalid');
    return url.origin === 'https://zodaci.invalid' ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch { return fallback; }
}