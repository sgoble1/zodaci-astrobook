import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { computeChart } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { buildReadings, risingLine } from '@/lib/readings';
import { BoxArt } from '@/components/common/BoxArt';
import { TopicReadings } from '@/components/readings/TopicReadings';
import { Button } from '@/components/ui/button';
import { ThemeArt } from '@/components/common/ThemeArt';
import { CORE_THEMES, FREE_READINGS, READING_FILTERS, TOPIC_READINGS, readingMatches, type ReadingFilter } from '@/lib/topicReadings';
import { usePlan } from '@/hooks/usePlan';
import { StartLink } from '@/components/common/StartLink';
import { PageHead } from '@/components/observatory/PageHead';

const PILL = 'inline-flex min-h-10 items-center rounded-sm border border-[hsl(var(--brass)/0.5)] px-3.5 font-label text-sm tracking-[0.1em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

/** Personal life-area readings built only from the member's own calculated chart. */
export default function MyReadings() {
  const birth = useMyBirth();
  const { plan } = usePlan();
  const [filter, setFilter] = useState<ReadingFilter | null>(null);
  const chart = useMemo(() => birth ? computeChart({ ...toChartInput(birth), houseSystem: birth.houseSystem }) : null, [birth]);
  const readings = useMemo(() => chart ? buildReadings(chart, !!birth?.time, birth?.date) : [], [chart, birth]);
  if (birth === undefined) return <p role="status">Loading your readings…</p>;
  if (!birth || !chart) return (
    <article className="obs-panel mx-auto max-w-lg space-y-4 p-8 text-center">
      <p className="font-label text-xs tracking-[0.16em] text-primary">Reading Shelf</p>
      <h1 className="font-display text-3xl">Your readings need a chart first</h1>
      <p className="text-muted-foreground">Every reading here is written from your own placements, so we need your birth date, time and place.</p>
      <Button asChild><StartLink>Enter my birth details</StartLink></Button>
    </article>
  );
  return (
    <article className="space-y-8">
      <PageHead eyebrow={birth.name ? `Reading Shelf · ${birth.name}` : 'Reading Shelf'} title="My readings" script="Written from your chart, for you alone." art="written">
        <p>Each reading is written only from your calculated placements, with no guessed family details or life events. {risingLine(chart) ?? ''}</p>
      </PageHead>
      <div className="space-y-3">
        <nav aria-label="Reading sections" className="flex flex-wrap gap-2">
          {[['#topics', `In-depth topics · ${TOPIC_READINGS.length}`], ['#core-themes', `Core themes · ${CORE_THEMES.length}`], ['#quick', `Quick readings · ${readings.length}`]].map(([href, label]) => <a key={href} href={href} className={PILL + ' text-foreground hover:bg-muted'}>{label}</a>)}
        </nav>
        <div role="group" aria-label="Filter readings" className="flex flex-wrap gap-2">
          {[null, ...READING_FILTERS].map(f => <button key={f ?? 'all'} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`${PILL} ${filter === f ? 'border-primary bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>{f ?? 'All'}</button>)}
        </div>
      </div>
      <TopicReadings seed={`${birth.date}-${birth.placeLabel}`} filter={filter} />
      <section id="core-themes" aria-labelledby="core-h" className="scroll-mt-24 space-y-4">
        <h2 id="core-h" className="font-display text-3xl">Core themes</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">Twelve everyday themes read from your chart. {plan === 'free' ? 'Personality & Strengths is free in full; the others open with a free first section.' : 'Each one is written in full from your placements.'}</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CORE_THEMES.filter(t => readingMatches(t.slug, filter)).map(t => <li key={t.slug}><Link to={`/my-readings/topic/${t.slug}`} className="obs-paper flex min-h-16 items-center gap-3 p-3 transition-colors duration-500 hover:border-[hsl(var(--brass)/0.7)] focus-visible:outline focus-visible:outline-2">
            <ThemeArt label={t.title} className="h-10 w-10 shrink-0" orbit={false} />
            <span className="min-w-0"><span className="block font-display text-base leading-tight">{t.title}</span>{plan === 'free' && <span className="text-xs text-muted-foreground">{FREE_READINGS.includes(t.slug) ? 'Free' : 'Free first section'}</span>}</span>
          </Link></li>)}
        </ul>
      </section>
      <h2 id="quick" className="scroll-mt-24 font-display text-3xl">Quick readings</h2>
      <nav aria-label="Quick readings" className="-mt-4 flex flex-wrap gap-2">
        {readings.map(r => <a key={r.key} href={`#${r.key}`} className="inline-flex min-h-11 items-center rounded-sm border border-[hsl(var(--brass)/0.5)] px-3 py-1 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2">{r.title}</a>)}
      </nav>
      {readings.map(r => (
        <section key={r.key} id={r.key} aria-labelledby={`${r.key}-h`} className="obs-paper grid gap-5 p-5 md:grid-cols-[180px_1fr]">
          <BoxArt seed={r.art} label={r.title} className="aspect-square w-full rounded" />
          <div className="space-y-3">
            <h2 id={`${r.key}-h`} className="font-display text-2xl">{r.title}</h2>
            <div><h3 className="font-label text-xs tracking-[0.16em] text-primary">Key facts</h3><ul className="mt-1 list-disc pl-5 text-sm">{r.facts.map(f => <li key={f}>{f}</li>)}</ul></div>
            <div><h3 className="font-label text-xs tracking-[0.16em] text-primary">In plain words</h3><p className="text-sm">{r.plain}</p></div>
            <div><h3 className="font-label text-xs tracking-[0.16em] text-primary">Daily life</h3><p className="text-sm">{r.daily}</p></div>
            <div><h3 className="font-label text-xs tracking-[0.16em] text-primary">Reflection questions</h3><ul className="mt-1 list-disc pl-5 text-sm">{r.questions.map(q => <li key={q}>{q}</li>)}</ul></div>
          </div>
        </section>
      ))}
      <p className="text-xs text-muted-foreground">Positions are calculated from astronomical data; meanings are traditional astrology, offered for reflection rather than as proven fact.</p>
    </article>
  );
}
