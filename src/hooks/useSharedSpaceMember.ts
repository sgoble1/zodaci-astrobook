import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

let cached: { uid: string; ok: boolean } | null = null;
const listeners = new Set<(v: boolean | undefined) => void>();

let revision = 0;
async function check() {
  const version = ++revision;
  const valid = () => version === revision;
  try {
    const { data } = await supabase.auth.getSession();
    if (!valid()) return;
    const uid = data.session?.user.id;
    if (!uid) { cached = null; listeners.forEach(l => l(false)); return; }
    if (cached?.uid === uid) { listeners.forEach(l => l(cached?.ok ?? false)); return; }
    listeners.forEach(l => l(undefined));
    const { data: member, error } = await supabase.rpc('is_shared_space_member');
    if (!valid()) return;
    const ok = !error && member === true;
    cached = { uid, ok };
    listeners.forEach(l => l(ok));
  } catch {
    if (!valid()) return;
    cached = null;
    listeners.forEach(l => l(false));
  }
}
supabase.auth.onAuthStateChange(() => {
  revision++;
  cached = null;
  listeners.forEach(l => l(false));
  setTimeout(() => void check(), 0);
});

/**
 * undefined while checking; true only for the approved April & Shane accounts (checked by the database).
 * Deliberately separate from useAprilSpace so the shared space never depends on loading the private edition.
 */
export function useSharedSpaceMember() {
  const [ok, setOk] = useState<boolean | undefined>(cached?.ok);
  useEffect(() => { listeners.add(setOk); check(); return () => { listeners.delete(setOk); }; }, []);
  return ok;
}
