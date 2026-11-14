import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart, type ChartResult } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { lunarCalendar, type LunarDay } from '@/lib/lunarCalendar';
import { skyAt, dualTime } from '@/lib/skyNow';
import type { BodyPos } from '@/lib/astro';

const ord = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const MARK: Record<string, string> = { 'New Moon': '●', 'First Quarter': '◐', 'Full Moon': '○', 'Last Quarter': '◑' };

/** Personal Moon calendar: the next six months of Moon phases from the ephemeris, placed in the member's own chart. */
export default function MoonCalendar() {
  usePageMeta('Moon Calendar · Zodaci', 'Every New Moon, Full Moon and quarter for the next six months, with the sign and the house of your own chart each one falls in.');
  const birth = useMyBirth();
  const chart = useMemo<ChartResult | null>(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const [attempt, setAttempt] = useState(0);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { setNow(new Date()); }, [attempt]);
  const calc = useMemo<{ days: LunarDay[]; sky: BodyPos[] } | Error>(() => {
    try { return { days: lunarCalendar(now, 6, chart), sky: skyAt(now) }; } catch (e) { return e instanceof Error ? e : new Error('Calculation failed'); }
  }, [chart, now]);
  const days = calc instanceof Error ? [] : calc.days;
  const tz = birth?.tz || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const months = useMemo(() => {
    const m = new Map<string, typeof days>();
    for (const d of days) { const k = d.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: tz }); m.set(k, [...(m.get(k) ?? []), d]); }
    return [...m];
  }, [days, tz]);
  if (birth === undefined) return (
    <div role="status" aria-label="Calculating the Moon calendar" className="space-y-4">
      <div className="h-10 w-64 animate-pulse rounded bg-card" />
      <div className="grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded bg-card" />)}</div>
    </div>
  );
  const stamp = dualTime(now, tz);
  return (
    <div className="space-y-8">
      <PageHead eyebrow="Moon calendar · calculated from the ephemeris" title="Moon Calendar" script="Your next six months of Moons." art="planet">
        <p>Every New Moon, First Quarter, Full Moon and Last Quarter for the next six months. The dates and signs are the same for everyone; the house and the close contacts come from your own chart.</p>
      </PageHead>
      {!birth && (
        <section className="obs-paper space-y-3 p-5">
          <h2 className="font-display text-2xl">Add your birth details to make it personal</h2>
          <p className="text-foreground/80">With your chart saved, each Moon shows which of your houses it lands in and any planet of yours it touches.</p>
          <Button asChild size="sm"><Link to="/start">Add birth details</Link></Button>
        </section>
      )}
      {calc instanceof Error ? (
        <section role="alert" className="obs-paper space-y-3 border-l-4 border-destructive p-5">
          <h2 className="font-display text-2xl">We couldn't calculate the Moon right now</h2>
          <p className="text-foreground/80">The ephemeris didn't return positions ({calc.message}). Nothing is shown in its place. Try again in a moment.</p>
          <Button size="sm" onClick={() => setAttempt(a => a + 1)}>Retry</Button>
        </section>
      ) : (
        <section aria-labelledby="sky-now" className="obs-paper space-y-3 p-5">
          <h2 id="sky-now" className="font-display text-2xl">Today's ephemeris</h2>
          <p className="text-sm text-muted-foreground">Calculated for <b>{stamp.utc}</b> · your time {stamp.local}. Positions are geocentric and the same for everyone; signs change on UTC time.</p>
          <ul className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {calc.sky.map(b => <li key={b.key} className="flex justify-between border-b border-border/50 py-1"><span>{b.glyph} {b.name}</span><span className="font-mono">{b.deg}°{String(b.min).padStart(2, '0')}′ {b.sign}{b.retro && b.key !== 'node' ? ' ℞' : ''}</span></li>)}
          </ul>
          <Button size="sm" variant="ghost" onClick={() => setAttempt(a => a + 1)}>Recalculate for now</Button>
        </section>
      )}
      {!(calc instanceof Error) && days.length === 0 && <p className="obs-paper p-5">No Moon phases fall in this window. Recalculate to start from today.</p>}
      {days.length > 0 && <p className="text-sm text-muted-foreground">Phase times below are shown in {birth?.tz ? 'your birthplace time zone' : 'your device time zone'} ({tz}), with UTC alongside.</p>}
      {birth && !chart?.cusps && <p className="text-sm text-muted-foreground">Your birth time isn't saved, so houses are left out. Contacts with your planets are still shown.</p>}
      {months.map(([month, list]) => (
        <section key={month} className="space-y-3">
          <h2 className="font-display text-2xl">{month}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map(d => (
              <li key={d.date.toISOString()} className="obs-paper p-4">
                <p className="font-label text-sm tracking-[0.12em] text-primary"><span aria-hidden>{MARK[d.phase]} </span>{d.phase}</p>
                <p className="font-semibold">{d.date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' })}</p>
                <p className="text-xs text-muted-foreground">{dualTime(d.date).utc}</p>
                <p className="text-sm">Moon at {d.deg}° {d.sign}{d.house ? ` · your ${ord(d.house)} house` : ''}</p>
                {d.contacts.length > 0 && <p className="text-sm text-muted-foreground">Touches your {d.contacts.join(', ')} (within 3°)</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
