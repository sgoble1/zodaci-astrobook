import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/useLibrary';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useMyBirth, toChartInput } from '@/lib/myBirth';
import { computeChart } from '@/lib/astro';
import { skyToday, skyEvents } from '@/lib/skyToday';
import { upcomingEvents, type TransitEvent } from '@/lib/transitOverlay';
import { eventArea, LIFE_AREAS, type LifeArea } from '@/lib/lifeAreas';
import { useMyThemes } from '@/hooks/useMyThemes';
import type { ChartResult } from '@/lib/astro';
import { CurrentChapterPanel } from '@/components/observatory/CurrentChapterPanel';
import { ForecastReel } from '@/components/observatory/ForecastReel';
import { FilmFx } from '@/components/observatory/FilmFx';
import { TelevisionIcon, MapIcon, LibraryIcon } from '@/components/icons/RetroIcons';
import controlRoom from '@/assets/forecast/forecast-control-room.jpg';
import { StartLink } from '@/components/common/StartLink';

export default function Forecast() {
  usePageMeta('Forecast Center · Zodaci', 'Today’s calculated sky, a 30-day calendar and private chart-based television channels, illustrated in Zodaci’s 1950s AstroComic style.');
  const session = useSession();
  const now = useMemo(() => new Date(), []);
  const sky = useMemo(() => skyToday(now), [now]);
  const events = useMemo(() => skyEvents(now, 30), [now]);
  return <article className="forecast-page min-w-0 space-y-12">
    <Link to="/learn#forecasts" className="inline-flex items-center gap-2 text-sm text-primary"><LibraryIcon size={18} />Back to Learn</Link>
    <header className="forecast-hero relative overflow-hidden rounded-md border border-border">
      <img src={controlRoom} alt="A woman astronomer at a 1950s observatory console with planet broadcasts, brass instruments and a telescope" width={1536} height={1024} className="absolute inset-0 h-full w-full object-cover" />
      <div className="forecast-hero-shade absolute inset-0" /><FilmFx motes={18} specks={6} />
      <div className="relative z-10 max-w-xl px-5 py-10 sm:px-9 sm:py-14">
        <p className="font-label text-sm text-primary">Zodaci · Astral Research Authority</p>
        <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-6xl">Forecast<br />Center</h1>
        <p className="mt-3 font-script text-3xl text-primary">Your sky, on the air.</p>
        <p className="mt-5 max-w-sm text-foreground">The planets today. The month ahead. A closer look at how the moving sky meets your birth chart.</p>
        <div className="mt-6 flex flex-wrap gap-3"><Button asChild variant="signal"><a href="#personal-broadcast"><TelevisionIcon />{session ? 'My broadcast' : 'Personal forecast'}</a></Button><Button asChild variant="outline"><a href="#sky-calendar">Sky calendar</a></Button></div>
      </div>
    </header>
    <section id="personal-broadcast" className="scroll-mt-28 space-y-6" aria-labelledby="forecast-personal-h">
      <div><p className="font-script text-2xl text-primary">Tuned to your chart.</p><h2 id="forecast-personal-h" className="mt-2 font-display text-3xl">Personal broadcasts</h2></div>
      {session ? <PersonalBroadcast key={session.user.id} now={now} /> : <div className="flex flex-wrap items-center justify-between gap-5 border-y border-border py-6"><p className="max-w-xl text-muted-foreground">Sign in to open your private channels from your saved birth chart. The general sky below is available to everyone.</p><Button asChild variant="signal"><Link to="/auth?next=%2Fforecast">Sign in for my forecast</Link></Button></div>}
    </section>
    <section aria-labelledby="forecast-sky-h" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-script text-2xl text-primary">The sky we all share.</p><h2 id="forecast-sky-h" className="mt-2 font-display text-3xl">Today’s planetary bulletin</h2></div><time className="font-label text-sm text-muted-foreground" dateTime={now.toISOString()}>{now.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' })} UTC</time></div>
      <div className="obs-paper p-5 sm:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-4"><h3 className="font-display text-xl">{sky.phase.name}</h3><p className="font-label">{sky.phase.lit}% illuminated · {sky.phase.waxing ? 'waxing' : 'waning'}</p></div>
        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">{sky.bodies.map(body => <div key={body.key} className="border-b border-border pb-3"><dt className="font-label text-sm">{body.name}</dt><dd className="mt-1 font-display text-lg">{body.deg.toFixed(1)}° {body.sign}<span className="block font-label text-xs text-accent">{body.retro ? 'Retrograde' : 'Direct'}</span></dd></div>)}</dl>
      </div>
    </section>
    <section id="sky-calendar" aria-labelledby="forecast-calendar-h" className="scroll-mt-28 space-y-6">
      <div><p className="font-script text-2xl text-primary">The next reel.</p><h2 id="forecast-calendar-h" className="mt-2 font-display text-3xl">The next 30 days</h2><p className="mt-3 max-w-2xl text-muted-foreground">Moon phases, sign changes and stations in the shared sky. Dates are sampled daily in UTC, not exact event times.</p></div>
      <ForecastReel frames={events} />
      <ol className="divide-y divide-border border-y border-border">{events.map((event, i) => <li key={`${event.title}-${i}`} className="grid gap-2 py-5 sm:grid-cols-[8rem_minmax(0,1fr)]"><time className="font-label text-primary" dateTime={event.date.toISOString()}>{event.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })} UTC</time><div><h3 className="font-display text-lg">{event.title}</h3><p className="mt-2 text-sm text-muted-foreground">{event.detail}</p></div></li>)}</ol>
    </section>
    <section className="space-y-6 border-t border-border pt-8" aria-labelledby="forecast-notes-h">
      <h2 id="forecast-notes-h" className="font-display text-3xl">Reading the signal</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="obs-paper p-5"><MapIcon className="mb-3 text-primary" size={34} /><h3 className="font-display text-xl">Positions are calculated</h3><p className="mt-3 text-sm text-muted-foreground">Planetary longitudes come from Astronomy Engine in the tropical zodiac. Personal contacts compare today’s positions with the saved birth chart.</p></div>
        <div className="obs-paper p-5"><TelevisionIcon className="mb-3 text-primary" size={34} /><h3 className="font-display text-xl">Themes are interpretations</h3><p className="mt-3 text-sm text-muted-foreground">Career, relationships and growth are traditional symbolic lenses, not promises of events. Signal meters measure chart activity, not luck or a health diagnosis.</p></div>
        <div className="obs-paper p-5"><LibraryIcon className="mb-3 text-primary" size={34} /><h3 className="font-display text-xl">Timing has limits</h3><p className="mt-3 text-sm text-muted-foreground">Without a birth time, personal Moon, Rising and Midheaven contacts are omitted. Forecast dates are daily approximations rather than exact appointments.</p></div>
      </div>
      <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/reading-room/transits">Read the transit guide</Link></Button><Button asChild variant="outline"><Link to="/learn">More from Learn</Link></Button></div>
    </section>
  </article>;
}
/** Mount only when signed in: public visitors never get the device birth-data fallback. */
function PersonalBroadcast({ now }: { now: Date }) {
  const birth = useMyBirth();
  const chart = useMemo(() => { if (!birth) return null; try { return computeChart(toChartInput(birth)); } catch { return null; } }, [birth]);
  const events90 = useMemo(() => chart ? upcomingEvents(chart, now, 90) : [], [chart, now]);
  const events = useMemo(() => events90.filter(e => e.date.getTime() < now.getTime() + 30 * DAY), [events90, now]);
  if (birth === undefined) return <p role="status">Opening your chart…</p>;
  if (!birth || !chart) return <div className="space-y-4 border-y border-border py-6"><p className="text-muted-foreground">A saved birth chart is needed for your personal broadcast. Shared editions require the owner’s permission to open the whole chart.</p><Button asChild variant="signal"><StartLink>Open birth details</StartLink></Button></div>;
  return <div className="space-y-8">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{birth.name} · {birth.date} · {birth.time ?? 'Birth time unknown'} · {birth.placeLabel}</p><Button asChild variant="outline" size="sm"><Link to="/my-chart">Open chart</Link></Button></div>
    {!birth.time && <p role="note" className="border-l-2 border-primary pl-4 text-sm text-muted-foreground">Birth time unknown: no personal Moon, Ascendant or Midheaven contacts are included.</p>}
    <ComingSoon events={events90} now={now} />
    <CurrentChapterPanel chart={chart} name={birth.name} />
    <div className="space-y-5"><h3 className="font-display text-2xl">{birth.name}’s forecast film</h3><p className="text-sm text-muted-foreground">Upcoming close slow-planet contacts, plus general stations and sign changes. Daily sampling locates the closest day, not an exact time.</p><ForecastReel key={`${birth.date}-${birth.time}-${birth.lat}-${birth.lon}`} frames={events} personal /></div>
    <PersonalTimeline chart={chart} events={events90} now={now} />
  </div>;
}

