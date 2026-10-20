import { PRICE_TIER } from '@/lib/plans';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';

export type Tier = 'free' | 'full' | 'creator';
const TIER: Record<string, Tier> = PRICE_TIER;

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
    let revision = 0; let currentUid: string | null = null; let alive = true; let channel: ReturnType<typeof supabase.channel> | null = null;
    const load = async (uid: string | null) => {
      const version = ++revision;
      const env = envOrNull();
      if (!uid || !env) { if (alive) setS({ loading: false, userId: uid, tier: 'free' }); return; }
      const { data } = await supabase.from('billing_subscriptions').select('*').eq('user_id', uid).eq('environment', env).order('created_at', { ascending: false });
      const activeRows = (data ?? []).filter(isActive);
      const row = activeRows.find(r => TIER[r.price_id] === 'creator') || activeRows.find(r => TIER[r.price_id] === 'full');
      if (alive && version === revision && uid === currentUid) setS({ loading: false, userId: uid, tier: row ? TIER[row.price_id] ?? 'full' : 'free', status: row?.status, periodEnd: row?.current_period_end, cancelAtEnd: !!row?.cancel_at_period_end });
    };
    const bind = (uid: string | null) => {
      currentUid = uid; revision++; setS({ loading: true, userId: uid, tier: 'free' });
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      void load(uid);
      if (uid) channel = supabase.channel(`billing-${uid}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_subscriptions', filter: `user_id=eq.${uid}` }, () => load(uid)).subscribe();
    };
    supabase.auth.getUser().then(({ data }) => { if(alive) bind(data.user?.id ?? null); });
    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => { setTimeout(() => { if(alive) bind(session?.user.id ?? null); },0); });
    const timer = window.setInterval(() => { void supabase.auth.getUser().then(({ data }) => { if(alive) void load(data.user?.id ?? null); }); },15000);
    return () => { alive = false; window.clearInterval(timer); auth.subscription.unsubscribe(); if (channel) void supabase.removeChannel(channel); };
  }, []);
  return s;
}
