import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ACCESS_CHANGED_EVENT, type Edition } from '@/lib/protectedContent';
import { onAccountChange } from '@/lib/authEvents';

/** One row of the owner's sharing list, grouped by person (a founder by name, anyone else by email). */
export type EditionShare = { key: string; ids: string[]; recipient: string; recipient_label: string; scope: 'edition' | 'chapter'; area: string | null; chapter_id: string | null; chapter_title: string; created_at: string };
export type SharedWithMe = { key: string; edition: Edition; owner_name: string; scope: 'edition' | 'chapter'; area: string | null; chapter_id: string | null; chapter_title: string; created_at: string };
/** A person the owner can pick by name: `target` is their edition key, so their email is never shown. */
export type ShareTarget = { target: string; display_name: string };

export const EDITION_OWNER_NAME: Record<Edition, string> = { april: 'April', shane: 'Shane', zac: 'Zac' };
/** The protected-content area that holds each edition's chapters. */
export const CHAPTER_AREA: Record<Edition, 'masterbook' | 'shane' | 'zac'> = { april: 'masterbook', shane: 'shane', zac: 'zac' };

/** Where a shared item opens. April's single chapters open in the standalone reader so her full edition never loads. */
export function sharedHref(s: Pick<SharedWithMe, 'edition' | 'scope' | 'chapter_id'>): string {
  if (s.scope === 'chapter' && s.chapter_id) return s.edition === 'april' ? `/read/${s.chapter_id}` : `/${s.edition}/${s.chapter_id}`;
  return s.edition === 'april' ? '/april' : `/${s.edition}`;
}
/** Where the owner opens one of their own chapters. */
export const ownChapterHref = (edition: Edition, chapterId: string) => (edition === 'april' ? `/masterbook/${chapterId}` : `/${edition}/${chapterId}`);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const validShareEmail = (v: string) => EMAIL.test(v.trim()) && v.trim().length <= 254;

const announce = () => window.dispatchEvent(new Event(ACCESS_CHANGED_EVENT));

/** Readable message for the share/revoke functions' errors. */
export function shareError(message: string) {
  if (/only the owner/i.test(message)) return 'Only the edition’s owner can share it or stop sharing it.';
  if (/already your own|already owns|no email on file/i.test(message)) return 'That person already owns this edition, or hasn’t signed up with an email yet.';
  if (/valid email/i.test(message)) return 'Enter a full email address, like name@example.com.';
  if (/not part of this edition/i.test(message)) return 'That chapter isn’t part of this edition.';
  if (/sign in/i.test(message)) return 'Sign in first.';
  return 'Sharing couldn’t be saved. Check your connection and try again.';
}

/** Share the whole edition, or one chapter, with a founder (by edition key) or any email address. */
export async function shareEdition(edition: Edition, target: string, chapter?: { id: string; title: string }) {
  const args: { _edition: string; _target: string; _area?: string; _chapter_id?: string; _chapter_title?: string } = { _edition: edition, _target: target.trim().toLowerCase() };
  if (chapter) Object.assign(args, { _area: CHAPTER_AREA[edition], _chapter_id: chapter.id, _chapter_title: chapter.title.slice(0, 300) });
  const { error } = await supabase.rpc('share_edition', args);
  if (error) throw new Error(shareError(error.message));
  announce();
}

export async function revokeShare(ids: string[]) {
  const { error } = await supabase.rpc('revoke_edition_shares', { _ids: ids });
  if (error) throw new Error(shareError(error.message));
  announce();
}

function useReloadOnAccess(reload: () => void) {
  useEffect(() => {
    window.addEventListener(ACCESS_CHANGED_EVENT, reload);
    const stop = onAccountChange(reload);
    return () => { window.removeEventListener(ACCESS_CHANGED_EVENT, reload); stop(); };
  }, [reload]);
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
      setShares(((data ?? []) as Omit<EditionShare, 'key'>[]).map(r => ({ ...r, key: r.ids.join(',') })));
    });
    return () => { on = false; };
  }, [edition, enabled, attempt]);
  const reload = useCallback(() => setAttempt(a => a + 1), []);
  useReloadOnAccess(reload);
  return { shares, error, reload };
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
      setItems(((data ?? []) as Omit<SharedWithMe, 'key'>[]).map(r => ({ ...r, key: `${r.edition}:${r.scope}:${r.area ?? ''}:${r.chapter_id ?? ''}` })));
    });
    return () => { on = false; };
  }, [attempt]);
  const retry = useCallback(() => setAttempt(a => a + 1), []);
  useReloadOnAccess(retry);
  return { items, error, retry };
}

/** People the owner can pick in one tap (the other edition owners); any other email can be typed. */
export function useShareTargets(edition: Edition, enabled: boolean) {
  const [targets, setTargets] = useState<ShareTarget[]>([]);
  useEffect(() => {
    if (!enabled) return;
    let on = true;
    void supabase.rpc('edition_share_targets', { _edition: edition }).then(({ data }) => { if (on) setTargets((data ?? []) as ShareTarget[]); });
    return () => { on = false; };
  }, [edition, enabled]);
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

/** Whole editions shared with this account (for the edition switch), decided by the database. */
export function useSharedEditions() {
  const { items } = useSharedWithMe();
  return useMemo(() => (items ?? []).filter(i => i.scope === 'edition').map(i => i.edition), [items]);
}

/** Whether this account may read the whole edition (owner, or shared the whole book). Chapter-only readers get false. */
export function useWholeEditionAccess(edition: Edition) {
  const [full, setFull] = useState<boolean | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let on = true;
    void supabase.rpc('can_open_edition', { _edition: edition }).then(({ data, error }) => { if (on) setFull(!error && data === true); });
    return () => { on = false; };
  }, [edition, attempt]);
  const reload = useCallback(() => setAttempt(a => a + 1), []);
  useReloadOnAccess(reload);
  return full;
}
