import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearPrivateEdition, hydratePrivateEdition } from '@/lib/privateEditionStore';

let cached: { uid: string; ok: boolean } | null = null;
export const ADMIN_EDITION_KEY = 'zodaci-admin-edition';
const ADMIN_EMAIL = 'shanegoble@gmail.com';
if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('edition') === 'april') {
  sessionStorage.setItem(ADMIN_EDITION_KEY, 'april');
}
/** The admin sees his own edition by default; April's edition only in a tab he opened for it. */
const adminWantsOwn = (email?: string) => email?.toLowerCase() === ADMIN_EMAIL && sessionStorage.getItem(ADMIN_EDITION_KEY) !== 'april';
export const isAdminEmail = (email?: string | null) => email?.toLowerCase() === ADMIN_EMAIL;
export function openAprilEditionTab() { window.open(`${window.location.origin}/?edition=april`, '_blank', 'noopener'); }
export function leaveAprilEdition() { sessionStorage.removeItem(ADMIN_EDITION_KEY); window.location.href = '/'; }
const listeners = new Set<(v: boolean | undefined) => void>();

let pending: Promise<void> | null = null;
function check() {
  pending ??= performCheck().finally(() => { pending = null; });
  return pending;
}
async function performCheck() {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) { cached = null; clearPrivateEdition(); listeners.forEach(l => l(false)); return; }
  if (cached?.uid === uid) { listeners.forEach(l => l(cached?.ok ?? false)); return; }
  listeners.forEach(l => l(undefined));
  clearPrivateEdition();
  const { data: member } = await supabase.rpc('is_shared_space_member');
  const ok = member && !adminWantsOwn(data.session?.user.email);
  if (ok) {
    const response = await supabase.functions.invoke('private-edition', { body: {} });
    if (response.error || typeof response.data?.url !== 'string') { listeners.forEach(l => l(false)); return; }
    const blob = await (await fetch(response.data.url as string)).blob();
    const stream = blob.stream().pipeThrough(new DecompressionStream('gzip'));
    const edition = JSON.parse(await new Response(stream).text());
    const current = await supabase.auth.getSession();
    if (current.data.session?.user.id !== uid) return;
    if (response.error || !response.data) { listeners.forEach(l => l(false)); return; }
    hydratePrivateEdition(edition);
  }
  cached = { uid, ok: !!ok };
  listeners.forEach(l => l(!!ok));
}
supabase.auth.onAuthStateChange(() => { setTimeout(check, 0); });

/** undefined while checking; true only for the approved April & Shane accounts (checked by the database), which see the original April edition. */
export function useAprilSpace() {
  const [ok, setOk] = useState<boolean | undefined>(cached?.ok);
  useEffect(() => { listeners.add(setOk); check(); return () => { listeners.delete(setOk); }; }, []);
  return ok;
}
