import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SourceChapters } from '@/components/common/SourceChapters';
import { StartLink } from '@/components/common/StartLink';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { RETROGRADES_AT_BIRTH, PLACEMENTS } from '@/content/april';
import { useAprilSpace } from '@/hooks/useAprilSpace';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart, type ChartResult } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { isDoubleRx, retrogradeDebrief, retrogradeWindow, periodDays, periodsForChart, RETRO_MEANING, type RetroPeriod } from '@/lib/retrogrades';
import { NatalRetrogradeGuide } from '@/components/retrogood/NatalRetrogradeGuide';
import { ContinueExploring } from '@/components/common/ContinueExploring';
import { usePlan } from '@/hooks/usePlan';
import { TierGate } from '@/components/common/TierGate';
import journalImg from '@/assets/journaling-desk.jpg';

const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const fmtShort = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const deg = (p: { deg: number; min: number; sign: string }) => `${p.deg}°${String(p.min).padStart(2, '0')}′ ${p.sign}`;
const ordinal = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;

/**
 * Retrograde desk. Every account sees its own retrograde-at-birth planets from its saved chart and the coming year's
 * retrograde periods from the ephemeris, placed in its own houses. April's original edition keeps her written chapter.
 */
export default function Retrogrades() {
  usePageMeta('Retrograde Guide · Zodaci', 'Recent retrograde reviews, today’s sky, the next twelve months and your natal retrograde placements, calculated from the ephemeris.');
  const april = useAprilSpace();
  const birth = useMyBirth();
  const [retry, setRetry] = useState(0);
  const calculation = useMemo(() => {
    if (!birth) return { chart: null, error: false };
    try {
      const raw = computeChart(toChartInput(birth));
      const chart = birth.time ? raw : { ...raw, asc: null, mc: null, cusps: null, bodies: raw.bodies.map(b => ({ ...b, house: null })) };
      return { chart, error: false };
    } catch { return { chart: null, error: true }; }
  }, [birth, retry]);
  if (april === undefined || birth === undefined) return <p role="status" className="text-muted-foreground">Opening the Retrograde Guide…</p>;
  const { chart } = calculation;
  return (
    <article className="mx-auto max-w-6xl space-y-10">
      <PageHead eyebrow="Timing & cycles" title="Retrograde Guide" script="A second look, with your chart in view." art="planet">
        <p>See what recently turned direct, what is moving backwards now and what comes next. Then explore the planets that were retrograde at your birth. Dates and degrees are calculated; the reflections are astrological interpretations, not evidence of events in your life.</p>
      </PageHead>
      <nav aria-label="Retrograde Guide sections" className="flex flex-wrap gap-x-5 gap-y-3 border-y border-border py-4 text-sm">
        {[['recent-review', 'Recent review'], ['sky-now', 'Active sky'], ['coming-rx', 'Next twelve months'], ['natal-inward', 'Natal retrogrades']].map(([id, label]) => <a key={id} href={`#${id}`} className="ink-link">{label}</a>)}
      </nav>
      {calculation.error && <section role="alert" className="space-y-3"><p>Your saved chart could not be calculated. Sky dates remain available; personal houses and natal insights are left out.</p><Button variant="outline" onClick={() => setRetry(n => n + 1)}>Retry chart</Button><Button asChild variant="outline"><StartLink>Check birth details</StartLink></Button></section>}
      {!birth && <section className="space-y-3 border-y border-border py-6"><h2 className="text-2xl">Add your chart for personal context</h2><p>The sky dates below are shared by everyone. Your saved birth details add natal retrogrades and, with a birth time, the houses crossed by each cycle.</p><Button asChild variant="signal"><StartLink>Open birth details</StartLink></Button></section>}
      <ComingRetrogrades chart={chart} />
      {chart && <NatalRetrogradeGuide chart={chart} date={birth?.date ?? chart.input.date} />}
      {april && RETROGRADES_AT_BIRTH.length > 0 && <details className="border-y border-border py-5"><summary className="cursor-pointer font-display text-xl">April’s original retrograde chapter</summary><div className="pt-6"><AprilRetrogrades /></div></details>}
      <HowCalculated />
      <ContinueExploring links={[
        { to: '/timeline', title: 'Your timeline', text: 'See retrogrades alongside other planetary cycles.' },
        { to: '/results?tab=placements', title: 'Your placements', text: 'Read the same planets in the wider chart.' },
        { to: '/observation-log', title: 'Observation Log', text: 'Compare these themes with your own notes.' },
      ]} />
    </article>
  );
}

