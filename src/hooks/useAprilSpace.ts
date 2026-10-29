import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearPrivateEdition, hydratePrivateEdition } from '@/lib/privateEditionStore';
import { isShaneAccount } from '@/lib/founderEdition';

/**
 * April's edition opens by account only: April's own account always sees it; anyone she shared her whole edition
 * with (for example Shane) sees it only in a tab where they chose "View April's edition". The server checks access.
 */
let cached: { uid: string; view: string | null; ok: boolean } | null = null;
/** Which shared edition this tab is viewing ('april' | 'zac'), chosen from the edition switch. Presentation only. */
export const ADMIN_EDITION_KEY = 'zodaci-admin-edition';
export type SharedEditionView = 'april' | 'zac';
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edition') === 'april') {
  sessionStorage.setItem(ADMIN_EDITION_KEY, 'april');
}
const readView = (): string | null => (typeof window === 'undefined' ? null : sessionStorage.getItem(ADMIN_EDITION_KEY));
export const viewingSharedEdition = (): SharedEditionView | null => { const v = readView(); return v === 'april' || v === 'zac' ? v : null; };
/** Shane's owner accounts (presentation only — admin rights are checked by the database role). */
export const isAdminEmail = (email?: string | null) => isShaneAccount(email);
export function openAprilEditionTab() { window.open(`${window.location.origin}/?edition=april`, '_blank', 'noopener'); }
export function viewAprilEditionInApp() { sessionStorage.setItem(ADMIN_EDITION_KEY, 'april'); window.location.href = '/'; }
/** Open Zac's edition in this tab (the server still checks that Zac shared it with this account). */
export function viewZacEditionInApp() { sessionStorage.setItem(ADMIN_EDITION_KEY, 'zac'); window.location.href = '/zac'; }
export const viewingZacAsAdmin = (_email?: string | null) => viewingSharedEdition() === 'zac';
export function leaveAprilEdition() { sessionStorage.removeItem(ADMIN_EDITION_KEY); window.location.href = '/'; }
const listeners = new Set<(v: boolean | undefined) => void>();

let revision = 0;
/** The account the current check is for; auth events for the same account (token refresh, tab focus) never reset the app. */
let checkingUid: string | null = null;
/** True when an approved account's private edition failed to open (network, download or unpack), so the UI can offer a retry instead of silently showing the member view. */
let loadFailed = false;
const errorListeners = new Set<(v: boolean) => void>();
const setFailed = (v: boolean) => { loadFailed = v; errorListeners.forEach(l => l(v)); };
export function retryAprilSpace() { cached = null; checkingUid = null; setFailed(false); void check(); }
export function useAprilSpaceError() {
  const [v, setV] = useState(loadFailed);
  useEffect(() => { errorListeners.add(setV); return () => { errorListeners.delete(setV); }; }, []);
  return v;
}
async function check() {
  const version = ++revision;
  const valid = () => version === revision;
  try {
    const { data } = await supabase.auth.getSession();
    if (!valid()) return;
    const uid = data.session?.user.id;
    if (!uid) { cached = null; checkingUid = null; clearPrivateEdition(); listeners.forEach(l => l(false)); return; }
    const view = readView();
    if (cached?.uid === uid && cached.view === view) { listeners.forEach(l => l(cached?.ok ?? false)); return; }
    checkingUid = uid;
    clearPrivateEdition();
    listeners.forEach(l => l(undefined));
    const [own, open] = await Promise.all([
      supabase.rpc('owns_official_edition', { _edition: 'april' }),
      supabase.rpc('can_open_edition', { _edition: 'april' }),
    ]);
    if (!valid()) return;
    // A shared reader (not the owner) sees April's edition only after choosing it for this tab.
    const ok = !open.error && open.data === true && ((!own.error && own.data === true) || view === 'april');
    if (ok) {
      const response = await supabase.functions.invoke('private-edition', { body: {} });
      if (response.error || typeof response.data?.url !== 'string') throw new Error('Private edition unavailable');
      const download = await fetch(response.data.url, { signal: AbortSignal.timeout(20000) });
      if (!download.ok) throw new Error('Private edition download failed');
      const blob = await download.blob();
      const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
      const edition = JSON.parse(await new Response(stream).text());
      const current = await supabase.auth.getSession();
      if (!valid() || current.data.session?.user.id !== uid) return;
      hydratePrivateEdition(edition);
    }
    if (!valid()) return;
    setFailed(false);
    cached = { uid, view, ok };
    listeners.forEach(l => l(ok));
  } catch {
    if (!valid()) return;
    cached = null;
    checkingUid = null;
    clearPrivateEdition();
    setFailed(true);
    listeners.forEach(l => l(false));
  }
}

/** Auth events that keep the same account signed in must not tear down the app or reload private data. */
export function isSameAccountEvent(event: string, nextUid: string | null, currentUid: string | null) {
  if (event === 'SIGNED_OUT' || !nextUid) return false;
  return nextUid === currentUid && (event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'MFA_CHALLENGE_VERIFIED');
}

supabase.auth.onAuthStateChange((event, session) => {
  const nextUid = session?.user.id ?? null;
  if (isSameAccountEvent(event, nextUid, cached?.uid ?? checkingUid)) return;
  revision++;
  setFailed(false);
  cached = null;
  checkingUid = null;
  clearPrivateEdition();
  listeners.forEach(l => l(nextUid ? undefined : false));
  setTimeout(() => void check(), 0);
});

/** undefined while checking; true only when April's original edition is open in this tab (her account, or someone she shared it with who chose to view it). */
export function useAprilSpace() {
  const [ok, setOk] = useState<boolean | undefined>(cached?.ok);
  useEffect(() => { listeners.add(setOk); check(); return () => { listeners.delete(setOk); }; }, []);
  return ok;
}

/** Founder-only presentation choice: 'classic' shows the standard member layout. Purely visual; access rules are unchanged. */
export const CLASSIC_VIEW_KEY = 'zodaci-classic-view';
const classicListeners = new Set<(v: boolean) => void>();
const readClassic = () => typeof window !== 'undefined' && localStorage.getItem(CLASSIC_VIEW_KEY) === '1';
export function setClassicView(on: boolean) {
  if (on) localStorage.setItem(CLASSIC_VIEW_KEY, '1'); else localStorage.removeItem(CLASSIC_VIEW_KEY);
  classicListeners.forEach(l => l(on));
  window.scrollTo({ top: 0 });
}
export function useClassicView() {
  const [on, setOn] = useState(readClassic);
  useEffect(() => { classicListeners.add(setOn); return () => { classicListeners.delete(setOn); }; }, []);
  return on;
}
