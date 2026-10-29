import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACCESS_CHANGED_EVENT, type Edition } from '@/lib/protectedContent';
import { onAccountChange } from '@/lib/authEvents';

export type EditionShare = { id: string; recipient_email: string; recipient_name: string; scope: 'edition' | 'chapter'; chapter_id: string; chapter_title: string; created_at: string };
export type SharedWithMe = { id: string; edition: Edition; owner_name: string; scope: 'edition' | 'chapter'; chapter_id: string; chapter_title: string; created_at: string };
export type ShareTarget = { email: string; display_name: string };

export const EDITION_OWNER_NAME: Record<Edition, string> = { april: 'April', shane: 'Shane', zac: 'Zac' };

/** Where a shared item opens. April's chapters open in the standalone reader so her private edition never needs to load. */
export function sharedHref(s: Pick<SharedWithMe, 'edition' | 'scope' | 'chapter_id'>): string {
  if (s.scope === 'chapter') {
    if (s.edition === 'april') return `/read/${s.chapter_id}`;
    return `/${s.edition}/${s.chapter_id}`;
  }
  if (s.edition === 'april') return '/april';
  return `/${s.edition}`;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const validShareEmail = (v: string) => EMAIL.test(v.trim()) && v.trim().length <= 254;

const announce = () => window.dispatchEvent(new Event(ACCESS_CHANGED_EVENT));

/** Readable message for the share/revoke functions' errors. */
function shareError(message: string) {
  if (/own edition|only the owner/i.test(message)) return 'Only the edition’s owner can share or stop sharing it.';
  if (/yourself/i.test(message)) return 'That’s your own account — you already have the whole edition.';
  if (/email/i.test(message)) return 'Enter a full email address, like name@example.com.';
  if (/chapter/i.test(message)) return 'That chapter couldn’t be found in this edition.';
  return 'Sharing couldn’t be saved. Check your connection and try again.';
}

export async function shareEdition(edition: Edition, email: string, chapter?: { id: string; title: string }) {
  const { error } = await supabase.rpc('share_edition', { _edition: edition, _email: email.trim().toLowerCase(), _scope: chapter ? 'chapter' : 'edition', _chapter_id: chapter?.id ?? '', _chapter_title: chapter?.title ?? '' });
  if (error) throw new Error(shareError(error.message));
  announce();
}

export async function revokeShare(id: string) {
  const { error } = await supabase.rpc('revoke_edition_share', { _id: id });
  if (error) throw new Error(shareError(error.message));
  announce();
}

/** The owner's view of who can read their edition (whole book and single chapters). */
export function useMyEditionShares(edition: Edition, enabled: boolean) {
  const [shares, setShares] = useState<EditionShare[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!enabled) { setShares(null); return; }
    let on = true;
    setError('');
    void supabase.rpc('my_edition_shares', { _edition: edition }).then(({ data, error: e }) => {
      if (!on) return;
      if (e) { setError('Your sharing list couldn’t load.'); setShares([]); return; }
      setShares((data ?? []) as EditionShare[]);
    });
    return () => { on = false; };
  }, [edition, enabled, attempt]);
  useEffect(() => {
    const reload = () => setAttempt(a => a + 1);
    window.addEventListener(ACCESS_CHANGED_EVENT, reload);
    const stop = onAccountChange(reload);
    return () => { window.removeEventListener(ACCESS_CHANGED_EVENT, reload); stop(); };
  }, []);
  return { shares, error, reload: useCallback(() => setAttempt(a => a + 1), []) };
}

/** Everything other people have shared with the signed-in account. */
export function useSharedWithMe() {
  const [items, setItems] = useState<SharedWithMe[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true;
    setError('');
    void supabase.rpc('shared_with_me').then(({ data, error: e }) => {
      if (!on) return;
      if (e) { setError('What’s been shared with you couldn’t load.'); setItems([]); return; }
      setItems((data ?? []) as SharedWithMe[]);
    });
    return () => { on = false; };
  }, [attempt]);
  useEffect(() => {
    const reload = () => { setItems(null); setAttempt(a => a + 1); };
    window.addEventListener(ACCESS_CHANGED_EVENT, reload);
    const stop = onAccountChange(reload);
    return () => { window.removeEventListener(ACCESS_CHANGED_EVENT, reload); stop(); };
  }, []);
  return { items, error, retry: useCallback(() => setAttempt(a => a + 1), []) };
}

/** People the owner can pick in one tap (the other edition owners); any other email can be typed. */
export function useShareTargets(enabled: boolean) {
  const [targets, setTargets] = useState<ShareTarget[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let on = true;
    void supabase.rpc('edition_share_targets').then(({ data }) => { if (on) setTargets(((data ?? []) as ShareTarget[]).filter(t => t.email)); });
    return () => { on = false; };
  }, [enabled]);
  return targets;
}

/** Whether the signed-in account owns this edition (decided by the database). */
export function useOwnsEdition(edition: Edition) {
  const [owns, setOwns] = useState<boolean | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true;
    setOwns(undefined);
    void supabase.rpc('owns_official_edition', { _edition: edition }).then(({ data, error }) => { if (on) setOwns(!error && data === true); });
    return () => { on = false; };
  }, [edition, attempt]);
  useEffect(() => onAccountChange(() => setAttempt(a => a + 1)), []);
  return owns;
}
