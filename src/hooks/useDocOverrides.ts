import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DocOverride = { doc_key: string; title: string | null; note: string | null; hidden: boolean; sort_order: number | null };

/** Admin-set titles, notes, ordering and visibility for Document Index entries. */
export function useDocOverrides() {
  const [map, setMap] = useState<Record<string, DocOverride>>({});
  const reload = useCallback(async () => {
    const { data } = await supabase.rpc('get_document_overrides');
    setMap(Object.fromEntries((data ?? []).map(d => [d.doc_key, d as DocOverride])));
  }, []);
  useEffect(() => { reload(); }, [reload]);
  const save = async (o: DocOverride) => {
    const { error } = await supabase.from('document_overrides').upsert({ ...o, updated_at: new Date().toISOString() });
    if (error) throw error;
    await reload();
  };
  return { map, save, reload };
}
