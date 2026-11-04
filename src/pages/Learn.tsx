import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SpotArt, type SpotKind } from '@/components/art/SpotArt';
import { CommunityJournal } from '@/components/learn/CommunityJournal';
import { ACADEMY, ALL_LESSONS } from '@/content/academy';
import { PUBLIC_ARTICLES } from '@/content/publicArticles';
import { READING_ROOM, READING_ROOM_HERO, ROOM_CATEGORIES } from '@/content/readingRoom';
import { LEARN_SECTIONS } from '@/content/learnSections';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useJsonLd } from '@/hooks/useJsonLd';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useIsAdmin, useSession } from '@/hooks/useLibrary';
import { skyEvents, skyToday } from '@/lib/skyToday';
import { cn } from '@/lib/utils';

const fmtDay = (d: Date) => d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** One Learn page: lessons, today's sky and forecasts, illustrated guides, articles and the community journal. */
export default function Learn() {
  usePageMeta('Learn astrology · Zodaci Research Library', 'Lessons, illustrated guides, today’s measured sky and a 30-day sky calendar, articles and member essays — all in one place.');
  useJsonLd('learn-schema', { '@type': 'CollectionPage', name: 'Zodaci Learn', description: 'Lessons, guides, forecasts and articles on reading a birth chart.', hasPart: [...PUBLIC_ARTICLES.map(a => ({ '@type': 'Article', headline: a.title, url: `https://zodaci.com/learn/${a.slug}` })), ...READING_ROOM.map(a => ({ '@type': 'Article', headline: a.title, url: `https://zodaci.com/reading-room/${a.slug}` }))] });
  const { hash } = useLocation();
  const settings = useSiteSettings();
  const session = useSession();
  const admin = useIsAdmin(session);
  const showLessons = settings.flags.academy || admin;
  const [cat, setCat] = useState<string | null>(null);
  const sky = useMemo(() => skyToday(), []);
  const events = useMemo(() => skyEvents(new Date(), 30), []);

  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    return () => window.clearTimeout(t);
  }, [hash]);

  const sections = LEARN_SECTIONS.filter(s => s.id !== 'lessons' || showLessons);
  const guides = READING_ROOM.filter(a => !cat || a.category === cat);

  return (
    <article className="space-y-14">
      <header className="learn-hero relative overflow-hidden rounded-2xl border border-[hsl(var(--brass)/0.5)]">
        <img src={READING_ROOM_HERO} alt="A lamp-lit 1950s home library with a telescope at the window and a zodiac wheel on the wall" width={1280} height={717} {...{ fetchpriority: 'high' }} className="h-80 w-full object-cover sm:h-[26rem]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
        <div className="absolute bottom-0 max-w-2xl p-6 sm:p-10">
          <p className="font-label text-sm tracking-[0.2em] text-primary">Zodaci · Research Library</p>
          <h1 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-6xl">Learn to read the sky.</h1>
          <p className="mt-3 font-script text-2xl text-primary sm:text-3xl">One idea at a time.</p>
          <p className="mt-3 text-muted-foreground">{showLessons ? `${ALL_LESSONS.length} lessons, ` : ''}{READING_ROOM.length} illustrated guides, {PUBLIC_ARTICLES.length} articles, today’s measured sky and essays from members.</p>
        </div>
      </header>

      <nav aria-label="Learn sections" className="learn-subnav sticky top-16 z-30 -mx-2 flex gap-2 overflow-x-auto rounded-full border border-[hsl(var(--brass)/0.5)] bg-background p-1.5 shadow-lg lg:top-20">
        {sections.map(s => <a key={s.id} href={`#${s.id}`} aria-current={hash === `#${s.id}` ? 'true' : undefined} className={cn('flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 font-label text-sm transition-colors duration-700 hover:bg-secondary', hash === `#${s.id}` && 'bg-primary text-primary-foreground')}><SpotArt kind={s.art} className="h-6 w-6" />{s.label}</a>)}
      </nav>

      {showLessons && <section id="lessons" aria-labelledby="lessons-h" className="scroll-mt-36 space-y-10">
        <SectionHead id="lessons-h" eyebrow="Zodaci Academy" title="Lessons" text={`${ALL_LESSONS.length} short lessons in ${ACADEMY.length} paths. Each separates what is measured from what is interpreted, and ends with a way to try it on your own chart.`} art="book" />
        {ACADEMY.map(path => (
          <div key={path.slug}>
            <h3 className="font-display text-2xl">{path.title}</h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{path.intro}</p>
            <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{path.lessons.map((l, i) => (
              <li key={l.slug}><Link to={`/academy/${l.slug}`} className="atomic-box h-full"><SpotArt label={`${l.title} ${l.summary}`} badge={i + 1} className="h-16 w-16" /><h4 className="text-lg leading-snug">{l.title}</h4><p className="flex-1 text-sm leading-relaxed text-muted-foreground">{l.summary}</p><p className="flex items-center gap-1.5 font-label text-xs text-primary"><Clock aria-hidden className="h-3.5 w-3.5" />{l.minutes} min</p></Link></li>
            ))}</ol>
          </div>
        ))}
      </section>}

      <section id="forecasts" aria-labelledby="forecasts-h" className="scroll-mt-36 space-y-6">
        <SectionHead id="forecasts-h" eyebrow="Forecast Center" title="Today’s sky and the next 30 days" text="Calculated live from planetary positions. This is the general sky everyone shares; how it touches your own chart is in your personal forecast." art="year" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="obs-paper self-start p-5 sm:p-6">
            <div className="flex items-center gap-4"><SpotArt kind="moon" className="h-16 w-16" /><div><p className="font-label text-xs text-accent">Moon phase</p><p className="text-2xl">{sky.phase.name}</p><p className="text-sm text-muted-foreground">{sky.phase.lit}% lit · {sky.phase.waxing ? 'waxing' : 'waning'}</p></div></div>
            <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">{sky.bodies.filter(b => !/node|chiron|lilith/i.test(b.key)).map(b => <li key={b.key} className="flex items-baseline justify-between gap-2 border-b border-[hsl(var(--paper-ink)/0.15)] pb-1"><span><span aria-hidden className="mr-1.5">{b.glyph}{'\uFE0E'}</span>{b.name}</span><span className="tabular-nums">{Math.floor(b.deg)}° {b.sign}{b.retro && <span title="Retrograde" className="ml-1 text-accent">℞</span>}</span></li>)}</ul>
            <p className="mt-4 text-xs text-muted-foreground">{sky.retrograde.length ? `Retrograde now: ${sky.retrograde.map(b => b.name).join(', ')}.` : 'No planets are retrograde right now.'} Positions at {sky.at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}, your time.</p>
          </div>
          <div className="obs-panel p-5 sm:p-6">
            <h3 className="font-label text-lg">Sky calendar</h3>
            {events.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">A quiet month: no Moon phases, sign changes or stations in the next 30 days.</p> :
              <ol className="mt-3 divide-y divide-border">{events.map(e => <li key={`${e.title}-${e.date.toISOString()}`} className="flex items-start gap-3 py-3"><SpotArt kind={e.kind === 'station' ? 'planet' : e.kind === 'ingress' ? 'sign' : 'moon'} className="h-10 w-10" /><div className="min-w-0 flex-1"><p className="font-medium">{e.title}</p><p className="text-sm text-muted-foreground">{e.detail}</p></div><time dateTime={e.date.toISOString().slice(0, 10)} className="shrink-0 font-label text-xs text-primary">{fmtDay(e.date)}</time></li>)}</ol>}
            <div className="mt-5 flex flex-wrap gap-2"><Button asChild variant="signal" size="sm"><Link to={session ? '/transits' : '/start'}>{session ? 'See how it touches your chart' : 'Get your personal forecast'}<ArrowRight /></Link></Button><Button asChild variant="outline" size="sm"><Link to="/reading-room/transits">How transits work</Link></Button></div>
          </div>
        </div>
      </section>

      <section id="guides" aria-labelledby="guides-h" className="scroll-mt-36 space-y-6">
        <SectionHead id="guides-h" eyebrow="The Reading Room" title="Illustrated guides" text="Short guides with words to know and something to try on your own chart." art="explore" />
        <div role="group" aria-label="Filter guides by category" className="flex flex-wrap gap-2">
          {[null, ...ROOM_CATEGORIES].map(c => <Button key={c ?? 'all'} size="sm" variant={cat === c ? 'secondary' : 'outline'} aria-pressed={cat === c} onClick={() => setCat(c)}>{c ?? 'All'}</Button>)}
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{guides.map(a => <li key={a.slug}><Link to={`/reading-room/${a.slug}`} className="atomic-box h-full overflow-hidden p-0"><img src={a.image} alt="" loading="lazy" decoding="async" width={1280} height={717} className="aspect-video w-full object-cover" /><div className="space-y-2 p-5"><p className="font-label text-xs text-primary">{a.category} · {a.minutes} min</p><h3 className="text-xl leading-snug">{a.title}</h3><p className="text-sm text-muted-foreground">{a.glance}</p></div></Link></li>)}</ul>
      </section>

      <section id="articles" aria-labelledby="articles-h" className="scroll-mt-36 space-y-6">
        <SectionHead id="articles-h" eyebrow="Zodaci editorial" title="Articles" text="Longer pieces on the measured sky and on using a reading well, each with sources you can check." art="source" />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{PUBLIC_ARTICLES.map(a => <li key={a.slug}><Link to={`/learn/${a.slug}`} className="atomic-box h-full overflow-hidden p-0"><img src={a.image} alt="" width={1024} height={768} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" /><div className="flex flex-1 flex-col gap-2 p-5"><p className="font-label text-xs text-accent">{a.category}</p><h3 className="text-xl leading-snug">{a.title}</h3><p className="flex-1 text-sm text-muted-foreground">{a.summary}</p><p className="font-label text-xs text-primary">Read article →</p></div></Link></li>)}</ul>
      </section>

      <section id="journal" aria-labelledby="journal-h" className="scroll-mt-36 space-y-6">
        <SectionHead id="journal-h" eyebrow="Zodaci community" title="Community journal" text="Reflections and discoveries written by members. Pro and Cosmic members can publish; drafts stay private." art="written" />
        <CommunityJournal />
      </section>

      <section className="atomic-box items-start p-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><SpotArt kind="chart" className="h-16 w-16" /><div><h2 className="font-display text-2xl">Try it on your own sky</h2><p className="text-sm text-muted-foreground">Every lesson and guide makes more sense with your chart open beside it.</p></div></div><Button asChild variant="signal"><Link to={session ? '/my-chart' : '/start'}>{session ? 'Open my chart' : 'Generate your chart'}<ArrowRight /></Link></Button></section>
    </article>
  );
}

function SectionHead({ id, eyebrow, title, text, art }: { id: string; eyebrow: string; title: string; text: string; art: SpotKind }) {
  return (
    <div className="flex items-start gap-5">
      <SpotArt kind={art} className="hidden h-20 w-20 sm:inline-flex" />
      <div><p className="font-label text-sm tracking-[0.18em] text-accent">{eyebrow}</p><h2 id={id} className="mt-1 font-display text-3xl sm:text-4xl">{title}</h2><p className="mt-2 max-w-2xl text-muted-foreground">{text}</p></div>
    </div>
  );
}
