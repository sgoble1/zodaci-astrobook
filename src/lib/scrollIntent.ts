export type NavKind = 'POP' | 'PUSH' | 'REPLACE';
export type Place = { pathname: string; search: string; hash: string };
export type ScrollIntent =
  | { kind: 'none' }
  | { kind: 'top' }
  | { kind: 'section'; id: string; smooth: boolean }
  | { kind: 'restore' };

/**
 * Where a page should open after navigation:
 * - a link to another page opens at the top, or at its #section when the link names one;
 * - Back/Forward returns to where the visitor was on that page;
 * - filters and sorting that only change the query string (e.g. the shop) keep the current position;
 * - a #section link on the same page glides to that section.
 */
export function scrollIntent(prev: Place | null, next: Place, nav: NavKind): ScrollIntent {
  const id = next.hash ? safeDecode(next.hash.slice(1)) : '';
  if (!prev) return id ? { kind: 'section', id, smooth: false } : { kind: 'none' };
  if (nav === 'POP') return { kind: 'restore' };
  const samePage = prev.pathname === next.pathname;
  if (samePage) {
    if (id && next.hash !== prev.hash) return { kind: 'section', id, smooth: true };
    return { kind: 'none' };
  }
  return id ? { kind: 'section', id, smooth: false } : { kind: 'top' };
}

function safeDecode(s: string) {
  try { return decodeURIComponent(s); } catch { return s; }
}
