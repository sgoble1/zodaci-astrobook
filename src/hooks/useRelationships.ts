import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';

export type Relationship = {
  id: string; owner_id: string; name: string; relation: string; sex: 'male' | 'female' | 'unspecified';
  birth_date: string; birth_time: string | null; place_label: string; lat: number; lon: number; tz: string;
  notes: string; created_at: string; updated_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = () => (supabase as any).from('relationships');
const listeners = new Set<() => void>();
export const refreshRelationships = () => listeners.forEach(f => f());

export function useRelationships() {
  const session = useSession();
  const [items, setItems] = useState<Relationship[]>([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!session) { setItems([]); setLoading(false); return; }
    const { data } = await table().select('*').order('created_at');
    setItems((data ?? []) as Relationship[]); setLoading(false);
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); listeners.add(load); return () => { listeners.delete(load); }; }, [load]);
  return { session, items, loading, reload: load };
}

export async function saveRelationship(r: Partial<Relationship> & { id?: string }) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error('Please sign in first.');
  const row = { ...r, owner_id: u.user.id, updated_at: new Date().toISOString() };
  const q = r.id ? table().update(row).eq('id', r.id).select().single() : table().insert(row).select().single();
  const { data, error } = await q;
  if (error) throw error;
  refreshRelationships();
  return data as Relationship;
}
export async function deleteRelationship(id: string) {
  const { error } = await table().delete().eq('id', id);
  if (error) throw error;
  refreshRelationships();
}
