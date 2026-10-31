import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { onAccountChange } from '@/lib/authEvents';

export type SharedSpaceKey = 'april' | 'zac';
export const SHARED_SPACE_LABEL: Record<SharedSpaceKey, string> = { april: 'April & Shane', zac: 'Zac & Shane' };

type State = { spaces: SharedSpaceKey[]; active: SharedSpaceKey | null } | undefined;
let cached: State;
const listeners = new Set<(s: State) => void>();
const emit = (s: State) => { cached = s; listeners.forEach(l => l(s)); };

async function load() {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return emit({ spaces: [], active: null });
  const [spaces, active] = await Promise.all([supabase.rpc('my_shared_spaces'), supabase.rpc('current_shared_space')]);
  emit({ spaces: ((spaces.data ?? []) as string[]).filter((s): s is SharedSpaceKey => s === 'april' || s === 'zac'), active: (active.data as SharedSpaceKey | null) ?? null });
}
onAccountChange(() => { emit(undefined); setTimeout(() => void load(), 0); });

/** Shared spaces this account belongs to (checked by the database) and the one currently open. */
export function useSharedSpaces() {
  const [state, setState] = useState<State>(cached);
  useEffect(() => { listeners.add(setState); if (cached === undefined) void load(); return () => { listeners.delete(setState); }; }, []);
  const switchTo = useCallback(async (space: SharedSpaceKey) => {
    const { error } = await supabase.rpc('set_shared_space', { _space: space });
    if (error) throw error;
    emit({ spaces: cached?.spaces ?? [space], active: space });
  }, []);
  return { loading: state === undefined, spaces: state?.spaces ?? [], active: state?.active ?? null, switchTo };
}
