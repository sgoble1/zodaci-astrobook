import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearPrivateEdition, hydratePrivateEdition } from '@/lib/privateEditionStore';
import { originalAprilView } from '@/lib/founderEdition';

let cached: { uid: string; ok: boolean } | null = null;
export const ADMIN_EDITION_KEY = 'zodaci-admin-edition';
const ADMIN_EMAIL = 'shanegoble@gmail.com';
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edition') === 'april') {
  sessionStorage.setItem(ADMIN_EDITION_KEY, 'april');
}
/** The admin sees his own edition by default; April's edition only in a tab he opened for it. */
const adminWantsOwn = (email?: string) => !originalAprilView(email, sessionStorage.getItem(ADMIN_EDITION_KEY));
export const isAdminEmail = (email?: string | null) => email?.toLowerCase() === ADMIN_EMAIL;
export function openAprilEditionTab() { window.open(`${window.location.origin}/?edition=april`, '_blank', 'noopener'); }
export function viewAprilEditionInApp() { sessionStorage.setItem(ADMIN_EDITION_KEY, 'april'); window.location.href = '/'; }
/** Admin only: preview Zac's full edition in this tab (the server still checks every chapter). */
export function viewZacEditionInApp() { sessionStorage.setItem(ADMIN_EDITION_KEY, 'zac'); window.location.href = '/zac'; }
export const viewingZacAsAdmin = (email?: string | null) => isAdminEmail(email) && sessionStorage.getItem(ADMIN_EDITION_KEY) === 'zac';
export function leaveAprilEdition() { sessionStorage.removeItem(ADMIN_EDITION_KEY); window.location.href = '/'; }
const listeners = new Set<(v: boolean | undefined) => void>();

let revision = 0;
/** True when an approved member's private edition failed to open (network, download or unpack), so the UI can offer a retry instead of silently showing the member view. */
let loadFailed = false;
const errorListeners = new Set<(v: boolean) => void>();
const setFailed = (v: boolean) => { loadFailed = v; errorListeners.forEach(l => l(v)); };
export function retryAprilSpace() { cached = null; setFailed(false); void check(); }
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
    if (!uid) { cached = null; clearPrivateEdition(); listeners.forEach(l => l(false)); return; }
    if (cached?.uid === uid) { listeners.forEach(l => l(cached?.ok ?? false)); return; }
    clearPrivateEdition();
    listeners.forEach(l => l(undefined));
    const { data: member, error } = await supabase.rpc('is_shared_space_member');
    if (!valid()) return;
    const ok = !error && !!member && !adminWantsOwn(data.session?.user.email);
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
    cached = { uid, ok };
    listeners.forEach(l => l(ok));
  } catch {
    if (!valid()) return;
    cached = null;
    clearPrivateEdition();
    setFailed(true);
    listeners.forEach(l => l(false));
  }
}
supabase.auth.onAuthStateChange(() => {
  revision++;
  setFailed(false);
  cached = null;
  clearPrivateEdition();
  listeners.forEach(l => l(false));
  setTimeout(() => void check(), 0);
});

/** undefined while checking; true only for the approved April & Shane accounts (checked by the database), which see the original April edition. */
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
