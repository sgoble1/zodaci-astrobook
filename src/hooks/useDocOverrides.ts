import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { onAccountChange } from '@/lib/authEvents';

export type DocOverride = { doc_key: string; title: string | null; note: string | null; hidden: boolean; sort_order: number | null };

/** Admin-set titles, notes, ordering and visibility for Document Index entries. */
export function useDocOverrides() {
  const [map, setMap] = useState<Record<string, DocOverride>>({});
  const generation = useRef(0);
  const reload = useCallback(async () => {
    const request = ++generation.current;
    const { data } = await supabase.rpc('get_document_overrides');
    if (request === generation.current) setMap(Object.fromEntries((data ?? []).map(d => [d.doc_key, d as DocOverride])));
  }, []);
  useEffect(() => {
    let active = true;
    void reload();
    const unsubscribe = onAccountChange(() => {
      ++generation.current;
      setMap({});
      // Avoid database calls inside the auth callback.
      setTimeout(() => { if (active) void reload(); }, 0);
    });
    return () => { active = false; ++generation.current; unsubscribe(); };
  }, [reload]);
  const save = async (o: DocOverride) => {
    const { error } = await supabase.from('document_overrides').upsert({ ...o, updated_at: new Date().toISOString() });
    if (error) throw error;
    await reload();
  };
  return { map, save, reload };
}
