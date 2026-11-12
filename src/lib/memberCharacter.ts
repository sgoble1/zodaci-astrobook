import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MEMBER_CHARACTERS } from '@/lib/observatory';
import type { ComicGuide } from '@/lib/comic';

/** The comic stand-in for a saved character choice; unknown or missing choices draw no stand-in. */
export function guideFor(characterId: string | null | undefined): ComicGuide | null {
  const c = MEMBER_CHARACTERS.find(x => x.id === characterId);
  return c ? { name: c.name, blurb: c.blurb } : null;
}

/** The signed-in member's own saved character (owner-only row), re-read when the account changes. */
export function useMyCharacter(): ComicGuide | null {
  const [guide, setGuide] = useState<ComicGuide | null>(null);
  useEffect(() => {
    let on = true;
    const read = async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) { if (on) setGuide(null); return; }
      const { data } = await supabase.from('member_characters').select('character_id').eq('user_id', uid).maybeSingle();
      if (on) setGuide(guideFor(data?.character_id));
    };
    void read();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => { if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') void read(); });
    return () => { on = false; sub.subscription.unsubscribe(); };
  }, []);
  return guide;
}
