import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { detectPatterns, type LifeArea } from '@/lib/lifeAreas';

export type MyThemes = { areas: { area: LifeArea; hits: number }[]; entries: number };

/**
 * The signed-in member's recurring life areas from their own workbook writing in the last 60 days. Counted in the
 * browser from rows only the owner can read; nothing is sent anywhere. `undefined` while loading, `null` signed out.
 */
export function useMyThemes(): MyThemes | null | undefined {
  const session = useSession();
  const uid = session?.user.id;
  const [themes, setThemes] = useState<MyThemes | null | undefined>(undefined);
  useEffect(() => {
    if (!uid) { setThemes(session === null ? null : undefined); return; }
    let on = true;
    setThemes(undefined);
    const since = new Date(Date.now() - 60 * 864e5).toISOString();
    void supabase.from('workbook_entries').select('answer,created_at').eq('owner_id', uid).gte('created_at', since).order('created_at', { ascending: false }).limit(200)
      .then(({ data, error }) => {
        if (!on) return;
        const rows = error ? [] : (data ?? []);
        setThemes({ areas: detectPatterns(rows.map(r => String(r.answer ?? ''))), entries: rows.length });
      });
    return () => { on = false; };
  }, [uid, session]);
  return themes;
}
