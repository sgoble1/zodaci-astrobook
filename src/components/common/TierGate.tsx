import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAN_NAME } from '@/lib/plans';
import type { Plan } from '@/content/navigation';

export const PLAN_RANK: Record<Plan, number> = { free: 0, full: 1, creator: 2 };
export const meetsPlan = (plan: Plan, need: Plan) => PLAN_RANK[plan] >= PLAN_RANK[need];

/**
 * Rank-based gate: free=0, Pro=1, Cosmic=2. Renders children when the member's plan meets `need`.
 * Otherwise shows a blurred locked card built from `teaser` (never the real content) with an upgrade link.
 */
export function TierGate({ plan, loading, need, title, teaser, children }: { plan: Plan; loading?: boolean; need: Plan; title: string; teaser?: ReactNode; children: ReactNode }) {
  if (loading) return <div className="h-32 animate-pulse rounded-lg border border-border bg-card/60" role="status" aria-label="Loading" />;
  if (meetsPlan(plan, need)) return <>{children}</>;
  return (
    <section className="relative overflow-hidden rounded-lg border border-gold/40 bg-card" aria-label={`${title} — part of ${PLAN_NAME[need]}`}>
      <div className="pointer-events-none select-none p-5 blur-sm" aria-hidden>{teaser ?? <div className="space-y-2">{[0, 1, 2].map(i => <div key={i} className="h-3 rounded bg-muted" style={{ width: `${90 - i * 15}%` }} />)}</div>}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/60 p-4 text-center">
        <p className="flex items-center gap-2 font-display text-lg"><Lock className="h-4 w-4 text-gold" aria-hidden />{title}</p>
        <p className="text-sm text-muted-foreground">Included with {PLAN_NAME[need]}{need === 'full' ? ' and Cosmic' : ''}.</p>
        <Button asChild size="sm"><Link to={`/pricing?plan=${need === 'creator' ? 'cosmic' : 'pro'}`}>See {PLAN_NAME[need]}</Link></Button>
      </div>
    </section>
  );
}
