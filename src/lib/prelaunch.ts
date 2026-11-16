/** Pre-launch gate rules. The passcode is checked by the server; this device only remembers that it passed. */
export const ACCESS_KEY = 'zodaci_access_granted';
/** Paths that stay open while the gate is on, so admins can sign in and visitors can read the legal pages. */
export const GATE_OPEN_PATHS = ['/auth', '/access', '/welcome', '/coming-soon', '/privacy', '/terms', '/newsletter/confirm', '/reset-password', '/index'];

export function isWaitlistPath(path: string): boolean {
  return path === '/' || path === '/coming-soon' || path === '/access';
}

export function pathBypassesGate(path: string): boolean {
  return GATE_OPEN_PATHS.some(p => path === p || path.startsWith(p + '/'));
}

export function hasDeviceAccess(): boolean {
  try { return localStorage.getItem(ACCESS_KEY) === '1'; } catch { return false; }
}

export function grantDeviceAccess() {
  try { localStorage.setItem(ACCESS_KEY, '1'); } catch { /* private mode */ }
}

export type GateState = 'checking' | 'open' | 'gated';
/** What the gate shows for a path: the real site, the waitlist, a redirect home, or a blank check. */
export function gateView(path: string, state: GateState): 'site' | 'waitlist' | 'home' | 'checking' {
  if (path === '/coming-soon') return 'waitlist';
  if (state === 'open') return path === '/access' ? 'home' : 'site';
  if (pathBypassesGate(path) && !isWaitlistPath(path)) return 'site';
  return state === 'checking' ? 'checking' : 'waitlist';
}
