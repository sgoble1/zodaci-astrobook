import { useEffect, useState } from 'react';
import { useSession } from '@/hooks/useLibrary';
import { supabase } from '@/integrations/supabase/client';
import { nextUnorderedIssue } from '@/lib/shopPresentation';

/** Merchandising only; never changes checkout or treats a pending payment as an order. */
export function useNextComicIssue() {
  const session = useSession();
  const uid = session?.user.id;
  const [result, setResult] = useState<{ owner: string; next: number; purchased: boolean } | null>(null);
  useEffect(() => {
    setResult(null);
    if (!uid) return;
    let current = true;
    const load = async () => {
      const subs = await supabase.from('comic_subscriptions').select('id,status,environment,checkout_session_id').eq('user_id', uid).eq('environment', 'live').not('checkout_session_id', 'is', null).in('status', ['active', 'paused', 'canceled']);
      if (subs.error || !current) return;
      const ids = (subs.data ?? []).map(s => s.id);
      if (!ids.length) { setResult({ owner: uid, next: 1, purchased: false }); return; }
      const issues = await supabase.from('comic_issues').select('issue_number').eq('user_id', uid).in('subscription_id', ids);
      if (issues.error || !current) return;
      // A confirmed subscription awaiting its first issue already reserves Issue #1.
      const numbers = (issues.data ?? []).map(i => i.issue_number);
      setResult({ owner: uid, next: nextUnorderedIssue(numbers.length ? numbers : [1]), purchased: true });
    };
    void load();
    return () => { current = false; };
  }, [uid]);
  return result?.owner === uid ? result : { next: 1, purchased: false };
}