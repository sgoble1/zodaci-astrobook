import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ChartResult } from '@/lib/astro';
import { transitPositions, transitsTo, upcomingEvents } from '@/lib/transitOverlay';
import { broadcastChannels, compassFrom, contactReflection, shortDay, type ChannelId, type CompassDomain } from '@/lib/currentChapter';
import { STAFF } from '@/lib/observatory';
import { RetroTV, SignalMeter, PanelTitle, StatusLight } from './Observatory';
import { StaffPortrait } from './StaffPortrait';
import { CHANNEL_ICONS } from '@/components/icons/registry';
import { RetroEmblem } from '@/components/icons/RetroIcons';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import chapterArt from '@/assets/channels/channel-chapter.jpg';
import careerArt from '@/assets/channels/channel-career.jpg';
import relationshipArt from '@/assets/channels/channel-relationship.jpg';
import windowArt from '@/assets/channels/channel-window.jpg';
import growthArt from '@/assets/channels/channel-growth.jpg';

/** Each channel has its own 1950s broadcast card, so changing channel visibly changes the picture. */
const CHANNEL_ART: Record<ChannelId, string> = { chapter: chapterArt, career: careerArt, relationship: relationshipArt, window: windowArt, growth: growthArt };
const LINK: Record<ChannelId, [string, string]> = {
  chapter: ['/forecast', 'Open the Forecast Center'], career: ['/my-readings', 'Career readings'], relationship: ['/relationships', 'Relationship Bureau'],
  window: ['/forecast#sky-calendar', 'Full 30-day forecast'], growth: ['/timeline', 'Timeline Hall'],
};

