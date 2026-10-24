import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';

/** True when the signed-in account is assigned Zac's edition (server-side edition_access, set by the admin). */
export function useZacAccount() {
  const session = useSession();
  const uid = session?.user.id;
  const [zac, setZac] = useState(false);
  useEffect(() => {
    let on = true; setZac(false);
    if (uid) void supabase.rpc('my_founder_edition').then(({ data }) => { if (on) setZac(data === 'zac'); });
    return () => { on = false; };
  }, [uid]);
  return zac;
}
