import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Plan } from '@/content/navigation';

export const PLAN_LABEL: Record<Plan, string> = { free: 'Free', full: 'Pro', creator: 'Cosmic' };

/** Shown instead of a page the member's plan doesn't include. */
export function PlanLock({ need }: { need: Plan }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-4">
      <Lock className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
      <h1 className="font-display text-3xl">Part of {PLAN_LABEL[need]}</h1>
      <p className="text-muted-foreground">Your free plan includes your chart wheel, planets, houses, aspects, Explore & Discover and two full readings: Your Big Three and Personality & Strengths. {PLAN_LABEL[need]} unlocks this page, written from your own chart.</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild><Link to="/pricing">See {PLAN_LABEL[need]}</Link></Button>
        <Button asChild variant="outline"><Link to="/my-readings">Back to my readings</Link></Button>
      </div>
    </div>
  );
}