/** Broadcast Studio: five retro-TV channels plus the six Life Compass signals, all from today's real sky. */
export function CurrentChapterPanel({ chart, name }: { chart: ChartResult; name?: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => { if (!document.hidden) setNow(new Date()); };
    const interval = window.setInterval(refresh, 5 * 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(interval); document.removeEventListener('visibilitychange', refresh); };
  }, []);
  const hits = useMemo(() => { try { return transitsTo(chart, now); } catch { return []; } }, [chart, now]);
  const events = useMemo(() => { try { return upcomingEvents(chart, now, 31); } catch { return []; } }, [chart, now]);
  const sky = useMemo(() => { try { return transitPositions(now); } catch { return []; } }, [now]);
  const channels = useMemo(() => broadcastChannels(hits, events, now, sky), [hits, events, now, sky]);
  const compass = compassFrom(hits);
  const [active, setActive] = useState<ChannelId>('chapter');
  const [tuning, setTuning] = useState(false);
  const timer = useRef<number>();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  // Full-screen TV: the browser's own full-screen mode on the set itself; Esc exits.
  const stage = useRef<HTMLDivElement>(null);
  const [full, setFull] = useState(false);
  const canFull = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  useEffect(() => {
    const on = () => setFull(document.fullscreenElement === stage.current);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  const toggleFull = () => { if (document.fullscreenElement) void document.exitFullscreen?.(); else void stage.current?.requestFullscreen?.().catch(() => {}); };
  // The sky wire: every planet's position today, then this chart's live contacts, crawling slowly under the picture.
  const wire = useMemo(() => [
    ...sky.map(p => `${p.glyph}\uFE0E ${p.name} ${p.deg}° ${p.sign}${p.retro ? ' Rx' : ''}`),
    ...hits.slice(0, 6).map(h => `${h.transit.name} ${h.symbol}\uFE0E natal ${h.natalName} · orb ${h.orb.toFixed(1)}°`),
  ], [sky, hits]);
  const ch = channels.find(c => c.id === active);
  if (!ch) return null;
  const idx = channels.findIndex(c => c.id === active);
  // Reception: a tight contact comes in clear; a quiet channel is a faint carrier signal.
  const bars = ch.hit ? Math.max(1, Math.min(5, 5 - Math.floor(ch.hit.orb))) : 1;
  const dialDeg = channels.length > 1 ? -135 + (270 / (channels.length - 1)) * idx : 0;
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
      <div className="obs-panel min-w-0 p-4 sm:p-6">
        <PanelTitle eyebrow={`Broadcast Studio${name ? ` · ${name}` : ''}`} live><span id="cc-h">Current Chapter</span></PanelTitle>
        <div role="tablist" aria-label="Broadcast channels" className="channel-dial mb-3 grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap">
          {channels.map((c, i) => {
            const Icon = CHANNEL_ICONS[c.id];
            return (
              <button key={c.id} ref={el => { tabs.current[i] = el; }} role="tab" id={`ch-${c.id}`} aria-selected={c.id === active} aria-controls="ch-panel" tabIndex={c.id === active ? 0 : -1}
                onClick={() => tune(c.id)} onKeyDown={e => onKey(e, i)}
                className={cn('channel-tab', c.id === active && 'channel-tab-active')}>
                <Icon size={18} /><span aria-hidden>{c.number}</span><span className="hidden sm:inline">{c.name}</span><span className="sr-only sm:hidden">{c.name}</span>
              </button>
            );
          })}
        </div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <button type="button" onClick={() => tune(channels[(idx + 1) % channels.length].id)} className="tv-dial" aria-label={`Turn the dial to channel ${channels[(idx + 1) % channels.length].number}, ${channels[(idx + 1) % channels.length].name}`}>
            <span aria-hidden className="tv-dial-face" style={{ transform: `rotate(${dialDeg}deg)` }}><span className="tv-dial-pointer" /></span>
            <span className="font-label text-xs tracking-widest text-muted-foreground">Turn the dial</span>
          </button>
          <span className="flex items-center gap-2" role="img" aria-label={`Reception ${bars} of 5`}>
            <span className="font-label text-xs tracking-widest text-muted-foreground" aria-hidden>Reception</span>
            <span aria-hidden className="tv-signal">{[1, 2, 3, 4, 5].map(n => <span key={n} className={cn('tv-signal-bar', n <= bars && 'tv-signal-on')} style={{ height: `${n * 20}%` }} />)}</span>
          </span>
          {canFull && <Button type="button" variant="outline" size="sm" onClick={toggleFull} aria-pressed={full}>{full ? <Minimize2 aria-hidden className="h-4 w-4" /> : <Maximize2 aria-hidden className="h-4 w-4" />}<span className="hidden sm:inline">{full ? 'Exit full screen' : 'Full screen'}</span><span className="sr-only sm:hidden">{full ? 'Exit full screen' : 'Full screen'}</span></Button>}
        </div>
        <div id="ch-panel" role="tabpanel" aria-labelledby={`ch-${active}`} aria-live="polite">
          <div ref={stage} className="tv-stage">
          <RetroTV channel={`Channel ${ch.number} · ${ch.name}`} label={ch.hit ? `${ch.hit.transit.name} ${ch.hit.symbol} ${ch.hit.natalName}` : ch.id === 'window' ? `${ch.events.length} ${ch.events.length === 1 ? 'event' : 'events'}` : 'Quiet sky'}>
            <div className="relative h-full w-full">
              <img key={active} src={CHANNEL_ART[active]} alt="" width={1024} height={768} loading="lazy" className="channel-art absolute inset-0 h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex items-center gap-2"><RetroEmblem icon={CHANNEL_ICONS[active]} size={34} active /><span className="channel-callsign">CH {ch.number}</span></div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/75 to-transparent p-4 pb-9 pt-12 sm:p-5 sm:pb-10 sm:pt-16">
                <div className="flex items-center gap-2"><StaffPortrait id={ch.host} size={32} /><p className="font-label text-[0.7rem] text-primary sm:text-xs">{STAFF[ch.host].title} · now transmitting</p></div>
                <h3 className="mt-1.5 font-display text-xl leading-tight sm:text-3xl">{ch.title}</h3>
              </div>
              <div aria-hidden className="tv-ticker"><div className="tv-ticker-track">{[0, 1].map(k => <span key={k} className="tv-ticker-run">{wire.map((w, i) => <span key={i}>{w}<span className="tv-ticker-sep">✦</span></span>)}</span>)}</div></div>
              {tuning && <div aria-hidden className="obs-static-burst absolute inset-0 z-[5]" />}
            </div>
          </RetroTV>
          </div>
          <p className="sr-only">Sky wire: {wire.join('; ')}.</p>
          {ch.sky.length > 0 && (
            <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label={`${STAFF[ch.host].title}'s sky readout for today`}>
              {ch.sky.map(r => <div key={r.label} className="sky-dial"><dt>{r.label}</dt><dd>{r.value}</dd></div>)}
            </dl>
          )}
          <p className="mt-4 leading-relaxed text-muted-foreground">{ch.summary}</p>
          <p className="mt-2 font-label text-xs text-muted-foreground">Calculated <time dateTime={now.toISOString()}>{now.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</time> · interpretations, not predictions</p>
          {ch.hit && <div className="mt-4 border-l-2 border-primary pl-4"><h4 className="font-label text-primary">A question for this contact</h4><p className="mt-2 text-sm text-muted-foreground">{contactReflection(ch.hit).focus}</p><p className="mt-2 text-sm">{contactReflection(ch.hit).prompt}</p></div>}
          {!chart.input.time && <p className="mt-3 text-sm text-muted-foreground">Birth time unknown: personal Moon and angle contacts are omitted.</p>}
          {ch.contacts.length > 0 && (
            <div className="mt-4">
              <p className="font-label text-xs tracking-widest text-primary">Live on this channel</p>
              <ul className="mt-2 divide-y divide-border/60 border-y border-border/70">
                {ch.contacts.map(c => (
                  <li key={`${c.transit.key}-${c.natalKey}-${c.type}`} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 px-3 py-2 text-sm">
                    <span className="font-medium">{c.transit.glyph}&#xFE0E; {c.transit.name} {c.symbol}&#xFE0E; natal {c.natalName}</span>
                    <span className="font-label text-xs text-muted-foreground">orb {c.orb.toFixed(1)}° · {c.applying ? 'building' : 'easing'}</span>
                    <p className="w-full text-muted-foreground">{c.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ch.events.length > 0 && (
            <div className="mt-4">
              <p className="font-label text-xs tracking-widest text-primary">{ch.id === 'window' ? 'Biggest events this month' : 'Coming up on this channel'}</p>
              <ul className="mt-2 space-y-2">{ch.events.map(e => (
                <li key={`${e.title}-${e.date.toISOString()}`} className="flex gap-3 border-t border-border p-3 text-sm">
                  <time dateTime={e.date.toISOString()} className="font-label w-12 shrink-0 text-primary">{shortDay(e.date)}</time>
                  <span className="min-w-0"><span className="font-medium">{e.title}</span><span className="block text-muted-foreground">{e.detail}</span><span className="mt-1 block font-label text-xs text-muted-foreground">{e.kind === 'exact' ? 'Personal chart contact' : 'Shared sky event'} · approximate UTC day</span></span>
                </li>
              ))}</ul>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2"><Button asChild variant="signal" size="sm"><Link to={LINK[active][0]}>{LINK[active][1]}</Link></Button><Button asChild variant="outline" size="sm"><Link to="/timeline">Timeline Hall</Link></Button><Button asChild variant="outline" size="sm"><Link to="/personal-context">Update my context</Link></Button></div>
        </div>
      </div>
      <div className="obs-panel min-w-0 p-4 sm:p-6">
        <PanelTitle eyebrow="Analyst’s desk">Life Compass</PanelTitle>
        <div className="space-y-4">{(Object.keys(compass) as CompassDomain[]).map(d => <SignalMeter key={d} label={d} value={compass[d]} />)}</div>
        <p className="mt-5 text-xs text-muted-foreground"><StatusLight tone="info" /> Signal strength counts how strongly today’s planets touch the chart points tied to each area. It measures activity, not good or bad luck.</p>
      </div>
    </section>
  );
}
