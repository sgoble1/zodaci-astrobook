import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
export function useWorkspaces() {
  const session = useSession();
  const [spaces, setSpaces] = useState<{ id: string; name: string }[]>([]);
  useEffect(() => {
    if (!session) { setSpaces([]); return; }
    void supabase.from('spaces').select('id,name').then(({data}) => setSpaces(data ?? []));
  }, [session]);
  return spaces;
}