function ComingRetrogrades({ chart }: { chart: ChartResult | null }) {
  const today = useMemo(() => new Date(), []);
  const { plan, loading } = usePlan();
  const [retry, setRetry] = useState(0);
  const sky = useMemo(() => {
    try {
      const lookback = new Date(today.getTime() - 365 * 864e5);
      return { window: retrogradeWindow(periodsForChart(chart, lookback, 730), today), error: false };
    } catch { return { window: null, error: true }; }
  }, [chart, today, retry]);
  if (sky.error || !sky.window) return <section role="alert" className="space-y-3"><h2 className="text-2xl">The sky calendar could not be calculated</h2><p>No substitute dates have been shown.</p><Button variant="outline" onClick={() => setRetry(n => n + 1)}>Retry calendar</Button></section>;
  const { recent, active, upcoming, stations } = sky.window;
  const timed = !!chart?.input.time;
  const debrief = recent ? retrogradeDebrief(recent) : null;
  const row = (p: RetroPeriod) => <PeriodRow key={p.key + p.start.toISOString()} p={p} timed={timed} doubled={isDoubleRx(chart, p.key)} />;
  return <div className="space-y-10">
    <section id="recent-review" aria-labelledby="recent-heading" className="scroll-mt-28 space-y-4">
      <h2 id="recent-heading" className="text-2xl sm:text-3xl">The most recent review</h2>
      {recent && debrief ? <>
        <p className="text-lg">{recent.name} turned direct on {fmt(recent.end)}.</p>
        <ol>{row(recent)}</ol>
        <div className="max-w-3xl space-y-3 leading-relaxed"><p>{debrief.themes}</p><p className="border-l-2 border-primary pl-4 text-muted-foreground">{debrief.reflection}</p></div>
        {recent.postShadow && <p className="text-sm text-muted-foreground">{recent.postShadow > today ? `The post-shadow continues until ${fmt(recent.postShadow)}.` : `The post-shadow ended on ${fmt(recent.postShadow)}.`} This marks the return to the retrograde station degree, not a deadline for personal resolution.</p>}
      </> : <p>No completed cycle was found in the preceding twelve months.</p>}
    </section>
    <section id="sky-now" aria-labelledby="active-heading" className="scroll-mt-28 space-y-4">
      <h2 id="active-heading" className="text-2xl sm:text-3xl">Active sky · {fmt(today)}</h2>
      <p className="text-sm text-muted-foreground">UTC daily sampling. Station dates may differ from your local calendar by a day.</p>
      {stations.length ? <ul className="border-y border-border py-3 space-y-2">{stations.map(s => <li key={s.period.key + s.direction}>{s.period.name} stations {s.direction} today at {deg(s.direction === 'direct' ? s.period.to : s.period.from)}.</li>)}</ul> : <p>No sampled station falls on today’s UTC date.</p>}
      {active.length ? <ol className="space-y-4">{active.map(row)}</ol> : <p>No planet from Mercury to Pluto is in a retrograde cycle today.</p>}
    </section>
    <section id="coming-rx" aria-labelledby="calendar-heading" className="scroll-mt-28 space-y-4">
      <h2 id="calendar-heading" className="text-2xl sm:text-3xl">Your next twelve months</h2>
      <p className="max-w-3xl text-muted-foreground">Through {fmt(new Date(today.getTime() + 365 * 864e5))}. Pre-shadow begins at the future direct-station degree; post-shadow ends at the retrograde-station degree. Outer-planet shadows are degree recrossings too, though their interpretation varies by tradition.</p>
      <TierGate plan={plan} loading={loading} need="full" title="Twelve-month retrograde calendar" preview={`${upcoming.length} calculated cycles ahead, with station degrees, shadows and your chart’s house crossings.`}>
        {upcoming.length ? <ol className="space-y-4">{upcoming.map(row)}</ol> : <p>No new cycle starts in this window.</p>}
      </TierGate>
      {chart && !timed && <p className="text-sm text-muted-foreground">With a date-only chart, the calendar uses signs, degrees and natal retrograde matches. Houses and angles are omitted.</p>}
    </section>
  </div>;
}