const DAY = 864e5;
const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
const daysUntil = (d: Date, now: Date) => Math.max(0, Math.round((d.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12)) / DAY));

/** The strongest personal contact or station in the next seven days, if any. */
function ComingSoon({ events, now }: { events: TransitEvent[]; now: Date }) {
  const soon = events.filter(e => e.kind !== 'ingress' && e.date.getTime() - now.getTime() <= 7 * DAY).sort((a, b) => b.weight - a.weight || a.date.getTime() - b.date.getTime())[0];
  if (!soon) return null;
  const n = daysUntil(soon.date, now);
  return (
    <aside aria-labelledby="coming-soon" className="obs-panel flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:gap-6">
      <div className="shrink-0"><p className="font-label text-xs tracking-[0.16em] text-primary">Coming soon</p><p className="font-label text-2xl text-accent">{n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : `In ${n} days`}</p></div>
      <div className="min-w-0"><h3 id="coming-soon" className="font-display text-xl">{soon.title}</h3><p className="mt-1 text-sm text-foreground/80">{soon.detail} Closest around {fmtDay(soon.date)} (UTC).</p></div>
    </aside>
  );
}

/**
 * Next 90 days of personal events grouped by life area. Areas the member keeps writing about in their own workbook
 * come first and are marked; the matching happens in the browser on rows only they can read.
 */
