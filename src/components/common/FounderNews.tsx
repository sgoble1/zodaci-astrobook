import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/hooks/useLibrary';
import { usePlan } from '@/hooks/usePlan';
import { PLAN_LABEL } from '@/components/common/PlanLock';
import { founderNewsFor } from '@/content/founderNews';
import { useOfficialEditions, type OfficialEdition } from '@/lib/officialEditions';

const EDITION_NAME: Record<OfficialEdition, string> = { april: 'April', shane: 'Shane', zac: 'Zac' };
const SPACE: Partial<Record<OfficialEdition, { to: string; label: string }>> = { april: { to: '/shared/april', label: 'April & Shane' }, zac: { to: '/shared/zac', label: 'Zac & Shane' } };
const fmt = (d: string) => new Date(d + 'T12:00:00Z').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

/**
 * "What's new for you" on a founder's own home: plain-language notes for that edition only, plus (for the owner) a
 * short account summary read from the same server checks the rest of the site uses.
 */
export function FounderNews({ edition, owns, count = 4 }: { edition: OfficialEdition; owns: boolean; count?: number }) {
  const [all, setAll] = useState(false);
  const notes = founderNewsFor(edition);
  const shown = all ? notes : notes.slice(0, count);
  return (
    <section aria-labelledby={`founder-news-${edition}`} className="obs-paper grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id={`founder-news-${edition}`} className="plate-title !text-2xl">{owns ? 'What’s new for you' : `What’s new in ${EDITION_NAME[edition]}’s account`}</h2>
          {notes.length > count && <button type="button" onClick={() => setAll(a => !a)} className="min-h-10 text-sm underline underline-offset-4">{all ? 'Show fewer' : `Show all ${notes.length}`}</button>}
        </div>
        <ol className="space-y-3">
          {shown.map(n => (
            <li key={n.title} className="border-b border-dashed border-[hsl(var(--comic-navy)/0.2)] pb-3 last:border-0 last:pb-0">
              <p className="text-xs text-muted-foreground">{fmt(n.date)}</p>
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.text}</p>
              {n.to && <Link to={n.to} className="mt-1 inline-flex min-h-8 items-center text-sm font-semibold underline underline-offset-4">{n.cta ?? 'Take a look'}</Link>}
            </li>
          ))}
        </ol>
      </div>
      {owns ? <AccountGlance edition={edition} /> : <p className="self-start text-sm text-muted-foreground">These are the notes {EDITION_NAME[edition]} sees on their own home page.</p>}
    </section>
  );
}

type Credits = { allowance: number; used: number; unlimited: boolean };
function AccountGlance({ edition }: { edition: OfficialEdition }) {
  const session = useSession();
  const { plan, loading } = usePlan();
  const [credits, setCredits] = useState<Credits | null>(null);
  const [orders, setOrders] = useState<number | null>(null);
  useEffect(() => {
    if (!session) return;
    let on = true;
    void Promise.all([
      supabase.rpc('credit_status', { _user_id: session.user.id }),
      supabase.from('book_orders').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
    ]).then(([c, o]) => { if (!on) return; setCredits((c.data as unknown as Credits[] | null)?.[0] ?? null); setOrders(o.error ? null : o.count ?? 0); });
    return () => { on = false; };
  }, [session?.user.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const space = SPACE[edition];
  const rows: [string, ReactNode][] = [
    ['Your edition', <Link key="e" to={`/${edition}`} className="underline underline-offset-4">{EDITION_NAME[edition]}’s Masterbook</Link>],
    ['Plan', loading ? '…' : PLAN_LABEL[plan] ?? plan],
    ['AI credits this month', !credits ? '…' : credits.unlimited ? 'Unlimited' : `${Math.max(0, credits.allowance - credits.used)} of ${credits.allowance} left`],
    ['Book orders', orders == null ? '…' : orders === 0 ? 'None yet' : <Link key="o" to="/orders" className="underline underline-offset-4">{orders}</Link>],
  ];
  if (space) rows.push(['Shared space', <Link key="s" to={space.to} className="underline underline-offset-4">{space.label}</Link>]);
  return (
    <aside aria-label="Your account at a glance" className="self-start rounded-sm border border-[hsl(var(--brass)/0.5)] p-4">
      <p className="font-label text-xs tracking-[0.16em] text-primary">Your account at a glance</p>
      <dl className="mt-3 space-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="flex items-baseline justify-between gap-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}</dl>
      <Link to="/credits" className="mt-3 inline-flex min-h-8 items-center text-sm underline underline-offset-4">Credits and plan</Link>
    </aside>
  );
}

/** The signed-in founder's own notes (their owned edition), or nothing for accounts that own no edition. */
export function MyFounderNews({ count, fallback = null }: { count?: number; fallback?: ReactNode }) {
  const { rows } = useOfficialEditions();
  if (!rows) return null;
  const own = rows.find(r => r.is_own)?.edition;
  return own ? <FounderNews edition={own} owns count={count} /> : <>{fallback}</>;
}
