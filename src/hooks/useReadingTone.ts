import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isTone, type Tone } from '@/lib/perception';

const LOCAL = 'zodaci-reading-tone';

/** Reading tone (Oracle / Educational / Professional), saved to the member's profile and mirrored on this device. */
export function useReadingTone(): [Tone, (t: Tone) => void] {
  const [tone, setTone] = useState<Tone>(() => { const v = typeof localStorage !== 'undefined' ? localStorage.getItem(LOCAL) : null; return isTone(v) ? v : 'oracle'; });
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id; if (!uid) return;
      const { data } = await supabase.from('profiles').select('reading_tone').eq('id', uid).maybeSingle();
      if (alive && isTone(data?.reading_tone)) { setTone(data.reading_tone); localStorage.setItem(LOCAL, data.reading_tone); }
    })();
    return () => { alive = false; };
  }, []);
  const update = useCallback((t: Tone) => {
    setTone(t); localStorage.setItem(LOCAL, t);
    void (async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id; if (!uid) return;
      await supabase.from('profiles').update({ reading_tone: t }).eq('id', uid);
    })();
  }, []);
  return [tone, update];
}
