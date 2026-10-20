import { useMemo, useState } from 'react';
import type { ChartResult } from '@/lib/astro';
import { transitPositions, transitsTo, upcomingEvents } from '@/lib/transitOverlay';
import { Input } from '@/components/ui/input';

const toInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** MOD-007: transits to the natal chart on any date, a 90-day timeline and RetroGOOD Rx flags (double-Rx windows highlighted). */
export function TransitOverlay({ chart }: { chart: ChartResult }) {
  const [day, setDay] = useState(() => toInput(new Date()));
  const date = useMemo(() => { const [y, m, d] = day.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); }, [day]);
  const positions = useMemo(() => transitPositions(date), [date]);
  const hits = useMemo(() => transitsTo(chart, date).slice(0, 12), [chart, date]);
  const events = useMemo(() => upcomingEvents(chart, date, 90), [chart, date]);
  const rx = positions.filter(p => p.retro);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Date<Input type="date" className="mt-1 w-auto" value={day} onChange={e => e.target.value && setDay(e.target.value)} /></label>
        <button type="button" className="text-sm text-primary underline" onClick={() => setDay(toInput(new Date()))}>Today</button>
        <p className="text-sm text-muted-foreground">{rx.length ? `Retrograde on this date: ${rx.map(p => p.name).join(', ')}.` : 'No planets are retrograde on this date.'}</p>
      </div>
      <section aria-labelledby="tr-now">
        <h3 id="tr-now" className="font-display text-xl">Active transits</h3>
        {hits.length ? <ul className="mt-3 grid gap-3 md:grid-cols-2">{hits.map((h, i) => (
          <li key={i} className={`rounded-lg border bg-card p-4 ${h.transit.retro && h.natalRetro ? 'border-gold' : 'border-border'}`}>
            <p className="font-medium">{h.transit.glyph} {h.transit.name} {h.symbol} natal {h.natalName}</p>
            <p className="text-xs text-muted-foreground">{h.type} · {h.orb.toFixed(1)}° · {h.applying ? 'applying (building)' : 'separating (easing)'}</p>
            <p className="mt-1 text-sm">{h.text}</p>
            {h.transit.retro && <p className="mt-2 inline-block rounded-full border border-gold/50 px-2 py-0.5 text-xs text-gold">Transit planet in RetroGOOD Rx period{h.natalRetro ? ' · double Rx' : ''}</p>}
          </li>))}</ul> : <p className="mt-2 text-sm text-muted-foreground">No close transits to your chart on this date.</p>}
      </section>
      <section aria-labelledby="tr-90">
        <h3 id="tr-90" className="font-display text-xl">Next 90 days</h3>
        {events.length ? <ol className="relative mt-3 space-y-3 border-l border-border pl-5">{events.map((e, i) => (
          <li key={i} className="relative">
            <span className={`absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full ${e.doubleRx ? 'bg-gold' : e.kind === 'station' ? 'bg-primary' : e.kind === 'exact' ? 'bg-accent' : 'bg-muted-foreground'}`} aria-hidden />
            <p className="text-xs text-muted-foreground">{e.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>
            <p className="font-medium">{e.title}{e.doubleRx ? ' · double Rx window' : ''}</p>
            <p className="text-sm">{e.detail}</p>
          </li>))}</ol> : <p className="mt-2 text-sm text-muted-foreground">A quiet stretch: no major transit events in the next 90 days.</p>}
      </section>
    </div>
  );
}
