import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type LibraryItem = {
  id: string; kind: string; title: string; description: string | null; category: string | null;
  file_path: string; file_name: string; mime_type: string | null; size_bytes: number | null;
  owner_id: string; created_at: string; url?: string; sections?: unknown;
};

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

/** True when the signed-in user holds the admin role (the designated owner email claims it on first verified sign-in). */
export function useIsAdmin(session: Session | null) {
  const [admin, setAdmin] = useState(false);
  useEffect(() => {
    if (!session) { setAdmin(false); return; }
    supabase.rpc('claim_admin').then(({ data }) => setAdmin(!!data));
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  return admin;
}

export function useLibrary(kind: 'podcast' | 'source' | 'masterbook') {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('library_items').select('*').eq('kind', kind).order('created_at', { ascending: false });
    const rows = (data ?? []) as LibraryItem[];
    if (rows.length) {
      const { data: signed } = await supabase.storage.from('library').createSignedUrls(rows.map(r => r.file_path), 60 * 60 * 6);
      rows.forEach((r, i) => { r.url = signed?.[i]?.signedUrl ?? undefined; });
    }
    setItems(rows); setLoading(false);
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);

  const upload = async (file: File, meta: { title: string; description?: string; category?: string; sections?: { title: string; text: string }[] }, userId: string) => {
    const path = `${userId}/${kind}/${Date.now()}-${file.name.replace(/[^\w.\-]+/g, '_')}`;
    const up = await supabase.storage.from('library').upload(path, file, { contentType: file.type });
    if (up.error) throw up.error;
    const ins = await supabase.from('library_items').insert({
      kind, title: meta.title || file.name, description: meta.description || null, category: meta.category || null,
      file_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size, sections: meta.sections ?? null,
    });
    if (ins.error) throw ins.error;
    await reload();
  };
  const remove = async (item: LibraryItem) => {
    await supabase.storage.from('library').remove([item.file_path]);
    await supabase.from('library_items').delete().eq('id', item.id);
    await reload();
  };
  const rename = async (item: LibraryItem, patch: Partial<Pick<LibraryItem, 'title' | 'description' | 'category'>>) => {
    await supabase.from('library_items').update(patch).eq('id', item.id);
    await reload();
  };
  return { items, loading, upload, remove, rename, reload };
}
