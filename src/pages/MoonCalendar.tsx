import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHead } from '@/components/observatory/PageHead';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';
import { computeChart, type ChartResult } from '@/lib/astro';
import { toChartInput, useMyBirth } from '@/lib/myBirth';
import { lunarCalendar } from '@/lib/lunarCalendar';

const ord = (n: number) => `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`;
const MARK: Record<string, string> = { 'New Moon': '●', 'First Quarter': '◐', 'Full Moon': '○', 'Last Quarter': '◑' };

/** Personal Moon calendar: the next six months of Moon phases from the ephemeris, placed in the member's own chart. */
export default function MoonCalendar() {
  usePageMeta('Moon Calendar · Zodaci', 'Every New Moon, Full Moon and quarter for the next six months, with the sign and the house of your own chart each one falls in.');
  const birth = useMyBirth();
  const chart = useMemo<ChartResult | null>(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const days = useMemo(() => lunarCalendar(new Date(), 6, chart), [chart]);
  const tz = birth?.tz;
  const months = useMemo(() => {
    const m = new Map<string, typeof days>();
    for (const d of days) { const k = d.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: tz }); m.set(k, [...(m.get(k) ?? []), d]); }
    return [...m];
  }, [days, tz]);
  if (birth === undefined) return <p role="status" className="text-muted-foreground">Opening the Moon calendar…</p>;
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
      {birth && !chart?.cusps && <p className="text-sm text-muted-foreground">Your birth time isn't saved, so houses are left out. Contacts with your planets are still shown.</p>}
      {months.map(([month, list]) => (
        <section key={month} className="space-y-3">
          <h2 className="font-display text-2xl">{month}</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {list.map(d => (
              <li key={d.date.toISOString()} className="obs-paper p-4">
                <p className="font-label text-sm tracking-[0.12em] text-primary"><span aria-hidden>{MARK[d.phase]} </span>{d.phase}</p>
                <p className="font-semibold">{d.date.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: tz, timeZoneName: 'short' })}</p>
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
