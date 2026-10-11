import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from '@/hooks/useSubscription';
import { getStripeEnvironment } from '@/lib/stripe';
import { STARTER_CHAPTERS, STARTER_EVENT } from '@/lib/starterChapters';
import { toast } from 'sonner';

const running = new Set<string>();
const attempted = new Set<string>();
/** A single sequential queue per signed-in visit; terminal failures never replay automatically. */
export function AutomaticChapters() {
  const sub = useSubscription();
  useEffect(() => {
    const uid = sub.userId;
    if (!uid || sub.loading || sub.tier === 'free') return;
    const start = async () => {
      if (running.has(uid) || attempted.has(uid)) return;
      const { data: profile } = await supabase.from('profiles').select('birth_date,chart').eq('id', uid).maybeSingle();
      if (!profile?.birth_date || !profile.chart) return;
      running.add(uid); attempted.add(uid);
      try {
        const { data: pages } = await supabase.from('generated_pages').select('title').eq('owner_id', uid).eq('section', 'My Masterbook');
        for (const topic of STARTER_CHAPTERS) {
          if (pages?.some(p => p.title === topic)) continue;
          window.dispatchEvent(new CustomEvent(STARTER_EVENT, { detail: { writing: topic } }));
          const { data, error } = await supabase.functions.invoke('creator-studio', { body: { kind: 'starter', topic, environment: getStripeEnvironment() } });
          if (error || data?.error) {
            let message = data?.error;
            if (!message && error?.context instanceof Response) {
              const body = await error.context.json().catch(() => null); message = body?.error || body?.message;
            }
            message ||= 'Your chapters could not finish. Please return to My Masterbook to see the status.';
            window.dispatchEvent(new CustomEvent(STARTER_EVENT, { detail: { error: message } }));
            toast.error(message); return;
          }
          window.dispatchEvent(new CustomEvent(STARTER_EVENT, { detail: { saved: true } }));
        }
        window.dispatchEvent(new CustomEvent(STARTER_EVENT, { detail: { done: true } }));
      } finally { running.delete(uid); }
    };
    void start();
    const birthSaved = () => { void start(); };
    window.addEventListener('astrobook-birth-saved', birthSaved);
    return () => window.removeEventListener('astrobook-birth-saved', birthSaved);
  }, [sub.loading, sub.userId, sub.tier]);
  return null;
}