function PeriodRow({ p, timed, doubled }: { p: RetroPeriod; timed: boolean; doubled: boolean }) {
  const m = RETRO_MEANING[p.key];
  return (
    <li className="obs-paper grid gap-3 p-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-5 sm:p-5">
      <div>
        <p className="flex items-center gap-2 font-display text-xl"><span aria-hidden className="text-primary">{p.glyph}</span>{p.name}</p>
        <p className="mt-1 text-sm font-semibold">{fmtShort(p.start)} – {fmt(p.end)}</p>
        <p className="text-xs text-muted-foreground">{periodDays(p)} days</p>
      </div>
      <div className="min-w-0 space-y-2">
        <p className="text-sm text-foreground/85">Turns back at {deg(p.from)} and turns forward again at {deg(p.to)}.</p>
        {p.preShadow && p.postShadow && <p className="text-sm text-muted-foreground">Shadow: {fmtShort(p.preShadow)} to {fmtShort(p.postShadow)} — the days it covers the same stretch of sky three times.</p>}
        {timed && p.houses && p.houses.length > 0 && <p className="text-sm"><span className="font-label text-[11px] tracking-[0.14em] text-primary">In your chart · </span>{p.houses.length === 1 ? `your ${ordinal(p.houses[0])} house` : `your ${p.houses.map(ordinal).join(' and ')} houses`}</p>}
        {doubled && <p className="text-sm"><span className="font-label text-[11px] tracking-[0.14em] text-accent">Double Rx · </span>you were born with {p.name} retrograde, so the same planet is retrograde in the sky and at birth. This is a placement match, not a prediction of stronger effects.</p>}
        {m && <p className="leading-relaxed text-foreground/80">{m.passing}</p>}
      </div>
    </li>
  );
}

function HowCalculated() {
  return (
    <aside className="obs-paper p-5 text-sm leading-relaxed text-foreground/80 sm:p-6">
      <p className="font-label text-xs tracking-[0.16em] text-primary">How this is calculated</p>
      <p className="mt-2">Positions come from the same astronomy library as your chart. Each planet is checked once a day: when its longitude goes down from one day to the next, it is retrograde. Dates are given in Universal Time and are accurate to within a day, so a station late in the evening in the Americas can show as the next day here. The meanings are traditional readings, not predictions.</p>
    </aside>
  );
}

/**
 * April's original chapter, restyled, followed by the general coming-year dates. Houses are left out here because an
 * authorized viewer may be looking at her edition, and the viewer's own chart must never be placed on her page.
 */
function AprilRetrogrades() {
  return (
    <div className="space-y-10">
      <PageHead eyebrow="Part Two · Retrograde Navigation" title="Four planets, turned inward." art="planet">
        <p>Four of the ten planets were retrograde the day she was born. Retrograde-at-birth is not a defect; it is a signature of a life whose most important work is done internally first, and then delivered.</p>
      </PageHead>
      <div className="obs-paper max-w-3xl p-2">
        <img src={journalImg} alt="A scholar's writing desk at night, lit by a single oil lamp" width={1200} height={800} className="h-auto w-full" loading="lazy" />
      </div>
      <div className="space-y-6">
        {RETROGRADES_AT_BIRTH.map(r => {
          const p = PLACEMENTS.find(pl => pl.key === r.planet);
          if (!p) return null;
          return (
            <div key={r.planet} className="obs-paper p-6">
              <div className="flex items-baseline gap-4">
                <div aria-hidden className="text-4xl text-primary">{p.glyph}</div>
                <div>
                  <div className="font-display text-2xl leading-tight">{p.name} Retrograde in {p.sign}</div>
                  <div className="mt-1 text-xs text-muted-foreground">House {p.house} · {p.degree}°{String(p.minute).padStart(2, '0')}′ · {p.dignity}</div>
                </div>
              </div>
              <div className="my-4 h-px w-16 bg-[hsl(var(--brass)/0.5)]" />
              <p className="leading-relaxed text-foreground/85">{r.meaning}</p>
              <Link to={`/planets/${p.key}`} className="ink-link mt-4 inline-block font-label text-xs tracking-[0.14em]">Full {p.name} chapter →</Link>
            </div>
          );
        })}
      </div>
      
      <SourceChapters match={/retrograde|\brx\b|stationing|shadow period/i} />
    </div>
  );
}
