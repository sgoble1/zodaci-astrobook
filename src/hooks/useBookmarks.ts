import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';

export type Bookmark = { id: string; path: string; title: string; note: string; created_at: string };

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());

export function useBookmarks() {
  const session = useSession();
  const [items, setItems] = useState<Bookmark[]>([]);
  const load = useCallback(async () => {
    if (!session) { setItems([]); return; }
    const { data } = await supabase.from('bookmarks').select('id,path,title,note,created_at').order('created_at', { ascending: false });
    setItems((data as Bookmark[]) ?? []);
  }, [session]);
  useEffect(() => { load(); listeners.add(load); return () => { listeners.delete(load); }; }, [load]);

  const add = async (path: string, title: string) => { await supabase.from('bookmarks').insert({ path, title }); notify(); };
  const remove = async (id: string) => { await supabase.from('bookmarks').delete().eq('id', id); notify(); };
  const setNote = async (id: string, note: string) => { await supabase.from('bookmarks').update({ note }).eq('id', id); notify(); };
  return { items, signedIn: !!session, add, remove, setNote };
}
