import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { createBookmarkStore } from './bookmarkStore';

export type Bookmark = { id: string; path: string; title: string; note: string; created_at: string };

const listeners = new Set<() => void>();
// Shared fetch so many bookmark buttons on one page make a single request.
const store = createBookmarkStore<Bookmark>();
const fetchAll = (ownerId: string) => store.load(ownerId, async () => {
  const { data, error } = await supabase.from('bookmarks').select('id,path,title,note,created_at').eq('owner_id', ownerId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Bookmark[]) ?? [];
});
const notify = () => { store.clear(); listeners.forEach(l => l()); };
supabase.auth.onAuthStateChange(() => { store.clear(); });

export function useBookmarks() {
  const session = useSession();
  const ownerId = session?.user.id ?? null;
  const currentOwner = useRef(ownerId);
  currentOwner.current = ownerId;
  const [saved, setSaved] = useState<{ ownerId: string; items: Bookmark[] } | null>(null);
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const request = ++requestId.current;
    if (!ownerId) { setSaved(null); return; }
    try {
      const items = await fetchAll(ownerId);
      if (request === requestId.current && currentOwner.current === ownerId) setSaved({ ownerId, items });
    } catch { if (request === requestId.current) setSaved(null); }
  }, [ownerId]);
  useEffect(() => { void load(); listeners.add(load); return () => { requestId.current++; listeners.delete(load); }; }, [load]);

  const requireOwner = () => { if (!ownerId || currentOwner.current !== ownerId) throw new Error('Sign in to save a bookmark.'); return ownerId; };
  const add = async (path: string, title: string) => { const owner = requireOwner(); const { error } = await supabase.from('bookmarks').insert({ path, title, owner_id: owner }); if (error) throw error; notify(); };
  const remove = async (id: string) => { const owner = requireOwner(); const { error } = await supabase.from('bookmarks').delete().eq('id', id).eq('owner_id', owner); if (error) throw error; notify(); };
  const setNote = async (id: string, note: string) => { const owner = requireOwner(); const { error } = await supabase.from('bookmarks').update({ note }).eq('id', id).eq('owner_id', owner); if (error) throw error; notify(); };
  return { items: saved?.ownerId === ownerId ? saved.items : [], signedIn: !!ownerId, add, remove, setNote };
}
