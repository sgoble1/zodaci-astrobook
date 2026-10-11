import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { buildReadings, risingLine } from '@/lib/readings';
import { BoxArt } from '@/components/common/BoxArt';
import { TopicReadings } from '@/components/readings/TopicReadings';
import { Button } from '@/components/ui/button';

/** Personal life-area readings built only from the member's own calculated chart. */
export default function MyReadings() {
  const birth = useMyBirth();
  const chart = useMemo(() => birth ? computeChart({ ...toChartInput(birth), houseSystem: birth.houseSystem }) : null, [birth]);
  const readings = useMemo(() => chart ? buildReadings(chart, !!birth?.time, birth?.date) : [], [chart, birth]);
  if (birth === undefined) return <p role="status">Loading your readings…</p>;
  if (!birth || !chart) return (
    <article className="mx-auto max-w-lg space-y-4 py-10 text-center">
      <h1 className="font-display text-3xl">Your readings need a chart first</h1>
      <Button asChild><Link to="/start">Enter my birth details</Link></Button>
    </article>
  );
  return (
    <article className="space-y-8">
      <header>
        <p className="font-smallcaps text-xs text-gold">{birth.name ? `${birth.name}'s readings` : 'Your readings'}</p>
        <h1 className="font-display mt-1 text-4xl">My readings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Each reading is written only from your calculated placements — no guessed family details or life events. {risingLine(chart) ?? ''}</p>
        <nav aria-label="Reading sections" className="mt-4 flex flex-wrap gap-2">
          {readings.map(r => <a key={r.key} href={`#${r.key}`} className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2">{r.title}</a>)}
        </nav>
      </header>
      <TopicReadings seed={`${birth.date}-${birth.placeLabel}`} />
      <h2 className="font-display text-3xl">Quick readings</h2>
      {readings.map(r => (
        <section key={r.key} id={r.key} aria-labelledby={`${r.key}-h`} className="grid gap-5 rounded-lg border border-border bg-card p-5 md:grid-cols-[180px_1fr]">
          <BoxArt seed={r.art} label={r.title} className="aspect-square w-full rounded" />
          <div className="space-y-3">
            <h2 id={`${r.key}-h`} className="font-display text-2xl">{r.title}</h2>
            <div><h3 className="font-smallcaps text-xs text-gold">Key facts</h3><ul className="mt-1 list-disc pl-5 text-sm">{r.facts.map(f => <li key={f}>{f}</li>)}</ul></div>
            <div><h3 className="font-smallcaps text-xs text-gold">In plain words</h3><p className="text-sm">{r.plain}</p></div>
            <div><h3 className="font-smallcaps text-xs text-gold">Daily life</h3><p className="text-sm">{r.daily}</p></div>
            <div><h3 className="font-smallcaps text-xs text-gold">Reflection questions</h3><ul className="mt-1 list-disc pl-5 text-sm">{r.questions.map(q => <li key={q}>{q}</li>)}</ul></div>
          </div>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">Positions are calculated from astronomical data; meanings are traditional astrology, offered for reflection rather than as proven fact.</p>
    </article>
  );
}
