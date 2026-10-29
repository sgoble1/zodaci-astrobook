import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';

type Status = { tier: string; allowance: number; used: number; unlimited: boolean };

/** This month's AI credits, read from the same server check every AI feature uses. */
export function CreditBalance() {
  const session = useSession();
  const [s, setS] = useState<Status | null>(null);
  useEffect(() => {
    if (!session) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).rpc('credit_status', { _user_id: session.user.id }).then(({ data }: { data: Status[] | null }) => setS(data?.[0] ?? null));
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!s) return null;
  if (s.unlimited) return <p className="text-sm text-muted-foreground">AI credits: unlimited on your account.</p>;
  const left = Math.max(0, s.allowance - s.used);
  return (
    <section aria-label="AI credits" className="rounded border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm"><span>AI credits this month</span><span className="font-medium">{left} of {s.allowance} left</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, (s.used / s.allowance) * 100)}%` }} /></div>
      <p className="mt-2 text-xs text-muted-foreground">Counselor messages use 1, chart covers 3, podcasts 5. Credits refresh on the 1st.{" "}<Link to="/credits" className="text-primary underline">Buy more credits</Link></p>
    </section>
  );
}
