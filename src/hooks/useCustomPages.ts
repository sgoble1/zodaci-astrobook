import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type CustomPage = { id: string; owner_id: string; title: string; brief: string; menu_group: string; content: string; status: string; created_at: string };
export const CUSTOM_PAGES_CHANGED = 'custom-pages-changed';

export function useCustomPages() {
  const [items, setItems] = useState<CustomPage[]>([]);
  useEffect(() => {
    const load = () => supabase.from('custom_pages').select('*').order('created_at').then(({ data }) => setItems((data ?? []) as CustomPage[]));
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    window.addEventListener(CUSTOM_PAGES_CHANGED, load);
    return () => { sub.subscription.unsubscribe(); window.removeEventListener(CUSTOM_PAGES_CHANGED, load); };
  }, []);
  return items;
}

/** Session key holding the id of a just-created page, so the menu can scroll to it and glow. */
export const NEW_PAGE_HIGHLIGHT_KEY = 'new-page-highlight';
