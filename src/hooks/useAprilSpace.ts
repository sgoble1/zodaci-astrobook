import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { clearPrivateEdition, hydratePrivateEdition } from '@/lib/privateEditionStore';

let cached: { uid: string; ok: boolean } | null = null;
const listeners = new Set<(v: boolean | undefined) => void>();

async function check() {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) { cached = null; clearPrivateEdition(); listeners.forEach(l => l(false)); return; }
  if (cached?.uid === uid) { listeners.forEach(l => l(cached?.ok ?? false)); return; }
  listeners.forEach(l => l(undefined));
  clearPrivateEdition();
  const { data: ok } = await supabase.rpc('is_shared_space_member');
  if (ok) {
    const response = await supabase.functions.invoke('private-edition', { body: {} });
    const current = await supabase.auth.getSession();
    if (current.data.session?.user.id !== uid) return;
    if (response.error || !response.data) { listeners.forEach(l => l(false)); return; }
    hydratePrivateEdition(response.data);
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
