/** Pre-launch gate rules. The passcode is checked by the server; this device only remembers that it passed. */
export const ACCESS_KEY = 'zodaci_access_granted';
/** Paths that stay open while the gate is on, so admins can sign in and visitors can read the legal pages. */
export const GATE_OPEN_PATHS = ['/auth', '/access', '/welcome', '/coming-soon', '/privacy', '/terms', '/newsletter/confirm', '/reset-password', '/index'];

export function pathBypassesGate(path: string): boolean {
  return GATE_OPEN_PATHS.some(p => path === p || path.startsWith(p + '/'));
}

export function hasDeviceAccess(): boolean {
  try { return localStorage.getItem(ACCESS_KEY) === '1'; } catch { return false; }
}

export function grantDeviceAccess() {
  try { localStorage.setItem(ACCESS_KEY, '1'); } catch { /* private mode */ }
}
