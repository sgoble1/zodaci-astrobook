import { useMemo } from 'react';
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
import { natalRetrogrades, periodDays, periodsForChart, RETRO_MEANING, type RetroPeriod } from '@/lib/retrogrades';
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
  usePageMeta('Retrogrades · Zodaci', 'Which planets were retrograde when you were born, and every retrograde period in the coming year, placed in your own chart.');
  const april = useAprilSpace();
  const birth = useMyBirth();
  const chart = useMemo<ChartResult | null>(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  if (april === undefined || birth === undefined) return <p role="status" className="text-muted-foreground">Opening the retrograde desk…</p>;
  if (april && RETROGRADES_AT_BIRTH.length > 0) return <AprilRetrogrades chart={chart} />;
  return (
    <div className="space-y-8">
      <PageHead eyebrow="Retrograde desk · calculated from the ephemeris" title="Retrogrades" script="When a planet seems to turn back." art="planet">
        <p>From Earth, every planet except the Sun and Moon sometimes appears to slow, stop and move backwards for a while. Astrologers read these stretches as times to review rather than start. Below: the planets that were retrograde when you were born, and every retrograde period in the next twelve months.</p>
      </PageHead>
      {chart ? <BornRetrograde chart={chart} /> : (
        <section className="obs-paper space-y-3 p-5 sm:p-6">
          <p className="font-label text-xs tracking-[0.16em] text-primary">Born retrograde</p>
          <h2 className="font-display text-2xl">Add your birth details to see yours</h2>
          <p className="max-w-2xl text-foreground/80">Which planets were retrograde at your birth, and which of your houses each coming retrograde passes through, both come from your own chart. The dates below are the same for everyone.</p>
          <Button asChild variant="signal"><StartLink>Open birth details</StartLink></Button>
        </section>
      )}
      <ComingRetrogrades chart={chart} />
      <HowCalculated />
    </div>
  );
}

function BornRetrograde({ chart }: { chart: ChartResult }) {
  const rx = natalRetrogrades(chart);
  const timed = !!chart.input.time;
  return (
    <section className="space-y-4" aria-labelledby="born-rx">
      <div>
        <p className="font-label text-xs tracking-[0.16em] text-primary">Born retrograde</p>
        <h2 id="born-rx" className="font-display text-2xl sm:text-3xl">{rx.length === 0 ? 'No planets were retrograde when you were born' : `${rx.length} ${rx.length === 1 ? 'planet was' : 'planets were'} retrograde when you were born`}</h2>
        <div className="mt-3 h-px max-w-xs bg-[hsl(var(--brass)/0.5)]" />
        <p className="mt-3 max-w-3xl text-foreground/80">{rx.length === 0
          ? 'Every planet from Mercury to Pluto was moving forward on your birth day. That is less common than it sounds: most people are born with at least one of the slow outer planets retrograde.'
          : 'A planet that was retrograde at birth is traditionally read as working inward first. It is not a fault or a weakness. The outer planets are retrograde for months every year, so those are shared by everyone born around the same time.'}</p>
      </div>
      {rx.length > 0 && <ul className="grid gap-3 md:grid-cols-2">
        {rx.map(b => {
          const m = RETRO_MEANING[b.key];
          return (
            <li key={b.key} className="obs-paper p-5">
              <div className="flex items-baseline gap-4">
                <span aria-hidden className="text-4xl text-primary">{b.glyph}</span>
                <div className="min-w-0">
                  <h3 className="font-display text-xl leading-tight">{b.name} retrograde in {b.sign}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.deg}°{String(b.min).padStart(2, '0')}′{timed && b.house ? ` · ${ordinal(b.house)} house` : ''}{m ? ` · ${m.theme}` : ''}</p>
                </div>
              </div>
              {m && <p className="mt-3 leading-relaxed text-foreground/85"><span className="font-label text-[11px] tracking-[0.14em] text-accent">Traditional reading · </span>{m.natal}</p>}
              <Link to={`/planets/${b.key}`} className="ink-link mt-3 inline-block font-label text-xs tracking-[0.14em]">Your {b.name} page →</Link>
            </li>
          );
        })}
      </ul>}
    </section>
  );
}

function ComingRetrogrades({ chart }: { chart: ChartResult | null }) {
  const today = useMemo(() => new Date(), []);
  const periods = useMemo(() => periodsForChart(chart, today, 365), [chart, today]);
  const natalRx = useMemo(() => new Set(chart ? natalRetrogrades(chart).map(b => b.key) : []), [chart]);
  const now = periods.filter(p => p.start <= today && p.end >= today);
  const next = periods.filter(p => p.start > today);
  const timed = !!chart?.input.time;
  return (
    <section className="space-y-5" aria-labelledby="coming-rx">
      <div>
        <p className="font-label text-xs tracking-[0.16em] text-primary">The coming year</p>
        <h2 id="coming-rx" className="font-display text-2xl sm:text-3xl">Retrograde periods, {fmtShort(today)} to {fmt(new Date(today.getTime() + 365 * 864e5))}</h2>
        <div className="mt-3 h-px max-w-xs bg-[hsl(var(--brass)/0.5)]" />
      </div>
      <div className="obs-panel p-5 sm:p-6">
        <p className="font-label text-xs tracking-[0.16em] text-primary">In the sky today</p>
        {now.length === 0 ? <p className="mt-2 text-foreground/85">No planet is retrograde today.</p> : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {now.map(p => <li key={p.key + p.start.toISOString()} className="rounded-sm border border-[hsl(var(--brass)/0.5)] px-3 py-1.5 text-sm"><span aria-hidden className="mr-1 text-primary">{p.glyph}</span>{p.name} until {fmtShort(p.end)}</li>)}
          </ul>
        )}
      </div>
      {next.length === 0 ? <p className="text-muted-foreground">No new retrograde periods begin in the next twelve months.</p> : (
        <ol className="space-y-3">
          {next.map(p => <PeriodRow key={p.key + p.start.toISOString()} p={p} timed={timed} doubled={natalRx.has(p.key)} />)}
        </ol>
      )}
      {chart && !timed && <p className="text-sm text-muted-foreground">Your chart has no birth time, so houses are left out. Add a birth time to see which part of your life each period passes through.</p>}
    </section>
  );
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
        {doubled && <p className="text-sm"><span className="font-label text-[11px] tracking-[0.14em] text-accent">Born retrograde · </span>you were born with {p.name} retrograde, so these periods are traditionally said to feel familiar.</p>}
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

/** April's original chapter (her account only), restyled, followed by the same calculated coming-year list. */
function AprilRetrogrades({ chart }: { chart: ChartResult | null }) {
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
      <ComingRetrogrades chart={chart} />
      <SourceChapters match={/retrograde|\brx\b|stationing|shadow period/i} />
    </div>
  );
}
