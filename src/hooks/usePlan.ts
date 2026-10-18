import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import type { Plan } from '@/content/navigation';

/** Effective plan: subscription tier, with admins and the private shared space treated as Creator. */
export function usePlan(): { plan: Plan; loading: boolean } {
  const sub = useSubscription();
  const [elevated, setElevated] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) { if (alive) setElevated(false); return; }
      const [admin, shared] = await Promise.all([
        supabase.rpc('has_role', { _user_id: uid, _role: 'admin' }),
        supabase.rpc('is_shared_space_member'),
      ]);
      if (alive) setElevated(!!(admin.data || shared.data));
    })();
    return () => { alive = false; };
  }, [sub.userId]);
  const plan: Plan = elevated ? 'creator' : (sub.tier as Plan) ?? 'free';
  return { plan, loading: sub.loading || elevated === null };
}
