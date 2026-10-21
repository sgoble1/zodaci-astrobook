import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { computeChart } from '@/lib/astro';
import { toChartInput, type MyBirth } from '@/lib/myBirth';
import { systemFacts } from '@/lib/systemFacts';
import { SYSTEM_READINGS } from '@/lib/topicReadings';
import { BoxArt } from '@/components/common/BoxArt';
import { useOnDemandReading } from '@/hooks/useOnDemandReading';
import { FounderSourcePanel } from '@/components/readings/FounderSourcePanel';

/** One Other Systems page calculated and written for the signed-in member. */
export function MemberSystem({ birth, slug }: { birth: MyBirth; slug: string }) {
  const facts = useMemo(() => { const c = computeChart(toChartInput(birth)); return systemFacts(slug, birth.date, c.bodies, c.bazi); }, [birth, slug]);
  const { row, writing, error, locked } = useOnDemandReading(`sys-${slug}`);
  if (!facts) return null;
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2"><h1 className="font-display text-4xl">{facts.title}</h1><p className="text-xl">{facts.summary}</p><p className="text-sm text-muted-foreground">{facts.method}</p></header>
      <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full text-sm"><tbody>{facts.rows.map(([k, v]) => <tr key={k} className="border-b border-border last:border-0"><th className="p-3 text-left font-normal text-muted-foreground">{k}</th><td className="p-3">{v}</td></tr>)}</tbody></table></div>
      {row === undefined ? <div className="h-24 animate-pulse rounded bg-muted" /> : row ? <div className="reading-prose"><ReactMarkdown remarkPlugins={[remarkGfm]}>{row.content}</ReactMarkdown></div>
        : error ? <p role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm text-destructive">{error}</p>
        : locked ? <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">The full {facts.title} reading is part of Pro. <Link to="/pricing" className="underline">See plans</Link></p>
        : <p role="status" className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">{writing ? `Writing your ${facts.title} reading from these values — about a minute. It saves to your account.` : 'Loading…'}</p>}
      <FounderSourcePanel theme={`sys-${slug}`} />
    </article>
  );
}

export function MemberSystemsDashboard({ birth }: { birth: MyBirth }) {
  const facts = useMemo(() => { const c = computeChart(toChartInput(birth)); return SYSTEM_READINGS.map(s => ({ s, f: systemFacts(s.slug.slice(4), birth.date, c.bodies, c.bazi) })); }, [birth]);
  return (
    <article className="mx-auto max-w-5xl space-y-6">
      <header><h1 className="font-display text-4xl">Other Systems</h1><p className="text-muted-foreground">Eight other traditions, each calculated from your own birth details, with a full reading for each.</p></header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{facts.map(({ s, f }) => <Link key={s.slug} to={s.route} className="block overflow-hidden rounded-lg border border-border bg-card hover:border-primary focus-visible:outline focus-visible:outline-2"><BoxArt seed={`${birth.date}-${s.slug}`} label={s.title} className="aspect-[16/9] w-full" /><div className="p-4"><h2 className="font-display text-lg">{s.title}</h2><p className="text-sm text-muted-foreground">{f?.summary}</p></div></Link>)}</div>
    </article>
  );
}
