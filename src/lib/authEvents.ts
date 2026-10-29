import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

/** Identity of a session for change detection: a token refresh keeps the same account, so it isn't a change. */
export const accountKey = (session: Session | null | undefined) => (session?.user ? `${session.user.id}|${(session.user.email ?? '').toLowerCase()}` : '');

/**
 * True when an auth event means a different account (or nobody) is now signed in. Routine events for the same
 * account — hourly token refresh, returning to the tab, the initial session — return false, so pages keep their
 * state, half-typed text and open dialogs.
 */
export function isAccountChange(event: AuthChangeEvent, previousKey: string | undefined, nextKey: string) {
  if (previousKey === undefined) return false;
  if (event === 'SIGNED_OUT') return previousKey !== '';
  return previousKey !== nextKey;
}

/** Subscribe to real account changes only (sign in as someone else, sign out, email change). Returns an unsubscribe. */
export function onAccountChange(cb: (session: Session | null, event: AuthChangeEvent) => void): () => void {
  let last: string | undefined;
  void supabase.auth.getSession().then(({ data }) => { if (last === undefined) last = accountKey(data.session); });
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    const next = accountKey(session);
    const changed = isAccountChange(event, last, next);
    last = next;
    if (changed) cb(session, event);
  });
  return () => data.subscription.unsubscribe();
}
