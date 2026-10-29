import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type LibraryItem = {
  id: string; kind: string; title: string; description: string | null; category: string | null;
  file_path: string; file_name: string; mime_type: string | null; size_bytes: number | null;
  owner_id: string; created_at: string; url?: string; cover_path?: string | null; cover_url?: string; shared_with_space?: boolean; workspace_id?: string | null; sections?: unknown; belongs_to?: string;
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

export function useLibrary(kind: 'podcast' | 'source' | 'masterbook' | 'creation') {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('library_items').select('*').eq('kind', kind).order('created_at', { ascending: false });
    const rows = (data ?? []) as LibraryItem[];
    if (rows.length) {
      const paths = rows.flatMap(r => [r.file_path, ...(r.cover_path ? [r.cover_path] : [])]);
      const { data: signed } = await supabase.storage.from('library').createSignedUrls(paths, 60 * 60 * 6);
      const urls = new Map(paths.map((path, index) => [path, signed?.[index]?.signedUrl]));
      rows.forEach(r => { r.url = urls.get(r.file_path) ?? undefined; r.cover_url = r.cover_path ? urls.get(r.cover_path) ?? undefined : undefined; });
      const sharedRows=rows.filter(r=>r.workspace_id && !r.url);
      await Promise.all(sharedRows.map(async r=>{const result=await supabase.functions.invoke('workspace-audio',{body:{itemId:r.id}});if(result.data?.url)r.url=result.data.url;}));
    }
    setItems(rows); setLoading(false);
  }, [kind]);
  useEffect(() => { reload(); }, [reload]);

  const upload = async (file: File, meta: { title: string; description?: string; category?: string; shared_with_space?: boolean; workspace_id?: string | null; sections?: { title: string; text: string }[] }, userId: string) => {
    const path = `${userId}/${kind}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`;
    const up = await supabase.storage.from('library').upload(path, file, { contentType: file.type });
    if (up.error) throw up.error;
    const ins = await supabase.from('library_items').insert({
      kind, owner_id: userId, workspace_id: meta.workspace_id ?? null, title: meta.title || file.name, description: meta.description || null, category: meta.category || null,
      file_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size, sections: meta.sections ?? null, shared_with_space: meta.shared_with_space ?? false,
    });
    if (ins.error) throw ins.error;
    await reload();
  };
  // Writes confirm a row actually changed: a policy refusal returns no rows rather than an error.
  const remove = async (item: LibraryItem) => {
    const { data, error } = await supabase.from('library_items').delete().eq('id', item.id).select('id');
    if (error || !data?.length) throw new Error('This item could not be deleted.');
    // The record goes first so a failed file cleanup never leaves a listed item without its file.
    await supabase.storage.from('library').remove([item.file_path, ...(item.cover_path ? [item.cover_path] : [])]);
    await reload();
  };
  const rename = async (item: LibraryItem, patch: Partial<Pick<LibraryItem, 'title' | 'description' | 'category'>>) => {
    const { data, error } = await supabase.from('library_items').update(patch).eq('id', item.id).select('id');
    if (error || !data?.length) throw new Error('This change could not be saved.');
    await reload();
  };
  const setShared = async (item: LibraryItem, shared_with_space: boolean) => {
    const { data, error } = await supabase.from('library_items').update({ shared_with_space }).eq('id', item.id).select('id');
    if (error || !data?.length) throw new Error('Sharing could not be changed for this item.');
    await reload();
  };
  return { items, loading, upload, remove, rename, setShared, reload };
}
