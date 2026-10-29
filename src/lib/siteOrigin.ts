/** The public address of the live site, used when a link will be shared with someone outside this browser. */
export const PUBLIC_SITE = 'https://zodaci.com';

/** Hosts a friend can't open (local builds and editor previews), so shared links fall back to the public site. */
export function isPrivateHost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('id-preview--') || hostname.endsWith('.lovableproject.com');
}

/** The site the visitor is on, unless that address only works for them; then the public site. */
export function shareOrigin(loc: Pick<Location, 'hostname' | 'origin'> | undefined = typeof window !== 'undefined' ? window.location : undefined) {
  if (!loc || isPrivateHost(loc.hostname)) return PUBLIC_SITE;
  return loc.origin;
}
