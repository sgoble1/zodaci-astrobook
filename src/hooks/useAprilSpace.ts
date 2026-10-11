import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearPrivateEdition, hydratePrivateEdition } from '@/lib/privateEditionStore';

let cached: { uid: string; ok: boolean } | null = null;
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
  const { data: ok } = await supabase.rpc('is_shared_space_member');
  if (ok) {
    const response = await supabase.functions.invoke('private-edition', { body: {} });
    if (response.error || !Number.isInteger(response.data?.segments) || response.data.segments > 10) { listeners.forEach(l => l(false)); return; }
    const segments = await Promise.all(Array.from({ length: response.data.segments }, (_, index) => supabase.functions.invoke(`private-edition-${index}`, { body: {} })));
    if (segments.some(segment => segment.error || typeof segment.data?.segment !== 'string')) { listeners.forEach(l => l(false)); return; }
    const bytes = Uint8Array.from(atob(segments.map(segment => segment.data.segment).join('')), c => c.charCodeAt(0));
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
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
