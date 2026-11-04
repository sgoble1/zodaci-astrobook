import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ChartResult } from '@/lib/astro';
import { transitsTo, upcomingEvents } from '@/lib/transitOverlay';
import { broadcastChannels, compassFrom, type ChannelId, type CompassDomain } from '@/lib/currentChapter';
import { STAFF } from '@/lib/observatory';
import { RetroTV, SignalMeter, PanelTitle, StatusLight } from './Observatory';
import { StaffPortrait } from './StaffPortrait';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import sky from '@/assets/home-heads-hero.jpg';

/** Each channel frames a different part of the sky poster so changing channel visibly changes the picture. */
const FRAME: Record<ChannelId, string> = { chapter: '62% 30%', career: '88% 18%', relationship: '20% 40%', window: '45% 10%', growth: '80% 55%' };
const LINK: Record<ChannelId, [string, string]> = {
  chapter: ['/transits', 'Open the Forecast Center'], career: ['/my-readings', 'Career readings'], relationship: ['/relationships', 'Relationship Bureau'],
  window: ['/transits', 'Full 90-day forecast'], growth: ['/timeline', 'Timeline Hall'],
};
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

/** Broadcast Studio: five retro-TV channels plus the six Life Compass signals, all from today's real transits. */
export function CurrentChapterPanel({ chart, name }: { chart: ChartResult; name?: string }) {
  const hits = useMemo(() => { try { return transitsTo(chart, new Date()); } catch { return []; } }, [chart]);
  const events = useMemo(() => { try { return upcomingEvents(chart, new Date(), 31); } catch { return []; } }, [chart]);
  const channels = useMemo(() => broadcastChannels(hits, events), [hits, events]);
  const compass = compassFrom(hits);
  const [active, setActive] = useState<ChannelId>('chapter');
  const [tuning, setTuning] = useState(false);
  const timer = useRef<number>();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const ch = channels.find(c => c.id === active)!;
  const tune = (id: ChannelId) => {
    if (id === active) return;
    setActive(id);
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    setTuning(true); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setTuning(false), 700);
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const next = e.key === 'ArrowRight' ? (i + 1) % channels.length : e.key === 'ArrowLeft' ? (i - 1 + channels.length) % channels.length : e.key === 'Home' ? 0 : e.key === 'End' ? channels.length - 1 : -1;
    if (next < 0) return;
    e.preventDefault(); tune(channels[next].id); tabs.current[next]?.focus();
  };
  return (
    <section aria-labelledby="cc-h" className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow={`Broadcast Studio${name ? ` · ${name}` : ''}`} live><span id="cc-h">Current Chapter</span></PanelTitle>
        <div role="tablist" aria-label="Broadcast channels" className="mb-3 flex flex-wrap gap-1.5">
          {channels.map((c, i) => (
            <button key={c.id} ref={el => { tabs.current[i] = el; }} role="tab" id={`ch-${c.id}`} aria-selected={c.id === active} aria-controls="ch-panel" tabIndex={c.id === active ? 0 : -1}
              onClick={() => tune(c.id)} onKeyDown={e => onKey(e, i)}
              className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 font-label text-xs tracking-wider transition-colors duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                c.id === active ? 'border-primary bg-primary/15 text-primary' : 'border-[hsl(var(--brass)/0.45)] text-muted-foreground hover:text-foreground')}>
              <span aria-hidden>{c.number}</span><span className="hidden sm:inline">{c.name}</span><span className="sr-only sm:hidden">{c.name}</span>
            </button>
          ))}
        </div>
        <div id="ch-panel" role="tabpanel" aria-labelledby={`ch-${active}`} aria-live="polite">
          <RetroTV channel={`Channel ${ch.number} · ${ch.name}`} label={ch.hit ? `${ch.hit.transit.name} ${ch.hit.symbol} ${ch.hit.natalName}` : ch.id === 'window' ? `${ch.events.length} events` : 'Quiet sky'}>
            <div className="relative h-full w-full">
              <img src={sky} alt="" width={1920} height={1088} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-[object-position] duration-1000" style={{ objectPosition: FRAME[active] }} />
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background via-background/60 to-transparent p-5">
                <div className="flex items-center gap-2"><StaffPortrait id={ch.host} size={36} /><p className="font-label text-xs text-primary">{STAFF[ch.host].title} · now transmitting</p></div>
                <h3 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">{ch.title}</h3>
              </div>
              {tuning && <div aria-hidden className="obs-static-burst absolute inset-0" />}
            </div>
          </RetroTV>
          <p className="mt-4 leading-relaxed text-muted-foreground">{ch.summary}</p>
          {ch.events.length > 0 && (
            <ul className="mt-3 space-y-2">{ch.events.map(e => (
              <li key={`${e.title}-${e.date.toISOString()}`} className="parchment flex gap-3 p-3 text-sm">
                <span className="font-label shrink-0 text-primary">{fmtDay(e.date)}</span>
                <span><span className="font-medium">{e.title}</span><span className="block text-muted-foreground">{e.detail}</span></span>
              </li>
            ))}</ul>
          )}
          <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="signal" size="sm"><Link to={LINK[active][0]}>{LINK[active][1]}</Link></Button><Button asChild variant="outline" size="sm"><Link to="/timeline">Timeline Hall</Link></Button></div>
        </div>
      </div>
      <div className="obs-panel p-5 sm:p-6">
        <PanelTitle eyebrow="Analyst’s desk">Life Compass</PanelTitle>
        <div className="space-y-4">{(Object.keys(compass) as CompassDomain[]).map(d => <SignalMeter key={d} label={d} value={compass[d]} />)}</div>
        <p className="mt-5 text-xs text-muted-foreground"><StatusLight tone="info" /> Signal strength counts how strongly today’s planets touch the chart points tied to each area. It measures activity, not good or bad luck.</p>
      </div>
    </section>
  );
}
