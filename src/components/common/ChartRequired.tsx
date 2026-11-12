import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StartLink } from '@/components/common/StartLink';
import { computeChart, type ChartResult } from '@/lib/astro';
import { toChartInput, useMyBirth, type MyBirth } from '@/lib/myBirth';

/**
 * Renders its children with the signed-in account's own calculated chart (or the shared edition being viewed).
 * Without saved birth details it asks for them instead of falling back to anyone else's chart.
 */
export function ChartRequired({ what, children }: { what: string; children: (v: { chart: ChartResult; birth: MyBirth }) => ReactNode }) {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (birth === undefined) return <div role="status" aria-label="Opening your chart" className="space-y-4"><Skeleton className="h-36 w-full" /><Skeleton className="h-64 w-full" /></div>;
  if (!birth || !chart) return (
    <article className="obs-paper mx-auto max-w-xl space-y-4 p-8 text-center">
      <h1 className="font-display text-3xl">This page is built from your own chart</h1>
      <p className="text-muted-foreground">Add your birth date, time and place to {what}. Nothing here is drawn from anyone else’s chart.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild><StartLink>Enter my birth details</StartLink></Button>
        <Button asChild variant="outline"><Link to="/explore">Back to Explore</Link></Button>
      </div>
    </article>
  );
  return <>{children({ chart, birth })}</>;
}
