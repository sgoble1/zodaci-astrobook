import { PRICE_TIER } from '@/lib/plans';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getStripeEnvironment } from '@/lib/stripe';

export type Tier = 'free' | 'full' | 'creator';
const TIER: Record<string, Tier> = PRICE_TIER;

export interface SubState { loading: boolean; userId: string | null; tier: Tier; status?: string; periodEnd?: string | null; cancelAtEnd?: boolean; grantReason?: string; priceId?: string }

const REFRESH = 'zodaci:billing-refresh';
/** Ask every mounted plan reader to reload now (after checkout sync or a plan change). */
export const refreshSubscription = () => window.dispatchEvent(new Event(REFRESH));

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
      const nowIso = new Date().toISOString();
      const [{ data }, { data: grants }] = await Promise.all([
        supabase.from('billing_subscriptions').select('*').eq('user_id', uid).eq('environment', env).order('created_at', { ascending: false }),
        supabase.from('plan_grants').select('tier,expires_at,reason').eq('user_id', uid).lte('starts_at', nowIso).gt('expires_at', nowIso),
      ]);
      // Only plan prices grant a tier; AstroComic and book payments never do.
      const activeRows = (data ?? []).filter(r => !!TIER[r.price_id] && isActive(r));
      const row = activeRows.find(r => TIER[r.price_id] === 'creator') || activeRows.find(r => TIER[r.price_id] === 'full');
      const subTier: Tier = row ? TIER[row.price_id] : 'free';
      const grant = (grants ?? []).sort((a, b) => (b.tier === 'creator' ? 1 : 0) - (a.tier === 'creator' ? 1 : 0))[0];
      const grantTier: Tier = grant ? (grant.tier as Tier) : 'free';
      const rank = { free: 0, full: 1, creator: 2 } as const;
      const useGrant = rank[grantTier] > rank[subTier];
      if (alive && version === revision && uid === currentUid) setS({ loading: false, userId: uid, tier: useGrant ? grantTier : subTier, status: useGrant ? 'granted' : row?.status, periodEnd: useGrant ? grant!.expires_at : row?.current_period_end, cancelAtEnd: useGrant ? false : !!row?.cancel_at_period_end, grantReason: useGrant ? grant!.reason : undefined, priceId: useGrant ? undefined : row?.price_id });
    };
    const bind = (uid: string | null) => {
      currentUid = uid; revision++; setS({ loading: true, userId: uid, tier: 'free' });
      if (channel) { void supabase.removeChannel(channel); channel = null; }
      void load(uid);
      if (uid) channel = supabase.channel(`billing-${uid}-${Math.random().toString(36).slice(2)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'billing_subscriptions', filter: `user_id=eq.${uid}` }, () => load(uid))
        .subscribe(status => { live = status === 'SUBSCRIBED'; });
    };
    let live = false;
    const reload = () => { if (alive) void load(currentUid); };
    supabase.auth.getUser().then(({ data }) => { if(alive) bind(data.user?.id ?? null); });
    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => { setTimeout(() => { if(alive) bind(session?.user.id ?? null); },0); });
    // Live updates normally carry plan changes; poll only while that connection is down.
    const timer = window.setInterval(() => { if (!live && currentUid && document.visibilityState === 'visible') reload(); }, 15000);
    const onFocus = () => { if (currentUid) reload(); };
    window.addEventListener(REFRESH, reload);
    window.addEventListener('focus', onFocus);
    return () => { alive = false; window.clearInterval(timer); window.removeEventListener(REFRESH, reload); window.removeEventListener('focus', onFocus); auth.subscription.unsubscribe(); if (channel) void supabase.removeChannel(channel); };
  }, []);
  return s;
}
