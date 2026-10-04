import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';

export type Bookmark = { id: string; path: string; title: string; note: string; created_at: string };

const listeners = new Set<() => void>();
// Shared fetch so many bookmark buttons on one page make a single request.
let inflight: Promise<Bookmark[]> | null = null;
const fetchAll = () => (inflight ??= Promise.resolve(supabase.from('bookmarks').select('id,path,title,note,created_at').order('created_at', { ascending: false })
  .then(({ data }) => (data as Bookmark[]) ?? [])));
const notify = () => { inflight = null; listeners.forEach(l => l()); };

export function useBookmarks() {
  const session = useSession();
  const [items, setItems] = useState<Bookmark[]>([]);
  const load = useCallback(async () => {
    if (!session) { setItems([]); return; }
    setItems(await fetchAll());
  }, [session]);
  useEffect(() => { load(); listeners.add(load); return () => { listeners.delete(load); }; }, [load]);

  const add = async (path: string, title: string) => { await supabase.from('bookmarks').insert({ path, title }); notify(); };
  const remove = async (id: string) => { await supabase.from('bookmarks').delete().eq('id', id); notify(); };
  const setNote = async (id: string, note: string) => { await supabase.from('bookmarks').update({ note }).eq('id', id); notify(); };
  return { items, signedIn: !!session, add, remove, setNote };
}