function PersonalTimeline({ chart, events, now }: { chart: ChartResult; events: TransitEvent[]; now: Date }) {
  const themes = useMyThemes();
  const groups = useMemo(() => {
    const by = new Map<LifeArea | 'sky', TransitEvent[]>();
    for (const e of events) { const a = eventArea(e, chart) ?? 'sky'; by.set(a, [...(by.get(a) ?? []), e]); }
    return by;
  }, [events, chart]);
  const mine = new Set((themes?.areas ?? []).map(t => t.area));
  const order = (Object.keys(LIFE_AREAS) as LifeArea[]).filter(a => groups.has(a)).sort((a, b) => Number(mine.has(b)) - Number(mine.has(a)));
  const sky = groups.get('sky') ?? [];
  if (events.length === 0) return null;
  return (
    <section aria-labelledby="personal-timeline" className="space-y-5">
      <div>
        <p className="font-script text-2xl text-primary">The next ninety days.</p>
        <h3 id="personal-timeline" className="mt-1 font-display text-2xl sm:text-3xl">Your personal transit timeline</h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Exact slow-planet contacts to your chart, stations and sign changes, sorted by the part of life they traditionally touch.{themes && themes.areas.length > 0 ? ' Areas you have been writing about in your workbook come first.' : ''}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {order.map(a => {
          const list = groups.get(a)!;
          return (
            <div key={a} className={`obs-paper p-5 ${mine.has(a) ? 'ring-1 ring-[hsl(var(--brass)/0.6)]' : ''}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-display text-xl">{LIFE_AREAS[a].label}</h4>
                {mine.has(a) && <span className="rounded-sm bg-primary/15 px-2 py-0.5 font-label text-[11px] tracking-[0.12em] text-primary">In your workbook</span>}
              </div>
              <p className="text-xs text-muted-foreground">{LIFE_AREAS[a].text}</p>
              <ol className="mt-3 space-y-3">
                {list.slice(0, 5).map((e, i) => (
                  <li key={`${e.title}-${i}`} className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 border-t border-[hsl(var(--paper-ink)/0.15)] pt-3">
                    <time className="font-label text-sm text-primary" dateTime={e.date.toISOString().slice(0, 10)}>{fmtDay(e.date)}</time>
                    <div className="min-w-0"><p className="font-semibold leading-snug">{e.title}</p><p className="mt-1 text-sm text-foreground/80">{e.detail}</p></div>
                  </li>
                ))}
              </ol>
              {list.length > 5 && <p className="mt-3 text-xs text-muted-foreground">{list.length - 5} more in this area.</p>}
            </div>
          );
        })}
      </div>
      {sky.length > 0 && <p className="text-sm text-muted-foreground">Also in the shared sky: {sky.slice(0, 6).map(e => `${e.title} (${fmtDay(e.date)})`).join(' · ')}{chart.input.time ? '' : '. Add a birth time to place these in your houses.'}</p>}
    </section>
  );
}
