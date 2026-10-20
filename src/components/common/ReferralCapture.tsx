import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const REF_KEY = 'zodaci-ref';
export const REF_PATTERN = /^ZOD-[A-Z0-9]{6,10}$/;
const BONUS_KEY = 'zodaci-signup-bonus-checked';

export const REFERRAL_MESSAGES: Record<string, string> = {
  claimed: 'Welcome! A friend’s invitation gave you 7 days of Pro.',
  invalid: 'That invitation code isn’t valid.',
  own_code: 'That’s your own invitation code — share it with a friend instead.',
  too_late: 'Invitation codes can be used within 7 days of joining.',
  already: 'You’ve already used an invitation code.',
  already_paid: 'You already have a paid plan, so the invitation can’t be applied.',
  sign_in: 'Sign in to use an invitation code.',
};

/** Keeps a ?ref= invitation code from any page, applies it after sign-in, and claims the one-time welcome credits. */
export function ReferralCapture() {
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref')?.trim().toUpperCase();
    if (ref && REF_PATTERN.test(ref)) localStorage.setItem(REF_KEY, ref);
    let busy = false;
    const apply = async (uid: string | undefined) => {
      if (!uid || busy) return;
      busy = true;
      try {
        const code = localStorage.getItem(REF_KEY);
        if (code) {
          const { data, error } = await supabase.rpc('claim_referral', { _code: code });
          if (!error) { localStorage.removeItem(REF_KEY); if (data === 'claimed') toast.success(REFERRAL_MESSAGES.claimed); }
        }
        if (localStorage.getItem(BONUS_KEY) !== uid) {
          const { data, error } = await supabase.rpc('claim_signup_bonus');
          if (!error) { localStorage.setItem(BONUS_KEY, uid); if ((data ?? 0) > 0) toast.success(`Welcome to Zodaci — ${data} bonus AI credits added for your first month.`); }
        }
      } finally { busy = false; }
    };
    supabase.auth.getSession().then(({ data }) => void apply(data.session?.user.id));
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => { if (event === 'SIGNED_IN') setTimeout(() => void apply(session?.user.id), 0); });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
