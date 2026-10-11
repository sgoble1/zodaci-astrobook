import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';

export type Tier = 'free' | 'full' | 'creator';
const TIER: Record<string, Tier> = { full_access_monthly: 'full', creator_monthly: 'creator' };

export interface SubState { loading: boolean; userId: string | null; tier: Tier; status?: string; periodEnd?: string | null; cancelAtEnd?: boolean }

function envOrNull() { try { return getStripeEnvironment(); } catch { return null; } }

function isActive(r: { status: string; current_period_end: string | null }) {
  const future = !r.current_period_end || new Date(r.current_period_end) > new Date();
  return (['active', 'trialing', 'past_due'].includes(r.status) && future) || (r.status === 'canceled' && !!r.current_period_end && future);
}

/** The signed-in visitor's plan, kept current as payment updates arrive. */
export function useSubscription(): SubState {
  const [s, setS] = useState<SubState>({ loading: true, userId: null, tier: 'free' });
  useEffect(() => {
    let alive = true; let channel: ReturnType<typeof supabase.channel> | null = null;
    const load = async (uid: string | null) => {
      const env = envOrNull();
      if (!uid || !env) { if (alive) setS({ loading: false, userId: uid, tier: 'free' }); return; }
      const { data } = await supabase.from('billing_subscriptions').select('*').eq('user_id', uid).eq('environment', env).order('created_at', { ascending: false });
      const row = (data ?? []).find(isActive);
      if (alive) setS({ loading: false, userId: uid, tier: row ? TIER[row.price_id] ?? 'full' : 'free', status: row?.status, periodEnd: row?.current_period_end, cancelAtEnd: !!row?.cancel_at_period_end });
    };
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null; load(uid);
      if (uid) channel = supabase.channel(`billing-${uid}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_subscriptions', filter: `user_id=eq.${uid}` }, () => load(uid)).subscribe();
    });
    return () => { alive = false; if (channel) supabase.removeChannel(channel); };
  }, []);
  return s;
}
